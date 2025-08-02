import { useMemo } from 'react';
import { parseTimeToMinutes, calculateTimeDetails } from '@/lib/timeUtils';
import { useTimeCalculatorContext } from '../contexts/TimeCalculatorContext';

export const useHeatmapData = () => {
  const { yearData } = useTimeCalculatorContext();

  const heatmapData = useMemo(() => {
    try {
      const data = Array.from({ length: 24 * 7 }, (_, i) => ({
        day: Math.floor(i / 24),
        hour: i % 24,
        value: 0,
      }));

      Object.entries(yearData).forEach(([dateString, input]) => {
        if (input) {
          const { timeEntries } = calculateTimeDetails(input);
          const date = new Date(dateString);
          // Check for invalid date
          if (isNaN(date.getTime())) {
            return;
          }
          const dayOfWeek = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6

          timeEntries.forEach(entry => {
            const startMinutes = parseTimeToMinutes(entry.start);
            const endMinutes = parseTimeToMinutes(entry.end);

            for (let hour = 0; hour < 24; hour++) {
              const hourStart = hour * 60;
              const hourEnd = (hour + 1) * 60;

              const overlapStart = Math.max(startMinutes, hourStart);
              const overlapEnd = Math.min(endMinutes, hourEnd);

              if (overlapEnd > overlapStart) {
                const minutesInHour = overlapEnd - overlapStart;
                const index = dayOfWeek * 24 + hour;
                if (data[index]) {
                  data[index].value += minutesInHour;
                }
              }
            }
          });
        }
      });

      return { data, error: null };
    } catch (error) {
      console.error("Error creating heatmap data:", error);
      return { data: [], error: 'Fehler beim Erstellen der Heatmap-Daten.' };
    }
  }, [yearData]);

  return heatmapData;
};
