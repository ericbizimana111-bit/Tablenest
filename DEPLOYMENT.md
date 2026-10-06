# Deploying TableNest

| Piece    | Host           | Notes                                              |
| -------- | -------------- | -------------------------------------------------- |
| Frontend | Vercel         | `frontend/`, static Vite build (`frontend/vercel.json`) |
| API      | Render         | `backend/`, Node web service (`render.yaml`)       |
| Database | MongoDB Atlas  | The API uses MongoDB/Mongoose, so Postgres hosts such as Neon will not work |
| Images   | Cloudinary     | `UPLOAD_DRIVER=cloudinary`                         |

Do the steps in order: each one produces a value the next one needs.

## 1. MongoDB Atlas

1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a user with a strong password (letters and digits only avoids URL-encoding trouble).
3. **Network Access** → add `0.0.0.0/0`. Render's free plan has no fixed outbound IP.
4. **Connect → Drivers** → copy the URI, and add the database name before the `?`:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/tablenest?retryWrites=true&w=majority`

Indexes are created automatically when the API starts.

## 2. Cloudinary

From the Cloudinary dashboard, copy the **API environment variable**:
`cloudinary://<api_key>:<api_secret>@<cloud_name>`. That value is `CLOUDINARY_URL`.

## 3. Render (API)

1. Push this repo to GitHub.
2. Render → **New → Blueprint** → choose the repo. Render reads `render.yaml`.
3. Fill in the prompted values:
   - `MONGODB_URI`: the Atlas URI from step 1
   - `CLOUDINARY_URL`: from step 2
   - `CORS_ORIGINS` and `FRONTEND_URL`: your Vercel URL, e.g. `https://tablenest.vercel.app` (no trailing slash). If you don't know it yet, enter a placeholder and update it after step 4. Render redeploys when you save.
   - `JWT_SECRET` is generated for you.
4. After the deploy, open `https://<service>.onrender.com/api/health`. It should return `{"status":"ok","database":"up"}`.

The API refuses to start in production if `MONGODB_URI`, `JWT_SECRET` or `CORS_ORIGINS` is missing or weak, or if the Cloudinary credentials are missing. The Render log names the exact variable.

## 4. Vercel (frontend)

1. Vercel → **Add New Project** → import the repo → set **Root Directory** to `frontend`.
2. Add the environment variable `VITE_API_URL` = `https://<service>.onrender.com/api`.
   This value is baked in at build time, so redeploy after you change it.
3. Deploy, then put the final Vercel URL into Render's `CORS_ORIGINS` and `FRONTEND_URL` (step 3.3).

## 5. Make yourself admin

Register normally on the live site, then run this from your machine against the production database:

```bash
cd backend
MONGODB_URI="<atlas uri>" npm run admin:grant -- you@example.com
```

Sign out and back in. The admin console is at `/admin`.

Do **not** run `npm run seed` against production. It wipes the database (it also refuses to run when `NODE_ENV=production`).

## Monetisation is off until you turn it on

Nothing blocks restaurants or guests from using the app:

- New restaurants get the **Starter** plan (no monthly fee) and go live immediately, unless you enable approval in Admin → Settings.
- Subscription charges are created only when an admin presses **Bill this month's plans** (Admin → Revenue). Nothing is ever charged automatically, and an unpaid charge never restricts a restaurant.
- Guests pay on arrival or delivery. There is no card gateway yet.

To launch with no fees at all, set Admin → Settings: service fee `0`, booking fee `0`, Starter commission `0`. You can raise them later without redeploying.

## Optional

- **Email** (password-reset links): set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM` on Render (Brevo, Resend and Mailgun all offer free SMTP). Without these, reset emails only appear in the Render logs, so users can't reset their own passwords.
- **AI concierge**: set `ANTHROPIC_API_KEY` on Render.

## Known limits of the free tiers

- **Render free instances sleep after 15 minutes idle.** The first request afterwards takes about 30–60 seconds, and the frontend gives up after 20 seconds and shows "could not reach TableNest". For real users, use the paid Starter instance, or ping `/api/health` every 10 minutes with a free uptime monitor (e.g. UptimeRobot).
- Atlas M0 gives 512 MB of storage. That's plenty to start with.
