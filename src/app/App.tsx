import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import { NotificationsContext, ScheduledNotification, NotificationPermission } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/AnimatedBackground';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { useAppSettings } from '@/hooks/useAppSettings';

const queryClient = new QueryClient();

const AppContent = () => {
  const { zoomLevel } = useAppSettings();

  // Verhindere automatisches Scrollen beim Laden
  useEffect(() => {
    // Setze Scroll-Position auf 0,0 beim ersten Laden
    window.scrollTo(0, 0);
    
    // Verhindere Browser-Scroll-Restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <div className="relative">
      <AnimatedBackground />
      <div style={{ zoom: zoomLevel }}>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
};

const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);

  const updateNotificationsInStorage = useCallback((notifications: ScheduledNotification[]) => {
    try {
      const storableNotifications = notifications.map(({ timerId, ...rest }) => rest);
      localStorage.setItem('scheduledNotifications', JSON.stringify(storableNotifications));
    } catch (error) {
      console.error("Benachrichtigungen konnten nicht in localStorage gespeichert werden", error);
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    try {
      const storedNotifications = localStorage.getItem('scheduledNotifications');
      if (storedNotifications) {
        const parsedNotifications: Omit<ScheduledNotification, 'timerId'>[] = JSON.parse(storedNotifications);
        const now = Date.now();
        
        const validNotifications = parsedNotifications.filter(n => n.options.timestamp > now);
        
        const rescheduledNotifications: ScheduledNotification[] = [];
        validNotifications.forEach(n => {
          const delay = n.options.timestamp - now;
          const timerId = window.setTimeout(() => {
            new Notification(n.title, n.options);
            setScheduledNotifications(prev => {
              const updated = prev.filter(p => p.id !== n.id);
              updateNotificationsInStorage(updated);
              return updated;
            });
          }, delay);
          rescheduledNotifications.push({ ...n, timerId });
        });
        setScheduledNotifications(rescheduledNotifications);
      }
    } catch (error) {
      console.error("Benachrichtigungen konnten nicht aus localStorage geladen werden", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('Dieser Browser unterstützt keine Desktop-Benachrichtigungen.');
      return false;
    }
    if (permission === 'granted') return true;
    if (permission === 'denied') {
      toast.error('Bitte aktiviere Benachrichtigungen in den Browsereinstellungen.');
      return false;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const scheduleNotification = async (
    targetTime: string,
    title: string,
    body: string,
    offsetMinutes = 0,
    label: string,
    progressValue: number
  ) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const [hours, minutes] = targetTime.split(':').map(Number);
    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);
    targetDate.setMinutes(targetDate.getMinutes() - offsetMinutes);

    if (targetDate <= now) {
      toast.error('Die geplante Zeit liegt in der Vergangenheit.');
      return;
    }

    const delay = targetDate.getTime() - now.getTime();
    const id = Date.now();

    const timerId = window.setTimeout(() => {
      new Notification(title, { body });
      setScheduledNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        updateNotificationsInStorage(updated);
        return updated;
      });
    }, delay);

    const newNotification: ScheduledNotification = {
      id,
      title,
      options: {
        body,
        timestamp: targetDate.getTime(),
        data: { offsetMinutes, label, progressValue, originalTargetTime: targetTime },
      },
      timerId,
    };

    setScheduledNotifications(prev => {
      const updated = [...prev, newNotification];
      updateNotificationsInStorage(updated);
      return updated;
    });

    const notificationTime = `${targetDate.getHours().toString().padStart(2, '0')}:${targetDate.getMinutes().toString().padStart(2, '0')}`;
    toast.success('Benachrichtigung geplant', { description: `Du wirst um ${notificationTime} Uhr benachrichtigt.` });
  };

  const removeNotification = (id: number) => {
    const notificationToRemove = scheduledNotifications.find(n => n.id === id);
    if (notificationToRemove) {
      clearTimeout(notificationToRemove.timerId);
      setScheduledNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        updateNotificationsInStorage(updated);
        return updated;
      });
      toast.info('Benachrichtigung gelöscht');
    }
  };

  const value = {
    permission,
    scheduledNotifications,
    scheduleNotification,
    removeNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppSettingsProvider>
        <TooltipProvider>
          <NotificationsProvider>
            <AppContent />
          </NotificationsProvider>
        </TooltipProvider>
      </AppSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
