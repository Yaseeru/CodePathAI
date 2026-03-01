import { NextResponse } from 'next/server';

export async function GET() {
     try {
          // Test Claude API connectivity with minimal request
          const response = await fetch('https://api.anthropic.com/v1/messages', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.CLAUDE_API_KEY!,
                    'anthropic-version': '2023-06-01'
               },
               body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 10
               })
          });

          if (!response.ok) {
               throw new Error(`AI service returned status ${response.status}`);
          }

          return NextResponse.json({
               status: 'ok',
               ai: 'connected',
               timestamp: new Date().toISOString()
          });
     } catch (error) {
          console.error('AI health check failed:', error);

          return NextResponse.json(
               {
                    status: 'error',
                    ai: 'disconnected',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
               },
               { status: 503 }
          );
     }
}
