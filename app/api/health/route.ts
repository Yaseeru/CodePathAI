import { NextResponse } from 'next/server';

export async function GET() {
     return NextResponse.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'codepath-ai',
          version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development'
     });
}
