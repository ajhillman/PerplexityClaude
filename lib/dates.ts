const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function endOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

export function addDays(timestamp: number, days: number): number {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

export function atHour(timestamp: number, hour: number, minute = 0): number {
  const date = new Date(timestamp);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

export function isSameDay(left: number, right: number): boolean {
  return startOfDay(left) === startOfDay(right);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(timestamp);
}

export function formatShortDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(timestamp);
}

export function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(timestamp);
}

export function formatWhen(timestamp: number, now = Date.now()): string {
  if (isSameDay(timestamp, now)) {
    return `today ${formatTime(timestamp)}`;
  }
  if (isSameDay(timestamp, addDays(now, 1))) {
    return `tomorrow ${formatTime(timestamp)}`;
  }
  return `${formatShortDate(timestamp)} ${formatTime(timestamp)}`;
}

export function daysBetween(from: number, to: number): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86_400_000);
}

export function nextWeekday(now: number, weekday: number): number {
  const date = new Date(now);
  const current = date.getDay();
  let add = weekday - current;
  if (add <= 0) {
    add += 7;
  }
  date.setDate(date.getDate() + add);
  date.setHours(17, 0, 0, 0);
  return date.getTime();
}

export function parseDueHint(text: string, now = Date.now()): number | null {
  const lower = text.toLowerCase();
  if (/\btoday\b/.test(lower)) {
    return atHour(now, 17);
  }
  if (/\btomorrow\b/.test(lower)) {
    return atHour(addDays(now, 1), 17);
  }
  if (/\bnext week\b/.test(lower)) {
    return atHour(addDays(now, 7), 17);
  }
  for (const [name, weekday] of Object.entries(WEEKDAYS)) {
    if (new RegExp(`\\b${name}\\b`).test(lower)) {
      return nextWeekday(now, weekday);
    }
  }
  return null;
}

export function parseClock(text: string, day: number): number {
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!match) {
    return atHour(day, 10);
  }
  const hourRaw = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3]?.toLowerCase();
  if (hourRaw < 0 || hourRaw > 23 || Number.isNaN(minute)) {
    return atHour(day, 10);
  }
  let hour = hourRaw;
  if (meridiem === "pm" && hour < 12) {
    hour += 12;
  }
  if (meridiem === "am" && hour === 12) {
    hour = 0;
  }
  return atHour(day, hour, minute);
}
