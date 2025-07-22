export const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dayMap: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export function getDateFromSlot(slotLabel: string, weekOffset: number): string {
  const dayName = slotLabel.split("-")[0];
  const dayOffset = dayMap[dayName] ?? 0;

  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const finalDate = new Date(startOfWeek);
  finalDate.setDate(startOfWeek.getDate() + dayOffset);

  return finalDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// export function getSlotDate(slotLabel: string, weekOffset: number): Date {
//   const dayName = slotLabel.split("-")[0];
//   const dayOffset = dayMap[dayName] ?? 0;

//   const today = new Date();
//   const currentDay = today.getDay();
//   const startOfWeek = new Date(today);
//   startOfWeek.setDate(today.getDate() - currentDay + weekOffset * 7);
//   startOfWeek.setHours(0, 0, 0, 0);

//   const date = new Date(startOfWeek);
//   date.setDate(date.getDate() + dayOffset);
//   return date;
// }

export function getSlotDate(slotLabel: string, weekOffset: number): Date {
  const [dayName, time] = slotLabel.split("-");
  const dayOffset = dayMap[dayName] ?? 0;

  const today = new Date();
  const currentDay = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const date = new Date(startOfWeek);
  date.setDate(date.getDate() + dayOffset);

  if (time) {
    const [hour, minute] = time.split(":").map(Number);
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  return date;
}

export function getDateForDayInWeek(day: string, weekOffset: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay + weekOffset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const targetDate = new Date(startOfWeek);
  targetDate.setDate(startOfWeek.getDate() + dayMap[day]);

  return targetDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function getCurrentWeekRange(offset = 0): { start: Date; end: Date } {
  const today = new Date();
  const currentDay = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - currentDay + offset * 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function formatWeekRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const startStr = start.toLocaleDateString(undefined, options);
  const endStr = end.toLocaleDateString(undefined, {
    ...options,
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}
