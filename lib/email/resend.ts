/**
 * Resend Email Service
 * Handles email sending for re-engagement and notifications
 */

import { Resend } from 'resend';

export interface EmailTrackingData {
     userId: string;
     emailType: 'reengagement';
     sentAt: string;
     opened?: boolean;
     clicked?: boolean;
     openedAt?: string;
     clickedAt?: string;
}

export interface ReengagementEmailData {
     to: string;
     userName: string;
     learningGoal: string;
     lessonsCompleted: number;
     currentStreak: number;
     nextLessonTitle: string;
     nextLessonUrl: string;
}

export class ResendEmailService {
     private resend: Resend;
     private fromEmail: string;

     constructor() {
          const apiKey = process.env.RESEND_API_KEY;
          if (!apiKey) {
               throw new Error('RESEND_API_KEY environment variable is not set');
          }

          this.resend = new Resend(apiKey);
          this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@codepath.ai';
     }

     /**
      * Send a re-engagement email to inactive users
      */
     async sendReengagementEmail(data: ReengagementEmailData): Promise<{ id: string; success: boolean }> {
          try {
               const html = this.buildReengagementEmailTemplate(data);
               const text = this.buildReengagementEmailText(data);

               const result = await this.resend.emails.send({
                    from: this.fromEmail,
                    to: data.to,
                    subject: `${data.userName}, your coding journey awaits! 🚀`,
                    html,
                    text,
                    tags: [
                         { name: 'type', value: 'reengagement' },
                         { name: 'goal', value: data.learningGoal.substring(0, 50) },
                    ],
               });

               if (result.error) {
                    console.error('Resend email error:', result.error);
                    return { id: '', success: false };
               }

               return { id: result.data?.id || '', success: true };
          } catch (error) {
               console.error('Failed to send re-engagement email:', error);
               return { id: '', success: false };
          }
     }

     /**
      * Build HTML template for re-engagement email
      */
     private buildReengagementEmailTemplate(data: ReengagementEmailData): string {
          return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Continue Your Learning Journey</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .stats {
      background-color: #f0f9ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
    }
    .stats p {
      margin: 5px 0;
      font-size: 14px;
    }
    .cta {
      text-align: center;
      margin: 30px 0;
    }
    .cta a {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .cta a:hover {
      background-color: #1d4ed8;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 CodePath AI</h1>
    </div>
    
    <div class="content">
      <p>Hi ${data.userName},</p>
      
      <p>We noticed you haven't been back to CodePath AI in a few days. Your coding journey is waiting for you!</p>
      
      <p><strong>Your Goal:</strong> ${data.learningGoal}</p>
      
      <div class="stats">
        <p><strong>📚 Lessons Completed:</strong> ${data.lessonsCompleted}</p>
        <p><strong>🔥 Current Streak:</strong> ${data.currentStreak} days</p>
      </div>
      
      <p>You're making great progress! Your next lesson is ready:</p>
      <p><strong>${data.nextLessonTitle}</strong></p>
      
      <p>Remember, just 15 minutes a day can keep you on track toward achieving your goal. Let's keep the momentum going!</p>
    </div>
    
    <div class="cta">
      <a href="${data.nextLessonUrl}">Continue Learning →</a>
    </div>
    
    <div class="footer">
      <p>Keep building, keep learning! 💪</p>
      <p>
        <a href="${data.nextLessonUrl.replace(/\/lesson\/.*/, '/settings')}">Email Preferences</a> | 
        <a href="${data.nextLessonUrl.replace(/\/lesson\/.*/, '/unsubscribe')}">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
     }

     /**
      * Build plain text version for re-engagement email
      */
     private buildReengagementEmailText(data: ReengagementEmailData): string {
          return `
Hi ${data.userName},

We noticed you haven't been back to CodePath AI in a few days. Your coding journey is waiting for you!

Your Goal: ${data.learningGoal}

Your Progress:
- Lessons Completed: ${data.lessonsCompleted}
- Current Streak: ${data.currentStreak} days

You're making great progress! Your next lesson is ready:
${data.nextLessonTitle}

Remember, just 15 minutes a day can keep you on track toward achieving your goal. Let's keep the momentum going!

Continue Learning: ${data.nextLessonUrl}

Keep building, keep learning!

---
Email Preferences: ${data.nextLessonUrl.replace(/\/lesson\/.*/, '/settings')}
Unsubscribe: ${data.nextLessonUrl.replace(/\/lesson\/.*/, '/unsubscribe')}
    `.trim();
     }

     /**
      * Track email events (to be called from webhook handlers)
      */
     async trackEmailEvent(
          emailId: string,
          event: 'opened' | 'clicked',
          timestamp: string
     ): Promise<void> {
          // This would typically update a database record
          // For now, just log the event
          console.log(`Email ${emailId} ${event} at ${timestamp}`);
     }
}

// Export singleton instance
export const resendEmailService = new ResendEmailService();
