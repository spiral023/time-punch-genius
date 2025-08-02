import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft, Loader2 } from "lucide-react";

const VacationPlanningCard = () => {
  const [showWebsite, setShowWebsite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageClick = () => {
    setShowWebsite(true);
    setIsLoading(true);
  };

  const handleBackClick = () => {
    setShowWebsite(false);
    setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

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
            <img 
              src="https://sp23.online/images/fenstertage_ad2_small.png" 
              alt="Urlaubsplanung" 
              className="rounded-md cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={handleImageClick}
            />
          </DialogTrigger>
          <DialogContent className="p-0 border-0 sm:max-w-4xl max-w-[95vw] h-[80vh]">
            {!showWebsite ? (
              <div className="p-4">
                <img 
                  src="https://sp23.online/images/fenstertage_ad2_small.png" 
                  alt="Urlaubsplanung" 
                  className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={handleImageClick}
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Klicken Sie auf das Bild, um die interaktive Website zu öffnen
                </p>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBackClick}
                    className="shadow-lg"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Zurück
                  </Button>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Website wird geladen...</span>
                    </div>
                  </div>
                )}
                <iframe
                  src="https://fenstertage.com"
                  className="w-full h-full rounded-lg"
                  title="Fenstertage.com - Urlaubsplanung"
                  onLoad={handleIframeLoad}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VacationPlanningCard;
