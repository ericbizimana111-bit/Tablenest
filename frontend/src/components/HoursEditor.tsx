import { Copy } from 'lucide-react';
import { DAYS, cn } from '@/lib/format';
import type { WeeklyHours } from '@/lib/types';

export const DEFAULT_HOURS: WeeklyHours = Object.fromEntries(DAYS.map((d) => [d, { open: '11:00', close: '22:00', closed: false }]));
const ORDER = [...DAYS.slice(1), DAYS[0]]; // Monday first

/** Weekly opening hours. Closing earlier than opening means "past midnight". */
export function HoursEditor({ value, onChange }: { value: WeeklyHours; onChange: (v: WeeklyHours) => void }) {
  const set = (day: string, patch: Partial<{ open: string; close: string; closed: boolean }>) =>
    onChange({ ...value, [day]: { ...(value[day as keyof WeeklyHours] ?? { open: '11:00', close: '22:00', closed: false }), ...patch } });
  const copyToAll = () => {
    const monday = value.monday ?? { open: '11:00', close: '22:00', closed: false };
    onChange(Object.fromEntries(DAYS.map((d) => [d, { ...monday }])));
  };
  return (
    <div className="rounded-[20px] border border-line bg-card">
      {ORDER.map((d, i) => {
        const h = value[d] ?? { open: '11:00', close: '22:00', closed: true };
        return (
          <div key={d} className={cn('flex flex-wrap items-center gap-3 px-4 py-3', i > 0 && 'border-t border-line')}>
            <span className="w-24 text-sm font-semibold text-ink capitalize">{d}</span>
            <label className="inline-flex items-center gap-2 text-[13px] text-ink-3">
              <input type="checkbox" checked={!h.closed} onChange={(e) => set(d, { closed: !e.target.checked })} className="size-4 accent-herb-700" />
              Open
            </label>
            {!h.closed ? (
              <div className="ml-auto flex items-center gap-2">
                <input type="time" value={h.open} onChange={(e) => set(d, { open: e.target.value })} className="h-10 rounded-xl border border-line bg-paper px-2 text-sm tabular-nums" aria-label={`${d} opening time`} />
                <span className="text-ink-4">–</span>
                <input type="time" value={h.close} onChange={(e) => set(d, { close: e.target.value })} className="h-10 rounded-xl border border-line bg-paper px-2 text-sm tabular-nums" aria-label={`${d} closing time`} />
              </div>
            ) : (
              <span className="ml-auto text-sm text-ink-4">Closed</span>
            )}
          </div>
        );
      })}
      <div className="border-t border-line px-4 py-3">
        <button type="button" onClick={copyToAll} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-herb-700 hover:underline">
          <Copy className="size-3.5" /> Use Monday's hours every day
        </button>
      </div>
    </div>
  );
}

export const timezones = (() => {
  try {
    return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone');
  } catch {
    return ['UTC', 'Africa/Kigali', 'Africa/Nairobi', 'Africa/Lagos', 'Europe/London', 'Europe/Paris', 'America/New_York'];
  }
})();
export const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
