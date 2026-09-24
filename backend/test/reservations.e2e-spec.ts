import { Types } from 'mongoose';
import { bearer, bootstrap, Ctx, dayFromNow, makeAdmin, ownerWithRestaurant, OwnedRestaurant, registerCustomer } from './helpers';

describe('Reservations (e2e)', () => {
  let ctx: Ctx;
  beforeAll(async () => (ctx = await bootstrap()));
  afterAll(() => ctx.close());

  const book = (token: string, body: Record<string, unknown>) => ctx.api().post('/api/reservations').set(bearer(token)).send(body);

  describe('validation', () => {
    let o: OwnedRestaurant;
    let token: string;
    beforeAll(async () => {
      o = await ownerWithRestaurant(ctx, {
        openingHours: {
          ...Object.fromEntries(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((d) => [d, { open: '10:00', close: '22:00', closed: false }])),
        },
      });
      token = (await registerCustomer(ctx)).token;
    });

    it.each([
      ['past date', { date: dayFromNow(-1), time: '19:00', guests: 2 }, 400],
      ['impossible date', { date: '2030-02-30', time: '19:00', guests: 2 }, 400],
      ['too far ahead', { date: dayFromNow(120), time: '19:00', guests: 2 }, 400],
      ['zero guests', { date: dayFromNow(2), time: '19:00', guests: 0 }, 400],
      ['21 guests', { date: dayFromNow(2), time: '19:00', guests: 21 }, 400],
      ['bad time', { date: dayFromNow(2), time: '7pm', guests: 2 }, 400],
      ['off-grid time', { date: dayFromNow(2), time: '19:10', guests: 2 }, 400],
      ['before opening', { date: dayFromNow(2), time: '08:00', guests: 2 }, 400],
      ['after last seating', { date: dayFromNow(2), time: '21:30', guests: 2 }, 400],
    ])('rejects %s', async (_n, body, status) => {
      await book(token, { restaurantId: o.restaurantId, ...body }).expect(status);
    });

    it('rejects an unknown restaurant and a missing one', async () => {
      await book(token, { restaurantId: '0123456789abcdef01234567', date: dayFromNow(2), time: '19:00', guests: 2 }).expect(404);
      await book(token, { date: dayFromNow(2), time: '19:00', guests: 2 }).expect(400);
    });

    it('rejects a closed day and restaurants without dine-in', async () => {
      const dow = new Date(`${dayFromNow(3)}T12:00:00Z`).getUTCDay();
      const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dow];
      await ctx.api().put(`/api/restaurants/${o.restaurantId}`).set(bearer(o.token)).send({ openingHours: { [day]: { open: '10:00', close: '22:00', closed: true } } }).expect(200);
      await book(token, { restaurantId: o.restaurantId, date: dayFromNow(3), time: '19:00', guests: 2 }).expect(400);
      const avail = await ctx.api().get('/api/reservations/availability').query({ restaurantId: o.restaurantId, date: dayFromNow(3) }).expect(200);
      expect(avail.body).toMatchObject({ closed: true, slots: [] });

      const noDineIn = await ownerWithRestaurant(ctx, { dineIn: false });
      await book(token, { restaurantId: noDineIn.restaurantId, date: dayFromNow(2), time: '19:00', guests: 2 }).expect(400);
    });
  });

  describe('table-based booking', () => {
    it('picks the smallest table that fits, respects capacity, and never double-books', async () => {
      const o = await ownerWithRestaurant(ctx);
      await ctx.api().post('/api/tables').set(bearer(o.token)).send({ tableNumber: 'Big', capacity: 6 }).expect(201);
      await ctx.api().post('/api/tables').set(bearer(o.token)).send({ tableNumber: 'Small', capacity: 2 }).expect(201);
      const [a, b, c, d] = await Promise.all([1, 2, 3, 4].map(() => registerCustomer(ctx)));
      const date = dayFromNow(1);

      const r1 = await book(a.token, { restaurantId: o.restaurantId, date, time: '19:00', guests: 2 }).expect(201);
      expect(r1.body.tableNumber).toBe('Small');
      await book(b.token, { restaurantId: o.restaurantId, date, time: '19:00', guests: 7 }).expect(409); // no table seats 7
      const r2 = await book(b.token, { restaurantId: o.restaurantId, date, time: '19:30', guests: 2 }).expect(201);
      expect(r2.body.tableNumber).toBe('Big'); // Small is held 19:00–20:30
      await book(c.token, { restaurantId: o.restaurantId, date, time: '20:00', guests: 2 }).expect(409); // both tables busy
      const r3 = await book(d.token, { restaurantId: o.restaurantId, date, time: '20:30', guests: 2 }).expect(201); // Small frees at 20:30
      expect(r3.body.tableNumber).toBe('Small');

      const avail = await ctx.api().get('/api/reservations/availability').query({ restaurantId: o.restaurantId, date, guests: 2 }).expect(200);
      const at = (t: string) => avail.body.slots.find((s: { time: string }) => s.time === t)?.available;
      expect(at('20:00')).toBe(false);
      expect(at('23:00')).toBe(undefined); // after last seating
      expect(at('22:00')).toBe(true);
    });

    it('CONCURRENCY: 8 customers racing for the last table → exactly one wins', async () => {
      const o = await ownerWithRestaurant(ctx);
      await ctx.api().post('/api/tables').set(bearer(o.token)).send({ tableNumber: 'Only', capacity: 4 }).expect(201);
      const customers = await Promise.all(Array.from({ length: 8 }, () => registerCustomer(ctx)));
      const date = dayFromNow(4);
      const results = await Promise.all(customers.map((c) => book(c.token, { restaurantId: o.restaurantId, date, time: '19:00', guests: 3 })));
      const codes = results.map((r) => r.status).sort();
      expect(codes.filter((s) => s === 201)).toHaveLength(1);
      expect(codes.filter((s) => s === 409)).toHaveLength(7);
      expect(await ctx.db.collection('reservations').countDocuments({ restaurantId: new Types.ObjectId(o.restaurantId) })).toBe(1);
    });
  });

  describe('capacity-based booking (restaurant without tables)', () => {
    it('CONCURRENCY: never seats more guests than capacity', async () => {
      const o = await ownerWithRestaurant(ctx, { seatingCapacity: 10 });
      const customers = await Promise.all(Array.from({ length: 6 }, () => registerCustomer(ctx)));
      const date = dayFromNow(5);
      const results = await Promise.all(customers.map((c) => book(c.token, { restaurantId: o.restaurantId, date, time: '18:00', guests: 4 })));
      expect(results.filter((r) => r.status === 201)).toHaveLength(2); // 2 × 4 = 8 ≤ 10; a third would make 12
      const slots = await ctx.db.collection('reservationslots').find({ tableId: null }).toArray();
      expect(Math.max(...slots.map((s) => s.seats))).toBeLessThanOrEqual(10);
    });
  });

  describe('lifecycle', () => {
    it('owner confirms; customer sees it; cancelling frees the table; transitions are enforced', async () => {
      const o = await ownerWithRestaurant(ctx);
      await ctx.api().post('/api/tables').set(bearer(o.token)).send({ tableNumber: 'T1', capacity: 4 }).expect(201);
      const [alice, bob] = [await registerCustomer(ctx), await registerCustomer(ctx)];
      const date = dayFromNow(6);
      const r = await book(alice.token, { restaurantId: o.restaurantId, date, time: '19:00', guests: 2, notes: 'Window seat' }).expect(201);
      expect(r.body).toMatchObject({ status: 'pending', specialRequests: 'Window seat', bookingRef: expect.stringMatching(/^TN-/) });

      await book(alice.token, { restaurantId: o.restaurantId, date, time: '19:30', guests: 2 }).expect(409); // overlapping own booking

      const list = await ctx.api().get(`/api/reservations/restaurant/${o.restaurantId}`).set(bearer(o.token)).query({ date }).expect(200);
      expect(list.body.reservations.map((x: { _id: string }) => x._id)).toContain(r.body._id);

      await ctx.api().patch(`/api/reservations/${r.body._id}/arrived`).set(bearer(o.token)).expect(400); // pending → arrived not allowed
      await ctx.api().patch(`/api/reservations/${r.body._id}/confirm`).set(bearer(o.token)).expect(200);
      const mine = await ctx.api().get('/api/reservations/my-reservations').set(bearer(alice.token)).expect(200);
      expect(mine.body.find((x: { _id: string }) => x._id === r.body._id).status).toBe('confirmed');
      await ctx.api().patch(`/api/reservations/${r.body._id}/status`).set(bearer(o.token)).send({ status: 'completed' }).expect(400); // not the booking day yet

      await book(bob.token, { restaurantId: o.restaurantId, date, time: '19:00', guests: 2 }).expect(409);
      await ctx.api().patch(`/api/reservations/${r.body._id}/cancel`).set(bearer(alice.token)).send({ reason: 'Plans changed' }).expect(200);
      await ctx.api().patch(`/api/reservations/${r.body._id}/confirm`).set(bearer(o.token)).expect(400); // cancelled is final
      await book(bob.token, { restaurantId: o.restaurantId, date, time: '19:00', guests: 2 }).expect(201); // table freed

      // Both sides were notified at each step.
      const aliceNotes = await ctx.api().get('/api/notifications').set(bearer(alice.token)).expect(200);
      expect(aliceNotes.body.notifications.map((n: { title: string }) => n.title)).toEqual(expect.arrayContaining(['Booking request sent', 'Booking confirmed']));
      const ownerNotes = await ctx.api().get('/api/notifications').set(bearer(o.token)).expect(200);
      expect(ownerNotes.body.notifications.map((n: { title: string }) => n.title)).toEqual(expect.arrayContaining(['New booking request', 'Booking cancelled']));
    });

    it('rescheduling moves the lock and resets to pending', async () => {
      const o = await ownerWithRestaurant(ctx);
      await ctx.api().post('/api/tables').set(bearer(o.token)).send({ tableNumber: 'T1', capacity: 4 }).expect(201);
      const [alice, bob] = [await registerCustomer(ctx), await registerCustomer(ctx)];
      const date = dayFromNow(7);
      const r = await book(alice.token, { restaurantId: o.restaurantId, date, time: '12:00', guests: 2 }).expect(201);
      await ctx.api().patch(`/api/reservations/${r.body._id}/confirm`).set(bearer(o.token)).expect(200);
      const moved = await ctx.api().patch(`/api/reservations/${r.body._id}`).set(bearer(alice.token)).send({ time: '12:30', guests: 3 }).expect(200);
      expect(moved.body).toMatchObject({ time: '12:30', guests: 3, status: 'pending' });
      await book(bob.token, { restaurantId: o.restaurantId, date, time: '13:00', guests: 2 }).expect(409); // overlaps new 12:30 slot
      await book(bob.token, { restaurantId: o.restaurantId, date, time: '10:30', guests: 2 }).expect(201); // old 12:00 lock released? 10:30–12:00 ends as 12:30 starts
    });

    it('completing a visit records the platform booking fee', async () => {
      const o = await ownerWithRestaurant(ctx);
      const admin = await makeAdmin(ctx);
      await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ bookingFeePerCover: 1.5 }).expect(200);
      const c = await registerCustomer(ctx);
      const r = await book(c.token, { restaurantId: o.restaurantId, date: dayFromNow(1), time: '19:00', guests: 4 }).expect(201);
      // Simulate the booking day having arrived.
      await ctx.db.collection('reservations').updateOne({ bookingRef: r.body.bookingRef }, { $set: { date: new Date(`${dayFromNow(0)}T00:00:00.000Z`) } });
      await ctx.api().patch(`/api/reservations/${r.body._id}/confirm`).set(bearer(o.token)).expect(200);
      await ctx.api().patch(`/api/reservations/${r.body._id}/arrived`).set(bearer(o.token)).expect(200);
      await ctx.api().patch(`/api/reservations/${r.body._id}/status`).set(bearer(o.token)).send({ status: 'completed' }).expect(200);
      const stmt = await ctx.api().get('/api/billing/my-statement').set(bearer(o.token)).expect(200);
      expect(stmt.body.totals.byType.booking_fee).toBe(6);
      await ctx.api().put('/api/admin/settings').set(bearer(admin.token)).send({ bookingFeePerCover: 0 }).expect(200);
      const loyalty = await ctx.api().get('/api/loyalty').set(bearer(c.token)).expect(200);
      expect(loyalty.body.points).toBe(150); // 100 welcome + 50 for dining
    });
  });
});
