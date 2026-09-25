import { describe, expect, it } from 'vitest';
import { formatBookingDate, initials, isoDay, openState, requestKey } from './format';
import type { WeeklyHours } from './types';

const week = (open: string, close: string): WeeklyHours =>
  Object.fromEntries(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((d) => [d, { open, close, closed: false }]));

describe('openState', () => {
  // Wednesday 2026-09-23 18:30 UTC = 20:30 in Kigali (UTC+2)
  const now = new Date('2026-09-23T18:30:00Z');

  it('uses the restaurant time zone, not the viewer’s', () => {
    const r = { openingHours: week('11:00', '21:00'), timezone: 'Africa/Kigali', acceptingOrders: true, openNow: true };
    expect(openState(r, now)).toEqual({ open: true, label: 'Open now', detail: 'until 21:00' });
  });

  it('says "Paused" inside opening hours when the server reports it is not taking orders', () => {
    const r = { openingHours: week('11:00', '21:00'), timezone: 'Africa/Kigali', acceptingOrders: false, openNow: false };
    expect(openState(r, now).label).toBe('Paused');
  });

  it('handles hours that run past midnight', () => {
    const r = { openingHours: week('18:00', '02:00'), timezone: 'UTC', acceptingOrders: true, openNow: false };
    expect(openState(r, new Date('2026-09-23T01:00:00Z')).label).toBe('Paused'); // within 18:00–02:00
    expect(openState(r, new Date('2026-09-23T10:00:00Z'))).toMatchObject({ label: 'Opens later', detail: 'at 18:00' });
  });

  it('points to the next opening day when closed today', () => {
    const hours = week('09:00', '17:00');
    hours.wednesday = { open: '09:00', close: '17:00', closed: true };
    const r = { openingHours: hours, timezone: 'UTC', acceptingOrders: true, openNow: false };
    expect(openState(r, new Date('2026-09-23T12:00:00Z'))).toEqual({ open: false, label: 'Closed today', detail: 'opens tomorrow 09:00' });
  });
});

describe('dates and small helpers', () => {
  it('formats booking dates as calendar days regardless of the viewer zone', () => {
    expect(formatBookingDate('2026-12-31', { day: 'numeric', month: 'numeric', year: 'numeric' })).toMatch(/31/);
    expect(formatBookingDate('2026-01-01T00:00:00.000Z', { day: 'numeric' })).toBe('1');
  });

  it('builds local YYYY-MM-DD days', () => {
    expect(isoDay(0, new Date(2026, 1, 28))).toBe('2026-02-28');
    expect(isoDay(1, new Date(2026, 1, 28))).toBe('2026-03-01');
  });

  it('derives initials and idempotency keys', () => {
    expect(initials('  ada   lovelace byron ')).toBe('AL');
    const a = requestKey();
    expect(a).toMatch(/^[\w-]{16,}$/);
    expect(requestKey()).not.toBe(a);
  });
});
