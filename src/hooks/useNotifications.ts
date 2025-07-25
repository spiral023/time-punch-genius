import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type NotificationPermission = 'default' | 'granted' | 'denied';

export const useNotifications = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Set initial permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: 'Fehler',
        description: 'Dieser Browser unterstützt keine Desktop-Benachrichtigungen.',
        variant: 'destructive',
      });
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    if (permission === 'denied') {
      toast({
        title: 'Berechtigung verweigert',
        description: 'Bitte aktivieren Sie Benachrichtigungen in den Browsereinstellungen.',
        variant: 'destructive',
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      return true;
    } else {
      toast({
        title: 'Berechtigung nicht erteilt',
        description: 'Sie werden keine Benachrichtigungen erhalten.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const scheduleNotification = async (targetTime: string, title: string, body: string, offsetMinutes = 0) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const [hours, minutes] = targetTime.split(':').map(Number);
    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    // Apply the offset
    targetDate.setMinutes(targetDate.getMinutes() - offsetMinutes);

    if (targetDate <= now) {
      toast({
        title: 'Fehler',
        description: 'Die Zielzeit liegt in der Vergangenheit.',
        variant: 'destructive',
      });
      return;
    }

    const delay = targetDate.getTime() - now.getTime();

    setTimeout(() => {
      new Notification(title, { body });
    }, delay);

    const notificationTime = `${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;

    toast({
      title: 'Benachrichtigung geplant',
      description: `Sie werden um ${notificationTime} Uhr benachrichtigt.`,
    });
  };

  return { scheduleNotification, permission };
};
