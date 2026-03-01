import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for password reset request
const resetPasswordSchema = z.object({
     email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();

          // Validate input
          const validationResult = resetPasswordSchema.safeParse(body);
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
               return NextResponse.json(
                    { error: 'Failed to send password reset email' },
                    { status: 500 }
               );
          }

          // Always return success to prevent email enumeration
          return NextResponse.json(
               {
                    success: true,
                    message: 'If an account exists with this email, a password reset link has been sent.',
               },
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
