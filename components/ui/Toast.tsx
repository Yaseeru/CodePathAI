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
               bg: 'bg-green-50',
               border: 'border-green-200',
               text: 'text-green-800',
               icon: '✓',
               iconBg: 'bg-green-500',
          },
          error: {
               bg: 'bg-red-50',
               border: 'border-red-200',
               text: 'text-red-800',
               icon: '⚠️',
               iconBg: 'bg-red-500',
          },
          warning: {
               bg: 'bg-yellow-50',
               border: 'border-yellow-200',
               text: 'text-yellow-800',
               icon: '⚡',
               iconBg: 'bg-yellow-500',
          },
          info: {
               bg: 'bg-blue-50',
               border: 'border-blue-200',
               text: 'text-blue-800',
               icon: 'ℹ️',
               iconBg: 'bg-blue-500',
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
                         className={`flex-shrink-0 ${styles.text} hover:opacity-70 transition-opacity`}
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
