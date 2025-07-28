import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { tips, Tip } from '@/lib/tips';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const getRandomTip = (currentTip?: Tip): Tip => {
  let newTip: Tip;
  do {
    newTip = tips[Math.floor(Math.random() * tips.length)];
  } while (tips.length > 1 && newTip.title === currentTip?.title);
  return newTip;
};

export const TipsCard: React.FC = () => {
  const [randomTip, setRandomTip] = useState<Tip>(() => getRandomTip());

  const refreshTip = useCallback(() => {
    setRandomTip((prevTip) => getRandomTip(prevTip));
  }, []);

  if (!randomTip) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            Tipp des Tages
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={refreshTip}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 min-h-[6rem] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={randomTip.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-semibold">{randomTip.title}</h3>
            <p className="text-sm text-muted-foreground">{randomTip.description}</p>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
