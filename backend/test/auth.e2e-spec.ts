import { JwtService } from '@nestjs/jwt';

const jwt = { sign: (payload: object, secret: string) => new JwtService().sign(payload, { secret }) };
import { bearer, bootstrap, Ctx, registerCustomer, uniq } from './helpers';

describe('Authentication (e2e)', () => {
  let ctx: Ctx;
  beforeAll(async () => (ctx = await bootstrap()));
  afterAll(() => ctx.close());

  const password = 'Passw0rd!';

  it('registers a customer, hashes the password and never returns secrets', async () => {
    const email = `${uniq('reg')}@Test.io`;
    const res = await ctx.api().post('/api/auth/register').send({ fullName: '  Ada Lovelace ', email, password }).expect(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ fullName: 'Ada Lovelace', email: email.toLowerCase(), role: 'customer' });
    for (const secret of ['password', 'tokenVersion', 'resetPasswordToken', 'failedLoginAttempts', 'lockUntil']) {
      expect(res.body.user).not.toHaveProperty(secret);
    }
    const stored = await ctx.db.collection('users').findOne({ email: email.toLowerCase() });
    expect(stored!.password).toMatch(/^\$2[aby]\$12\$/);
    expect(stored!.password).not.toContain(password);
  });

  it('rejects duplicate registration with 409 (case-insensitive email)', async () => {
    const email = `${uniq('dup')}@test.io`;
    await ctx.api().post('/api/auth/register').send({ fullName: 'First', email, password }).expect(201);
    const res = await ctx.api().post('/api/auth/register').send({ fullName: 'Second', email: email.toUpperCase(), password }).expect(409);
    expect(res.body.message).toMatch(/already exists/);
  });

  it('validates registration input', async () => {
    const bad = [
      {},
      { fullName: 'A', email: 'x@y.io', password },
      { fullName: 'Valid Name', email: 'not-an-email', password },
      { fullName: 'Valid Name', email: 'a@b.io', password: 'short1' },
      { fullName: 'Valid Name', email: 'a@b.io', password: 'nodigitshere' },
    ];
    for (const body of bad) await ctx.api().post('/api/auth/register').send(body).expect(400);
  });

  it('ignores a client-supplied role (no privilege escalation at signup)', async () => {
    const res = await ctx.api().post('/api/auth/register').send({ fullName: 'Mallory', email: `${uniq('m')}@t.io`, password, role: 'admin' }).expect(201);
    expect(res.body.user.role).toBe('customer');
  });

  it('logs in with correct credentials and rejects wrong or missing ones', async () => {
    const { email } = await registerCustomer(ctx);
    const ok = await ctx.api().post('/api/auth/login').send({ email, password }).expect(200);
    expect(ok.body.accessToken).toBeDefined();
    const wrong = await ctx.api().post('/api/auth/login').send({ email, password: 'Wrong999' }).expect(401);
    const unknown = await ctx.api().post('/api/auth/login').send({ email: 'nobody@nowhere.io', password }).expect(401);
    expect(wrong.body.message).toBe(unknown.body.message); // no account enumeration
    await ctx.api().post('/api/auth/login').send({ email }).expect(400);
    await ctx.api().post('/api/auth/login').send({}).expect(400);
  });

  it('protects endpoints: missing, malformed, forged and expired tokens get 401', async () => {
    const c = await registerCustomer(ctx);
    await ctx.api().get('/api/auth/me').expect(401);
    await ctx.api().get('/api/auth/me').set('Authorization', 'Bearer not.a.jwt').expect(401);
    const forged = jwt.sign({ sub: c.id, role: 'admin', tv: 0 }, 'some-other-secret');
    await ctx.api().get('/api/auth/me').set(bearer(forged)).expect(401);
    const expired = jwt.sign({ sub: c.id, role: 'customer', tv: 0, exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET!);
    await ctx.api().get('/api/auth/me').set(bearer(expired)).expect(401);
    const me = await ctx.api().get('/api/auth/me').set(bearer(c.token)).expect(200);
    expect(me.body.email).toBe(c.email);
  });

  it('takes the role from the database, not from the token', async () => {
    const c = await registerCustomer(ctx);
    const tampered = jwt.sign({ sub: c.id, role: 'admin', tv: 0 }, process.env.JWT_SECRET!);
    await ctx.api().get('/api/admin/stats').set(bearer(tampered)).expect(403);
  });

  it('locks the account after 5 failed attempts', async () => {
    const { email } = await registerCustomer(ctx);
    for (let i = 0; i < 5; i++) await ctx.api().post('/api/auth/login').send({ email, password: 'Wrong999' }).expect(401);
    const locked = await ctx.api().post('/api/auth/login').send({ email, password }).expect(429);
    expect(locked.body.message).toMatch(/Try again in/);
  });

  it('changing the password revokes existing tokens and returns a new one', async () => {
    const c = await registerCustomer(ctx);
    await ctx.api().patch('/api/auth/change-password').set(bearer(c.token)).send({ currentPassword: 'Wrong999', newPassword: 'NewPassw0rd' }).expect(400);
    const res = await ctx.api().patch('/api/auth/change-password').set(bearer(c.token)).send({ currentPassword: password, newPassword: 'NewPassw0rd' }).expect(200);
    await ctx.api().get('/api/auth/me').set(bearer(c.token)).expect(401);
    await ctx.api().get('/api/auth/me').set(bearer(res.body.accessToken)).expect(200);
    await ctx.api().post('/api/auth/login').send({ email: c.email, password }).expect(401);
    await ctx.api().post('/api/auth/login').send({ email: c.email, password: 'NewPassw0rd' }).expect(200);
  });

  it('logout-all revokes every session', async () => {
    const c = await registerCustomer(ctx);
    await ctx.api().post('/api/auth/logout-all').set(bearer(c.token)).expect(200);
    await ctx.api().get('/api/auth/me').set(bearer(c.token)).expect(401);
  });

  it('password reset: token works once, expires sessions, and unknown emails get the same answer', async () => {
    const c = await registerCustomer(ctx);
    const unknown = await ctx.api().post('/api/auth/forgot-password').send({ email: 'ghost@nowhere.io' }).expect(200);
    const res = await ctx.api().post('/api/auth/forgot-password').send({ email: c.email }).expect(200);
    expect(res.body.message).toBe(unknown.body.message);
    const token = new URL(`http://x${res.body.devResetUrl}`).searchParams.get('token')!;
    await ctx.api().post('/api/auth/reset-password').send({ token, password: 'Res3tPassword' }).expect(200);
    await ctx.api().post('/api/auth/reset-password').send({ token, password: 'Again4Password' }).expect(400);
    await ctx.api().get('/api/auth/me').set(bearer(c.token)).expect(401);
    await ctx.api().post('/api/auth/login').send({ email: c.email, password: 'Res3tPassword' }).expect(200);
  });

  it('a deactivated account can neither use its token nor sign in', async () => {
    const c = await registerCustomer(ctx);
    await ctx.api().delete('/api/users/account').set(bearer(c.token)).expect(200);
    await ctx.api().get('/api/auth/me').set(bearer(c.token)).expect(401);
    await ctx.api().post('/api/auth/login').send({ email: c.email, password }).expect(401);
  });

  it('registers restaurant owners with the owner role', async () => {
    const res = await ctx.api().post('/api/auth/register-owner').send({ fullName: 'Olive Owner', email: `${uniq('ow')}@t.io`, password }).expect(201);
    expect(res.body.user.role).toBe('owner');
  });
});

describe('Rate limiting (e2e)', () => {
  let ctx: Ctx;
  beforeAll(async () => (ctx = await bootstrap({ rateLimit: true })));
  afterAll(() => ctx.close());

  it('throttles repeated sign-in attempts from one client', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 22; i++) statuses.push((await ctx.api().post('/api/auth/login').send({ email: 'x@y.io', password: 'Wrong999' })).status);
    expect(statuses.slice(0, 20).every((s) => s === 401)).toBe(true);
    expect(statuses.slice(20)).toEqual([429, 429]);
  });
});
