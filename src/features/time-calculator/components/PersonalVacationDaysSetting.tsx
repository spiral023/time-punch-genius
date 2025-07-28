import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings } from 'lucide-react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Label } from '@/components/ui/label';

export const PersonalVacationDaysSetting = () => {
  const { personalVacationDays, setPersonalVacationDays } = useAppSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState(personalVacationDays);

  const handleSave = () => {
    setPersonalVacationDays(days);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Urlaubstage</h4>
              <p className="text-sm text-muted-foreground">
                Persönliche Urlaubstage pro Jahr.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="vacation-days">Tage</Label>
                <Input
                  id="vacation-days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10))}
                  className="col-span-2 h-8"
                />
              </div>
            </div>
            <Button type="submit">Speichern</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
