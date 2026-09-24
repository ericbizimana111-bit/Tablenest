import { ALL_DAY, bearer, bootstrap, Ctx, makeAdmin, ownerWithRestaurant, registerCustomer, registerOwner } from './helpers';

describe('Restaurants & menu (e2e)', () => {
  let ctx: Ctx;
  beforeAll(async () => (ctx = await bootstrap()));
  afterAll(() => ctx.close());

  const base = { name: 'Chez Test', cuisineType: 'French', seatingCapacity: 30, address: '2 Rue Test', city: 'Paris', openingHours: ALL_DAY };

  it('owner creates exactly one restaurant; it becomes discoverable', async () => {
    const owner = await registerOwner(ctx);
    const r = await ctx.api().post('/api/restaurants').set(bearer(owner.token)).send(base).expect(201);
    expect(r.body).toMatchObject({ name: 'Chez Test', status: 'active', plan: 'starter' });
    await ctx.api().post('/api/restaurants').set(bearer(owner.token)).send(base).expect(409);

    const mine = await ctx.api().get('/api/restaurants/my-restaurant').set(bearer(owner.token)).expect(200);
    expect(mine.body._id).toBe(r.body._id);

    const pub = await ctx.api().get(`/api/restaurants/public/${r.body._id}`).expect(200);
    expect(pub.body.openNow).toEqual(expect.any(Boolean));
    for (const f of ['commissionRate', 'plan', 'rejectionReason', 'sponsoredUntil']) expect(pub.body).not.toHaveProperty(f);
    const list = await ctx.api().get('/api/restaurants/public').query({ search: 'Chez' }).expect(200);
    expect(list.body.restaurants.map((x: { _id: string }) => x._id)).toContain(r.body._id);
  });

  it('validates restaurant input', async () => {
    const owner = await registerOwner(ctx);
    await ctx.api().post('/api/restaurants').set(bearer(owner.token)).send({ ...base, seatingCapacity: 0 }).expect(400);
    await ctx.api().post('/api/restaurants').set(bearer(owner.token)).send({ ...base, taxRate: 0.9 }).expect(400);
    await ctx.api().post('/api/restaurants').set(bearer(owner.token)).send({ ...base, openingHours: { monday: { open: '25:00', close: '10:00', closed: false } } }).expect(400);
    await ctx.api().post('/api/restaurants').set(bearer(owner.token)).send({ ...base, timezone: 'Mars/Olympus' }).expect(400);
    await ctx.api().post('/api/restaurants').set(bearer(owner.token)).send({ ...base, images: ['https://evil.example/x.png'] }).expect(400);
  });

  it('accepts a whole restaurant object on update but only changes editable fields', async () => {
    const o = await ownerWithRestaurant(ctx);
    const full = (await ctx.api().get('/api/restaurants/my-restaurant').set(bearer(o.token))).body;
    const res = await ctx
      .api()
      .put(`/api/restaurants/${o.restaurantId}`)
      .set(bearer(o.token))
      .send({ ...full, name: 'Renamed Bistro', status: 'active', commissionRate: 0, rating: 5, ownerId: '000000000000000000000000', plan: 'pro' })
      .expect(200);
    expect(res.body).toMatchObject({ name: 'Renamed Bistro', plan: 'starter', commissionRate: null, rating: 0, ownerId: o.id });
  });

  it('with approval required, new restaurants stay hidden until an admin approves', async () => {
    const admin = await makeAdmin(ctx);
    await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ requireRestaurantApproval: true }).expect(200);
    const owner = await registerOwner(ctx);
    const r = await ctx.api().post('/api/restaurants').set(bearer(owner.token)).send({ ...base, name: 'Pending Place' }).expect(201);
    expect(r.body.status).toBe('pending');
    await ctx.api().get(`/api/restaurants/public/${r.body._id}`).expect(404);
    await ctx.api().patch(`/api/admin/restaurants/${r.body._id}/status`).set(bearer(admin.token)).send({ status: 'rejected' }).expect(400); // reason required
    await ctx.api().patch(`/api/admin/restaurants/${r.body._id}/status`).set(bearer(admin.token)).send({ status: 'active' }).expect(200);
    await ctx.api().get(`/api/restaurants/public/${r.body._id}`).expect(200);
    await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ requireRestaurantApproval: false }).expect(200);
  });

  describe('menu', () => {
    it('full CRUD with live price updates visible to customers', async () => {
      const o = await ownerWithRestaurant(ctx, {}, []);
      const item = await ctx
        .api()
        .post('/api/menu/items')
        .set(bearer(o.token))
        .send({ categoryId: o.categoryId, name: 'Chicken Burger', price: 5000, description: '' })
        .expect(201);
      expect(item.body).toMatchObject({ name: 'Chicken Burger', price: 5000, description: null, restaurantId: o.restaurantId });

      let menu = await ctx.api().get(`/api/menu/restaurant/${o.restaurantId}`).expect(200);
      expect(menu.body[0].items[0]).toMatchObject({ name: 'Chicken Burger', price: 5000 });

      await ctx.api().put(`/api/menu/items/${item.body._id}`).set(bearer(o.token)).send({ price: 5500 }).expect(200);
      menu = await ctx.api().get(`/api/menu/restaurant/${o.restaurantId}`).expect(200);
      expect(menu.body[0].items[0].price).toBe(5500);

      await ctx.api().patch(`/api/menu/items/${item.body._id}/toggle`).set(bearer(o.token)).expect(200);
      const publicItems = await ctx.api().get(`/api/menu/items/${o.restaurantId}`).expect(200);
      expect(publicItems.body).toHaveLength(0);
      const ownerItems = await ctx.api().get(`/api/menu/items/${o.restaurantId}`).set(bearer(o.token)).expect(200);
      expect(ownerItems.body).toHaveLength(1);
      await ctx.api().get(`/api/menu/item/${item.body._id}`).expect(404);

      await ctx.api().delete(`/api/menu/categories/${o.categoryId}`).set(bearer(o.token)).expect(409); // still has dishes
      await ctx.api().delete(`/api/menu/items/${item.body._id}`).set(bearer(o.token)).expect(200);
      await ctx.api().delete(`/api/menu/categories/${o.categoryId}`).set(bearer(o.token)).expect(200);
    });

    it('rejects invalid prices and names', async () => {
      const o = await ownerWithRestaurant(ctx, {}, []);
      for (const price of [-1, 'abc', 1.234, null]) {
        await ctx.api().post('/api/menu/items').set(bearer(o.token)).send({ categoryId: o.categoryId, name: 'X', price }).expect(400);
      }
      await ctx.api().post('/api/menu/items').set(bearer(o.token)).send({ categoryId: o.categoryId, name: '   ', price: 3 }).expect(400);
      await ctx.api().post('/api/menu/items').set(bearer(o.token)).send({ categoryId: 'nope', name: 'X', price: 3 }).expect(400);
    });

    it('menus of non-live restaurants are not public', async () => {
      const o = await ownerWithRestaurant(ctx);
      const admin = await makeAdmin(ctx);
      await ctx.api().patch(`/api/admin/restaurants/${o.restaurantId}/status`).set(bearer(admin.token)).send({ status: 'suspended', reason: 'Health inspection' }).expect(200);
      await ctx.api().get(`/api/menu/restaurant/${o.restaurantId}`).expect(404);
      await ctx.api().get(`/api/menu/restaurant/${o.restaurantId}`).set(bearer(o.token)).expect(200);
    });

    it('a customer token does not unlock hidden dishes', async () => {
      const o = await ownerWithRestaurant(ctx);
      const c = await registerCustomer(ctx);
      await ctx.api().patch(`/api/menu/items/${o.items[0]._id}/toggle`).set(bearer(o.token)).expect(200);
      const res = await ctx.api().get(`/api/menu/items/${o.restaurantId}`).set(bearer(c.token)).expect(200);
      expect(res.body.map((i: { _id: string }) => i._id)).not.toContain(o.items[0]._id);
    });
  });

  describe('tables', () => {
    it('owner manages tables; duplicates and bad capacities are rejected', async () => {
      const o = await ownerWithRestaurant(ctx);
      const t = await ctx.api().post('/api/tables').set(bearer(o.token)).send({ tableNumber: 'T1', capacity: 4 }).expect(201);
      await ctx.api().post('/api/tables').set(bearer(o.token)).send({ tableNumber: 'T1', capacity: 2 }).expect(409);
      await ctx.api().post('/api/tables').set(bearer(o.token)).send({ tableNumber: 'T2', capacity: 31 }).expect(400);
      await ctx.api().patch(`/api/tables/${t.body._id}/status`).set(bearer(o.token)).send({ status: 'flying' }).expect(400);
      const plan = await ctx.api().get(`/api/tables/floor-plan/${o.restaurantId}`).set(bearer(o.token)).expect(200);
      expect(plan.body.stats).toMatchObject({ total: 1, seats: 4 });
      await ctx.api().delete(`/api/tables/${t.body._id}`).set(bearer(o.token)).expect(200);
    });
  });
});
