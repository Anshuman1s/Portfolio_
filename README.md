# Anshuman Shukla — Portfolio

Next.js (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Prisma) · admin dashboard at `/admin`.

## Quick start

```bash
npm install
cp .env.example .env     # fill in values
npm run db:dev           # separate terminal: local Postgres
npm run db:migrate && npm run db:seed
npm run dev
```

Full setup, deployment, security model and privacy/retention details: **[docs/ADMIN.md](docs/ADMIN.md)**.

## Scripts

| Script | Purpose |
|---|---|
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint / TypeScript |
| `db:dev` | Local Prisma Postgres server |
| `db:migrate` | Create & apply migrations (dev) |
| `db:deploy` | Apply migrations (production) |
| `db:seed` | Bootstrap admin + initial skills (idempotent) |
| `db:studio` | Browse the database |
