import { bearer, bootstrap, Ctx, dayFromNow, makeAdmin, ownerWithRestaurant, OwnedRestaurant, registerCustomer, Account } from './helpers';

/** Every test here is an attack that must fail — plus the admin paths that must succeed. */
describe('Authorization & ownership (e2e)', () => {
  let ctx: Ctx;
  let ownerA: OwnedRestaurant;
  let ownerB: OwnedRestaurant;
  let alice: Account;
  let bob: Account;
  let admin: Account;
  let aliceOrderId: string;
  let aliceBookingId: string;

  beforeAll(async () => {
    ctx = await bootstrap();
    [ownerA, ownerB] = [await ownerWithRestaurant(ctx), await ownerWithRestaurant(ctx)];
    [alice, bob, admin] = [await registerCustomer(ctx), await registerCustomer(ctx), await makeAdmin(ctx)];
    const order = await ctx
      .api()
      .post('/api/orders')
      .set(bearer(alice.token))
      .send({ restaurantId: ownerA.restaurantId, items: [{ menuItemId: ownerA.items[0]._id, quantity: 1 }], orderType: 'pickup', paymentMethod: 'cash' })
      .expect(201);
    aliceOrderId = order.body._id;
    const booking = await ctx
      .api()
      .post('/api/reservations')
      .set(bearer(alice.token))
      .send({ restaurantId: ownerA.restaurantId, date: dayFromNow(2), time: '19:00', guests: 2 })
      .expect(201);
    aliceBookingId = booking.body._id;
  });
  afterAll(() => ctx.close());

  describe('role boundaries', () => {
    it('customers and owners cannot reach admin endpoints', async () => {
      for (const t of [alice.token, ownerA.token]) {
        await ctx.api().get('/api/admin/stats').set(bearer(t)).expect(403);
        await ctx.api().get('/api/admin/users').set(bearer(t)).expect(403);
        await ctx.api().put('/api/admin/settings').set(bearer(t)).send({ serviceFeeRate: 0.3 }).expect(403);
      }
    });

    it('customers cannot use owner endpoints', async () => {
      await ctx.api().get('/api/restaurants/my-restaurant').set(bearer(alice.token)).expect(403);
      await ctx.api().post('/api/menu/items').set(bearer(alice.token)).send({ categoryId: ownerA.categoryId, name: 'X', price: 1 }).expect(403);
      await ctx.api().get('/api/orders').set(bearer(alice.token)).expect(403);
      await ctx.api().patch(`/api/orders/${aliceOrderId}/status`).set(bearer(alice.token)).send({ status: 'confirmed' }).expect(403);
      await ctx.api().patch(`/api/reservations/${aliceBookingId}/confirm`).set(bearer(alice.token)).expect(403);
      await ctx.api().post('/api/tables').set(bearer(alice.token)).send({ tableNumber: 'Z', capacity: 2 }).expect(403);
      await ctx.api().get(`/api/analytics/restaurant/${ownerA.restaurantId}/dashboard`).set(bearer(alice.token)).expect(403);
    });

    it('owners cannot place customer orders or bookings', async () => {
      await ctx
        .api()
        .post('/api/orders')
        .set(bearer(ownerB.token))
        .send({ restaurantId: ownerA.restaurantId, items: [{ menuItemId: ownerA.items[0]._id, quantity: 1 }], orderType: 'pickup', paymentMethod: 'cash' })
        .expect(403);
    });

    it('admin rights cannot be granted over HTTP', async () => {
      await ctx.api().patch(`/api/admin/users/${bob.id}`).set(bearer(admin.token)).send({ role: 'admin' }).expect(400);
    });
  });

  describe('owner A vs restaurant B (IDOR/BOLA)', () => {
    it('cannot edit, read privately or manage another restaurant', async () => {
      await ctx.api().put(`/api/restaurants/${ownerB.restaurantId}`).set(bearer(ownerA.token)).send({ name: 'Hijacked' }).expect(403);
      await ctx.api().get(`/api/restaurants/${ownerB.restaurantId}`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().get(`/api/orders/restaurant/${ownerB.restaurantId}`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().get(`/api/reservations/restaurant/${ownerB.restaurantId}`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().get(`/api/tables/restaurant/${ownerB.restaurantId}`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().get(`/api/staff/restaurant/${ownerB.restaurantId}`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().get(`/api/inventory/restaurant/${ownerB.restaurantId}`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().get(`/api/promotions/restaurant/${ownerB.restaurantId}`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().get(`/api/analytics/restaurant/${ownerB.restaurantId}/overview`).set(bearer(ownerA.token)).expect(403);
    });

    it("cannot change another restaurant's menu", async () => {
      await ctx.api().put(`/api/menu/items/${ownerB.items[0]._id}`).set(bearer(ownerA.token)).send({ price: 0.01 }).expect(403);
      await ctx.api().patch(`/api/menu/items/${ownerB.items[0]._id}/toggle`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().delete(`/api/menu/items/${ownerB.items[0]._id}`).set(bearer(ownerA.token)).expect(403);
      await ctx.api().delete(`/api/menu/categories/${ownerB.categoryId}`).set(bearer(ownerA.token)).expect(403);
      // Cannot slip a dish into B's category either.
      await ctx.api().post('/api/menu/items').set(bearer(ownerA.token)).send({ categoryId: ownerB.categoryId, name: 'Sneaky', price: 1 }).expect(400);
      const item = await ctx.db.collection('menuitems').findOne({ name: ownerB.items[0].name, price: ownerB.items[0].price });
      expect(item).not.toBeNull();
    });

    it("cannot see or act on another restaurant's orders and bookings", async () => {
      await ctx.api().get(`/api/orders/${aliceOrderId}`).set(bearer(ownerB.token)).expect(404);
      await ctx.api().patch(`/api/orders/${aliceOrderId}/status`).set(bearer(ownerB.token)).send({ status: 'confirmed' }).expect(403);
      await ctx.api().patch(`/api/orders/${aliceOrderId}/cancel`).set(bearer(ownerB.token)).expect(404);
      await ctx.api().get(`/api/reservations/${aliceBookingId}`).set(bearer(ownerB.token)).expect(404);
      await ctx.api().patch(`/api/reservations/${aliceBookingId}/confirm`).set(bearer(ownerB.token)).expect(403);
    });
  });

  describe('customer vs customer', () => {
    it("cannot read, cancel or modify someone else's order or booking", async () => {
      await ctx.api().get(`/api/orders/${aliceOrderId}`).set(bearer(bob.token)).expect(404);
      await ctx.api().patch(`/api/orders/${aliceOrderId}/cancel`).set(bearer(bob.token)).expect(403);
      await ctx.api().get(`/api/reservations/${aliceBookingId}`).set(bearer(bob.token)).expect(404);
      await ctx.api().patch(`/api/reservations/${aliceBookingId}/cancel`).set(bearer(bob.token)).send({}).expect(403);
      await ctx.api().patch(`/api/reservations/${aliceBookingId}`).set(bearer(bob.token)).send({ guests: 6 }).expect(403);
    });

    it('lists only their own orders and bookings, whatever ids they pass', async () => {
      const orders = await ctx.api().get('/api/orders/my-orders').set(bearer(bob.token)).query({ customerId: alice.id }).expect(200);
      expect(orders.body.total).toBe(0);
      const bookings = await ctx.api().get('/api/reservations/my-reservations').set(bearer(bob.token)).expect(200);
      expect(bookings.body).toEqual([]);
    });

    it('mass assignment: extra fields are ignored', async () => {
      const res = await ctx.api().put('/api/users/profile').set(bearer(bob.token)).send({ fullName: 'Bob B', role: 'admin', isActive: false, tokenVersion: 99 }).expect(200);
      expect(res.body).toMatchObject({ fullName: 'Bob B', role: 'customer', isActive: true });
      await ctx.api().get('/api/auth/me').set(bearer(bob.token)).expect(200);
    });
  });

  describe('admin', () => {
    it('can read and manage any restaurant, order and booking', async () => {
      await ctx.api().get(`/api/restaurants/${ownerB.restaurantId}`).set(bearer(admin.token)).expect(200);
      await ctx.api().get(`/api/orders/${aliceOrderId}`).set(bearer(admin.token)).expect(200);
      await ctx.api().get(`/api/reservations/restaurant/${ownerA.restaurantId}`).set(bearer(admin.token)).expect(200);
      const res = await ctx.api().patch(`/api/orders/${aliceOrderId}/status`).set(bearer(admin.token)).send({ status: 'confirmed' }).expect(200);
      expect(res.body.statusHistory.at(-1).by).toBe('admin');
      const audit = await ctx.api().get('/api/admin/audit-logs').set(bearer(admin.token)).query({ action: 'admin.order_status' }).expect(200);
      expect(audit.body.total).toBeGreaterThanOrEqual(1);
    });

    it('cannot change its own account from the panel', async () => {
      await ctx.api().patch(`/api/admin/users/${admin.id}`).set(bearer(admin.token)).send({ isActive: false }).expect(403);
    });
  });
});
