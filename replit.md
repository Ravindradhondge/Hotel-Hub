# Hotel Management System

A full-stack hotel/restaurant management web app with role-based dashboards, real-time order updates via Socket.IO, and JWT authentication.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/hotel-management run dev` — run the frontend (port 18356)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `JWT_SECRET` — JWT signing secret (defaults to dev key)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + Socket.IO client
- API: Express 5 + Socket.IO
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (custom, role-based)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (users, tables, menu-items, orders, order-items, payments, inventory, expenses)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT middleware
- `artifacts/api-server/src/lib/socket.ts` — Socket.IO server
- `artifacts/hotel-management/src/` — React frontend

## Architecture decisions

- JWT stored in localStorage as `hms_token`; sent as Bearer token on every request
- Socket.IO used for real-time order updates between waiter and kitchen dashboards
- PostgreSQL instead of MongoDB (Replit built-in, supports rollback)
- Orval codegen for type-safe API hooks from OpenAPI spec
- Role-based routing: waiter → /waiter, kitchen → /kitchen, accountant → /accountant, owner → /owner

## Product

Four role-based dashboards:
- **Waiter**: Table grid, create orders, track live status
- **Kitchen**: Incoming order tickets, real-time updates, status management
- **Accountant**: Bill generation, GST calculation, payment processing, daily reports
- **Owner**: Revenue analytics, monthly charts, top-selling items, staff performance, inventory alerts, menu & inventory management

## Demo Credentials

- owner@hotel.com / password123
- waiter@hotel.com / password123
- kitchen@hotel.com / password123
- accountant@hotel.com / password123

## Gotchas

- After changing openapi.yaml, always run codegen: `pnpm --filter @workspace/api-spec run codegen`
- After codegen, fix `lib/api-zod/src/index.ts` to only export from `./generated/api` (orval overwrites it)
- Socket.IO connects to same origin (no separate WS URL needed in production)
- Run `pnpm --filter @workspace/db run push` after schema changes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
