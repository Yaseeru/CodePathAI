'use client';

import { useState, useRef } from 'react';
import CodeEditorWithAutoSave from './CodeEditorWithAutoSave';
import CodeOutput from './CodeOutput';
import CodeControls from './CodeControls';

interface ExecutionResult {
     stdout: string;
     stderr: string;
     exitCode: number;
     executionTime: number;
     error?: string;
}

interface CodeEditorLayoutProps {
     language: 'javascript' | 'python' | 'html';
     initialCode: string;
     starterCode?: string;
     lessonId?: string;
     projectId?: string;
     readOnly?: boolean;
}

export default function CodeEditorLayout({
     language,
     initialCode,
     starterCode,
     lessonId,
     projectId,
     readOnly = false,
}: CodeEditorLayoutProps) {
     const [code, setCode] = useState(initialCode);
     const [output, setOutput] = useState<ExecutionResult | null>(null);
     const [isRunning, setIsRunning] = useState(false);
     const abortControllerRef = useRef<AbortController | null>(null);

     const handleRun = async () => {
          setIsRunning(true);
          abortControllerRef.current = new AbortController();

          try {
               const response = await fetch('/api/code/execute', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         code,
                         language,
                    }),
                    signal: abortControllerRef.current.signal,
               });

               if (!response.ok) {
                    throw new Error('Failed to execute code');
               }

               const result = await response.json();
               setOutput(result);
          } catch (error) {
               if (error instanceof Error && error.name === 'AbortError') {
                    setOutput({
                         stdout: '',
                         stderr: 'Execution stopped by user',
                         exitCode: 1,
                         executionTime: 0,
                    });
               } else {
                    console.error('Error executing code:', error);
                    setOutput({
                         stdout: '',
                         stderr: '',
                         exitCode: 1,
                         executionTime: 0,
                         error: error instanceof Error ? error.message : 'Unknown error occurred',
                    });
               }
          } finally {
               setIsRunning(false);
               abortControllerRef.current = null;
          }
     };

     const handleStop = () => {
          if (abortControllerRef.current) {
               abortControllerRef.current.abort();
          }
     };

     const handleClearOutput = () => {
          setOutput(null);
     };

     const handleResetCode = () => {
          if (confirm('Are you sure you want to reset the code to the starter template?')) {
               setCode(starterCode || initialCode);
               setOutput(null);
          }
     };

     return (
          <div className="h-full w-full flex flex-col bg-gray-900">
               {/* Controls */}
               <CodeControls
                    onRun={handleRun}
                    onStop={handleStop}
                    onClearOutput={handleClearOutput}
                    onResetCode={handleResetCode}
                    isRunning={isRunning}
                    executionTime={output?.executionTime}
               />

               {/* Editor and Output */}
               <div className="flex-1 flex overflow-hidden">
                    {/* Code Editor */}
                    <div className="flex-1 border-r border-gray-700">
                         <CodeEditorWithAutoSave
                              language={language}
                              initialValue={code}
                              lessonId={lessonId}
                              projectId={projectId}
                              readOnly={readOnly}
                              onRun={handleRun}
                         />
                    </div>

                    {/* Output Panel */}
                    <div className="w-1/2">
                         <CodeOutput result={output} onClear={handleClearOutput} />
                    </div>
               </div>
          </div>
     );
}
