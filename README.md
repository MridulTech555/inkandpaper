# Ink & Paper

A full-stack blogging platform built with Next.js: public reading experience, author
portal with a block-based editor and editorial workflow, and a super admin console —
backed by PostgreSQL via Prisma, with database-verified sessions and RBAC.

## Technology Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack) + [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org) (strict mode)
- [Tailwind CSS](https://tailwindcss.com) v4
- [PostgreSQL](https://www.postgresql.org) + [Prisma ORM](https://www.prisma.io)
- [Zod](https://zod.dev) for schema validation, [React Hook Form](https://react-hook-form.com) for forms
- [Radix UI](https://www.radix-ui.com) primitives, [Lucide](https://lucide.dev) icons
- [ESLint](https://eslint.org) + [Prettier](https://prettier.io)

## Features

- **Public site** — home, category, author, and search pages; full-text search across
  title/excerpt/content with category/author/date filters; comments, likes, bookmarks;
  newsletter subscribe/unsubscribe; JSON-LD, canonical URLs, sitemap.xml, robots.txt.
- **Author portal** — dashboard, article list, analytics, media library, profile.
- **Block editor** — 12 block types, autosave, draft/review/publish workflow
  (`DRAFT → IN_REVIEW → CHANGES_REQUESTED/APPROVED → SCHEDULED/PUBLISHED`, plus
  `ARCHIVED`/`REJECTED`), scheduled publishing, per-article SEO fields.
- **Admin console** — dashboard, site-wide article management, review queue, categories,
  tags, authors, users, roles & permissions matrix, comment moderation, analytics,
  settings, audit log, newsletter subscribers.
- **Notifications** — in-app notifications (article submitted/approved/changes
  requested/published, comment reported, author request) with unread count and
  mark-as-read.
- **RBAC** — five roles (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `AUTHOR`, `READER`) with a
  database-backed permission matrix; every mutation re-checks ownership and permission
  server-side.

## Project Structure

```
app/
├── (public)/     # Public-facing pages (home, article, category, author profile, search, bookmarks, notifications)
├── (auth)/       # Login / register
├── (author)/     # Author dashboard (analytics, media, profile, article list)
├── (editor)/     # Article editor (own layout, no dashboard chrome)
├── (admin)/      # Admin console
└── api/          # Route handlers (session, media listing, health check)

components/
├── ui/           # Base UI primitives (Radix-backed)
├── blog/         # Blog/article-related components
├── editor/       # Article editor components
├── author/       # Author dashboard components
├── admin/        # Admin dashboard components
├── navigation/   # Navigation components
├── seo/          # JSON-LD helper
└── shared/       # Shared/cross-cutting components (error boundaries, empty/loading states)

lib/
├── db/           # Prisma client singleton
├── auth/         # Session cookies, login/register actions, password hashing
├── permissions/  # Role/permission matrix and server-side authorization checks
├── services/     # Business logic — one *-actions.ts (mutations) / plain .ts (queries) pair per domain
├── validation/   # Zod schemas
└── utils/        # cn(), rate limiter

prisma/
├── schema.prisma
├── migrations/
└── seed.ts       # Seeds roles/permissions, demo users, categories, tags, sample articles

types/            # Shared TypeScript types
hooks/            # Shared React hooks (toast store)
config/           # App configuration (site.ts)
public/           # Static assets (uploaded media lands in public/uploads, gitignored)
```

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and fill in your local values:

   ```bash
   cp .env.example .env
   ```

3. Start a local PostgreSQL database, apply migrations, and seed demo data:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Seeded demo accounts (see
   `prisma/seed.ts`): `super.admin@inknpaper.dev`, `admin@inknpaper.dev`,
   `editor@inknpaper.dev`, `author@inknpaper.dev`, `reader@inknpaper.dev` — passwords
   come from the `SEED_*_PASSWORD` env vars, or insecure `ChangeMe123!<Role>` fallbacks
   if unset (development only; always set real values for anything shared).

## Environment Variables

Defined in `.env.example`. Copy to `.env` and never commit real secrets.

| Variable                    | Required          | Description                                                                                                                                                                                               |
| --------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`              | Yes               | PostgreSQL connection string used by Prisma. Never expose this to the client or logs.                                                                                                                     |
| `AUTH_SECRET`               | Yes in production | Server-only secret mixed into every session token hash (HMAC pepper). Generate with `openssl rand -base64 32`. The app refuses to boot in production without it.                                          |
| `NEXT_PUBLIC_APP_URL`       | Yes               | Public base URL of the app — used for metadata, canonical URLs, the sitemap, and Open Graph tags. The `NEXT_PUBLIC_` prefix means this one _is_ exposed to the browser by design; put nothing else in it. |
| `SEED_SUPER_ADMIN_PASSWORD` | No                | Password for the seeded super admin account.                                                                                                                                                              |
| `SEED_ADMIN_PASSWORD`       | No                | Password for the seeded admin account.                                                                                                                                                                    |
| `SEED_EDITOR_PASSWORD`      | No                | Password for the seeded editor account.                                                                                                                                                                   |
| `SEED_AUTHOR_PASSWORD`      | No                | Password for the seeded author account.                                                                                                                                                                   |
| `SEED_READER_PASSWORD`      | No                | Password for the seeded reader account.                                                                                                                                                                   |

Everything except `NEXT_PUBLIC_APP_URL` stays server-side — none of these are ever
sent to the browser, logged, or returned from an API response. Session lookups only
ever `select` the columns they need (never `passwordHash`), and `hashToken()` HMACs
session tokens with `AUTH_SECRET` rather than storing them (or a plain hash of them)
raw, so a leaked database dump alone isn't enough to forge a session.

## Development Commands

| Command                     | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| `npm run dev`               | Start the Next.js dev server (Turbopack).                           |
| `npm run lint`              | Run ESLint.                                                         |
| `npm run typecheck`         | Run the TypeScript compiler (no emit).                              |
| `npm run format`            | Format the codebase with Prettier.                                  |
| `npm run format:check`      | Check formatting without writing.                                   |
| `npm run db:generate`       | Regenerate the Prisma client.                                       |
| `npm run db:migrate`        | Create and apply a migration in development (`prisma migrate dev`). |
| `npm run db:migrate:deploy` | Apply pending migrations without prompting — production.            |
| `npm run db:seed`           | Seed the database with demo data.                                   |
| `npm run db:studio`         | Open Prisma Studio.                                                 |

`npm run db:push` also exists (`prisma db push`) but is a schema-prototyping shortcut
only — it doesn't create a migration file or a history Prisma can replay. **Never use
it against a production database;** every schema change that reaches production must
go through a real migration (see below).

## Production Deployment

Ink & Paper is a standard Next.js app — deployable to any Node.js host (a VM, a
container, Railway/Render/Fly.io, etc.) that can run `npm run start` and reach a
PostgreSQL database.

### 1. Install

```bash
npm ci
```

### 2. Generate the Prisma client

```bash
npx prisma generate
```

(Runs automatically via `postinstall`, but harmless to run explicitly after `npm ci`.)

### 3. Apply migrations

```bash
npx prisma migrate deploy
```

This applies every migration in `prisma/migrations/` that the target database hasn't
seen yet, in order, without generating new ones or prompting. It's the only schema
command that belongs in a deploy pipeline — **not** `prisma db push` and **not**
`prisma migrate dev`, both of which are for local development only.

### 4. Build

```bash
npm run build
```

### 5. Start

```bash
npm run start
```

Listens on `PORT` (default `3000`).

### Deploy workflow, end to end

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

### Creating a new migration

When you change `prisma/schema.prisma`, create the migration in development first
(this also applies it to your dev database and regenerates the client):

```bash
npm run db:migrate
```

Commit the generated `prisma/migrations/<timestamp>_<name>/` folder. The deploy step
above (`prisma migrate deploy`) applies it in every other environment.

### File uploads on serverless hosts

`lib/services/media-actions.ts` currently writes uploads to `public/uploads` on the
local filesystem — fine for a long-running Node process with persistent disk, but
serverless/container platforms that redeploy on every push won't retain those files.
Swap the `writeFile`/`unlink` calls for an object storage SDK (S3, R2, Cloudinary, ...)
behind the same action signatures before deploying to one of those.

### Rate limiting on multiple instances

`lib/utils/rate-limit.ts` is an in-memory, per-process fixed-window limiter — correct
for a single instance, but each instance behind a load balancer keeps its own counters.
Swap it for a shared store (e.g. Upstash Redis) behind the same `checkRateLimit()`
signature before running more than one instance.

## Security

- **Authentication** — bcrypt-hashed passwords, opaque random session tokens (never
  JWTs, nothing client-decodable), HMAC'd with `AUTH_SECRET` before being stored, and
  re-verified against the database on every request (`getCurrentUser()`, cached
  per-request). A dummy bcrypt comparison runs on login even when the email doesn't
  exist, so response timing doesn't reveal which emails are registered.
- **Cookies** — `httpOnly`, `secure` in production, `SameSite=Lax`, scoped to `/`.
- **Authorization / RBAC** — every role/permission check happens server-side
  (`requireUser`/`requirePermission`/`requireRole` in `lib/permissions/check.ts`);
  route-group layouts re-check on every navigation, and every mutation re-verifies
  ownership by querying the database with the _session's_ user id — never trusting a
  client-supplied id alone. The `proxy.ts` edge middleware is a fast anonymous-request
  redirect only; it can't reach Postgres, so it's never the authoritative check.
- **Input validation** — every mutation validates with Zod (or an explicit allow-list
  check) server-side; client-side validation is a UX nicety only, never trusted.
- **SQL injection** — all queries go through Prisma's parameterized query builder; the
  codebase has no raw SQL (`$queryRaw`/`$executeRaw`) anywhere.
- **XSS** — React escapes all rendered content by default; the only
  `dangerouslySetInnerHTML` in the app is the JSON-LD `<script>` tag, which escapes
  `<` in its payload so it can't break out of the tag.
- **CSRF** — mutations go through Next.js Server Actions, which enforce a same-origin
  check on every invocation by default.
- **File upload validation** — uploads are size- and MIME-type-limited, and the actual
  file bytes are checked against a signature allow-list (JPEG/PNG/GIF/WEBP) rather than
  trusting the browser-supplied `Content-Type`, which is easy to spoof. The stored
  filename's extension is derived from the verified signature, not the client's
  filename.
- **Rate limiting** — applied to login, registration, newsletter subscribe/unsubscribe,
  comment creation/reporting, author-access requests, and media uploads.
- **HTTP security headers** — set globally in `next.config.ts`: `Content-Security-Policy`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`,
  `Strict-Transport-Security`, and `X-Powered-By` disabled.
- **Secrets** — `DATABASE_URL`, `AUTH_SECRET`, and password hashes are never sent to the
  client, logged, or returned from any API response or Server Action.
- **Error handling** — a global error boundary (`app/error.tsx` plus one per route
  group, so the header/sidebar survive an error), `app/global-error.tsx` for failures in
  the root layout itself, and a themed 404 (`not-found.tsx`). None of them render
  `error.message`/stack traces — only Next's safe `error.digest` correlation id.

## Production Checklist

Verified against a production build (`npm run build && npm run start`) before each
release:

- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` completes with zero errors
- [ ] Authentication: register, login, logout, session persistence across reload
- [ ] Reader: browse, search, bookmark, like, comment (create/edit/delete/report)
- [ ] Author: create/edit/save draft, submit for review, view own analytics/media
- [ ] Admin: review queue (approve/request changes/reject), publish/schedule,
      categories/tags/users/roles CRUD, comment moderation
- [ ] Article creation, editing, and the full review → publish workflow
- [ ] Search (keyword, category, author, date range) returns correct results
- [ ] Media upload accepts real images and rejects spoofed/oversized/wrong-type files
- [ ] SEO: metadata, canonical URLs, `/sitemap.xml`, `/robots.txt`, JSON-LD present
- [ ] Responsive layout (mobile/tablet/desktop), no horizontal overflow
- [ ] Error handling: a thrown error renders the themed boundary, not a stack trace;
      an unknown URL renders the themed 404
- [ ] Security headers present (`curl -I` against the deployed URL)
- [ ] `AUTH_SECRET` and `DATABASE_URL` set in the deploy environment, not committed
