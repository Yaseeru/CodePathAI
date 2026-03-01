'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastContainer, ToastType } from '@/components/ui/Toast';

interface ToastData {
     id: string;
     type: ToastType;
     title: string;
     message: string;
     action?: string;
     duration?: number;
}

interface ToastContextValue {
     showToast: (type: ToastType, title: string, message: string, action?: string, duration?: number) => void;
     showSuccess: (title: string, message: string, action?: string) => void;
     showError: (title: string, message: string, action?: string) => void;
     showWarning: (title: string, message: string, action?: string) => void;
     showInfo: (title: string, message: string, action?: string) => void;
     hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
     const [toasts, setToasts] = useState<ToastData[]>([]);

     const showToast = useCallback((
          type: ToastType,
          title: string,
          message: string,
          action?: string,
          duration = 5000
     ) => {
          const id = Math.random().toString(36).substring(7);
          const newToast: ToastData = { id, type, title, message, action, duration };

          setToasts((prev) => [...prev, newToast]);
     }, []);

     const showSuccess = useCallback((title: string, message: string, action?: string) => {
          showToast('success', title, message, action);
     }, [showToast]);

     const showError = useCallback((title: string, message: string, action?: string) => {
          showToast('error', title, message, action, 7000); // Longer duration for errors
     }, [showToast]);

     const showWarning = useCallback((title: string, message: string, action?: string) => {
          showToast('warning', title, message, action);
     }, [showToast]);

     const showInfo = useCallback((title: string, message: string, action?: string) => {
          showToast('info', title, message, action);
     }, [showToast]);

     const hideToast = useCallback((id: string) => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
     }, []);

     return (
          <ToastContext.Provider
               value={{
                    showToast,
                    showSuccess,
                    showError,
                    showWarning,
                    showInfo,
                    hideToast,
               }}
          >
               {children}
               <ToastContainer>
                    {toasts.map((toast) => (
                         <Toast
                              key={toast.id}
                              {...toast}
                              onClose={hideToast}
                         />
                    ))}
               </ToastContainer>
          </ToastContext.Provider>
     );
}

export function useToast(): ToastContextValue {
     const context = useContext(ToastContext);
     if (!context) {
          throw new Error('useToast must be used within a ToastProvider');
     }
     return context;
}
