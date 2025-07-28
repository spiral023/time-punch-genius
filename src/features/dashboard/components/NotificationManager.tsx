import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const { scheduledNotifications, removeNotification } = useNotifications();

  useEffect(() => {
    scheduledNotifications.forEach(notification => {
      toast(notification.options.body, {
        description: `Geplant für: ${new Date(notification.options.timestamp).toLocaleTimeString()}`,
        action: {
          label: 'Löschen',
          onClick: () => removeNotification(notification.id),
        },
      });
    });
  }, [scheduledNotifications, removeNotification]);

  return null;
};
