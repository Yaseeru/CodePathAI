import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
     try {
          const supabase = await createClient();

          // Simple query to test database connection
          const { data, error } = await supabase
               .from('user_profiles')
               .select('count')
               .limit(1)
               .single();

          if (error) {
               throw error;
          }

          return NextResponse.json({
               status: 'ok',
               database: 'connected',
               timestamp: new Date().toISOString()
          });
     } catch (error) {
          console.error('Database health check failed:', error);

          return NextResponse.json(
               {
                    status: 'error',
                    database: 'disconnected',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
               },
               { status: 503 }
          );
     }
}
