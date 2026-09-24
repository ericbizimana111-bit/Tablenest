import { dayOfWeek, isDateString, isOpenAt, isValidTimeZone, startOfLocalDay, toMinutes, toTime, zonedNow, WeeklyHours } from './time';

describe('time utils', () => {
  it('parses and formats clock times', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('19:30')).toBe(1170);
    expect(toTime(1170)).toBe('19:30');
    expect(toTime(1500)).toBe('01:00'); // wraps past midnight
  });

  it('accepts only real calendar dates', () => {
    expect(isDateString('2026-02-28')).toBe(true);
    expect(isDateString('2028-02-29')).toBe(true);
    expect(isDateString('2026-02-29')).toBe(false);
    expect(isDateString('2026-13-01')).toBe(false);
    expect(isDateString('26-01-01')).toBe(false);
    expect(isDateString(20260101)).toBe(false);
  });

  it('computes the weekday independently of the server zone', () => {
    expect(dayOfWeek('2026-09-24')).toBe(4); // Thursday
  });

  it('validates IANA zones', () => {
    expect(isValidTimeZone('Africa/Kigali')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
  });

  it('reports local date and minutes in a zone', () => {
    const at = new Date('2026-09-24T22:30:00Z');
    expect(zonedNow('UTC', at)).toMatchObject({ date: '2026-09-24', minutes: 22 * 60 + 30 });
    expect(zonedNow('Africa/Kigali', at)).toMatchObject({ date: '2026-09-25', minutes: 30, dow: 5 }); // UTC+2
    expect(startOfLocalDay('Africa/Kigali', at).toISOString()).toBe('2026-09-24T22:00:00.000Z');
  });

  describe('isOpenAt', () => {
    const hours: WeeklyHours = {
      thursday: { open: '10:00', close: '22:00', closed: false },
      friday: { open: '18:00', close: '02:00', closed: false }, // overnight
      saturday: { open: '12:00', close: '14:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    };
    const utc = (iso: string) => new Date(iso);

    it('handles normal hours at the boundaries', () => {
      expect(isOpenAt(hours, 'UTC', utc('2026-09-24T09:59:00Z'))).toBe(false);
      expect(isOpenAt(hours, 'UTC', utc('2026-09-24T10:00:00Z'))).toBe(true);
      expect(isOpenAt(hours, 'UTC', utc('2026-09-24T22:00:00Z'))).toBe(false);
    });

    it("handles overnight hours, including the next morning's tail", () => {
      expect(isOpenAt(hours, 'UTC', utc('2026-09-25T23:00:00Z'))).toBe(true); // Friday night
      expect(isOpenAt(hours, 'UTC', utc('2026-09-26T01:30:00Z'))).toBe(true); // Saturday 01:30 = Friday's tail
      expect(isOpenAt(hours, 'UTC', utc('2026-09-26T03:00:00Z'))).toBe(false);
    });

    it('respects closed days and the restaurant zone', () => {
      expect(isOpenAt(hours, 'UTC', utc('2026-09-27T12:00:00Z'))).toBe(false);
      // 08:30 UTC is 10:30 in Kigali on a Thursday → open there, closed in UTC.
      expect(isOpenAt(hours, 'Africa/Kigali', utc('2026-09-24T08:30:00Z'))).toBe(true);
      expect(isOpenAt(hours, 'UTC', utc('2026-09-24T08:30:00Z'))).toBe(false);
    });

    it('treats a missing schedule as open', () => {
      expect(isOpenAt(undefined, 'UTC')).toBe(true);
    });
  });
});
