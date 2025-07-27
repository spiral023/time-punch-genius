import React from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Progress } from './ui/progress';
import { useNotifications } from '@/hooks/useNotifications';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const { scheduledNotifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full mt-4 bg-background/80 backdrop-blur-sm">
            Aktive Alerts verwalten {scheduledNotifications.length > 0 && `(${scheduledNotifications.length})`}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aktive Alarme</DialogTitle>
        </DialogHeader>
        {scheduledNotifications.length > 0 ? (
          <div className="space-y-4">
            {scheduledNotifications.map((notif) => (
              <div key={notif.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{notif.options.data.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      Zielzeit: {notif.options.data.originalTargetTime}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNotification(notif.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Progress value={notif.options.data.progressValue} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{Math.round(notif.options.data.progressValue)}% erreicht</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Alarm:</strong> {format(new Date(notif.options.timestamp), 'HH:mm', { locale: de })} Uhr
                    ({formatDistanceToNow(new Date(notif.options.timestamp), { addSuffix: true, locale: de })})
                  </p>
                  <p>
                    <strong>Offset:</strong> {notif.options.data.offsetMinutes > 0
                      ? `${notif.options.data.offsetMinutes} Minuten früher`
                      : 'Genau zur Zielzeit'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Keine aktiven Alarme gefunden.
          </p>
        )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
