# Ink & Paper

A production-ready blogging platform built with Next.js. This repository currently contains the
project foundation — routing structure, tooling, and configuration — with no business
functionality implemented yet.

## Technology Stack

- [Next.js](https://nextjs.org) (App Router) + [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org) (strict mode)
- [Tailwind CSS](https://tailwindcss.com)
- [ESLint](https://eslint.org) + [Prettier](https://prettier.io)
- [PostgreSQL](https://www.postgresql.org) + [Prisma ORM](https://www.prisma.io)
- [Zod](https://zod.dev) for schema validation
- [React Hook Form](https://react-hook-form.com) for forms
- [Lucide React](https://lucide.dev) for icons

## Project Structure

```
app/
├── (public)/     # Public-facing pages (home, article, category, author profile, search)
├── (auth)/       # Login / register
├── (author)/     # Author dashboard
├── (admin)/      # Admin dashboard
└── api/          # Route handlers

components/
├── ui/           # Base UI primitives
├── blog/         # Blog/article-related components
├── editor/       # Article editor components
├── author/       # Author dashboard components
├── admin/        # Admin dashboard components
├── navigation/   # Navigation components
└── shared/       # Shared/cross-cutting components

lib/
├── db/           # Database client (Prisma)
├── auth/         # Authentication logic
├── permissions/  # Authorization/role logic
├── services/     # Business logic services
├── validation/   # Zod schemas
├── seo/          # SEO helpers
└── utils/        # General utilities

prisma/           # Prisma schema
types/            # Shared TypeScript types
hooks/            # Shared React hooks
config/           # App configuration
public/           # Static assets
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

   Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Defined in `.env.example`. Copy to `.env` and never commit real secrets.

| Variable                    | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`              | PostgreSQL connection string used by Prisma.          |
| `AUTH_SECRET`               | Secret used to sign/encrypt auth sessions and tokens. |
| `NEXT_PUBLIC_APP_URL`       | Public base URL of the app.                           |
| `SEED_SUPER_ADMIN_PASSWORD` | Optional password for the seeded super admin account. |
| `SEED_AUTHOR_PASSWORD`      | Optional password for the seeded author account.      |
| `SEED_READER_PASSWORD`      | Optional password for the seeded reader account.      |

## Development Commands

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the Next.js dev server.           |
| `npm run lint`         | Run ESLint.                             |
| `npm run typecheck`    | Run the TypeScript compiler (no emit).  |
| `npm run format`       | Format the codebase with Prettier.      |
| `npm run format:check` | Check formatting without writing.       |
| `npm run db:generate`  | Regenerate the Prisma client.           |
| `npm run db:push`      | Push the Prisma schema to the database. |
| `npm run db:migrate`   | Create/apply a Prisma migration.        |
| `npm run db:seed`      | Seed the database with demo data.       |
| `npm run db:studio`    | Open Prisma Studio.                     |

## Production Build

```bash
npm run build
npm run start
```
