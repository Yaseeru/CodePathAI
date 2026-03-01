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
                    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
                         <div className="max-w-md w-full bg-surface rounded-lg shadow-lg p-8 text-center border border-border">
                              <div className="text-red-500 text-5xl mb-4">⚠️</div>
                              <h1 className="text-2xl font-bold text-text-primary mb-2">
                                   Something went wrong
                              </h1>
                              <p className="text-text-secondary mb-6">
                                   We're sorry, but something unexpected happened. Our team has been notified.
                              </p>
                              <button
                                   onClick={() => window.location.reload()}
                                   className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
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
