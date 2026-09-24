import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

export type Ctx = {
  app: NestExpressApplication;
  db: Connection;
  api: () => ReturnType<typeof request>;
  close: () => Promise<void>;
};

/** Boots the real app (same pipeline as production) against this file's private in-memory database. */
export async function bootstrap(opts: { rateLimit?: boolean } = {}): Promise<Ctx> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
  configureApp(app, { rateLimit: opts.rateLimit ?? false, swagger: false });
  await app.init();
  const db = app.get<Connection>(getConnectionToken());
  // Hard stop if the app somehow connected anywhere other than the throwaway test server.
  if (db.host !== '127.0.0.1' || !db.name.startsWith('tn_') || String(db.port) !== new URL(process.env.TEST_MONGO_BASE_URI!).port) {
    await app.close();
    throw new Error(`Tests connected to ${db.host}:${db.port}/${db.name} — refusing to continue`);
  }
  // Wait for index builds so uniqueness rules (e.g. booking slot locks) are in force before tests run.
  for (const m of Object.values(db.models)) {
    await m.init().catch((err: Error) => {
      throw new Error(`index build failed for ${m.modelName} (${m.collection.name}): ${err.message}`);
    });
  }
  return {
    app,
    db,
    api: () => request(app.getHttpServer()),
    close: async () => {
      await db.dropDatabase();
      await app.close();
    },
  };
}

let seq = 0;
export const uniq = (p = 'u') => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;
export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export type Account = { token: string; id: string; email: string };

export async function registerCustomer(ctx: Ctx, overrides: Record<string, unknown> = {}): Promise<Account> {
  const email = `${uniq('c')}@test.io`;
  const res = await ctx.api().post('/api/auth/register').send({ fullName: 'Casey Customer', email, password: 'Passw0rd!', ...overrides }).expect(201);
  return { token: res.body.accessToken, id: res.body.user._id, email };
}

export async function registerOwner(ctx: Ctx): Promise<Account> {
  const email = `${uniq('o')}@test.io`;
  const res = await ctx.api().post('/api/auth/register-owner').send({ fullName: 'Olive Owner', email, password: 'Passw0rd!' }).expect(201);
  return { token: res.body.accessToken, id: res.body.user._id, email };
}

/** Promotes a user the way the `admin:grant` CLI does, then signs in again for a fresh token. */
export async function makeAdmin(ctx: Ctx): Promise<Account> {
  const c = await registerCustomer(ctx);
  await ctx.db.collection('users').updateOne({ _id: new Types.ObjectId(c.id) }, { $set: { role: 'admin' }, $inc: { tokenVersion: 1 } });
  const res = await ctx.api().post('/api/auth/login').send({ email: c.email, password: 'Passw0rd!' }).expect(200);
  return { ...c, token: res.body.accessToken };
}

export const ALL_DAY = Object.fromEntries(
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((d) => [d, { open: '00:00', close: '23:59', closed: false }]),
);

export type OwnedRestaurant = Account & { restaurantId: string; categoryId: string; items: Array<{ _id: string; price: number; name: string }> };

/** Owner + live restaurant (open all day, all services, 10% tax) + a category with priced dishes. */
export async function ownerWithRestaurant(ctx: Ctx, extra: Record<string, unknown> = {}, prices = [12.5, 8]): Promise<OwnedRestaurant> {
  const owner = await registerOwner(ctx);
  const r = await ctx
    .api()
    .post('/api/restaurants')
    .set(bearer(owner.token))
    .send({
      name: `Test Bistro ${uniq('')}`,
      cuisineType: 'Fusion',
      seatingCapacity: 40,
      address: '1 Test Street',
      city: 'Kigali',
      dineIn: true,
      delivery: true,
      pickup: true,
      deliveryFee: 3,
      taxRate: 0.1,
      openingHours: ALL_DAY,
      timezone: 'UTC',
      ...extra,
    })
    .expect(201);
  const cat = await ctx.api().post('/api/menu/categories').set(bearer(owner.token)).send({ name: 'Mains' }).expect(201);
  const items: OwnedRestaurant['items'] = [];
  for (const [i, price] of prices.entries()) {
    const it = await ctx
      .api()
      .post('/api/menu/items')
      .set(bearer(owner.token))
      .send({ categoryId: cat.body._id, name: `Dish ${i + 1}`, price })
      .expect(201);
    items.push({ _id: it.body._id, price: it.body.price, name: it.body.name });
  }
  return { ...owner, restaurantId: r.body._id, categoryId: cat.body._id, items };
}

/** YYYY-MM-DD `n` days from today (UTC — the test restaurants use the UTC zone). */
export const dayFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

// Minimal valid image headers (content validation looks at magic bytes).
export const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)]);
export const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 2)]);
export const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x24, 0, 0, 0]), Buffer.from('WEBPVP8 '), Buffer.alloc(64, 3)]);
