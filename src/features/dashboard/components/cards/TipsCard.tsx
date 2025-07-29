import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { tips, Tip } from '@/lib/tips';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const SEEN_TIPS_STORAGE_KEY = 'zehelper_seentips';

const getSeenTips = (): number[] => {
  const seenTips = localStorage.getItem(SEEN_TIPS_STORAGE_KEY);
  return seenTips ? JSON.parse(seenTips) : [];
};

const addSeenTip = (tipId: number) => {
  const seenTips = getSeenTips();
  if (!seenTips.includes(tipId)) {
    localStorage.setItem(SEEN_TIPS_STORAGE_KEY, JSON.stringify([...seenTips, tipId]));
  }
};

const getNextTip = (currentTip?: Tip): Tip => {
  const seenTips = getSeenTips();
  const unseenTips = tips.filter((tip) => !seenTips.includes(tip.id));

  if (unseenTips.length > 0) {
    let newTip: Tip;
    do {
      newTip = unseenTips[Math.floor(Math.random() * unseenTips.length)];
    } while (unseenTips.length > 1 && newTip.id === currentTip?.id);
    return newTip;
  } else {
    // Alle Tipps gesehen, zeige sie in absteigender Reihenfolge
    const sortedTips = [...tips].sort((a, b) => b.id - a.id);
    if (!currentTip) {
      return sortedTips[0];
    }
    const currentIndex = sortedTips.findIndex((tip) => tip.id === currentTip.id);
    const nextIndex = (currentIndex + 1) % sortedTips.length;
    return sortedTips[nextIndex];
  }
};

export const TipsCard: React.FC = () => {
  const [currentTip, setCurrentTip] = useState<Tip | undefined>(undefined);

  useEffect(() => {
    const tip = getNextTip();
    setCurrentTip(tip);
    addSeenTip(tip.id);
  }, []);

  const refreshTip = useCallback(() => {
    setCurrentTip((prevTip) => {
      const newTip = getNextTip(prevTip);
      addSeenTip(newTip.id);
      return newTip;
    });
  }, []);

  if (!currentTip) {
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
          {currentTip && (
            <motion.div
              key={currentTip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-semibold">{currentTip.title}</h3>
              <p className="text-sm text-muted-foreground">{currentTip.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
