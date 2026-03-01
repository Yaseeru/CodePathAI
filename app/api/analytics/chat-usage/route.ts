/**
 * GET /api/analytics/chat-usage
 * Calculate AI mentor chat usage frequency
 * Returns: average messages per active user and total message count
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

          // Get all user messages (role = 'user')
          const { data: messages, error: messagesError } = await supabase
               .from('messages')
               .select('id, conversation_id')
               .eq('role', 'user');

          if (messagesError) {
               console.error('Error fetching messages:', messagesError);
               return NextResponse.json(
                    { error: 'Failed to fetch messages' },
                    { status: 500 }
               );
          }

          if (!messages || messages.length === 0) {
               return NextResponse.json({
                    totalMessages: 0,
                    uniqueUsers: 0,
                    messagesPerUser: 0,
                    unit: 'messages',
                    message: 'No chat messages yet',
               });
          }

          // Get unique conversation IDs
          const conversationIds = [...new Set(messages.map(m => m.conversation_id))];

          // Get unique users from conversations
          const { data: conversations, error: conversationsError } = await supabase
               .from('conversations')
               .select('user_id')
               .in('id', conversationIds);

          if (conversationsError) {
               console.error('Error fetching conversations:', conversationsError);
               return NextResponse.json(
                    { error: 'Failed to fetch conversations' },
                    { status: 500 }
               );
          }

          const uniqueUserIds = conversations
               ? [...new Set(conversations.map(c => c.user_id))]
               : [];

          const messagesPerUser = uniqueUserIds.length > 0
               ? Math.round((messages.length / uniqueUserIds.length) * 100) / 100
               : 0;

          return NextResponse.json({
               totalMessages: messages.length,
               uniqueUsers: uniqueUserIds.length,
               messagesPerUser,
               unit: 'messages',
          });
     } catch (error) {
          console.error('Error calculating chat usage:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
