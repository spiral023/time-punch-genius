export const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (minutes: number): string => {
  const totalMinutesInDay = 24 * 60;
  let adjustedMinutes = minutes;

  if (adjustedMinutes >= totalMinutesInDay) {
    adjustedMinutes = totalMinutesInDay - 1; // Limit to 23:59
  }

  const hours = Math.floor(adjustedMinutes / 60);
  const mins = adjustedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const formatHoursMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const addMinutesToTime = (baseTime: string, minutesToAdd: number): string => {
  const baseMinutes = parseTimeToMinutes(baseTime);
  const newMinutes = baseMinutes + minutesToAdd;
  return formatMinutesToTime(newMinutes);
};
