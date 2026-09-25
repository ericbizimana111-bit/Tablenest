/**
 * Backend for the frontend's Playwright tests.
 *
 * Starts a throwaway in-memory MongoDB, boots the real API on it (same guards as the e2e suite:
 * it refuses to run against any other database), seeds one approved restaurant through the public
 * HTTP API, and listens on UI_TEST_PORT (default 3101). Everything disappears when it stops.
 *
 *   npx ts-node -P test/tsconfig.json test/ui-server.ts
 */
import 'reflect-metadata';
import './mongo-binary';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

export const UI_SEED = {
  admin: { fullName: 'Ada Admin', email: 'admin@ui-test.tablenest', password: 'AdminPass123' },
  owner: { fullName: 'Olive Owner', email: 'owner@ui-test.tablenest', password: 'OwnerPass123' },
  restaurant: 'Umuganda Kitchen',
  dishes: [
    { name: 'Brochette platter', price: 12 },
    { name: 'Isombe with rice', price: 8.5 },
  ],
};

const ALL_DAY = Object.fromEntries(
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((d) => [d, { open: '00:00', close: '23:59', closed: false }]),
);

async function main() {
  const mongod = await MongoMemoryServer.create();
  process.env.TEST_MONGO_BASE_URI = mongod.getUri();
  // Loaded only now: setup-env reads TEST_MONGO_BASE_URI, and AppModule resolves config at import time.
  /* eslint-disable @typescript-eslint/no-require-imports */
  require('./setup-env');
  const { bootstrap } = require('./helpers') as typeof import('./helpers');
  /* eslint-enable @typescript-eslint/no-require-imports */

  const ctx = await bootstrap({ rateLimit: false });
  const api = ctx.api;
  const must = (res: { status: number; body: unknown }, what: string) => {
    if (res.status >= 300) throw new Error(`${what} failed: ${res.status} ${JSON.stringify(res.body)}`);
    return res.body as Record<string, any>;
  };

  // Admin: register a normal account, then promote it directly in the throwaway DB (the same thing the CLI does).
  must(await api().post('/api/auth/register').send(UI_SEED.admin), 'register admin');
  await ctx.db.collection('users').updateOne({ email: UI_SEED.admin.email }, { $set: { role: 'admin' }, $inc: { tokenVersion: 1 } });
  const adminToken = must(await api().post('/api/auth/login').send(UI_SEED.admin), 'admin login').accessToken;

  // Owner + restaurant, built exactly the way the partner wizard does it.
  const ownerToken = must(await api().post('/api/auth/register-owner').send(UI_SEED.owner), 'register owner').accessToken;
  const asOwner = (req: ReturnType<ReturnType<typeof api>['post']>) => req.set('Authorization', `Bearer ${ownerToken}`);
  const restaurant = must(
    await asOwner(api().post('/api/restaurants')).send({
      name: UI_SEED.restaurant,
      cuisineType: 'Rwandan',
      description: 'Home cooking from the hills, grilled over charcoal.',
      seatingCapacity: 30,
      priceRange: '$$',
      address: 'KN 4 Ave 12',
      city: 'Kigali',
      country: 'Rwanda',
      timezone: 'UTC',
      openingHours: ALL_DAY,
      dineIn: true,
      pickup: true,
      delivery: true,
      deliveryFee: 2,
      minOrder: 0,
      taxRate: 0.1,
    }),
    'create restaurant',
  );
  const category = must(await asOwner(api().post('/api/menu/categories')).send({ name: 'Mains' }), 'create category');
  for (const d of UI_SEED.dishes) {
    must(await asOwner(api().post('/api/menu/items')).send({ ...d, categoryId: category._id, description: 'Made to order.' }), `create ${d.name}`);
  }
  for (const [tableNumber, capacity] of [['1', 2], ['2', 4], ['3', 6]] as const) {
    must(await asOwner(api().post('/api/tables')).send({ tableNumber, capacity }), `create table ${tableNumber}`);
  }
  must(
    await api().patch(`/api/admin/restaurants/${restaurant._id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'active' }),
    'approve restaurant',
  );

  const port = Number(process.env.UI_TEST_PORT || 3101);
  await ctx.app.listen(port, '127.0.0.1');
  console.log(`UI test API ready on http://127.0.0.1:${port}/api (db ${ctx.db.name}, restaurant ${restaurant._id})`);

  const stop = async () => {
    await ctx.close().catch(() => undefined);
    await mongod.stop().catch(() => undefined);
    process.exit(0);
  };
  process.on('SIGINT', () => void stop());
  process.on('SIGTERM', () => void stop());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
