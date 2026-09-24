import type { MongoMemoryServer } from 'mongodb-memory-server-core';

export default async function globalTeardown() {
  await (globalThis as { __MONGOD__?: MongoMemoryServer }).__MONGOD__?.stop();
}
