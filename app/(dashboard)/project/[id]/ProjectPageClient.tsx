'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CodeOutput from '@/components/editor/CodeOutput';
import CodeControls from '@/components/editor/CodeControls';
import EditorSkeleton from '@/components/editor/EditorSkeleton';

// Dynamic import for Monaco Editor (heavy component, SSR disabled)
const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
     loading: () => <EditorSkeleton />,
     ssr: false,
});

interface ExecutionResult {
     stdout: string;
     stderr: string;
     exitCode: number;
     executionTime: number;
     error?: string;
}

interface ProjectRequirement {
     id: string;
     description: string;
     priority: 'must' | 'should' | 'could';
}

interface SuccessCriterion {
     id: string;
     description: string;
     testable: boolean;
}

interface ProjectPageClientProps {
     project: any;
     savedCode: string;
     savedLanguage: string;
     userId: string;
     latestSubmission: any;
}

export default function ProjectPageClient({
     project,
     savedCode,
     savedLanguage,
     userId,
     latestSubmission,
}: ProjectPageClientProps) {
     const [code, setCode] = useState(savedCode);
     const [language, setLanguage] = useState<'javascript' | 'python' | 'html'>(
          savedLanguage as 'javascript' | 'python' | 'html'
     );
     const [output, setOutput] = useState<ExecutionResult | null>(null);
     const [isRunning, setIsRunning] = useState(false);
     const [isSaving, setIsSaving] = useState(false);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
     const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

     const requirements: ProjectRequirement[] = project.requirements || [];
     const successCriteria: SuccessCriterion[] = project.success_criteria || [];

     // Calculate completion percentage based on checked criteria
     const [checkedCriteria, setCheckedCriteria] = useState<Set<string>>(new Set());
     const completionPercentage = successCriteria.length > 0
          ? Math.round((checkedCriteria.size / successCriteria.length) * 100)
          : 0;

     // Auto-save code every 30 seconds
     useEffect(() => {
          const interval = setInterval(() => {
               if (code !== savedCode) {
                    handleSaveCode();
               }
          }, 30000);

          return () => clearInterval(interval);
     }, [code, savedCode]);

     const handleSaveCode = useCallback(async () => {
          if (isSaving) return;

          setIsSaving(true);
          try {
               const response = await fetch(`/api/projects/${project.id}/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         code,
                         language,
                    }),
               });

               if (response.ok) {
                    setLastSaveTime(new Date());
               }
          } catch (error) {
               console.error('Failed to save code:', error);
          } finally {
               setIsSaving(false);
          }
     }, [code, language, project.id, isSaving]);

     const handleRunCode = async () => {
          setIsRunning(true);
          setOutput(null);

          try {
               const response = await fetch('/api/code/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         code,
                         language,
                    }),
               });

               const result = await response.json();
               setOutput(result);
          } catch (error) {
               setOutput({
                    stdout: '',
                    stderr: '',
                    exitCode: 1,
                    executionTime: 0,
                    error: 'Failed to execute code. Please try again.',
               });
          } finally {
               setIsRunning(false);
          }
     };

     const handleStopCode = () => {
          setIsRunning(false);
     };

     const handleClearOutput = () => {
          setOutput(null);
     };

     const handleResetCode = () => {
          if (confirm('Are you sure you want to reset the code? This will clear all your work.')) {
               setCode('');
               setOutput(null);
          }
     };

     const handleSubmitProject = async () => {
          if (!code.trim()) {
               alert('Please write some code before submitting.');
               return;
          }

          if (!confirm('Are you ready to submit your project for AI review?')) {
               return;
          }

          setIsSubmitting(true);
          try {
               const response = await fetch(`/api/projects/${project.id}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                         code,
                         language,
                    }),
               });

               if (response.ok) {
                    setShowSubmitSuccess(true);
                    setTimeout(() => setShowSubmitSuccess(false), 5000);
               } else {
                    const error = await response.json();
                    alert(`Failed to submit project: ${error.message || 'Unknown error'}`);
               }
          } catch (error) {
               console.error('Failed to submit project:', error);
               alert('Failed to submit project. Please try again.');
          } finally {
               setIsSubmitting(false);
          }
     };

     const toggleCriterion = (id: string) => {
          setCheckedCriteria((prev) => {
               const next = new Set(prev);
               if (next.has(id)) {
                    next.delete(id);
               } else {
                    next.add(id);
               }
               return next;
          });
     };

     return (
          <div className="h-screen flex flex-col bg-gray-50">
               {/* Top Bar */}
               <div className="bg-white border-b border-gray-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                         <div>
                              <h1 className="text-xl font-semibold text-gray-900">
                                   {project.title}
                              </h1>
                              <p className="text-sm text-gray-500">
                                   Project • {project.estimated_duration} min
                              </p>
                         </div>
                         <div className="flex items-center gap-4">
                              {lastSaveTime && (
                                   <span className="text-xs text-gray-500">
                                        Last saved: {lastSaveTime.toLocaleTimeString()}
                                   </span>
                              )}
                              {isSaving && (
                                   <span className="text-xs text-blue-600">Saving...</span>
                              )}
                              <div className="text-sm font-medium text-gray-700">
                                   {completionPercentage}% Complete
                              </div>
                              <button
                                   onClick={handleSubmitProject}
                                   disabled={isSubmitting}
                                   className={`
                px-4 py-2 rounded font-medium text-sm transition-colors
                ${isSubmitting
                                             ? 'bg-gray-400 cursor-not-allowed'
                                             : 'bg-blue-600 hover:bg-blue-700'
                                        }
                text-white
              `}
                              >
                                   {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                              </button>
                         </div>
                    </div>
               </div>

               {/* Success Message */}
               {showSubmitSuccess && (
                    <div className="bg-green-50 border-b border-green-200 px-6 py-3">
                         <div className="flex items-center gap-2 text-green-800">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                   <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                   />
                              </svg>
                              <span className="font-medium">
                                   Project submitted successfully! AI review is in progress.
                              </span>
                         </div>
                    </div>
               )}

               {/* Main Content Area */}
               <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Project Details */}
                    <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
                         <div className="flex-1 overflow-y-auto p-6 space-y-6">
                              {/* Description */}
                              <div>
                                   <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                        Description
                                   </h2>
                                   <p className="text-gray-700 leading-relaxed">
                                        {project.description}
                                   </p>
                              </div>

                              {/* Requirements */}
                              <div>
                                   <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                        Requirements
                                   </h2>
                                   <div className="space-y-2">
                                        {requirements.map((req: ProjectRequirement) => (
                                             <div
                                                  key={req.id}
                                                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                             >
                                                  <span
                                                       className={`
                        px-2 py-1 text-xs font-medium rounded
                        ${req.priority === 'must'
                                                                 ? 'bg-red-100 text-red-700'
                                                                 : req.priority === 'should'
                                                                      ? 'bg-yellow-100 text-yellow-700'
                                                                      : 'bg-blue-100 text-blue-700'
                                                            }
                      `}
                                                  >
                                                       {req.priority.toUpperCase()}
                                                  </span>
                                                  <p className="text-sm text-gray-700 flex-1">
                                                       {req.description}
                                                  </p>
                                             </div>
                                        ))}
                                   </div>
                              </div>

                              {/* Success Criteria Checklist */}
                              <div>
                                   <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                        Success Criteria
                                   </h2>
                                   <div className="space-y-2">
                                        {successCriteria.map((criterion: SuccessCriterion) => (
                                             <label
                                                  key={criterion.id}
                                                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                             >
                                                  <input
                                                       type="checkbox"
                                                       checked={checkedCriteria.has(criterion.id)}
                                                       onChange={() => toggleCriterion(criterion.id)}
                                                       className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                  />
                                                  <span className="text-sm text-gray-700 flex-1">
                                                       {criterion.description}
                                                  </span>
                                             </label>
                                        ))}
                                   </div>
                              </div>

                              {/* Latest Submission Status */}
                              {latestSubmission && (
                                   <div>
                                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                             Latest Submission
                                        </h2>
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                             <div className="flex items-center justify-between mb-2">
                                                  <span className="text-sm font-medium text-blue-900">
                                                       Status: {latestSubmission.status}
                                                  </span>
                                                  {latestSubmission.score !== null && (
                                                       <span className="text-sm font-medium text-blue-900">
                                                            Score: {latestSubmission.score}/100
                                                       </span>
                                                  )}
                                             </div>
                                             <p className="text-xs text-blue-700">
                                                  Submitted: {new Date(latestSubmission.submitted_at).toLocaleString()}
                                             </p>
                                             {latestSubmission.review_feedback && (
                                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                                       <p className="text-sm text-blue-900 font-medium mb-1">
                                                            AI Feedback:
                                                       </p>
                                                       <p className="text-sm text-blue-800">
                                                            {latestSubmission.review_feedback.overallFeedback || 'Review in progress...'}
                                                       </p>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* Right Panel - Code Editor and Output */}
                    <div className="w-1/2 flex flex-col bg-gray-900">
                         {/* Language Selector and Code Controls */}
                         <div className="flex items-center border-b border-gray-700">
                              <select
                                   value={language}
                                   onChange={(e) => setLanguage(e.target.value as 'javascript' | 'python' | 'html')}
                                   className="px-4 py-2 bg-gray-800 text-white border-r border-gray-700 focus:outline-none focus:bg-gray-700"
                              >
                                   <option value="javascript">JavaScript</option>
                                   <option value="python">Python</option>
                                   <option value="html">HTML/CSS</option>
                              </select>
                              <div className="flex-1">
                                   <CodeControls
                                        onRun={handleRunCode}
                                        onStop={handleStopCode}
                                        onClearOutput={handleClearOutput}
                                        onResetCode={handleResetCode}
                                        isRunning={isRunning}
                                        executionTime={output?.executionTime}
                                   />
                              </div>
                         </div>

                         {/* Editor and Output Split */}
                         <div className="flex-1 flex flex-col overflow-hidden">
                              {/* Code Editor */}
                              <div className="h-1/2 border-b border-gray-700">
                                   <CodeEditor
                                        language={language}
                                        value={code}
                                        onChange={setCode}
                                        onSave={handleSaveCode}
                                        onRun={handleRunCode}
                                   />
                              </div>

                              {/* Code Output */}
                              <div className="h-1/2">
                                   <CodeOutput result={output} onClear={handleClearOutput} />
                              </div>
                         </div>
                    </div>
               </div>

               {/* Mobile Warning */}
               <div className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md text-center">
                         <svg
                              className="w-16 h-16 text-yellow-500 mx-auto mb-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                         >
                              <path
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   strokeWidth={2}
                                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                         </svg>
                         <h2 className="text-xl font-bold text-gray-900 mb-2">
                              Desktop Required
                         </h2>
                         <p className="text-gray-600">
                              For the best coding experience, please use a desktop or laptop computer
                              with a larger screen.
                         </p>
                    </div>
               </div>
          </div>
     );
}
