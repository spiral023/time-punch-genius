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
            <img src="https://sp23.online/images/fenstertage_ad2_small.png" alt="Urlaubsplanung" className="rounded-md cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="p-0 border-0 sm:max-w-md">
            <a href="https://fenstertage.com" target="_blank" rel="noopener noreferrer">
              <img src="https://sp23.online/images/fenstertage_ad2_small.png" alt="Urlaubsplanung" className="rounded-lg" />
            </a>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VacationPlanningCard;
