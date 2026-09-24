import * as fs from 'fs';
import * as path from 'path';
import { bearer, bootstrap, Ctx, JPG, makeAdmin, ownerWithRestaurant, PNG, registerCustomer, WEBP } from './helpers';

describe('Image uploads (e2e)', () => {
  let ctx: Ctx;
  beforeAll(async () => (ctx = await bootstrap()));
  afterAll(() => ctx.close());

  const upload = (token: string, buf: Buffer, name: string, type = 'image/png') =>
    ctx.api().post('/api/uploads/image').set(bearer(token)).attach('file', buf, { filename: name, contentType: type });

  it.each([
    ['photo.jpg', JPG, 'image/jpeg', 'jpg'],
    ['photo.jpeg', JPG, 'image/jpeg', 'jpg'],
    ['photo.png', PNG, 'image/png', 'png'],
    ['photo.webp', WEBP, 'image/webp', 'webp'],
  ])('accepts %s, stores it and serves it back', async (name, buf, mime, ext) => {
    const c = await registerCustomer(ctx);
    const res = await upload(c.token, buf, name, mime).expect(201);
    expect(res.body).toMatchObject({ mimetype: mime, size: buf.length });
    expect(res.body.url).toMatch(new RegExp(`^/uploads/[0-9a-f-]{36}\\.${ext}$`));
    const doc = await ctx.db.collection('uploads').findOne({ url: res.body.url });
    expect(doc!.ownerId.toString()).toBe(c.id);

    const got = await ctx.api().get(res.body.url).expect(200);
    expect(got.headers['content-type']).toBe(mime);
    expect(got.headers['x-content-type-options']).toBe('nosniff');
    expect(Buffer.compare(got.body, buf)).toBe(0);
  });

  it('rejects files that are not images, whatever their name or claimed type', async () => {
    const c = await registerCustomer(ctx);
    const exe = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(100)]);
    const html = Buffer.from('<html><script>alert(1)</script></html>');
    await upload(c.token, exe, 'totally-a-photo.png', 'image/png').expect(415);
    await upload(c.token, html, 'x.jpg', 'image/jpeg').expect(415);
    await upload(c.token, html, 'x.html', 'text/html').expect(415);
    expect(fs.readdirSync(process.env.UPLOAD_DIR!).some((f) => f.endsWith('.html'))).toBe(false);
  });

  it('rejects oversized and missing files', async () => {
    const c = await registerCustomer(ctx);
    const big = Buffer.concat([PNG, Buffer.alloc(1.2 * 1024 * 1024)]); // limit is 1MB in tests
    await upload(c.token, big, 'big.png').expect(413);
    await ctx.api().post('/api/uploads/image').set(bearer(c.token)).expect(400);
  });

  it('requires authentication', async () => {
    await ctx.api().post('/api/uploads/image').attach('file', PNG, 'a.png').expect(401);
  });

  it('never serves unexpected names or traversal paths', async () => {
    fs.writeFileSync(path.join(process.env.UPLOAD_DIR!, 'legacy.html'), '<script>x</script>');
    await ctx.api().get('/uploads/legacy.html').expect(404);
    await ctx.api().get('/uploads/..%2F..%2Fpackage.json').expect(404);
    await ctx.api().get('/uploads/00000000-0000-0000-0000-000000000000.png').expect(404);
  });

  it('entities only accept images their user uploaded', async () => {
    const owner = await ownerWithRestaurant(ctx);
    const stranger = await registerCustomer(ctx);
    const theirs = (await upload(stranger.token, PNG, 's.png').expect(201)).body.url;
    await ctx.api().put(`/api/menu/items/${owner.items[0]._id}`).set(bearer(owner.token)).send({ image: theirs }).expect(403);
    await ctx.api().put(`/api/menu/items/${owner.items[0]._id}`).set(bearer(owner.token)).send({ image: '/uploads/11111111-1111-1111-1111-111111111111.png' }).expect(400);
    await ctx.api().put('/api/users/profile').set(bearer(owner.token)).send({ avatar: 'https://tracker.example/pixel.png' }).expect(400);
  });

  it('full lifecycle: attach, replace (old file removed), block in-use delete, delete', async () => {
    const owner = await ownerWithRestaurant(ctx);
    const first = (await upload(owner.token, PNG, 'a.png').expect(201)).body;
    const second = (await upload(owner.token, JPG, 'b.jpg', 'image/jpeg').expect(201)).body;
    const itemId = owner.items[0]._id;

    await ctx.api().put(`/api/menu/items/${itemId}`).set(bearer(owner.token)).send({ image: first.url }).expect(200);
    let menu = await ctx.api().get(`/api/menu/restaurant/${owner.restaurantId}`).expect(200);
    expect(menu.body[0].items.find((i: { _id: string }) => i._id === itemId).image).toBe(first.url);

    // In use → cannot be deleted by its owner.
    await ctx.api().delete(`/api/uploads/${first.id}`).set(bearer(owner.token)).expect(409);

    // Replace → the customer sees the new image and the old file is cleaned up.
    await ctx.api().put(`/api/menu/items/${itemId}`).set(bearer(owner.token)).send({ image: second.url }).expect(200);
    menu = await ctx.api().get(`/api/menu/restaurant/${owner.restaurantId}`).expect(200);
    expect(menu.body[0].items.find((i: { _id: string }) => i._id === itemId).image).toBe(second.url);
    await ctx.api().get(first.url).expect(404);
    expect(await ctx.db.collection('uploads').findOne({ url: first.url })).toBeNull();

    // Unused file → deletable by owner; not by anyone else.
    const spare = (await upload(owner.token, WEBP, 'c.webp', 'image/webp').expect(201)).body;
    const other = await registerCustomer(ctx);
    await ctx.api().delete(`/api/uploads/${spare.id}`).set(bearer(other.token)).expect(403);
    await ctx.api().delete(`/api/uploads/${spare.id}`).set(bearer(owner.token)).expect(200);
    await ctx.api().get(spare.url).expect(404);
    await ctx.api().delete(`/api/uploads/${spare.id}`).set(bearer(owner.token)).expect(404);
  });

  it('restaurant photos: set, then remove one → file released', async () => {
    const owner = await ownerWithRestaurant(ctx);
    const a = (await upload(owner.token, PNG, 'a.png').expect(201)).body.url;
    const b = (await upload(owner.token, PNG, 'b.png').expect(201)).body.url;
    await ctx.api().put(`/api/restaurants/${owner.restaurantId}`).set(bearer(owner.token)).send({ images: [a, b], logo: a }).expect(200);
    const pub = await ctx.api().get(`/api/restaurants/public/${owner.restaurantId}`).expect(200);
    expect(pub.body.images).toEqual([a, b]);
    await ctx.api().put(`/api/restaurants/${owner.restaurantId}`).set(bearer(owner.token)).send({ images: [a] }).expect(200);
    await ctx.api().get(b).expect(404);
    await ctx.api().get(a).expect(200);
  });

  it('admin force-delete detaches the image everywhere (no broken references)', async () => {
    const owner = await ownerWithRestaurant(ctx);
    const admin = await makeAdmin(ctx);
    const img = (await upload(owner.token, PNG, 'x.png').expect(201)).body;
    await ctx.api().put(`/api/menu/items/${owner.items[0]._id}`).set(bearer(owner.token)).send({ image: img.url }).expect(200);
    await ctx.api().delete(`/api/uploads/${img.id}`).set(bearer(admin.token)).expect(409);
    await ctx.api().delete(`/api/uploads/${img.id}?force=true`).set(bearer(admin.token)).expect(200);
    const item = await ctx.api().get(`/api/menu/item/${owner.items[0]._id}`).expect(200);
    expect(item.body.image).toBeNull();
    const listed = await ctx.api().get('/api/admin/uploads').set(bearer(admin.token)).expect(200);
    expect(listed.body.items.find((u: { url: string }) => u.url === img.url)).toBeUndefined();
  });

  it('multi-upload is all-or-nothing', async () => {
    const c = await registerCustomer(ctx);
    const before = (await ctx.api().get('/api/uploads/mine').set(bearer(c.token))).body.total;
    await ctx
      .api()
      .post('/api/uploads/images')
      .set(bearer(c.token))
      .attach('files', PNG, 'ok.png')
      .attach('files', Buffer.from('not an image at all'), 'bad.png')
      .expect(415);
    expect((await ctx.api().get('/api/uploads/mine').set(bearer(c.token))).body.total).toBe(before);
    const ok = await ctx.api().post('/api/uploads/images').set(bearer(c.token)).attach('files', PNG, '1.png').attach('files', JPG, '2.jpg').expect(201);
    expect(ok.body).toHaveLength(2);
  });
});
