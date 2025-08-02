import React, { useState } from 'react';
import { Settings, RotateCcw, Eye, EyeOff, Layout, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAppSettings } from '@/hooks/useAppSettings';
import { cardRegistry } from '../config/layout';
import { gradients } from '@/lib/gradients';

// Hilfsfunktion für Slider-Wert zu Kartenbreite Mapping
const getCardMinWidth = (sliderValue: number): number => {
  // 0-100 → 300px bis 500px (300px + sliderValue * 2)
  return 300 + (sliderValue * 2);
};

interface DashboardSettingsProps {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onResetLayout: () => void;
}

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  isEditing,
  setIsEditing,
  onResetLayout,
}) => {
  const { cardVisibility, setCardVisibility, setAllCardsVisibility, columnWidthSlider, setColumnWidthSlider, gradientId, setGradientId } = useAppSettings();
  const [open, setOpen] = useState(false);

  const handleResetLayout = () => {
    onResetLayout();
    setColumnWidthSlider(50); // Reset auf Standard-Kartenbreite (400px)
    handleToggleAllCards(true); // Alle Karten wieder einblenden
    setOpen(false);
  };

  const handleToggleAllCards = (visible: boolean) => {
    const newVisibility: { [key: string]: boolean } = {};
    Object.keys(cardRegistry).forEach(cardId => {
      newVisibility[cardId] = visible;
    });
    setAllCardsVisibility(newVisibility);
  };

  const visibleCardsCount = Object.keys(cardRegistry).filter(
    cardId => cardVisibility[cardId] !== false
  ).length;

  const totalCardsCount = Object.keys(cardRegistry).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Karten</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="layout" className="p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Layout-Einstellungen</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-mode" className="text-sm font-normal">
                    Bearbeitungsmodus
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Karten per Drag & Drop verschieben
                  </p>
                </div>
                <Switch
                  id="edit-mode"
                  checked={isEditing}
                  onCheckedChange={(checked) => {
                    setIsEditing(checked);
                    if (checked) {
                      setOpen(false);
                    }
                  }}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">Kartenbreite</Label>
                  <span className="text-xs text-muted-foreground">
                    {getCardMinWidth(columnWidthSlider)}px
                  </span>
                </div>
                
                <Slider
                  value={[columnWidthSlider]}
                  onValueChange={(value) => setColumnWidthSlider(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Schmal</span>
                  <span>Standard</span>
                  <span>Breit</span>
                </div>
              </div>
              
              <Separator />
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Layout zurücksetzen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Layout zurücksetzen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Diese Aktion setzt die Kartenbreite, Kartenposition und Kartensichtbarkeit auf die Standardwerte zurück. Alle Karten werden wieder eingeblendet und Ihre Einstellungen gehen verloren.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetLayout}>
                      Fortfahren
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
          
          <TabsContent value="cards" className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Karten-Sichtbarkeit</h4>
                <span className="text-xs text-muted-foreground">
                  {visibleCardsCount}/{totalCardsCount}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleToggleAllCards(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Alle
                </Button>
                <Button
                  onClick={() => handleToggleAllCards(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Keine
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(cardRegistry)
                  .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                  .map(([cardId, card]) => (
                  <div key={cardId} className="flex items-center justify-between">
                    <Label
                      htmlFor={`card-${cardId}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {card.name}
                    </Label>
                    <Switch
                      id={`card-${cardId}`}
                      checked={cardVisibility[cardId] !== false}
                      onCheckedChange={(checked) => setCardVisibility(cardId, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="design" className="p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Design-Einstellungen</h4>
              
              <div className="space-y-3">
                <Label className="text-sm font-normal">Hintergrund-Gradient</Label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {gradients.map((gradient) => (
                    <button
                      key={gradient.id}
                      onClick={() => setGradientId(gradient.id)}
                      className={`
                        relative h-12 w-full rounded-md border-2 transition-all
                        ${gradientId === gradient.id 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                      style={{ background: gradient.gradient }}
                    >
                      {gradientId === gradient.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-background/80 rounded-full p-1">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Wähle einen Hintergrund-Gradient für die Anwendung
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
