import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface NotesCardProps {
  notes: string;
  setNotes: (notes: string) => void;
}

export const NotesCard: React.FC<NotesCardProps> = ({ notes, setNotes }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notizen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Schreibe hier deine Notizen für diesen Tag..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-32"
        />
      </CardContent>
    </Card>
  );
};
