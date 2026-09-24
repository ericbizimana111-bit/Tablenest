import { MongoMemoryServer } from 'mongodb-memory-server-core';
import './setup-env';

/** One throwaway MongoDB for the whole run; every test file gets its own database on it. */
export default async function globalSetup() {
  const server = await MongoMemoryServer.create();
  (globalThis as { __MONGOD__?: MongoMemoryServer }).__MONGOD__ = server;
  process.env.TEST_MONGO_BASE_URI = server.getUri();
}
