const APP_TIME_ZONE = "America/Sao_Paulo";

export const combineDateAndTime = (date: Date | string, time: string): Date => {
  const datePart = typeof date === "string" ? date.slice(0, 10) : date.toISOString().slice(0, 10);
  // Reserva data e hora representam o horário civil de São Paulo, independente do fuso do servidor.
  return new Date(`${datePart}T${time}:00-03:00`);
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
  const getParts = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: APP_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);
    return Object.fromEntries(parts.map((part) => [part.type, part.value]));
  };
  const start = getParts(startTime);
  const end = getParts(endTime);
  const startMinutes = Number(start.hour) * 60 + Number(start.minute);
  const endMinutes = Number(end.hour) * 60 + Number(end.minute);

  return start.year === end.year && start.month === end.month && start.day === end.day &&
    startMinutes >= openH * 60 + openM && endMinutes <= closeH * 60 + closeM;
};
