import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { bootstrap, Ctx } from './helpers';

describe('Platform (e2e)', () => {
  let ctx: Ctx;
  beforeAll(async () => (ctx = await bootstrap()));
  afterAll(() => ctx.close());

  it('GET /api/health reports the database as up', async () => {
    const res = await ctx.api().get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('sets security headers and a request id', async () => {
    const res = await ctx.api().get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-request-id']).toMatch(/^[\w-]{8,}$/);
  });

  it('public restaurant listing works on an empty platform', async () => {
    const res = await ctx.api().get('/api/restaurants/public').expect(200);
    expect(res.body).toEqual({ restaurants: [], total: 0, page: 1, pages: 0 });
  });

  it('returns the uniform error shape for unknown routes', async () => {
    const res = await ctx.api().get('/api/does-not-exist').expect(404);
    expect(res.body).toMatchObject({ statusCode: 404, path: '/api/does-not-exist' });
    expect(res.body.requestId).toBeDefined();
    expect(res.body.stack).toBeUndefined();
  });

  it('rejects malformed JSON with 400 instead of crashing', async () => {
    const res = await ctx.api().post('/api/auth/login').set('Content-Type', 'application/json').send('{"email": ').expect(400);
    expect(res.body.message).toBe('Request body is not valid JSON');
  });

  it('rejects oversized JSON bodies with 413', async () => {
    await ctx.api().post('/api/auth/login').send({ email: 'a@b.co', password: 'x'.repeat(200_000) }).expect(413);
  });

  it('rejects invalid ids with 400', async () => {
    await ctx.api().get('/api/restaurants/public/not-an-id').expect(400);
  });

  it('generates the OpenAPI document for every route', () => {
    const doc = SwaggerModule.createDocument(ctx.app, new DocumentBuilder().build());
    expect(Object.keys(doc.paths).length).toBeGreaterThan(100);
    expect(doc.paths['/api/orders']).toBeDefined();
  });

  it('exposes public platform settings', async () => {
    const res = await ctx.api().get('/api/settings/public').expect(200);
    expect(res.body).toMatchObject({ currency: 'USD', serviceFeeRate: 0 });
    expect(res.body.plans.starter.commissionRate).toBe(0.15);
  });
});
