'use client';

import { useState, useCallback } from 'react';
import { NotificationProps } from '@/components/ui/Notification';

export interface NotificationData {
     id: string;
     type: NotificationProps['type'];
     title: string;
     message: string;
     oldLevel?: number;
     newLevel?: number;
}

export function useNotification() {
     const [notifications, setNotifications] = useState<NotificationData[]>([]);

     const showNotification = useCallback((
          notification: Omit<NotificationData, 'id'>
     ) => {
          const id = Math.random().toString(36).substring(7);
          setNotifications(prev => [...prev, { ...notification, id }]);
     }, []);

     const removeNotification = useCallback((id: string) => {
          setNotifications(prev => prev.filter(n => n.id !== id));
     }, []);

     return {
          notifications,
          showNotification,
          removeNotification
     };
}
