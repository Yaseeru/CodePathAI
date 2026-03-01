'use client';

import React, { Component, ReactNode } from 'react';
import { logError } from '@/lib/monitoring/sentry';

interface Props {
     children: ReactNode;
     fallback?: ReactNode;
}

interface State {
     hasError: boolean;
     error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
     constructor(props: Props) {
          super(props);
          this.state = { hasError: false };
     }

     static getDerivedStateFromError(error: Error): State {
          return { hasError: true, error };
     }

     componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
          logError(error, {
               feature: 'error-boundary',
               extra: {
                    componentStack: errorInfo.componentStack,
               },
          });
     }

     render() {
          if (this.state.hasError) {
               if (this.props.fallback) {
                    return this.props.fallback;
               }

               return (
                    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                         <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                              <div className="text-red-500 text-5xl mb-4">⚠️</div>
                              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                   Something went wrong
                              </h1>
                              <p className="text-gray-600 mb-6">
                                   We're sorry, but something unexpected happened. Our team has been notified.
                              </p>
                              <button
                                   onClick={() => window.location.reload()}
                                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                   Reload Page
                              </button>
                         </div>
                    </div>
               );
          }

          return this.props.children;
     }
}
