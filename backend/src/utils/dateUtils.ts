export const combineDateAndTime = (date: Date | string, time: string): Date => {
  const base = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(base);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

export const minutesBetween = (a: Date, b: Date): number => {
  return Math.abs(a.getTime() - b.getTime()) / 60000;
};

export const isWithinWorkingHours = (
  startTime: Date,
  endTime: Date,
  openingTime: string,
  closingTime: string
): boolean => {
  const [openH, openM] = openingTime.split(":").map(Number);
  const [closeH, closeM] = closingTime.split(":").map(Number);

  const opening = new Date(startTime);
  opening.setHours(openH, openM, 0, 0);

  const closing = new Date(startTime);
  closing.setHours(closeH, closeM, 0, 0);

  return startTime >= opening && endTime <= closing;
};
