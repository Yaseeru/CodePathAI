import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for login
const loginSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
     try {
          const body = await request.json();

          // Validate input
          const validationResult = loginSchema.safeParse(body);
          if (!validationResult.success) {
               return NextResponse.json(
                    { error: validationResult.error.errors[0].message },
                    { status: 400 }
               );
          }

          const { email, password } = validationResult.data;
          const supabase = createServerClient();

          // Authenticate user with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
               email,
               password,
          });

          if (authError) {
               console.error('Login error:', authError);
               return NextResponse.json(
                    { error: 'Invalid email or password' },
                    { status: 401 }
               );
          }

          if (!authData.user || !authData.session) {
               return NextResponse.json(
                    { error: 'Authentication failed' },
                    { status: 401 }
               );
          }

          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
               .from('user_profiles')
               .select('*')
               .eq('id', authData.user.id)
               .single();

          if (profileError) {
               console.error('Profile fetch error:', profileError);
               return NextResponse.json(
                    { error: 'Failed to fetch user profile' },
                    { status: 500 }
               );
          }

          return NextResponse.json(
               {
                    user: {
                         id: authData.user.id,
                         email: authData.user.email,
                         name: profile.name,
                         onboardingCompleted: profile.onboarding_completed,
                    },
                    session: authData.session,
               },
               { status: 200 }
          );
     } catch (error) {
          console.error('Unexpected login error:', error);
          return NextResponse.json(
               { error: 'An unexpected error occurred' },
               { status: 500 }
          );
     }
}
