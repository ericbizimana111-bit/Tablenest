import { isValidTimeZone } from '../common/utils/time';

/** Values that appeared in committed example files — never acceptable as a real secret. */
const KNOWN_WEAK_SECRETS = new Set([
  'tablenest_dev_secret_change_me',
  'tablenest_super_secret_key_2024_production',
  'change-me',
  'changeme',
  'secret',
]);

export const DEV_JWT_SECRET = 'tablenest_dev_secret_change_me';

/**
 * Validates process environment at boot. Fails fast in production on anything that would
 * make the deployment insecure; fills safe defaults for development and test.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const env = { ...config } as Record<string, string | undefined>;
  const nodeEnv = env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  const errors: string[] = [];

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push(`NODE_ENV must be development, test or production (got "${nodeEnv}")`);
  }

  if (isProd) {
    if (!env.MONGODB_URI) errors.push('MONGODB_URI is required in production');
    if (!env.JWT_SECRET) errors.push('JWT_SECRET is required in production');
    else if (env.JWT_SECRET.length < 32 || KNOWN_WEAK_SECRETS.has(env.JWT_SECRET)) {
      errors.push('JWT_SECRET must be a random value of at least 32 characters');
    }
    if (!env.CORS_ORIGINS) errors.push('CORS_ORIGINS is required in production');
  }

  if (env.PORT && !/^\d+$/.test(env.PORT)) errors.push('PORT must be a number');
  if (env.MAX_UPLOAD_MB && !(Number(env.MAX_UPLOAD_MB) > 0 && Number(env.MAX_UPLOAD_MB) <= 25)) {
    errors.push('MAX_UPLOAD_MB must be between 1 and 25');
  }
  if (env.DEFAULT_TIMEZONE && !isValidTimeZone(env.DEFAULT_TIMEZONE)) {
    errors.push(`DEFAULT_TIMEZONE "${env.DEFAULT_TIMEZONE}" is not a valid IANA time zone`);
  }
  if (env.UPLOAD_DRIVER && env.UPLOAD_DRIVER !== 'local') {
    errors.push(`UPLOAD_DRIVER "${env.UPLOAD_DRIVER}" is not supported (supported: local)`);
  }

  if (errors.length) {
    throw new Error(`Invalid environment configuration:\n - ${errors.join('\n - ')}`);
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: env.PORT || '3001',
    MONGODB_URI: env.MONGODB_URI || 'mongodb://localhost:27017/tablenest',
    JWT_SECRET: env.JWT_SECRET || DEV_JWT_SECRET,
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || '7d',
    DEFAULT_TIMEZONE: env.DEFAULT_TIMEZONE || 'UTC',
    UPLOAD_DRIVER: env.UPLOAD_DRIVER || 'local',
    MAX_UPLOAD_MB: env.MAX_UPLOAD_MB || '5',
  };
}
