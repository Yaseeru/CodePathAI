'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
     id: string;
     type: ToastType;
     title: string;
     message: string;
     action?: string;
     duration?: number;
     onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, action, duration = 5000, onClose }: ToastProps) {
     const [isVisible, setIsVisible] = useState(true);

     useEffect(() => {
          const timer = setTimeout(() => {
               setIsVisible(false);
               setTimeout(() => onClose(id), 300); // Wait for fade out animation
          }, duration);

          return () => clearTimeout(timer);
     }, [id, duration, onClose]);

     const typeStyles = {
          success: {
               bg: 'bg-success/10',
               border: 'border-success/30',
               text: 'text-success',
               icon: '✓',
               iconBg: 'bg-success',
          },
          error: {
               bg: 'bg-error/10',
               border: 'border-error/30',
               text: 'text-error',
               icon: '⚠️',
               iconBg: 'bg-error',
          },
          warning: {
               bg: 'bg-warning/10',
               border: 'border-warning/30',
               text: 'text-warning',
               icon: '⚡',
               iconBg: 'bg-warning',
          },
          info: {
               bg: 'bg-info/10',
               border: 'border-info/30',
               text: 'text-info',
               icon: 'ℹ️',
               iconBg: 'bg-info',
          },
     };

     const styles = typeStyles[type];

     return (
          <div
               className={`${styles.bg} border ${styles.border} rounded-lg shadow-lg p-4 max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
               role="alert"
          >
               <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 ${styles.iconBg} rounded-full flex items-center justify-center text-white`}>
                         {styles.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                         <h3 className={`text-sm font-semibold ${styles.text}`}>{title}</h3>
                         <p className={`text-sm ${styles.text} mt-1`}>{message}</p>
                         {action && (
                              <p className={`text-xs ${styles.text} mt-2 font-medium`}>{action}</p>
                         )}
                    </div>
                    <button
                         onClick={() => {
                              setIsVisible(false);
                              setTimeout(() => onClose(id), 300);
                         }}
                         className={`${styles.text} hover:opacity-70 transition-opacity`}
                         aria-label="Close notification"
                    >
                         ✕
                    </button>
               </div>
          </div>
     );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
     return (
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
               <div className="pointer-events-auto">
                    {children}
               </div>
          </div>
     );
}
