'use client';

import { useEffect, useState } from 'react';

export interface NotificationProps {
     type: 'success' | 'info' | 'warning' | 'error' | 'difficulty_adjustment';
     title: string;
     message: string;
     duration?: number;
     onClose?: () => void;
     oldLevel?: number;
     newLevel?: number;
}

export default function Notification({
     type,
     title,
     message,
     duration = 5000,
     onClose,
     oldLevel,
     newLevel
}: NotificationProps) {
     const [isVisible, setIsVisible] = useState(true);

     useEffect(() => {
          if (duration > 0) {
               const timer = setTimeout(() => {
                    setIsVisible(false);
                    onClose?.();
               }, duration);

               return () => clearTimeout(timer);
          }
     }, [duration, onClose]);

     if (!isVisible) return null;

     const getTypeStyles = () => {
          switch (type) {
               case 'success':
                    return 'bg-green-50 border-green-200 text-green-800';
               case 'error':
                    return 'bg-red-50 border-red-200 text-red-800';
               case 'warning':
                    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
               case 'difficulty_adjustment':
                    return 'bg-blue-50 border-blue-200 text-blue-800';
               default:
                    return 'bg-blue-50 border-blue-200 text-blue-800';
          }
     };

     const getIcon = () => {
          if (type === 'difficulty_adjustment' && oldLevel && newLevel) {
               return newLevel > oldLevel ? '📈' : '📉';
          }
          switch (type) {
               case 'success':
                    return '✓';
               case 'error':
                    return '✕';
               case 'warning':
                    return '⚠';
               default:
                    return 'ℹ';
          }
     };

     return (
          <div
               className={`fixed top-4 right-4 z-50 max-w-md p-4 border rounded-lg shadow-lg ${getTypeStyles()} animate-slide-in`}
               role="alert"
          >
               <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{getIcon()}</span>
                    <div className="flex-1">
                         <h3 className="font-semibold mb-1">{title}</h3>
                         <p className="text-sm">{message}</p>
                         {type === 'difficulty_adjustment' && oldLevel && newLevel && (
                              <div className="mt-2 text-sm font-medium">
                                   Level {oldLevel} → Level {newLevel}
                              </div>
                         )}
                    </div>
                    <button
                         onClick={() => {
                              setIsVisible(false);
                              onClose?.();
                         }}
                         className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                         aria-label="Close notification"
                    >
                         ✕
                    </button>
               </div>
          </div>
     );
}
