'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import GoalInput from '@/components/onboarding/GoalInput';

interface GoalPivotModalProps {
     isOpen: boolean;
     onClose: () => void;
     currentGoal: string;
     currentProgress: {
          completedLessons: number;
          completedProjects: number;
          totalTime: string;
     };
     onConfirm: (newGoal: string) => Promise<void>;
}

/**
 * GoalPivotModal component
 * Modal for changing user's learning goal with progress preservation warning
 */
export default function GoalPivotModal({
     isOpen,
     onClose,
     currentGoal,
     currentProgress,
     onConfirm,
}: GoalPivotModalProps) {
     const [step, setStep] = useState<'input' | 'confirm'>('input');
     const [newGoal, setNewGoal] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);

     const handleClose = () => {
          if (!loading) {
               setStep('input');
               setNewGoal('');
               setError('');
               onClose();
          }
     };

     const handleNext = () => {
          // Validate goal
          if (newGoal.length < 20) {
               setError('Goal must be at least 20 characters');
               return;
          }
          if (newGoal.length > 500) {
               setError('Goal must be less than 500 characters');
               return;
          }

          setError('');
          setStep('confirm');
     };

     const handleBack = () => {
          setStep('input');
     };

     const handleConfirm = async () => {
          try {
               setLoading(true);
               setError('');
               await onConfirm(newGoal);
               handleClose();
          } catch (err) {
               console.error('Error pivoting goal:', err);
               setError(err instanceof Error ? err.message : 'Failed to change goal. Please try again.');
          } finally {
               setLoading(false);
          }
     };

     return (
          <Modal isOpen={isOpen} onClose={handleClose} title="Change Your Learning Goal" size="lg">
               {step === 'input' ? (
                    <div className="space-y-6">
                         {/* Current Goal Display */}
                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h3 className="text-sm font-semibold text-blue-900 mb-2">Current Goal</h3>
                              <p className="text-blue-800">{currentGoal}</p>
                         </div>

                         {/* Current Progress Display */}
                         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Progress So Far</h3>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                   <div>
                                        <p className="text-2xl font-bold text-gray-900">{currentProgress.completedLessons}</p>
                                        <p className="text-xs text-gray-600">Lessons Completed</p>
                                   </div>
                                   <div>
                                        <p className="text-2xl font-bold text-gray-900">{currentProgress.completedProjects}</p>
                                        <p className="text-xs text-gray-600">Projects Completed</p>
                                   </div>
                                   <div>
                                        <p className="text-2xl font-bold text-gray-900">{currentProgress.totalTime}</p>
                                        <p className="text-xs text-gray-600">Learning Time</p>
                                   </div>
                              </div>
                         </div>

                         {/* New Goal Input */}
                         <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Your New Goal</h3>
                              <GoalInput value={newGoal} onChange={setNewGoal} error={error} />
                         </div>

                         {/* Actions */}
                         <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                              <button
                                   onClick={handleClose}
                                   className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                   disabled={loading}
                              >
                                   Cancel
                              </button>
                              <button
                                   onClick={handleNext}
                                   className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                   disabled={newGoal.length < 20 || newGoal.length > 500 || loading}
                              >
                                   Next
                              </button>
                         </div>
                    </div>
               ) : (
                    <div className="space-y-6">
                         {/* Warning Message */}
                         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-start">
                                   <svg
                                        className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0"
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
                                   <div>
                                        <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                                             Important: About Your Progress
                                        </h3>
                                        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                                             <li>Your current roadmap will be archived</li>
                                             <li>A new personalized roadmap will be generated for your new goal</li>
                                             <li>All your completed lessons and projects will be preserved in your history</li>
                                             <li>You can view your archived roadmaps anytime in your progress history</li>
                                        </ul>
                                   </div>
                              </div>
                         </div>

                         {/* Goal Comparison */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border border-gray-200 rounded-lg p-4">
                                   <h3 className="text-sm font-semibold text-gray-600 mb-2">Current Goal</h3>
                                   <p className="text-gray-900">{currentGoal}</p>
                              </div>
                              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                                   <h3 className="text-sm font-semibold text-blue-600 mb-2">New Goal</h3>
                                   <p className="text-blue-900">{newGoal}</p>
                              </div>
                         </div>

                         {/* Error Display */}
                         {error && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                   <p className="text-sm text-red-800">{error}</p>
                              </div>
                         )}

                         {/* Confirmation Actions */}
                         <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                              <button
                                   onClick={handleBack}
                                   className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                   disabled={loading}
                              >
                                   Back
                              </button>
                              <button
                                   onClick={handleConfirm}
                                   className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                   disabled={loading}
                              >
                                   {loading ? (
                                        <>
                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                             Generating New Roadmap...
                                        </>
                                   ) : (
                                        'Confirm & Generate New Roadmap'
                                   )}
                              </button>
                         </div>
                    </div>
               )}
          </Modal>
     );
}
