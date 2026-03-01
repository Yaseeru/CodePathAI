import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';
import { trackServerEvent, ServerAnalyticsEvents } from '@/lib/analytics/server-analytics';
import { validatePasswordStrength } from '@/lib/validation/password';
import { checkRateLimit, getClientIdentifier, RateLimitConfigs } from '@/lib/rate-limit';

// Validation schema for registration
const registerSchema = z.object({
     name: z.string().min(2, 'Name must be at least 2 characters').max(100),
     email: z.string().email('Invalid email address'),
     password: z.string().min(8, 'Password must be at least 8 characters'),
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
          const validationResult = registerSchema.safeParse(body);
          if (!validationResult.success) {
               return NextResponse.json(
                    { error: validationResult.error.errors[0].message },
                    { status: 400 }
               );
          }

          const { name, email, password } = validationResult.data;

          // Validate password strength
          const passwordStrength = validatePasswordStrength(password);
          if (!passwordStrength.isStrong) {
               return NextResponse.json(
                    {
                         error: 'Password is not strong enough',
                         feedback: passwordStrength.feedback,
                         score: passwordStrength.score
                    },
                    { status: 400 }
               );
          }

          const supabase = createServerClient();

          // Register user with Supabase Auth
          // Supabase automatically handles password hashing with bcrypt (10+ salt rounds)
          const { data: authData, error: authError } = await supabase.auth.signUp({
               email,
               password,
               options: {
                    data: {
                         name,
                    },
               },
          });

          if (authError) {
               console.error('Registration error:', authError);
               return NextResponse.json(
                    { error: authError.message },
                    { status: 400 }
               );
          }

          if (!authData.user) {
               return NextResponse.json(
                    { error: 'Failed to create user' },
                    { status: 500 }
               );
          }

          // Create user profile in database
          const { error: profileError } = await supabase
               .from('user_profiles')
               .insert({
                    id: authData.user.id,
                    name,
                    email,
                    onboarding_completed: false,
               });

          if (profileError) {
               console.error('Profile creation error:', profileError);
               // Note: User is created in auth but profile failed
               // This should be handled by a cleanup job or retry mechanism
               return NextResponse.json(
                    { error: 'Failed to create user profile' },
                    { status: 500 }
               );
          }

          // Track user registration event
          await trackServerEvent({
               user_id: authData.user.id,
               event_type: ServerAnalyticsEvents.USER_REGISTERED,
               event_data: {
                    email,
                    registration_date: new Date().toISOString(),
               },
          });

          return NextResponse.json(
               {
                    user: {
                         id: authData.user.id,
                         email: authData.user.email,
                         name,
                    },
                    session: authData.session,
               },
               { status: 201 }
          );
     } catch (error) {
          console.error('Unexpected registration error:', error);
          return NextResponse.json(
               { error: 'An unexpected error occurred' },
               { status: 500 }
          );
     }
}
