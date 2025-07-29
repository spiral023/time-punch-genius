const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('Dieser Browser unterstützt keine Desktop-Benachrichtigungen.');
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

const showBrowserNotification = async (title: string, body: string) => {
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    new Notification(title, { body });
  }
};

export const useBrowserNotifications = () => {
  return { showBrowserNotification };
};
