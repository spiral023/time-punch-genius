import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const FeedbackCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Diese Website befindet sich derzeit im <strong className="text-foreground">Entwicklungsstadium</strong>. Es können daher Fehler auftreten.
        </p>
        <p className="text-sm text-muted-foreground">
          Wenn dir <strong className="text-foreground">Fehler</strong> auffallen oder du <strong className="text-foreground">Verbesserungsvorschläge</strong> hast, freue ich mich über dein Feedback!
        </p>
        <a
          href="mailto:philipp.asanger@gmail.com"
          className={cn(buttonVariants({ variant: 'default' }), "w-full")}
          role="button"
        >
          Mail schreiben
        </a>
      </CardContent>
    </Card>
  );
};
