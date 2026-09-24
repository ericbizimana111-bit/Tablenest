# TableNest API

NestJS + MongoDB backend for TableNest: restaurant discovery, table booking, food ordering, restaurant
dashboards, platform administration and platform revenue.

- API reference, roles, workflows and error format: [docs/API.md](docs/API.md)
- Interactive docs (outside production): `http://localhost:3001/api/docs`

## Run it

```bash
npm install
cp .env.example .env          # then fill JWT_SECRET etc.
npm run migrate               # safe, idempotent; run after every deploy
npm run start:dev             # http://localhost:3001/api
```

Create your first administrator (there is deliberately no HTTP endpoint for this):

```bash
npm run admin:grant -- you@example.com          # the account must already exist
npm run admin:grant -- you@example.com --revoke
```

Demo data for local development only — **wipes the target database** and refuses to run in production:

```bash
npm run seed -- --wipe && npm run migrate
```

## Verify

```bash
npm run typecheck
npm run lint
npm test            # unit tests
npm run test:e2e    # full-app HTTP tests on a throwaway in-memory MongoDB (never your real DB)
```

The e2e suite needs a `mongod` binary: it uses an installed MongoDB if found (set `MONGOMS_SYSTEM_BINARY`
to point at one), otherwise `mongodb-memory-server` downloads one.

## Production checklist

- `NODE_ENV=production`, a random `JWT_SECRET` (≥ 32 chars), `MONGODB_URI`, `CORS_ORIGINS` — the app
  refuses to start without them.
- MongoDB with authentication and backups. A replica set (e.g. Atlas) is recommended but not required:
  bookings and checkout stay consistent on a standalone server (see docs/API.md → Consistency).
- `UPLOAD_DIR` on a persistent volume (uploads are stored on local disk today).
- Put the API behind HTTPS and set `TRUST_PROXY` to the number of proxies in front of it.
- Rate limits are per process (in memory). If you run several instances, put a shared limiter in front
  (reverse proxy / API gateway) or switch express-rate-limit to a Redis store.
- `GET /api/health` returns 200 only when the database answers — use it for liveness/readiness checks.
