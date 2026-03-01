/**
 * GET /api/analytics/onboarding-rate
 * Calculate onboarding completion rate
 * Returns: percentage of registered users who completed onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
     try {
          const supabase = createServerClient();

          // Get authenticated user (admin check could be added here)
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          // Count total registered users
          const { count: totalUsers, error: totalError } = await supabase
               .from('user_profiles')
               .select('*', { count: 'exact', head: true });

          if (totalError) {
               console.error('Error counting total users:', totalError);
               return NextResponse.json(
                    { error: 'Failed to fetch user count' },
                    { status: 500 }
               );
          }

          // Count users who completed onboarding
          const { count: completedUsers, error: completedError } = await supabase
               .from('user_profiles')
               .select('*', { count: 'exact', head: true })
               .eq('onboarding_completed', true);

          if (completedError) {
               console.error('Error counting completed users:', completedError);
               return NextResponse.json(
                    { error: 'Failed to fetch completed count' },
                    { status: 500 }
               );
          }

          // Calculate completion rate
          const completionRate = totalUsers && totalUsers > 0
               ? Math.round((completedUsers! / totalUsers) * 100 * 100) / 100 // Round to 2 decimals
               : 0;

          return NextResponse.json({
               totalUsers: totalUsers || 0,
               completedUsers: completedUsers || 0,
               completionRate,
               unit: 'percentage',
          });
     } catch (error) {
          console.error('Error calculating onboarding rate:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
