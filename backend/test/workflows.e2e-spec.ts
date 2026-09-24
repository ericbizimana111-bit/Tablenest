import { ALL_DAY, bearer, bootstrap, Ctx, dayFromNow, PNG } from './helpers';

/**
 * The two journeys the platform exists for, driven purely through the public HTTP API exactly as
 * the frontend would: no direct database writes, no shortcuts.
 */
describe('End-to-end workflows', () => {
  let ctx: Ctx;
  beforeAll(async () => (ctx = await bootstrap()));
  afterAll(() => ctx.close());

  async function openRestaurant() {
    const owner = await ctx.api().post('/api/auth/register-owner').send({ fullName: 'Grace Owner', email: `owner.${Date.now()}@kigali.rw`, password: 'Passw0rd!' }).expect(201);
    const token = owner.body.accessToken as string;
    const photo = await ctx.api().post('/api/uploads/image').set(bearer(token)).attach('file', PNG, 'front.png').expect(201);
    const restaurant = await ctx
      .api()
      .post('/api/restaurants')
      .set(bearer(token))
      .send({ name: 'Kigali Grill', cuisineType: 'African', seatingCapacity: 40, address: 'KN 5 Rd', city: 'Kigali', dineIn: true, pickup: true, delivery: true, openingHours: ALL_DAY, timezone: 'UTC', images: [photo.body.url], logo: photo.body.url })
      .expect(201);
    await ctx.api().post('/api/tables').set(bearer(token)).send({ tableNumber: 'A1', capacity: 4 }).expect(201);
    const cat = await ctx.api().post('/api/menu/categories').set(bearer(token)).send({ name: 'Grill' }).expect(201);
    const dishPhoto = await ctx.api().post('/api/uploads/image').set(bearer(token)).attach('file', PNG, 'burger.png').expect(201);
    const burger = await ctx
      .api()
      .post('/api/menu/items')
      .set(bearer(token))
      .send({ categoryId: cat.body._id, name: 'Chicken Burger', price: 5000, image: dishPhoto.body.url })
      .expect(201);
    return { token, restaurantId: restaurant.body._id as string, burgerId: burger.body._id as string, burgerImage: dishPhoto.body.url as string };
  }

  it('RESERVATION: customer books → owner sees & accepts → customer sees accepted', async () => {
    const r = await openRestaurant();

    // Customer
    await ctx.api().post('/api/auth/register').send({ fullName: 'Jean Customer', email: 'jean.booking@example.rw', password: 'Passw0rd!' }).expect(201);
    const login = await ctx.api().post('/api/auth/login').send({ email: 'jean.booking@example.rw', password: 'Passw0rd!' }).expect(200);
    const customer = login.body.accessToken;
    const found = await ctx.api().get('/api/restaurants/public').query({ search: 'Kigali Grill' }).expect(200);
    const listing = found.body.restaurants[0];
    expect(listing._id).toBe(r.restaurantId);
    await ctx.api().get(listing.images[0]).expect(200); // the photo really loads

    const date = dayFromNow(3);
    const avail = await ctx.api().get('/api/reservations/availability').query({ restaurantId: r.restaurantId, date, guests: 3 }).expect(200);
    expect(avail.body.slots.find((s: { time: string }) => s.time === '19:00').available).toBe(true);
    const booking = await ctx.api().post('/api/reservations').set(bearer(customer)).send({ restaurantId: r.restaurantId, date, time: '19:00', guests: 3, notes: 'Birthday' }).expect(201);
    expect(booking.body).toMatchObject({ status: 'pending', tableNumber: 'A1' });

    // Owner dashboard
    const dash = await ctx.api().get(`/api/analytics/restaurant/${r.restaurantId}/dashboard`).set(bearer(r.token)).expect(200);
    expect(dash.body.pendingReservations).toBe(1);
    expect(dash.body.upcomingReservations[0]).toMatchObject({ _id: booking.body._id, customerName: 'Jean Customer', guests: 3 });
    const ownerNotes = await ctx.api().get('/api/notifications').set(bearer(r.token)).expect(200);
    expect(ownerNotes.body.notifications[0].title).toBe('New booking request');
    await ctx.api().patch(`/api/reservations/${booking.body._id}/confirm`).set(bearer(r.token)).expect(200);

    // Customer refreshes
    const mine = await ctx.api().get('/api/reservations/my-reservations').set(bearer(customer)).expect(200);
    expect(mine.body[0]).toMatchObject({ _id: booking.body._id, status: 'confirmed', restaurantName: 'Kigali Grill' });
    const notes = await ctx.api().get('/api/notifications').set(bearer(customer)).expect(200);
    expect(notes.body.notifications[0].title).toBe('Booking confirmed');

    // The slot is now taken for everyone else.
    const after = await ctx.api().get('/api/reservations/availability').query({ restaurantId: r.restaurantId, date, guests: 3 }).expect(200);
    expect(after.body.slots.find((s: { time: string }) => s.time === '19:00').available).toBe(false);
  });

  it('ORDER: customer orders → owner receives → accept/prepare/ready → customer sees each status', async () => {
    const r = await openRestaurant();
    const reg = await ctx.api().post('/api/auth/register').send({ fullName: 'Aline Customer', email: 'aline.order@example.rw', password: 'Passw0rd!' }).expect(201);
    const customer = reg.body.accessToken;

    // Dynamic menu: the owner's dish, price and photo are what the customer gets.
    let menu = await ctx.api().get(`/api/menu/restaurant/${r.restaurantId}`).expect(200);
    expect(menu.body[0].items[0]).toMatchObject({ name: 'Chicken Burger', price: 5000, image: r.burgerImage });
    await ctx.api().put(`/api/menu/items/${r.burgerId}`).set(bearer(r.token)).send({ price: 5500 }).expect(200);
    menu = await ctx.api().get(`/api/menu/restaurant/${r.restaurantId}`).expect(200);
    expect(menu.body[0].items[0].price).toBe(5500);

    const placed = await ctx
      .api()
      .post('/api/orders')
      .set(bearer(customer))
      .set('Idempotency-Key', 'aline-checkout-0001')
      .send({ restaurantId: r.restaurantId, orderType: 'pickup', paymentMethod: 'cash', items: [{ menuItemId: r.burgerId, quantity: 2, price: 1 }] })
      .expect(201);
    expect(placed.body).toMatchObject({ subtotal: 11000, total: 11000, status: 'placed' });

    // Owner kitchen view
    const kitchen = await ctx.api().get('/api/orders').set(bearer(r.token)).query({ status: 'active' }).expect(200);
    expect(kitchen.body.orders[0]).toMatchObject({ _id: placed.body._id, customerName: 'Aline Customer', total: 11000 });
    const stats = await ctx.api().get('/api/orders/stats').set(bearer(r.token)).expect(200);
    expect(stats.body).toMatchObject({ todayOrders: 1, todayRevenue: 11000, active: 1 });

    for (const status of ['confirmed', 'preparing', 'ready']) {
      await ctx.api().patch(`/api/orders/${placed.body._id}/status`).set(bearer(r.token)).send({ status }).expect(200);
      const track = await ctx.api().get(`/api/orders/${placed.body._id}`).set(bearer(customer)).expect(200);
      expect(track.body.status).toBe(status);
    }
    const history = await ctx.api().get('/api/orders/my-orders').set(bearer(customer)).expect(200);
    expect(history.body.orders[0]).toMatchObject({ _id: placed.body._id, status: 'ready' });
    const notes = await ctx.api().get('/api/notifications').set(bearer(customer)).expect(200);
    expect(notes.body.notifications.map((n: { title: string }) => n.title)).toEqual(expect.arrayContaining(['Order placed', 'Order confirmed', 'Order preparing', 'Order ready']));

    // Handover completes it, pays the restaurant, earns the customer points and the platform its commission.
    await ctx.api().patch(`/api/orders/${placed.body._id}/status`).set(bearer(r.token)).send({ status: 'delivered' }).expect(200);
    const statement = await ctx.api().get('/api/billing/my-statement').set(bearer(r.token)).expect(200);
    expect(statement.body.totals.byType.commission).toBe(1650); // 15% of 11 000
    const loyalty = await ctx.api().get('/api/loyalty').set(bearer(customer)).expect(200);
    expect(loyalty.body.points).toBe(100 + 11000);
  });
});
