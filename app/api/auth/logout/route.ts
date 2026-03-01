import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
     try {
          const supabase = createServerClient();

          // Sign out user
          const { error } = await supabase.auth.signOut();

          if (error) {
               console.error('Logout error:', error);
               return NextResponse.json(
                    { error: 'Failed to logout' },
                    { status: 500 }
               );
          }

          return NextResponse.json(
               { success: true, message: 'Logged out successfully' },
               { status: 200 }
          );
     } catch (error) {
          console.error('Unexpected logout error:', error);
          return NextResponse.json(
               { error: 'An unexpected error occurred' },
               { status: 500 }
          );
     }
}
