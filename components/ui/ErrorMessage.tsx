'use client';

import { ApiError } from '@/lib/api/errorHandling';

interface ErrorMessageProps {
     error: ApiError | string;
     onRetry?: () => void;
     className?: string;
}

export function ErrorMessage({ error, onRetry, className = '' }: ErrorMessageProps) {
     const errorData = typeof error === 'string'
          ? { userMessage: error, retryable: false }
          : error;

     return (
          <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
               <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-red-500 text-xl">⚠️</div>
                    <div className="flex-1">
                         <p className="text-sm text-red-800 font-medium">
                              {errorData.userMessage}
                         </p>
                         {errorData.action && (
                              <p className="text-sm text-red-700 mt-1">
                                   {errorData.action}
                              </p>
                         )}
                         {onRetry && errorData.retryable && (
                              <button
                                   onClick={onRetry}
                                   className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                              >
                                   Try Again
                              </button>
                         )}
                    </div>
               </div>
          </div>
     );
}

interface SuccessMessageProps {
     message: string;
     className?: string;
}

export function SuccessMessage({ message, className = '' }: SuccessMessageProps) {
     return (
          <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
               <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-green-500 text-xl">✓</div>
                    <p className="text-sm text-green-800 font-medium">
                         {message}
                    </p>
               </div>
          </div>
     );
}

interface LoadingMessageProps {
     message?: string;
     className?: string;
}

export function LoadingMessage({ message = 'Loading...', className = '' }: LoadingMessageProps) {
     return (
          <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
               <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                         <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                    <p className="text-sm text-blue-800 font-medium">
                         {message}
                    </p>
               </div>
          </div>
     );
}
