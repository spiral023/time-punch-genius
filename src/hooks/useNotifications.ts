import { createContext, useContext } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface ScheduledNotification {
  id: number;
  title: string;
  options: NotificationOptions & { 
    timestamp: number; 
    data: { 
      offsetMinutes: number;
      label: string;
      progressValue: number;
      originalTargetTime: string;
    } 
  };
  timerId: number;
}

export interface NotificationsContextType {
  permission: NotificationPermission;
  scheduledNotifications: ScheduledNotification[];
  scheduleNotification: (
    targetTime: string,
    title: string,
    body: string,
    offsetMinutes: number,
    label: string,
    progressValue: number
  ) => Promise<void>;
  removeNotification: (id: number) => void;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
