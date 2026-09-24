import { bearer, bootstrap, Ctx, makeAdmin, ownerWithRestaurant, registerCustomer, Account } from './helpers';

describe('Admin & platform revenue (e2e)', () => {
  let ctx: Ctx;
  let admin: Account;
  beforeAll(async () => {
    ctx = await bootstrap();
    admin = await makeAdmin(ctx);
  });
  afterAll(() => ctx.close());
  const period = new Date().toISOString().slice(0, 7);

  it('stats are live counts from the database', async () => {
    const before = (await ctx.api().get('/api/admin/stats').set(bearer(admin.token)).expect(200)).body;
    await registerCustomer(ctx);
    await ownerWithRestaurant(ctx);
    const after = (await ctx.api().get('/api/admin/stats').set(bearer(admin.token)).expect(200)).body;
    expect(after.users.customer).toBe((before.users.customer || 0) + 1);
    expect(after.restaurants.active).toBe((before.restaurants.active || 0) + 1);
    expect(after.platformRevenueThisMonth).toMatchObject({ period, currency: 'USD' });
  });

  it('lists and searches users without exposing secrets', async () => {
    const c = await registerCustomer(ctx);
    const res = await ctx.api().get('/api/admin/users').set(bearer(admin.token)).query({ search: c.email }).expect(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0]).not.toHaveProperty('password');
    await ctx.api().get('/api/admin/users').set(bearer(admin.token)).query({ search: '.*' }).expect(200); // regex is escaped
  });

  it('deactivating an owner revokes their sessions and takes their restaurant offline', async () => {
    const o = await ownerWithRestaurant(ctx);
    await ctx.api().patch(`/api/admin/users/${o.id}`).set(bearer(admin.token)).send({ isActive: false }).expect(200);
    await ctx.api().get('/api/auth/me').set(bearer(o.token)).expect(401);
    await ctx.api().get(`/api/restaurants/public/${o.restaurantId}`).expect(404);
  });

  it('plans, commission overrides and sponsorship all produce the right charges', async () => {
    const o = await ownerWithRestaurant(ctx);
    const other = await ownerWithRestaurant(ctx);

    await ctx.api().patch(`/api/admin/restaurants/${o.restaurantId}/billing`).set(bearer(admin.token)).send({ plan: 'pro' }).expect(200);
    await ctx.api().patch(`/api/admin/restaurants/${o.restaurantId}/billing`).set(bearer(admin.token)).send({ plan: 'gold' }).expect(400);
    await ctx.api().patch(`/api/admin/restaurants/${other.restaurantId}/billing`).set(bearer(admin.token)).send({ plan: 'starter', commissionRate: 0.08 }).expect(200);

    const run1 = await ctx.api().post('/api/admin/billing/run-subscriptions').set(bearer(admin.token)).send({ period }).expect(200);
    const run2 = await ctx.api().post('/api/admin/billing/run-subscriptions').set(bearer(admin.token)).send({ period }).expect(200);
    expect(run1.body.created).toBeGreaterThanOrEqual(1);
    expect(run2.body.created).toBe(0); // idempotent

    const sp = await ctx.api().post(`/api/admin/restaurants/${other.restaurantId}/sponsorship`).set(bearer(admin.token)).send({ weeks: 2 }).expect(201);
    expect(new Date(sp.body.sponsoredUntil).getTime()).toBeGreaterThan(Date.now() + 13 * 86400000);

    const featured = await ctx.api().get('/api/restaurants/public/featured').expect(200);
    expect(featured.body.restaurants[0]).toMatchObject({ _id: other.restaurantId, sponsored: true });
    expect(featured.body.restaurants[0]).not.toHaveProperty('sponsoredUntil');

    const proStmt = await ctx.api().get('/api/billing/my-statement').set(bearer(o.token)).expect(200);
    expect(proStmt.body).toMatchObject({ plan: 'pro', commissionRate: 0.1 });
    expect(proStmt.body.totals.byType.subscription).toBe(49);
    const otherStmt = await ctx.api().get('/api/billing/my-statement').set(bearer(other.token)).expect(200);
    expect(otherStmt.body.commissionRate).toBe(0.08);
    expect(otherStmt.body.totals.byType.sponsorship).toBe(50);

    // Owners only ever see their own statement.
    await ctx.api().get(`/api/admin/restaurants/${o.restaurantId}/statement`).set(bearer(other.token)).expect(403);

    const revenue = await ctx.api().get('/api/admin/revenue').set(bearer(admin.token)).query({ from: period, to: period }).expect(200);
    expect(revenue.body.total).toBeGreaterThanOrEqual(99);
    expect(revenue.body.byType.map((t: { type: string }) => t.type)).toEqual(expect.arrayContaining(['subscription', 'sponsorship']));

    const paid = await ctx.api().post('/api/admin/charges/mark-paid').set(bearer(admin.token)).send({ restaurantId: o.restaurantId, period }).expect(200);
    expect(paid.body.updated).toBeGreaterThanOrEqual(1);
    const settled = await ctx.api().get('/api/billing/my-statement').set(bearer(o.token)).expect(200);
    expect(settled.body.totals.unpaid).toBe(0);
    expect(settled.body.outstandingAllPeriods).toBe(0);
    await ctx.api().post('/api/admin/charges/mark-paid').set(bearer(admin.token)).send({}).expect(400);
  });

  it('validates settings', async () => {
    await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ serviceFeeRate: 2 }).expect(400);
    await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ currency: 'dollars' }).expect(400);
    const ok = await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ currency: 'RWF' }).expect(200);
    expect(ok.body.currency).toBe('RWF');
    expect((await ctx.api().get('/api/settings/public').expect(200)).body.currency).toBe('RWF');
    await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ currency: 'USD' }).expect(200);
  });

  it('support: users open tickets without controlling status; admins answer', async () => {
    const c = await registerCustomer(ctx);
    const t = await ctx.api().post('/api/support').set(bearer(c.token)).send({ subject: 'Late order', description: 'My order is late', type: 'order', status: 'resolved', assignedTo: admin.id }).expect(201);
    expect(t.body).toMatchObject({ status: 'open', assignedTo: null });
    const other = await registerCustomer(ctx);
    await ctx.api().get(`/api/support/${t.body._id}`).set(bearer(other.token)).expect(404);
    await ctx.api().post(`/api/support/${t.body._id}/reply`).set(bearer(admin.token)).send({ message: 'On it!' }).expect(201);
    const seen = await ctx.api().get(`/api/support/${t.body._id}`).set(bearer(c.token)).expect(200);
    expect(seen.body.status).toBe('in_progress');
    expect(seen.body.responses).toHaveLength(1);
    await ctx.api().patch(`/api/admin/support/${t.body._id}`).set(bearer(admin.token)).send({ status: 'resolved' }).expect(200);
  });

  it('every admin mutation is in the audit log', async () => {
    const res = await ctx.api().get('/api/admin/audit-logs').set(bearer(admin.token)).query({ limit: 100 }).expect(200);
    const actions = res.body.items.map((a: { action: string }) => a.action);
    expect(actions).toEqual(expect.arrayContaining(['admin.user_updated', 'admin.restaurant_plan', 'admin.sponsorship_granted', 'admin.subscriptions_charged', 'admin.charges_marked_paid', 'admin.settings_updated']));
  });
});
