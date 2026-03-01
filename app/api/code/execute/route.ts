import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { z } from 'zod';
import { codeExecutionService } from '@/lib/code/executor';
import { ErrorParser } from '@/lib/code/error-parser';

const executeCodeSchema = z.object({
     code: z.string().min(1).max(50000), // 50KB limit
     language: z.enum(['javascript', 'python', 'html']),
     stdin: z.string().max(10000).optional(),
});

export async function POST(request: NextRequest) {
     try {
          const supabase = await createClient();

          // Get authenticated user
          const {
               data: { user },
               error: authError,
          } = await supabase.auth.getUser();

          if (authError || !user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Parse and validate request body
          const body = await request.json();
          const validation = executeCodeSchema.safeParse(body);

          if (!validation.success) {
               return NextResponse.json(
                    { error: 'Invalid input', details: validation.error.errors },
                    { status: 400 }
               );
          }

          const { code, language, stdin } = validation.data;

          // Validate code size (max 50KB)
          if (code.length > 50000) {
               return NextResponse.json(
                    { error: 'Code exceeds maximum size of 50KB' },
                    { status: 400 }
               );
          }

          // Validate code before execution
          const codeValidation = codeExecutionService.validateCode(code, language);
          if (!codeValidation.valid) {
               return NextResponse.json(
                    { error: codeValidation.error },
                    { status: 400 }
               );
          }

          // Execute code with timeout (30 seconds max)
          const result = await codeExecutionService.execute(code, language, stdin);

          // Parse execution errors with line numbers and stack traces
          let parsedError = null;
          if (result.stderr || result.exitCode !== 0 || result.error) {
               parsedError = ErrorParser.parseError(
                    result.stderr,
                    result.stdout,
                    result.exitCode,
                    result.error,
                    language
               );
          }

          // Parse execution results (stdout, stderr, exit code, time)
          return NextResponse.json({
               stdout: result.stdout,
               stderr: result.stderr,
               exitCode: result.exitCode,
               executionTime: result.executionTime,
               error: result.error,
               parsedError,
          });
     } catch (error) {
          console.error('Unexpected error in code execution:', error);
          return NextResponse.json(
               { error: 'Internal server error' },
               { status: 500 }
          );
     }
}
