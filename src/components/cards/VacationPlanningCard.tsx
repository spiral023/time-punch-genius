import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays } from "lucide-react";

const VacationPlanningCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Urlaubsplanung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <img src="https://sp23.online/images/fenstertage_screenshot.png" alt="Urlaubsplanung" className="rounded-md cursor-pointer" />
          </DialogTrigger>
          <p className="text-sm text-muted-foreground pt-2">
            Nutze Fenstertage effizient und plane deinen Urlaub auf <a href="https://fenstertage.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">fenstertage.com</a>
          </p>
          <DialogContent className="p-0 border-0 max-w-4xl">
            <a href="https://fenstertage.com" target="_blank" rel="noopener noreferrer">
              <img src="https://sp23.online/images/fenstertage_screenshot.png" alt="Urlaubsplanung" />
            </a>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VacationPlanningCard;
