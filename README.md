# NOVA

Premium workspace dashboard for customers, products, orders, billing, and reporting.

## Local development

1. Copy `.env.example` to `.env` and fill in local values. Never commit secrets.
2. Start PostgreSQL.
3. Install and generate the Prisma client:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seed login is documented in `prisma/seed.ts`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Development migrations |
| `npm run db:deploy` | Production migrations |

Use `prisma migrate deploy` against production. Do not run `prisma migrate dev` on production databases.

## Health

`GET /api/health` reports application and database status. Redis/cache unavailability does not fail the health check by itself.

## Production

- Configure secrets in the hosting provider. Do not put secrets in `NEXT_PUBLIC_` variables except the Stripe publishable key.
- CI runs lint, typecheck, Prisma generate/validate, and a production build on pull requests.
- Optional Docker files: `Dockerfile` and `docker-compose.production.yml`.
