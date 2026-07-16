# MindEase — Backend (Server)

Anonymous, culturally-adapted teletherapy booking and messaging API.
Built for the Orange Internship Programme — Elevate Circle.

## Stack
- Bun + Hono
- Drizzle ORM + Neon Postgres
- Better Auth (pseudonymous auth — username only, no PII)
- Zod validation
- Biome (lint/format)

## Setup

```bash
bun install
cp .env.example .env   # add your DATABASE_URL
bun run db:push        # push schema to Neon
bun run dev             # start dev server on localhost:3000
```

## Scripts
- `bun run dev` — start dev server with hot reload
- `bun run db:push` — push schema changes to database
- `bun run db:studio` — open Drizzle Studio to inspect data
- `bun run lint` — check code with Biome
- `bun run typecheck` — run TypeScript compiler check

## Project Structure
server/
src/
db/
schema.ts   # Drizzle schema — all tables
index.ts    # DB client (Neon + Drizzle)
index.ts         # Hono app entry point

## API Documentation
See [`../docs/api-contract.md`](../docs/api-contract.md) for full endpoint contracts.

## Status (Sprint 2)
- [x] Database schema designed and pushed to Neon
- [x] ER diagram
- [x] API contract documented
- [x] Server running with DB health check
- [ ] Endpoints implemented against schema (in progress)

.