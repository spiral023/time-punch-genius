import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const { scheduledNotifications, removeNotification } = useNotifications();

  useEffect(() => {
    scheduledNotifications.forEach(notification => {
      const scheduledTime = new Date(notification.options.timestamp).toLocaleTimeString();
      const label = notification.options.data?.label || 'Zielzeit';
      
      toast(`${label}-Erinnerung aktiviert`, {
        description: `Du wirst um ${scheduledTime} Uhr benachrichtigt`,
        action: {
          label: 'Löschen',
          onClick: () => removeNotification(notification.id),
        },
      });
    });
  }, [scheduledNotifications, removeNotification]);

  return null;
};
