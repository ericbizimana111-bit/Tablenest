import type { DayHours, Restaurant, WeeklyHours } from './types';

export const cn = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

const moneyFormatters = new Map<string, Intl.NumberFormat>();
/** Formats an amount in the platform currency, with the currency's natural precision (RWF has none, USD two). */
export function formatMoney(amount: number, currency = 'USD') {
  let f = moneyFormatters.get(currency);
  if (!f) {
    try {
      f = new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' });
    } catch {
      f = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
    }
    moneyFormatters.set(currency, f);
  }
  return f.format(Number.isFinite(amount) ? amount : 0);
}

export const pluralize = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Calendar date for YYYY-MM-DD strings stored as UTC midnight (reservations). */
export function formatBookingDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  return d.toLocaleDateString(undefined, { ...opts, timeZone: 'UTC' });
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Local YYYY-MM-DD for "today + n days" in the viewer's zone (used for booking date pickers). */
export function isoDay(offset = 0, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

function localNow(timeZone: string, now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value || '0';
    return { dow: DAYS.indexOf(get('weekday').toLowerCase() as (typeof DAYS)[number]), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  } catch {
    return { dow: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() };
  }
}

export type OpenState = { open: boolean; label: string; detail: string };

/** "Open · until 22:00" / "Closed · opens 18:00" / "Closed today", in the restaurant's own zone. */
export function openState(r: Pick<Restaurant, 'openingHours' | 'timezone' | 'acceptingOrders' | 'openNow'>, now = new Date()): OpenState {
  const hours: WeeklyHours = r.openingHours || {};
  const { dow, minutes } = localNow(r.timezone || 'UTC', now);
  const today: DayHours | undefined = hours[DAYS[dow]];
  const open = r.openNow ?? false;
  if (!today) return { open, label: open ? 'Open now' : 'Closed', detail: '' };
  if (today.closed) return { open: false, label: 'Closed today', detail: nextOpening(hours, dow) };
  const o = toMin(today.open);
  const c = toMin(today.close);
  if (open) return { open: true, label: 'Open now', detail: `until ${today.close}` };
  const withinHours = c > o ? minutes >= o && minutes < c : minutes >= o || minutes < c;
  if (withinHours) return { open: false, label: 'Paused', detail: 'not taking orders right now' };
  if (minutes < o) return { open: false, label: 'Opens later', detail: `at ${today.open}` };
  return { open: false, label: 'Closed now', detail: nextOpening(hours, dow) };
}

function nextOpening(hours: WeeklyHours, dow: number) {
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(dow + i) % 7];
    const h = hours[d];
    if (h && !h.closed) return `opens ${i === 1 ? 'tomorrow' : d[0].toUpperCase() + d.slice(1, 3)} ${h.open}`;
  }
  return '';
}

export const priceLevel = (range: string) => ({ $: 'Budget-friendly', $$: 'Moderate', $$$: 'Upscale', $$$$: 'Fine dining' })[range] || range;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

/** Random, collision-safe key for idempotent checkout requests. */
export const requestKey = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^\w-]/g, '');
