# Admin dashboard — setup, security & privacy

## Local setup

```bash
npm install                      # also runs `prisma generate`
cp .env.example .env             # then fill in values (see below)
npm run db:dev                   # terminal 1: local Postgres (prisma dev); copy the postgres:// URL into DATABASE_URL
npm run db:migrate               # apply migrations
npm run db:seed                  # create the bootstrap admin + initial skills
npm run dev                      # http://localhost:3000 · admin at /admin
```

For the local `prisma dev` server set `DATABASE_POOL_MAX="1"` — it accepts one
connection at a time. Generate secrets with
`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.

**First login:** sign in at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`.
The dashboard stays locked until you set a new password at `/admin/account`.
Then delete `ADMIN_INITIAL_PASSWORD` from `.env` (and from your host).
Re-running the seed never resets an existing admin's password.

## Deploying to Vercel

1. Create a hosted PostgreSQL database and copy its connection string.
2. In Vercel → Project → Settings → Environment Variables, add every variable
   from `.env.example` (production values; leave `DATABASE_POOL_MAX` unset).
3. `vercel.json` sets the build command to `npm run db:deploy && npm run build`,
   so migrations run before each build, and schedules `/api/cron/retention` daily.
4. After the first deploy, seed once from your machine against the production DB:
   `DATABASE_URL="<prod url>" ADMIN_EMAIL=… ADMIN_INITIAL_PASSWORD=… npm run db:seed`,
   sign in, change the password, then remove `ADMIN_INITIAL_PASSWORD` from Vercel.

The public homepage reads projects and skills at build time and caches them;
the build therefore needs `DATABASE_URL`. Admin edits invalidate the cache
immediately (`updateTag`), so no redeploy is needed for content changes.

## Security model

| Concern | Implementation |
|---|---|
| Passwords | Argon2id (19 MiB, t=2, p=1) via `@node-rs/argon2`; plaintext never stored or logged |
| Sessions | 32-byte random token in an `HttpOnly`, `SameSite=Strict`, `Secure` (production) cookie, 8 h absolute expiry; only its SHA-256 is stored |
| Rotation | Login destroys any existing session first; password change signs out every session and issues a new one |
| Authorisation | `requireAdmin()` on every admin page and Server Action; `getAdminForApi()` on every `/api/admin/*` handler. `src/proxy.ts` is only a redirect shortcut, not a security control |
| Brute force | DB-backed limits: 5 failures / 15 min per account, 10 per IP; generic error message; constant-work verify for unknown emails |
| CSRF | Server Actions: Next.js rejects mismatched `Origin`. Route handlers that change state check same-origin. Session cookie is `SameSite=Strict` |
| Input | Zod on every action/route; external links must be `https:`; images must be a `/public` path or `https:`; icons come from an allowlist (`src/lib/skill-icons.ts`) |
| Output | React escapes all text; URLs are re-checked before rendering; admin pages send `noindex` and `X-Frame-Options: DENY` |
| Secrets | Server-only env vars (`server-only` imports); `.env` is gitignored; `.env.example` holds placeholders only |

## Analytics & privacy

- **What's recorded:** path, time, referrer hostname, device category, browser
  family, approximate country/region/city (Vercel IP headers), and an anonymous
  visitor id = HMAC(`ANALYTICS_SECRET`, UTC day + IP + user agent). The id rotates
  daily and can't be reversed.
- **Not recorded:** admin pages, API calls, bots, visitors sending Do Not Track or
  Global Privacy Control, or visitors who opt out on `/privacy`.
- **Page views:** one per client-side route change, deduplicated per visitor and
  path within 30 minutes.
- **Unique visitors** are an estimate: daily ids summed over the range. Shared
  networks merge people; changing networks/devices splits them.
- **IP addresses:** taken only from Vercel's platform headers (or `TRUSTED_IP_HEADER`
  elsewhere — never from arbitrary client headers). Stored per `ANALYTICS_IP_MODE`
  (default: truncated), masked in tables, shown in full only on the protected
  visit-detail page, cleared after `ANALYTICS_IP_RETENTION_DAYS`.
- **Precise location:** off unless `NEXT_PUBLIC_PRECISE_LOCATION_ENABLED=true`
  (set before building). Requested only after a visitor clicks
  "Share Approximate Location" on `/privacy`; rounded to ~1 km; withdrawable with
  a token kept in the visitor's browser; deleted after `LOCATION_RETENTION_DAYS`.
- **Retention:** `/api/cron/retention` (daily, `CRON_SECRET`) or "Run cleanup now"
  on the Analytics page deletes expired visits, IPs, coordinates, sessions and
  login attempts.

This is a technical description, not legal advice. Depending on where your
visitors are, storing IPs (even truncated) or coordinates can require a lawful
basis and/or consent — review this against GDPR / your local rules, or set
`ANALYTICS_IP_MODE="none"` and leave precise location disabled.

## Known limitations

- **Forged page views:** `/api/track` is public (as with any analytics endpoint);
  a script can send fake views. Origin checks, bot filtering and deduplication
  reduce noise but can't prevent it.
- **Screenshots:** the dashboard takes a path or https URL; there is no upload
  storage (Vercel's filesystem is read-only). Commit images to `public/` or use
  an image host. Remote screenshots bypass the image optimiser.
- **Single admin:** one role, no 2FA. Adding TOTP/WebAuthn is the next hardening step.
- **Rate limiting** keys on the client IP; without a trusted IP header (e.g. local
  dev) all requests share one IP bucket.
- **Delete confirmation** is a client-side two-step UI; the server action itself
  is authorised but not "confirmed" server-side.
