import * as fs from 'fs';

// Use an installed mongod when available instead of downloading one (~800 MB).
const candidates = ['C:/Program Files/MongoDB/Server/8.2/bin/mongod.exe', '/usr/bin/mongod', '/usr/local/bin/mongod'];
if (!process.env.MONGOMS_SYSTEM_BINARY) {
  const found = candidates.find((p) => fs.existsSync(p));
  if (found) {
    process.env.MONGOMS_SYSTEM_BINARY = found;
    process.env.MONGOMS_VERSION ??= '8.2.3';
  }
}
