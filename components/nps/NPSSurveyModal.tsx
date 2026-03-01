'use client';

import { useState } from 'react';
import { trackNPSSurvey, AnalyticsEvents } from '@/lib/monitoring/posthog';

interface NPSSurveyModalProps {
     isOpen: boolean;
     onClose: () => void;
     onSubmit: (score: number, feedback?: string) => Promise<void>;
}

export default function NPSSurveyModal({ isOpen, onClose, onSubmit }: NPSSurveyModalProps) {
     const [selectedScore, setSelectedScore] = useState<number | null>(null);
     const [feedback, setFeedback] = useState('');
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [error, setError] = useState<string | null>(null);

     if (!isOpen) return null;

     const handleSubmit = async () => {
          if (selectedScore === null) {
               setError('Please select a score');
               return;
          }

          setIsSubmitting(true);
          setError(null);

          try {
               await onSubmit(selectedScore, feedback || undefined);

               // Track NPS survey completion
               trackNPSSurvey(selectedScore, feedback);

               onClose();
          } catch (err) {
               setError('Failed to submit survey. Please try again.');
               console.error('Error submitting NPS survey:', err);
          } finally {
               setIsSubmitting(false);
          }
     };

     const handleDismiss = () => {
          // Track dismissal
          if (typeof window !== 'undefined') {
               const posthog = require('posthog-js').default;
               posthog.capture(AnalyticsEvents.NPS_SURVEY_DISMISSED);
          }
          onClose();
     };

     return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                    <div className="mb-4">
                         <h2 className="text-xl font-semibold text-gray-900">
                              How likely are you to recommend CodePath AI?
                         </h2>
                         <p className="text-sm text-gray-600 mt-2">
                              Your feedback helps us improve the learning experience.
                         </p>
                    </div>

                    {/* Score Selection */}
                    <div className="mb-6">
                         <div className="flex justify-between mb-2">
                              <span className="text-xs text-gray-500">Not at all likely</span>
                              <span className="text-xs text-gray-500">Extremely likely</span>
                         </div>
                         <div className="flex gap-2 justify-between">
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                   <button
                                        key={score}
                                        onClick={() => setSelectedScore(score)}
                                        className={`
                  w-10 h-10 rounded-md border-2 font-medium transition-all
                  ${selectedScore === score
                                                  ? 'border-blue-500 bg-blue-500 text-white'
                                                  : 'border-gray-300 text-gray-700 hover:border-blue-300'
                                             }
                `}
                                   >
                                        {score}
                                   </button>
                              ))}
                         </div>
                    </div>

                    {/* Feedback Text Area */}
                    <div className="mb-6">
                         <label htmlFor="nps-feedback" className="block text-sm font-medium text-gray-700 mb-2">
                              What's the main reason for your score? (Optional)
                         </label>
                         <textarea
                              id="nps-feedback"
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Tell us more about your experience..."
                              maxLength={500}
                         />
                         <p className="text-xs text-gray-500 mt-1">
                              {feedback.length}/500 characters
                         </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-600">{error}</p>
                         </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                         <button
                              onClick={handleDismiss}
                              disabled={isSubmitting}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              Maybe later
                         </button>
                         <button
                              onClick={handleSubmit}
                              disabled={isSubmitting || selectedScore === null}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              {isSubmitting ? 'Submitting...' : 'Submit'}
                         </button>
                    </div>
               </div>
          </div>
     );
}
