'use client';

interface LessonProgressProps {
     totalSteps: number;
     completedSteps: number;
     currentStep?: number;
}

export default function LessonProgress({
     totalSteps,
     completedSteps,
     currentStep,
}: LessonProgressProps) {
     const percentage = Math.round((completedSteps / totalSteps) * 100);

     return (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
               {/* Header */}
               <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                         Lesson Progress
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                         {percentage}%
                    </span>
               </div>

               {/* Progress Bar */}
               <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div
                         className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                         style={{ width: `${percentage}%` }}
                    />
               </div>

               {/* Step Indicators */}
               <div className="flex items-center justify-between">
                    {Array.from({ length: totalSteps }, (_, index) => {
                         const stepNumber = index + 1;
                         const isCompleted = stepNumber <= completedSteps;
                         const isCurrent = stepNumber === currentStep;

                         return (
                              <div
                                   key={stepNumber}
                                   className="flex flex-col items-center gap-1"
                              >
                                   {/* Step Circle */}
                                   <div
                                        className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-xs font-semibold transition-all duration-200
                  ${isCompleted
                                                  ? 'bg-green-500 text-white'
                                                  : isCurrent
                                                       ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                                                       : 'bg-gray-200 text-gray-500'
                                             }
                `}
                                   >
                                        {isCompleted ? (
                                             <svg
                                                  className="w-5 h-5"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                             >
                                                  <path
                                                       strokeLinecap="round"
                                                       strokeLinejoin="round"
                                                       strokeWidth={3}
                                                       d="M5 13l4 4L19 7"
                                                  />
                                             </svg>
                                        ) : (
                                             stepNumber
                                        )}
                                   </div>

                                   {/* Step Label */}
                                   <span
                                        className={`
                  text-xs font-medium
                  ${isCompleted
                                                  ? 'text-green-600'
                                                  : isCurrent
                                                       ? 'text-blue-600'
                                                       : 'text-gray-400'
                                             }
                `}
                                   >
                                        Step {stepNumber}
                                   </span>
                              </div>
                         );
                    })}
               </div>

               {/* Progress Text */}
               <div className="mt-4 text-center text-sm text-gray-600">
                    {completedSteps} of {totalSteps} steps completed
               </div>
          </div>
     );
}
