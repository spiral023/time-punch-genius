import React, { useState, useEffect } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cardRegistry } from '../config/layout';

const cardComponents = Object.values(cardRegistry).map(({ id, name }) => ({ id, name }));

export const CardManager: React.FC = () => {
  const { cardVisibility, setAllCardsVisibility } = useAppSettings();
  const [localVisibility, setLocalVisibility] = useState(cardVisibility);

  useEffect(() => {
    setLocalVisibility(cardVisibility);
  }, [cardVisibility]);

  const handleToggle = (cardId: string, checked: boolean) => {
    setLocalVisibility((prev) => ({ ...prev, [cardId]: checked }));
  };

  const handleToggleAll = () => {
    const allVisible = cardComponents.every((card) => localVisibility[card.id] ?? true);
    const newVisibility = cardComponents.reduce((acc, card) => {
      acc[card.id] = !allVisible;
      return acc;
    }, {} as { [key: string]: boolean });
    setLocalVisibility(newVisibility);
  };

  const handleSave = () => {
    setAllCardsVisibility(localVisibility);
    window.location.reload();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Karten verwalten
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Karten verwalten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={handleToggleAll} variant="outline" className="w-full">
            Alle ein/ausblenden
          </Button>
          {cardComponents.map((card) => (
            <div key={card.id} className="flex items-center justify-between">
              <Label htmlFor={`switch-${card.id}`}>{card.name}</Label>
              <Switch
                id={`switch-${card.id}`}
                checked={localVisibility[card.id] ?? true}
                onCheckedChange={(checked) => handleToggle(card.id, checked)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Abbrechen
            </Button>
          </DialogClose>
          <Button onClick={handleSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
