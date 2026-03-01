import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
     name: z.string().min(2, 'Name must be at least 2 characters').max(100),
     email: z.string().email('Invalid email address'),
     password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
     try {
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
