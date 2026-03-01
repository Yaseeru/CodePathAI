'use client';

interface LoadingSpinnerProps {
     size?: 'sm' | 'md' | 'lg';
     className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
     const sizeClasses = {
          sm: 'h-4 w-4 border-2',
          md: 'h-8 w-8 border-2',
          lg: 'h-12 w-12 border-3',
     };

     return (
          <div
               className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]} ${className}`}
               role="status"
               aria-label="Loading"
          >
               <span className="sr-only">Loading...</span>
          </div>
     );
}

interface LoadingOverlayProps {
     message?: string;
     className?: string;
}

export function LoadingOverlay({ message = 'Loading...', className = '' }: LoadingOverlayProps) {
     return (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
               <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-700 font-medium">{message}</p>
               </div>
          </div>
     );
}

interface LoadingStateProps {
     message?: string;
     className?: string;
}

export function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
     return (
          <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
               <LoadingSpinner size="lg" />
               <p className="text-gray-600 mt-4">{message}</p>
          </div>
     );
}

interface ButtonLoadingProps {
     loading: boolean;
     children: React.ReactNode;
     className?: string;
     disabled?: boolean;
     onClick?: () => void;
     type?: 'button' | 'submit' | 'reset';
}

export function ButtonWithLoading({
     loading,
     children,
     className = '',
     disabled,
     onClick,
     type = 'button',
}: ButtonLoadingProps) {
     return (
          <button
               type={type}
               onClick={onClick}
               disabled={disabled || loading}
               className={`relative ${className}`}
          >
               {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                         <LoadingSpinner size="sm" />
                    </span>
               )}
               <span className={loading ? 'invisible' : ''}>{children}</span>
          </button>
     );
}
