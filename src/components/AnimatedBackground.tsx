import React, { useState, useEffect } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { gradients } from '@/lib/gradients';

const AnimatedBackground = () => {
  const { settings } = useAppSettings();
  const [gradient1, setGradient1] = useState(gradients[0].gradient);
  const [gradient2, setGradient2] = useState(gradients[0].gradient);
  const [opacity1, setOpacity1] = useState(1);
  const [opacity2, setOpacity2] = useState(0);
  const [activeLayer, setActiveLayer] = useState(1);

  useEffect(() => {
    const currentGradient = gradients.find(g => g.id === settings.gradientId) ?? gradients[0];

    if (activeLayer === 1) {
      setGradient2(currentGradient.gradient);
      setOpacity1(0);
      setOpacity2(1);
      setActiveLayer(2);
    } else {
      setGradient1(currentGradient.gradient);
      setOpacity1(1);
      setOpacity2(0);
      setActiveLayer(1);
    }
  }, [settings.gradientId]);

  return (
    <>
      <div
        className="gradient-layer"
        style={{
          background: gradient1,
          opacity: opacity1,
        }}
      />
      <div
        className="gradient-layer"
        style={{
          background: gradient2,
          opacity: opacity2,
        }}
      />
    </>
  );
};

export default AnimatedBackground;
