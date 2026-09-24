import { Transform } from 'class-transformer';
import { ValidationOptions, registerDecorator } from 'class-validator';
import { DAYS, TIME_RE, isValidTimeZone } from '../utils/time';

/** Trims strings; leaves other values alone so type validators still reject them. */
export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/** Trims and turns '' into null — for optional fields that forms submit as empty strings. */
export const EmptyToNull = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const v = value.trim();
    return v === '' ? null : v;
  });

/** `{ monday: { open: 'HH:MM', close: 'HH:MM', closed: boolean }, ... }` with only known day keys. */
export function IsWeeklyHours(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isWeeklyHours',
      target: object.constructor,
      propertyName,
      options: { message: 'openingHours must map weekdays to { open: "HH:MM", close: "HH:MM", closed: boolean }', ...options },
      validator: {
        validate(value: unknown) {
          if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
          return Object.entries(value as Record<string, unknown>).every(([day, h]) => {
            if (!(DAYS as readonly string[]).includes(day) || !h || typeof h !== 'object') return false;
            const { open, close, closed } = h as Record<string, unknown>;
            if (typeof closed !== 'boolean') return false;
            if (closed) return true;
            return typeof open === 'string' && TIME_RE.test(open) && typeof close === 'string' && TIME_RE.test(close) && open !== close;
          });
        },
      },
    });
}

export function IsTimeZone(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isTimeZone',
      target: object.constructor,
      propertyName,
      options: { message: 'timezone must be a valid IANA time zone such as Africa/Kigali', ...options },
      validator: { validate: (v: unknown) => typeof v === 'string' && isValidTimeZone(v) },
    });
}

/** Image references: a path we serve (/uploads/...) or an absolute http(s) URL. */
export const IMAGE_URL_RE = /^(\/uploads\/[\w.-]+|https?:\/\/[^\s]+)$/;
