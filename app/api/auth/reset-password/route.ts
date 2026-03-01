import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier, RateLimitConfigs } from '@/lib/rate-limit';

// Validation schema for password reset request
const resetRequestSchema = z.object({
     email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
     try {
          // Apply rate limiting
          const identifier = getClientIdentifier(request);
          const rateLimit = checkRateLimit(identifier, RateLimitConfigs.AUTH);

          if (!rateLimit.allowed) {
               const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
               return NextResponse.json(
                    { error: 'Too many requests. Please try again later.', retryAfter },
                    {
                         status: 429,
                         headers: {
                              'Retry-After': retryAfter.toString(),
                              'X-RateLimit-Limit': RateLimitConfigs.AUTH.maxRequests.toString(),
                              'X-RateLimit-Remaining': '0',
                              'X-RateLimit-Reset': rateLimit.resetTime.toString(),
                         }
                    }
               );
          }

          const body = await request.json();

          // Validate input
          const validationResult = resetRequestSchema.safeParse(body);
          if (!validationResult.success) {
               return NextResponse.json(
                    { error: validationResult.error.errors[0].message },
                    { status: 400 }
               );
          }

          const { email } = validationResult.data;
          const supabase = createServerClient();

          // Send password reset email
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
               redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm`,
          });

          if (error) {
               console.error('Password reset error:', error);
               // Don't reveal if email exists or not for security
               return NextResponse.json(
                    { message: 'If an account exists with this email, a password reset link has been sent.' },
                    { status: 200 }
               );
          }

          return NextResponse.json(
               { message: 'If an account exists with this email, a password reset link has been sent.' },
               { status: 200 }
          );
     } catch (error) {
          console.error('Unexpected password reset error:', error);
          return NextResponse.json(
               { error: 'An unexpected error occurred' },
               { status: 500 }
          );
     }
}
