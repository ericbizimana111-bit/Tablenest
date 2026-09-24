import { validateEnv } from './env.validation';

const strong = 'x'.repeat(16) + 'y'.repeat(16) + 'z';

describe('validateEnv', () => {
  it('fills safe development defaults', () => {
    expect(validateEnv({})).toMatchObject({ NODE_ENV: 'development', PORT: '3001', DEFAULT_TIMEZONE: 'UTC', UPLOAD_DRIVER: 'local' });
  });

  it('refuses to boot production without secrets, database or CORS', () => {
    expect(() => validateEnv({ NODE_ENV: 'production' })).toThrow(/MONGODB_URI[\s\S]*JWT_SECRET[\s\S]*CORS_ORIGINS/);
  });

  it('refuses weak or example JWT secrets in production', () => {
    const base = { NODE_ENV: 'production', MONGODB_URI: 'mongodb://db/x', CORS_ORIGINS: 'https://app' };
    expect(() => validateEnv({ ...base, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
    expect(() => validateEnv({ ...base, JWT_SECRET: 'tablenest_super_secret_key_2024_production' })).toThrow(/JWT_SECRET/);
    expect(validateEnv({ ...base, JWT_SECRET: strong }).JWT_SECRET).toBe(strong);
  });

  it('rejects invalid values', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
    expect(() => validateEnv({ DEFAULT_TIMEZONE: 'Nowhere/Land' })).toThrow(/DEFAULT_TIMEZONE/);
    expect(() => validateEnv({ UPLOAD_DRIVER: 's3' })).toThrow(/UPLOAD_DRIVER/);
    expect(() => validateEnv({ MAX_UPLOAD_MB: '500' })).toThrow(/MAX_UPLOAD_MB/);
  });
});
