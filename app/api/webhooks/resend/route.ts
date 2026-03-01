/**
 * API Route: Resend Webhook Handler
 * Handles webhook events from Resend for email tracking (opens, clicks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { reengagementEmailSender } from '@/lib/reengagement/email-sender';

interface ResendWebhookEvent {
     type: string;
     created_at: string;
     data: {
          email_id: string;
          from: string;
          to: string[];
          subject: string;
          [key: string]: any;
     };
}

export async function POST(req: NextRequest) {
     try {
          // Verify webhook signature (if configured)
          // const signature = req.headers.get('resend-signature');
          // TODO: Implement signature verification for production

          const event: ResendWebhookEvent = await req.json();

          // Handle different event types
          switch (event.type) {
               case 'email.opened':
                    await handleEmailOpened(event);
                    break;

               case 'email.clicked':
                    await handleEmailClicked(event);
                    break;

               case 'email.delivered':
                    // Optional: Track delivery
                    console.log('Email delivered:', event.data.email_id);
                    break;

               case 'email.bounced':
                    // Optional: Track bounces
                    console.log('Email bounced:', event.data.email_id);
                    break;

               default:
                    console.log('Unhandled event type:', event.type);
          }

          return NextResponse.json({ success: true });
     } catch (error) {
          console.error('Error handling Resend webhook:', error);
          return NextResponse.json(
               {
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error',
               },
               { status: 500 }
          );
     }
}

async function handleEmailOpened(event: ResendWebhookEvent): Promise<void> {
     try {
          const emailId = event.data.email_id;
          await reengagementEmailSender.trackEmailOpened(emailId);
          console.log('Email opened tracked:', emailId);
     } catch (error) {
          console.error('Error handling email opened event:', error);
     }
}

async function handleEmailClicked(event: ResendWebhookEvent): Promise<void> {
     try {
          const emailId = event.data.email_id;
          await reengagementEmailSender.trackEmailClicked(emailId);
          console.log('Email clicked tracked:', emailId);
     } catch (error) {
          console.error('Error handling email clicked event:', error);
     }
}
