import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { randomBytes } from 'crypto';

// Runs before any test module is imported, so AppModule (whose config is resolved at import time)
// only ever sees the test environment. .env files are never read under NODE_ENV=test.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-0123456789';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DEFAULT_TIMEZONE = 'UTC';
process.env.MAX_UPLOAD_MB = '1';
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'tablenest-uploads-'));
delete process.env.SMTP_HOST;

// Use an installed mongod when available instead of downloading one.
const candidates = ['C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe', '/usr/bin/mongod', '/usr/local/bin/mongod'];
if (!process.env.MONGOMS_SYSTEM_BINARY) {
  const found = candidates.find((p) => fs.existsSync(p));
  if (found) {
    process.env.MONGOMS_SYSTEM_BINARY = found;
    process.env.MONGOMS_VERSION ??= '8.2.3';
  }
}

// Each test file gets a private database on the throwaway server started in global-setup.
// Never fall back to MONGODB_URI from the shell: tests must not touch a real database.
const base = process.env.TEST_MONGO_BASE_URI;
if (base) {
  if (!/^mongodb:\/\/127\.0\.0\.1:\d+\/$/.test(base)) throw new Error(`Refusing to run tests against ${base}`);
  process.env.MONGODB_URI = `${base}tn_${randomBytes(4).toString('hex')}`;
} else {
  delete process.env.MONGODB_URI;
}
