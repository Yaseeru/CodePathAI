/**
 * Code Execution Service
 * Handles code execution via Piston API with sandboxing, validation, and error handling
 */

export interface ExecutionResult {
     stdout: string;
     stderr: string;
     exitCode: number;
     executionTime: number;
     error?: string;
}

interface PistonRequest {
     language: string;
     version: string;
     files: Array<{ name: string; content: string }>;
     stdin?: string;
     args?: string[];
     compile_timeout?: number;
     run_timeout?: number;
}

interface PistonResponse {
     language: string;
     version: string;
     run: {
          stdout: string;
          stderr: string;
          code: number;
          signal: string | null;
          output: string;
     };
     compile?: {
          stdout: string;
          stderr: string;
          code: number;
          signal: string | null;
          output: string;
     };
}

export class CodeExecutionService {
     private readonly apiUrl: string;
     private readonly maxCodeSize = 50000; // 50KB
     private readonly maxTimeout = 30000; // 30 seconds

     // Language mapping for Piston API
     private readonly languageMap: Record<string, { language: string; version: string; extension: string }> = {
          javascript: { language: 'javascript', version: '18.15.0', extension: 'js' },
          python: { language: 'python', version: '3.10.0', extension: 'py' },
          html: { language: 'html', version: '5', extension: 'html' },
     };

     // Dangerous patterns to sanitize
     private readonly dangerousPatterns: Record<string, RegExp[]> = {
          javascript: [
               /require\(['"]fs['"]\)/g,
               /require\(['"]child_process['"]\)/g,
               /require\(['"]net['"]\)/g,
               /require\(['"]http['"]\)/g,
               /require\(['"]https['"]\)/g,
               /process\.exit/g,
               /process\.kill/g,
          ],
          python: [
               /import\s+os/g,
               /from\s+os\s+import/g,
               /import\s+subprocess/g,
               /from\s+subprocess\s+import/g,
               /import\s+socket/g,
               /from\s+socket\s+import/g,
               /__import__\s*\(/g,
               /eval\s*\(/g,
               /exec\s*\(/g,
          ],
          html: [
               /<script[^>]*src=/gi,
               /<iframe/gi,
               /<embed/gi,
               /<object/gi,
          ],
     };

     constructor() {
          this.apiUrl = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';
     }

     /**
      * Execute code in a sandboxed environment
      */
     async execute(
          code: string,
          language: 'javascript' | 'python' | 'html',
          stdin?: string
     ): Promise<ExecutionResult> {
          // Validate code size
          if (code.length > this.maxCodeSize) {
               return {
                    stdout: '',
                    stderr: `Error: Code exceeds maximum size of ${this.maxCodeSize} bytes`,
                    exitCode: 1,
                    executionTime: 0,
                    error: 'Code size limit exceeded',
               };
          }

          // Sanitize code
          const sanitizedCode = this.sanitizeCode(code, language);

          // Get language configuration
          const langConfig = this.languageMap[language];
          if (!langConfig) {
               return {
                    stdout: '',
                    stderr: `Error: Unsupported language: ${language}`,
                    exitCode: 1,
                    executionTime: 0,
                    error: 'Unsupported language',
               };
          }

          // Build Piston request
          const request: PistonRequest = {
               language: langConfig.language,
               version: langConfig.version,
               files: [
                    {
                         name: `main.${langConfig.extension}`,
                         content: sanitizedCode,
                    },
               ],
               stdin,
               run_timeout: this.maxTimeout,
          };

          // Execute code
          const startTime = Date.now();
          try {
               const response = await fetch(`${this.apiUrl}/execute`, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
               });

               if (!response.ok) {
                    throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
               }

               const result: PistonResponse = await response.json();
               const executionTime = Date.now() - startTime;

               return this.parseResult(result, executionTime);
          } catch (error) {
               const executionTime = Date.now() - startTime;
               return {
                    stdout: '',
                    stderr: error instanceof Error ? error.message : 'Unknown error occurred',
                    exitCode: 1,
                    executionTime,
                    error: 'Execution failed',
               };
          }
     }

     /**
      * Sanitize code by removing dangerous patterns
      */
     private sanitizeCode(code: string, language: string): string {
          const patterns = this.dangerousPatterns[language] || [];
          let sanitized = code;

          for (const pattern of patterns) {
               sanitized = sanitized.replace(pattern, '/* REMOVED FOR SECURITY */');
          }

          return sanitized;
     }

     /**
      * Parse Piston API response into ExecutionResult
      */
     private parseResult(response: PistonResponse, executionTime: number): ExecutionResult {
          const { run, compile } = response;

          // Check for compilation errors
          if (compile && compile.code !== 0) {
               return {
                    stdout: compile.stdout,
                    stderr: compile.stderr,
                    exitCode: compile.code,
                    executionTime,
                    error: 'Compilation failed',
               };
          }

          // Check for timeout
          if (run.signal === 'SIGTERM' || run.signal === 'SIGKILL') {
               return {
                    stdout: run.stdout,
                    stderr: run.stderr + '\n\nExecution timed out (30 second limit)',
                    exitCode: run.code,
                    executionTime,
                    error: 'Execution timeout',
               };
          }

          // Normal execution result
          return {
               stdout: run.stdout,
               stderr: run.stderr,
               exitCode: run.code,
               executionTime,
          };
     }

     /**
      * Validate code before execution
      */
     validateCode(code: string, language: string): { valid: boolean; error?: string } {
          // Check code size
          if (code.length > this.maxCodeSize) {
               return {
                    valid: false,
                    error: `Code exceeds maximum size of ${this.maxCodeSize} bytes`,
               };
          }

          // Check if language is supported
          if (!this.languageMap[language]) {
               return {
                    valid: false,
                    error: `Unsupported language: ${language}`,
               };
          }

          // Check for empty code
          if (!code.trim()) {
               return {
                    valid: false,
                    error: 'Code cannot be empty',
               };
          }

          return { valid: true };
     }
}

// Export singleton instance
export const codeExecutionService = new CodeExecutionService();
