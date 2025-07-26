import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { tips, Tip } from '@/lib/tips';
import { motion } from 'framer-motion';

export const TipsCard: React.FC = () => {
  const [randomTip, setRandomTip] = useState<Tip | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    setRandomTip(tips[randomIndex]);
  }, []);

  if (!randomTip) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            Tipp des Tages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <h3 className="font-semibold">{randomTip.title}</h3>
          <p className="text-sm text-muted-foreground">{randomTip.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
