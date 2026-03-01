/**
 * Error Parser for Code Execution
 * Parses syntax errors, runtime errors, timeout errors, and resource limit errors
 */

export interface ParsedError {
     type: 'syntax' | 'runtime' | 'timeout' | 'resource_limit' | 'unknown';
     message: string;
     lineNumber?: number;
     columnNumber?: number;
     stackTrace?: string[];
     formattedMessage: string;
}

export class ErrorParser {
     /**
      * Parse execution errors with line numbers and stack traces
      */
     static parseError(
          stderr: string,
          stdout: string,
          exitCode: number,
          error?: string,
          language?: string
     ): ParsedError {
          // Check for timeout errors
          if (error === 'Execution timeout' || stderr.includes('timed out')) {
               return this.parseTimeoutError(stderr);
          }

          // Check for resource limit errors
          if (this.isResourceLimitError(stderr)) {
               return this.parseResourceLimitError(stderr);
          }

          // Parse language-specific errors
          if (language === 'javascript') {
               return this.parseJavaScriptError(stderr);
          } else if (language === 'python') {
               return this.parsePythonError(stderr);
          } else if (language === 'html') {
               return this.parseHTMLError(stderr, stdout);
          }

          // Default unknown error
          return {
               type: 'unknown',
               message: stderr || 'Unknown error occurred',
               formattedMessage: this.formatUnknownError(stderr, exitCode),
          };
     }

     /**
      * Parse JavaScript errors with line numbers and stack traces
      */
     private static parseJavaScriptError(stderr: string): ParsedError {
          // Syntax error pattern: SyntaxError: message at line:column
          const syntaxMatch = stderr.match(/SyntaxError: (.+?)(?:\n|$)/);
          if (syntaxMatch) {
               const lineMatch = stderr.match(/at .+?:(\d+):(\d+)/);
               return {
                    type: 'syntax',
                    message: syntaxMatch[1],
                    lineNumber: lineMatch ? parseInt(lineMatch[1]) : undefined,
                    columnNumber: lineMatch ? parseInt(lineMatch[2]) : undefined,
                    formattedMessage: this.formatSyntaxError(
                         syntaxMatch[1],
                         lineMatch ? parseInt(lineMatch[1]) : undefined,
                         lineMatch ? parseInt(lineMatch[2]) : undefined
                    ),
               };
          }

          // Runtime error pattern: Error: message with stack trace
          const runtimeMatch = stderr.match(/(Error|TypeError|ReferenceError|RangeError): (.+?)(?:\n|$)/);
          if (runtimeMatch) {
               const stackTrace = this.extractStackTrace(stderr);
               const lineMatch = stackTrace[0]?.match(/:(\d+):(\d+)/);

               return {
                    type: 'runtime',
                    message: runtimeMatch[2],
                    lineNumber: lineMatch ? parseInt(lineMatch[1]) : undefined,
                    columnNumber: lineMatch ? parseInt(lineMatch[2]) : undefined,
                    stackTrace,
                    formattedMessage: this.formatRuntimeError(
                         runtimeMatch[1],
                         runtimeMatch[2],
                         stackTrace
                    ),
               };
          }

          return {
               type: 'unknown',
               message: stderr,
               formattedMessage: this.formatUnknownError(stderr, 1),
          };
     }

     /**
      * Parse Python errors with line numbers and stack traces
      */
     private static parsePythonError(stderr: string): ParsedError {
          // Syntax error pattern: SyntaxError: message (line X)
          const syntaxMatch = stderr.match(/SyntaxError: (.+?)(?:\n|$)/);
          if (syntaxMatch) {
               const lineMatch = stderr.match(/line (\d+)/);
               return {
                    type: 'syntax',
                    message: syntaxMatch[1],
                    lineNumber: lineMatch ? parseInt(lineMatch[1]) : undefined,
                    formattedMessage: this.formatSyntaxError(
                         syntaxMatch[1],
                         lineMatch ? parseInt(lineMatch[1]) : undefined
                    ),
               };
          }

          // Runtime error pattern: Traceback with error type
          const tracebackMatch = stderr.match(/Traceback \(most recent call last\):/);
          if (tracebackMatch) {
               const stackTrace = this.extractPythonStackTrace(stderr);
               const errorMatch = stderr.match(/(\w+Error): (.+?)$/m);
               const lineMatch = stderr.match(/line (\d+)/);

               return {
                    type: 'runtime',
                    message: errorMatch ? errorMatch[2] : 'Runtime error',
                    lineNumber: lineMatch ? parseInt(lineMatch[1]) : undefined,
                    stackTrace,
                    formattedMessage: this.formatRuntimeError(
                         errorMatch ? errorMatch[1] : 'Error',
                         errorMatch ? errorMatch[2] : 'Runtime error',
                         stackTrace
                    ),
               };
          }

          return {
               type: 'unknown',
               message: stderr,
               formattedMessage: this.formatUnknownError(stderr, 1),
          };
     }

     /**
      * Parse HTML/CSS errors
      */
     private static parseHTMLError(stderr: string, stdout: string): ParsedError {
          if (stderr) {
               return {
                    type: 'syntax',
                    message: stderr,
                    formattedMessage: `HTML/CSS Error:\n${stderr}`,
               };
          }

          return {
               type: 'unknown',
               message: 'No errors detected',
               formattedMessage: 'Execution completed successfully',
          };
     }

     /**
      * Parse timeout errors
      */
     private static parseTimeoutError(stderr: string): ParsedError {
          return {
               type: 'timeout',
               message: 'Code execution exceeded the 30 second time limit',
               formattedMessage: `⏱️ Timeout Error\n\nYour code took too long to execute and was stopped after 30 seconds.\n\nTips:\n- Check for infinite loops\n- Reduce the amount of data being processed\n- Optimize your algorithm\n\nPartial output:\n${stderr.substring(0, 500)}`,
          };
     }

     /**
      * Check if error is a resource limit error
      */
     private static isResourceLimitError(stderr: string): boolean {
          const resourcePatterns = [
               /memory/i,
               /out of memory/i,
               /killed/i,
               /resource/i,
               /limit exceeded/i,
          ];

          return resourcePatterns.some(pattern => pattern.test(stderr));
     }

     /**
      * Parse resource limit errors
      */
     private static parseResourceLimitError(stderr: string): ParsedError {
          return {
               type: 'resource_limit',
               message: 'Code execution exceeded resource limits',
               formattedMessage: `⚠️ Resource Limit Error\n\nYour code used too much memory or other system resources.\n\nTips:\n- Reduce the size of data structures\n- Avoid creating too many objects\n- Check for memory leaks\n\nError details:\n${stderr.substring(0, 500)}`,
          };
     }

     /**
      * Extract stack trace from error output
      */
     private static extractStackTrace(stderr: string): string[] {
          const lines = stderr.split('\n');
          const stackTrace: string[] = [];

          for (const line of lines) {
               if (line.trim().startsWith('at ')) {
                    stackTrace.push(line.trim());
               }
          }

          return stackTrace;
     }

     /**
      * Extract Python stack trace
      */
     private static extractPythonStackTrace(stderr: string): string[] {
          const lines = stderr.split('\n');
          const stackTrace: string[] = [];
          let inTraceback = false;

          for (const line of lines) {
               if (line.includes('Traceback')) {
                    inTraceback = true;
                    continue;
               }

               if (inTraceback && (line.trim().startsWith('File ') || line.trim().startsWith('line '))) {
                    stackTrace.push(line.trim());
               }
          }

          return stackTrace;
     }

     /**
      * Format syntax error for user display
      */
     private static formatSyntaxError(
          message: string,
          lineNumber?: number,
          columnNumber?: number
     ): string {
          let formatted = `🔴 Syntax Error\n\n`;

          if (lineNumber) {
               formatted += `Line ${lineNumber}`;
               if (columnNumber) {
                    formatted += `, Column ${columnNumber}`;
               }
               formatted += `:\n`;
          }

          formatted += `${message}\n\n`;
          formatted += `Fix the syntax error and try again.`;

          return formatted;
     }

     /**
      * Format runtime error for user display
      */
     private static formatRuntimeError(
          errorType: string,
          message: string,
          stackTrace: string[]
     ): string {
          let formatted = `🔴 ${errorType}\n\n`;
          formatted += `${message}\n\n`;

          if (stackTrace.length > 0) {
               formatted += `Stack Trace:\n`;
               stackTrace.slice(0, 5).forEach(line => {
                    formatted += `  ${line}\n`;
               });

               if (stackTrace.length > 5) {
                    formatted += `  ... and ${stackTrace.length - 5} more\n`;
               }
          }

          return formatted;
     }

     /**
      * Format unknown error for user display
      */
     private static formatUnknownError(stderr: string, exitCode: number): string {
          return `⚠️ Error (Exit Code: ${exitCode})\n\n${stderr || 'An unknown error occurred'}`;
     }
}
