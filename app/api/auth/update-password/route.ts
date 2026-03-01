import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';
import { validatePasswordStrength } from '@/lib/validation/password';

// Validation schema for password update
const updatePasswordSchema = z.object({
     password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();

          // Validate input
          const validationResult = updatePasswordSchema.safeParse(body);
          if (!validationResult.success) {
               return NextResponse.json(
                    { error: validationResult.error.errors[0].message },
                    { status: 400 }
               );
          }

          const { password } = validationResult.data;

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

          // Update password
          const { error } = await supabase.auth.updateUser({
               password,
          });

          if (error) {
               console.error('Password update error:', error);
               return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
               );
          }

          return NextResponse.json(
               { message: 'Password updated successfully' },
               { status: 200 }
          );
     } catch (error) {
          console.error('Unexpected password update error:', error);
          return NextResponse.json(
               { error: 'An unexpected error occurred' },
               { status: 500 }
          );
     }
}
