/**
 * API Route: Send Re-engagement Emails
 * Endpoint to trigger re-engagement email sending for inactive users
 * This should be called by a scheduled job (e.g., cron job, Vercel Cron)
 */

import { NextRequest, NextResponse } from 'next/server';
import { inactivityDetector } from '@/lib/reengagement/inactivity-detector';
import { reengagementEmailSender } from '@/lib/reengagement/email-sender';

export async function POST(req: NextRequest) {
     try {
          // Verify authorization (e.g., cron secret)
          const authHeader = req.headers.get('authorization');
          const cronSecret = process.env.CRON_SECRET;

          if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Find eligible users
          const eligibleUsers = await inactivityDetector.getEligibleUsers();

          if (eligibleUsers.length === 0) {
               return NextResponse.json({
                    success: true,
                    message: 'No eligible users found',
                    emailsSent: 0,
               });
          }

          // Send emails
          const results = await reengagementEmailSender.sendReengagementEmails(eligibleUsers);

          // Count successes and failures
          const successCount = results.filter((r) => r.success).length;
          const failureCount = results.filter((r) => !r.success).length;

          return NextResponse.json({
               success: true,
               message: `Sent ${successCount} emails, ${failureCount} failed`,
               emailsSent: successCount,
               emailsFailed: failureCount,
               results,
          });
     } catch (error) {
          console.error('Error in re-engagement email sending:', error);
          return NextResponse.json(
               {
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error',
               },
               { status: 500 }
          );
     }
}

// Allow GET for testing purposes (remove in production)
export async function GET(req: NextRequest) {
     try {
          // Find eligible users (without sending emails)
          const eligibleUsers = await inactivityDetector.getEligibleUsers();

          return NextResponse.json({
               success: true,
               eligibleUsersCount: eligibleUsers.length,
               eligibleUsers: eligibleUsers.map((u) => ({
                    userId: u.userId,
                    name: u.name,
                    email: u.email,
                    daysSinceActivity: u.daysSinceActivity,
                    lastEmailSentAt: u.lastEmailSentAt,
               })),
          });
     } catch (error) {
          console.error('Error fetching eligible users:', error);
          return NextResponse.json(
               {
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error',
               },
               { status: 500 }
          );
     }
}
