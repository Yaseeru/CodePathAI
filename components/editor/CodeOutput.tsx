'use client';

interface ExecutionResult {
     stdout: string;
     stderr: string;
     exitCode: number;
     executionTime: number;
     error?: string;
}

interface CodeOutputProps {
     result: ExecutionResult | null;
     onClear: () => void;
}

export default function CodeOutput({ result, onClear }: CodeOutputProps) {
     if (!result) {
          return (
               <div className="h-full w-full bg-gray-900 text-gray-400 p-4 font-mono text-sm">
                    <p>Run your code to see output here...</p>
               </div>
          );
     }

     const hasError = result.stderr || result.exitCode !== 0 || result.error;

     // Extract line numbers from error messages
     const highlightErrorLines = (errorText: string) => {
          // Match common error patterns with line numbers
          const lineNumberPattern = /line (\d+)|:(\d+):|at line (\d+)/gi;
          const matches = [...errorText.matchAll(lineNumberPattern)];

          if (matches.length === 0) {
               return errorText;
          }

          // Highlight line numbers in the error text
          let highlightedText = errorText;
          matches.forEach((match) => {
               const lineNum = match[1] || match[2] || match[3];
               if (lineNum) {
                    const pattern = new RegExp(`(line ${lineNum}|:${lineNum}:|at line ${lineNum})`, 'gi');
                    highlightedText = highlightedText.replace(
                         pattern,
                         `<span class="text-yellow-400 font-bold">$1</span>`
                    );
               }
          });

          return highlightedText;
     };

     return (
          <div className="h-full w-full bg-gray-900 text-white flex flex-col">
               {/* Header */}
               <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                         <h3 className="text-sm font-semibold">Output</h3>
                         {result.executionTime !== undefined && (
                              <span className="text-xs text-gray-400">
                                   Execution time: {result.executionTime.toFixed(2)}ms
                              </span>
                         )}
                    </div>
                    <button
                         onClick={onClear}
                         className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                         Clear
                    </button>
               </div>

               {/* Output content */}
               <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                    {/* Standard output */}
                    {result.stdout && (
                         <div className="mb-4">
                              <div className="text-xs text-gray-400 mb-1">stdout:</div>
                              <pre className="whitespace-pre-wrap text-green-400">
                                   {result.stdout}
                              </pre>
                         </div>
                    )}

                    {/* Standard error */}
                    {result.stderr && (
                         <div className="mb-4">
                              <div className="text-xs text-gray-400 mb-1">stderr:</div>
                              <pre
                                   className="whitespace-pre-wrap text-red-400"
                                   dangerouslySetInnerHTML={{
                                        __html: highlightErrorLines(result.stderr),
                                   }}
                              />
                         </div>
                    )}

                    {/* General error */}
                    {result.error && (
                         <div className="mb-4">
                              <div className="text-xs text-gray-400 mb-1">Error:</div>
                              <pre
                                   className="whitespace-pre-wrap text-red-400"
                                   dangerouslySetInnerHTML={{
                                        __html: highlightErrorLines(result.error),
                                   }}
                              />
                         </div>
                    )}

                    {/* Exit code */}
                    {result.exitCode !== 0 && (
                         <div className="text-xs text-gray-400">
                              Exit code: <span className="text-red-400">{result.exitCode}</span>
                         </div>
                    )}

                    {/* Success message if no output */}
                    {!result.stdout && !result.stderr && !result.error && result.exitCode === 0 && (
                         <div className="text-green-400">
                              ✓ Code executed successfully with no output
                         </div>
                    )}
               </div>
          </div>
     );
}
