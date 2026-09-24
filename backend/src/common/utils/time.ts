export const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export type WeeklyHours = Record<string, { open: string; close: string; closed: boolean }>;

export const DEFAULT_HOURS: WeeklyHours = Object.fromEntries(
  DAYS.map((d) => [d, { open: '10:00', close: '22:00', closed: false }]),
);

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/** A real calendar date in YYYY-MM-DD form (rejects 2025-02-30 etc). */
export const isDateString = (v: unknown): v is string => {
  if (typeof v !== 'string' || !DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00.000Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

export const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

export const toTime = (mins: number) =>
  `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** Reservation dates are stored as UTC midnight of the local calendar day, so they never shift. */
export const dayStart = (date: string) => new Date(`${date}T00:00:00.000Z`);

/** Day of week (0 = Sunday) for a calendar date string, independent of server time zone. */
export const dayOfWeek = (date: string) => new Date(`${date}T12:00:00.000Z`).getUTCDay();

/** The current calendar date, minute-of-day and weekday in a given IANA time zone. */
export function zonedNow(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '00';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  return { date, minutes: Number(get('hour')) * 60 + Number(get('minute')), dow: dayOfWeek(date) };
}

/** The UTC instant at which the current local day began in `timeZone` (for "today" statistics). */
export function startOfLocalDay(timeZone: string, now = new Date()) {
  const { minutes } = zonedNow(timeZone, now);
  return new Date(now.getTime() - minutes * 60000 - now.getUTCSeconds() * 1000 - now.getUTCMilliseconds());
}

/** Whether a restaurant is open at `now`, evaluated in the restaurant's own time zone. */
export function isOpenAt(hours: WeeklyHours | undefined, timeZone: string, now = new Date()): boolean {
  const local = zonedNow(timeZone, now);
  const mins = local.minutes;
  if (!hours || !Object.keys(hours).length) return true; // no schedule configured → assume open

  // Still inside yesterday's overnight shift (e.g. Friday 18:00 → 02:00, now Saturday 01:30)?
  const yesterday = hours[DAYS[(local.dow + 6) % 7]];
  if (yesterday && !yesterday.closed) {
    const yOpen = toMinutes(yesterday.open || '00:00');
    const yClose = toMinutes(yesterday.close || '23:59');
    if (yClose <= yOpen && mins < yClose) return true;
  }

  const today = hours[DAYS[local.dow]];
  if (!today) return true; // day not configured → assume open (previous behaviour)
  if (today.closed) return false;
  const open = toMinutes(today.open || '00:00');
  const close = toMinutes(today.close || '23:59');
  return close > open ? mins >= open && mins < close : mins >= open; // overnight: open until midnight today
}
