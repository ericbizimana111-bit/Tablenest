import { Types } from 'mongoose';
import { bearer, bootstrap, Ctx, makeAdmin, ownerWithRestaurant, OwnedRestaurant, registerCustomer, Account } from './helpers';

describe('Orders (e2e)', () => {
  let ctx: Ctx;
  let r: OwnedRestaurant; // dishes: 12.50 and 8.00, tax 10%, delivery fee 3
  let admin: Account;
  beforeAll(async () => {
    ctx = await bootstrap();
    r = await ownerWithRestaurant(ctx);
    admin = await makeAdmin(ctx);
  });
  afterAll(() => ctx.close());

  const order = (token: string, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
    ctx
      .api()
      .post('/api/orders')
      .set({ ...bearer(token), ...headers })
      .send({ restaurantId: r.restaurantId, orderType: 'pickup', paymentMethod: 'cash', ...body });

  describe('pricing is computed by the server', () => {
    it('ignores client-sent prices and totals', async () => {
      const c = await registerCustomer(ctx);
      const res = await order(c.token, {
        items: [
          { menuItemId: r.items[0]._id, quantity: 2, price: 0.01, name: 'free?' },
          { menuItemId: r.items[1]._id, quantity: 1 },
        ],
        total: 1,
        subtotal: 1,
        tip: 2,
      }).expect(201);
      // 2 × 12.50 + 8 = 33; tax 3.30; tip 2 → 38.30
      expect(res.body).toMatchObject({ subtotal: 33, discount: 0, tax: 3.3, tip: 2, deliveryFee: 0, serviceFee: 0, total: 38.3, currency: 'USD', status: 'placed' });
      expect(res.body.items.find((i: { menuItemId: string }) => i.menuItemId === r.items[0]._id)).toMatchObject({ price: 12.5, quantity: 2, name: 'Dish 1' });
      expect(res.body).not.toHaveProperty('commissionAmount'); // platform economics are not exposed
    });

    it('merges duplicate lines and adds the delivery fee for delivery orders', async () => {
      const c = await registerCustomer(ctx);
      const res = await order(c.token, {
        orderType: 'delivery',
        deliveryAddress: '5 Road, Kigali',
        items: [
          { menuItemId: r.items[1]._id, quantity: 1 },
          { menuItemId: r.items[1]._id, quantity: 2 },
        ],
      }).expect(201);
      expect(res.body.items).toHaveLength(1);
      expect(res.body).toMatchObject({ subtotal: 24, deliveryFee: 3, tax: 2.4, total: 29.4 });
    });

    it('quote matches the placed order', async () => {
      const c = await registerCustomer(ctx);
      const body = { restaurantId: r.restaurantId, orderType: 'pickup', items: [{ menuItemId: r.items[0]._id, quantity: 3 }] };
      const quote = await ctx.api().post('/api/orders/quote').set(bearer(c.token)).send(body).expect(201);
      const placed = await order(c.token, body).expect(201);
      expect(placed.body.total).toBe(quote.body.total);
    });

    it('uses the price at checkout; later price changes do not alter the order', async () => {
      const own = await ownerWithRestaurant(ctx, {}, [10]);
      const c = await registerCustomer(ctx);
      const placed = await ctx.api().post('/api/orders').set(bearer(c.token))
        .send({ restaurantId: own.restaurantId, orderType: 'pickup', paymentMethod: 'cash', items: [{ menuItemId: own.items[0]._id, quantity: 1 }] }).expect(201);
      await ctx.api().put(`/api/menu/items/${own.items[0]._id}`).set(bearer(own.token)).send({ price: 99 }).expect(200);
      const again = await ctx.api().get(`/api/orders/${placed.body._id}`).set(bearer(c.token)).expect(200);
      expect(again.body.items[0].price).toBe(10);
      const next = await ctx.api().post('/api/orders/quote').set(bearer(c.token))
        .send({ restaurantId: own.restaurantId, orderType: 'pickup', items: [{ menuItemId: own.items[0]._id, quantity: 1 }] }).expect(201);
      expect(next.body.subtotal).toBe(99);
    });

    it('applies the service fee and records commission on the order', async () => {
      await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ serviceFeeRate: 0.05 }).expect(200);
      const c = await registerCustomer(ctx);
      const res = await order(c.token, { items: [{ menuItemId: r.items[1]._id, quantity: 5 }] }).expect(201);
      // 40 food, 2 service fee, 4 tax → 46
      expect(res.body).toMatchObject({ subtotal: 40, serviceFee: 2, tax: 4, total: 46 });
      const stored = await ctx.db.collection('orders').findOne({ _id: new Types.ObjectId(res.body._id) });
      expect(stored).toMatchObject({ commissionRate: 0.15, commissionAmount: 6 });
      await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ serviceFeeRate: 0 }).expect(200);
    });
  });

  describe('validation', () => {
    let c: Account;
    beforeAll(async () => (c = await registerCustomer(ctx)));

    it.each([
      ['empty cart', { items: [] }],
      ['negative quantity', { items: [{ menuItemId: 'x', quantity: -1 }] }],
      ['zero quantity', { items: [{ menuItemId: '0123456789abcdef01234567', quantity: 0 }] }],
      ['huge quantity', { items: [{ menuItemId: '0123456789abcdef01234567', quantity: 51 }] }],
      ['fractional quantity', { items: [{ menuItemId: '0123456789abcdef01234567', quantity: 1.5 }] }],
      ['invalid item id', { items: [{ menuItemId: 'nope', quantity: 1 }] }],
      ['bad order type', { orderType: 'teleport', items: [{ menuItemId: '0123456789abcdef01234567', quantity: 1 }] }],
      ['negative tip', { tip: -5, items: [{ menuItemId: '0123456789abcdef01234567', quantity: 1 }] }],
    ])('rejects %s with 400', async (_n, body) => {
      await order(c.token, body).expect(400);
    });

    it('rejects unknown dishes and dishes from another restaurant', async () => {
      const other = await ownerWithRestaurant(ctx);
      await order(c.token, { items: [{ menuItemId: '0123456789abcdef01234567', quantity: 1 }] }).expect(400);
      await order(c.token, { items: [{ menuItemId: other.items[0]._id, quantity: 1 }] }).expect(400);
    });

    it('rejects unavailable dishes, missing delivery address and more than 100 items', async () => {
      const own = await ownerWithRestaurant(ctx);
      await ctx.api().patch(`/api/menu/items/${own.items[1]._id}/toggle`).set(bearer(own.token)).expect(200);
      const base = { restaurantId: own.restaurantId, paymentMethod: 'cash' };
      await ctx.api().post('/api/orders').set(bearer(c.token)).send({ ...base, orderType: 'pickup', items: [{ menuItemId: own.items[1]._id, quantity: 1 }] }).expect(400);
      await ctx.api().post('/api/orders').set(bearer(c.token)).send({ ...base, orderType: 'delivery', items: [{ menuItemId: own.items[0]._id, quantity: 1 }] }).expect(400);
      const many = Array.from({ length: 3 }, () => ({ menuItemId: own.items[0]._id, quantity: 50 }));
      await ctx.api().post('/api/orders').set(bearer(c.token)).send({ ...base, orderType: 'pickup', items: many }).expect(400);
    });

    it('refuses card payment honestly while no gateway is connected', async () => {
      const res = await order(c.token, { paymentMethod: 'card', cardIndex: 0, items: [{ menuItemId: r.items[0]._id, quantity: 1 }] }).expect(400);
      expect(res.body.message).toMatch(/card payments are not available/i);
    });

    it('rejects orders when the restaurant is not accepting them', async () => {
      const own = await ownerWithRestaurant(ctx);
      await ctx.api().put(`/api/restaurants/${own.restaurantId}`).set(bearer(own.token)).send({ acceptingOrders: false }).expect(200);
      await ctx.api().post('/api/orders').set(bearer(c.token))
        .send({ restaurantId: own.restaurantId, orderType: 'pickup', paymentMethod: 'cash', items: [{ menuItemId: own.items[0]._id, quantity: 1 }] }).expect(400);
    });
  });

  describe('duplicate submits', () => {
    it('the same Idempotency-Key returns the same order, even when sent concurrently', async () => {
      const c = await registerCustomer(ctx);
      const key = `checkout-${Date.now()}`;
      const body = { items: [{ menuItemId: r.items[0]._id, quantity: 1 }] };
      const results = await Promise.all([1, 2, 3].map(() => order(c.token, body, { 'Idempotency-Key': key })));
      expect(results.every((x) => x.status === 201)).toBe(true);
      expect(new Set(results.map((x) => x.body._id)).size).toBe(1);
      const mine = await ctx.api().get('/api/orders/my-orders').set(bearer(c.token)).expect(200);
      expect(mine.body.total).toBe(1);
    });
  });

  describe('promotions and rewards', () => {
    it('code-less promotions apply automatically; codes are validated', async () => {
      const own = await ownerWithRestaurant(ctx, {}, [20]);
      const c = await registerCustomer(ctx);
      const today = new Date().toISOString().slice(0, 10);
      const next = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      await ctx.api().post('/api/promotions').set(bearer(own.token)).send({ name: 'Happy hour', discountType: 'percentage', discountValue: '10', startDate: today, endDate: next }).expect(201);
      await ctx.api().post('/api/promotions').set(bearer(own.token)).send({ name: 'Code deal', discountType: 'flat', discountValue: 5, startDate: today, endDate: next, code: 'save5' }).expect(201);
      const base = { restaurantId: own.restaurantId, orderType: 'pickup', paymentMethod: 'cash', items: [{ menuItemId: own.items[0]._id, quantity: 1 }] };

      const auto = await ctx.api().post('/api/orders').set(bearer(c.token)).send(base).expect(201);
      expect(auto.body).toMatchObject({ subtotal: 20, discount: 2, total: 19.8 }); // tax on 18

      const coded = await ctx.api().post('/api/orders').set(bearer(c.token)).send({ ...base, promoCode: 'SAVE5' }).expect(201);
      expect(coded.body).toMatchObject({ discount: 5, promoCode: 'SAVE5' });
      await ctx.api().post('/api/orders').set(bearer(c.token)).send({ ...base, promoCode: 'NOPE' }).expect(400);
    });

    it('CONCURRENCY: a promo with 1 use left is only spent once', async () => {
      const own = await ownerWithRestaurant(ctx, {}, [20]);
      const today = new Date().toISOString().slice(0, 10);
      const next = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      await ctx.api().post('/api/promotions').set(bearer(own.token)).send({ name: 'One shot', discountType: 'flat', discountValue: 10, startDate: today, endDate: next, code: 'ONCE', usageLimit: 1 }).expect(201);
      const customers = await Promise.all(Array.from({ length: 5 }, () => registerCustomer(ctx)));
      const results = await Promise.all(
        customers.map((c) =>
          ctx.api().post('/api/orders').set(bearer(c.token))
            .send({ restaurantId: own.restaurantId, orderType: 'pickup', paymentMethod: 'cash', promoCode: 'ONCE', items: [{ menuItemId: own.items[0]._id, quantity: 1 }] }),
        ),
      );
      expect(results.filter((x) => x.status === 201)).toHaveLength(1);
      const promo = await ctx.db.collection('promotions').findOne({ code: 'ONCE' });
      expect(promo!.usedCount).toBe(1);
    });

    it('CONCURRENCY: a loyalty voucher cannot be spent twice, and is returned when the order is cancelled', async () => {
      const c = await registerCustomer(ctx); // 100 welcome points
      await ctx.db.collection('loyalties').updateOne({ userId: new Types.ObjectId(c.id) }, { $set: { points: 1000 } });
      const redeemed = await ctx.api().post('/api/loyalty/redeem').set(bearer(c.token)).send({ rewardId: 'five-off' }).expect(201);
      const code = redeemed.body.voucher.code;
      const results = await Promise.all([1, 2, 3].map(() => order(c.token, { promoCode: code, items: [{ menuItemId: r.items[0]._id, quantity: 1 }] })));
      const ok = results.filter((x) => x.status === 201);
      expect(ok).toHaveLength(1);
      expect(ok[0].body.discount).toBe(5);

      await ctx.api().patch(`/api/orders/${ok[0].body._id}/cancel`).set(bearer(c.token)).expect(200);
      const again = await order(c.token, { promoCode: code, items: [{ menuItemId: r.items[0]._id, quantity: 1 }] }).expect(201);
      expect(again.body.discount).toBe(5);
    });
  });

  describe('status lifecycle', () => {
    it('owner moves the order through the flow; impossible moves are rejected; customer sees every step', async () => {
      const c = await registerCustomer(ctx);
      const placed = await order(c.token, { orderType: 'delivery', deliveryAddress: '1 Main St', items: [{ menuItemId: r.items[0]._id, quantity: 1 }] }).expect(201);
      const id = placed.body._id;
      const set = (status: string) => ctx.api().patch(`/api/orders/${id}/status`).set(bearer(r.token)).send({ status });

      await set('preparing').expect(400); // must confirm first
      await set('flying').expect(400);
      for (const s of ['confirmed', 'preparing', 'ready', 'out_for_delivery']) {
        await set(s).expect(200);
        const seen = await ctx.api().get(`/api/orders/${id}`).set(bearer(c.token)).expect(200);
        expect(seen.body.status).toBe(s);
      }
      await ctx.api().patch(`/api/orders/${id}/cancel`).set(bearer(c.token)).expect(400); // too late for the customer
      await set('delivered').expect(200);
      await set('preparing').expect(400); // completed is final
      await set('cancelled').expect(400);

      const done = await ctx.api().get(`/api/orders/${id}`).set(bearer(c.token)).expect(200);
      expect(done.body).toMatchObject({ status: 'delivered', paymentStatus: 'paid' });
      expect(done.body.statusHistory.map((h: { status: string }) => h.status)).toEqual(['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']);
      const payments = await ctx.api().get('/api/payments').set(bearer(c.token)).expect(200);
      expect(payments.body.payments.find((p: { orderId: string }) => p.orderId === id).status).toBe('success');
    });

    it('pickup orders cannot be sent out for delivery', async () => {
      const c = await registerCustomer(ctx);
      const placed = await order(c.token, { items: [{ menuItemId: r.items[0]._id, quantity: 1 }] }).expect(201);
      for (const s of ['confirmed', 'preparing', 'ready']) await ctx.api().patch(`/api/orders/${placed.body._id}/status`).set(bearer(r.token)).send({ status: s }).expect(200);
      await ctx.api().patch(`/api/orders/${placed.body._id}/status`).set(bearer(r.token)).send({ status: 'out_for_delivery' }).expect(400);
    });

    it('CONCURRENCY: two racing status updates cannot both apply', async () => {
      const c = await registerCustomer(ctx);
      const placed = await order(c.token, { items: [{ menuItemId: r.items[0]._id, quantity: 1 }] }).expect(201);
      const [a, b] = await Promise.all([
        ctx.api().patch(`/api/orders/${placed.body._id}/status`).set(bearer(r.token)).send({ status: 'confirmed' }),
        ctx.api().patch(`/api/orders/${placed.body._id}/cancel`).set(bearer(c.token)),
      ]);
      // Exactly one wins; the loser sees either the conflict (409) or the already-changed status (400).
      expect([a.status, b.status].filter((s) => s === 200)).toHaveLength(1);
      expect([400, 409]).toContain([a.status, b.status].find((s) => s !== 200));
    });

    it('customer can cancel early; owner is notified', async () => {
      const c = await registerCustomer(ctx);
      const placed = await order(c.token, { items: [{ menuItemId: r.items[0]._id, quantity: 1 }] }).expect(201);
      const res = await ctx.api().patch(`/api/orders/${placed.body._id}/cancel`).set(bearer(c.token)).expect(200);
      expect(res.body.status).toBe('cancelled');
      await new Promise((ok) => setTimeout(ok, 200));
      const notes = await ctx.api().get('/api/notifications').set(bearer(r.token)).expect(200);
      expect(notes.body.notifications.some((n: { title: string }) => n.title === 'Order cancelled')).toBe(true);
    });
  });

  describe('platform revenue', () => {
    it('a delivered order books commission once; admin can correct it (voiding the charge)', async () => {
      const own = await ownerWithRestaurant(ctx, {}, [100]);
      const c = await registerCustomer(ctx);
      const placed = await ctx.api().post('/api/orders').set(bearer(c.token))
        .send({ restaurantId: own.restaurantId, orderType: 'pickup', paymentMethod: 'cash', items: [{ menuItemId: own.items[0]._id, quantity: 1 }] }).expect(201);
      for (const s of ['confirmed', 'preparing', 'ready', 'delivered']) {
        await ctx.api().patch(`/api/orders/${placed.body._id}/status`).set(bearer(own.token)).send({ status: s }).expect(200);
      }
      const stmt = await ctx.api().get('/api/billing/my-statement').set(bearer(own.token)).expect(200);
      expect(stmt.body).toMatchObject({ plan: 'starter', commissionRate: 0.15, currency: 'USD' });
      expect(stmt.body.totals.byType.commission).toBe(15);
      expect(stmt.body.outstandingAllPeriods).toBe(15);

      // Reconcile is idempotent: no duplicate charges.
      await ctx.api().post('/api/admin/billing/reconcile').set(bearer(admin.token)).expect(200);
      const count = await ctx.db.collection('platformcharges').countDocuments({ sourceId: new Types.ObjectId(placed.body._id) });
      expect(count).toBe(1);

      await ctx.api().post(`/api/admin/orders/${placed.body._id}/correct`).set(bearer(admin.token)).send({ status: 'cancelled', note: 'x' }).expect(400); // note too short
      const corrected = await ctx.api().post(`/api/admin/orders/${placed.body._id}/correct`).set(bearer(admin.token)).send({ status: 'cancelled', note: 'Refund: wrong dish' }).expect(200);
      expect(corrected.body.status).toBe('cancelled');
      const after = await ctx.api().get('/api/billing/my-statement').set(bearer(own.token)).expect(200);
      expect(after.body.totals.byType.commission).toBeUndefined();
    });
  });
});
