import { formatBookingDate } from './format';

/** Shared recharts styling so every dashboard chart speaks the same language. */
export const chartTooltip = {
  contentStyle: { background: '#0f2a20', border: 'none', borderRadius: 14, color: '#f7f2e9', fontSize: 13, padding: '8px 12px' },
  itemStyle: { color: '#f7f2e9' },
  labelStyle: { color: '#f3c460', fontWeight: 600, marginBottom: 2 },
  cursor: { stroke: '#d5c7b0', strokeDasharray: '3 3' },
};
export const axisTick = { fill: '#6b6558', fontSize: 12 };
export const gridStroke = '#e5dbcb';
export const PALETTE = ['#1d4a37', '#edb041', '#d9472b', '#80ae94', '#8d5c10', '#3b3830'];

/** Day-axis ticks: weekday names for a week, calendar dates for longer ranges (a month of "Tue, Thu…" says nothing). */
export const dayTick = (days: number) => (iso: string) =>
  formatBookingDate(iso, days <= 7 ? { weekday: 'short' } : { day: 'numeric', month: 'short' });
export const dayLabel = (iso: unknown) => formatBookingDate(String(iso), { weekday: 'short', day: 'numeric', month: 'short' });
