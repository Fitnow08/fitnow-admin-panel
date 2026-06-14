# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Admin panel SPA for the **fitnow** fitness app. It is a frontend-only client that talks to a separate Go REST backend over JSON (snake_case fields). There is no server code here.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`).

- `pnpm dev` — start Vite dev server with HMR
- `pnpm build` — type-check (`tsc -b`) then build for production
- `pnpm lint` — run ESLint over the repo
- `pnpm preview` — serve the production build locally

There is no test runner configured.

## Environment

`VITE_API_URL` (in `.env`) sets the backend base URL, e.g. `http://127.0.0.1:7000/api/v1`. It falls back to `/api` if unset. All API paths in code are relative to this base (`/auth/login`, `/users`, etc.).

## Architecture

- **Stack:** React 19 + TypeScript + Vite, Tailwind CSS v4 (via `@tailwindcss/vite`, no config file), React Compiler enabled (babel plugin in `vite.config.ts` — assume components are auto-memoized; do not hand-add `useMemo`/`useCallback` for perf).
- **Path alias:** `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- **Routing** (`src/App.tsx`): react-router-dom v7. `/login` is public; everything else is wrapped by `ProtectedRoute` → `AdminLayout`. Unknown paths redirect to `/`.
- **Server state:** TanStack React Query. Components use `useQuery`/`useMutation` directly; data-fetching functions live in `src/features/<feature>/api.ts` and are passed as `queryFn`. Mutations invalidate by query key (e.g. `['users']`) on success.

### Auth & token flow (the most important part to understand)

`src/lib/api.ts` is the single axios instance for all requests. Auth is JWT access + refresh token, both stored in `localStorage` under `fitnow_admin_token` / `fitnow_admin_refresh`.

- A request interceptor attaches `Authorization: Bearer <access>`.
- A response interceptor catches `401`, runs a **single-flight token refresh** (`POST /auth/refresh`), retries the original request once (`_retry` flag), and on refresh failure calls `forceLogout()` (clears tokens, hard-redirects to `/login`). Refreshes use a separate `refreshClient` with no interceptors to avoid infinite loops; `/auth/login` 401s are never refreshed.
- `src/features/auth/AuthContext.tsx` owns `isAuthenticated` state and `login`/`logout`. It is the React-facing layer; `api.ts` is the lower-level token machinery. Note `forceLogout` in `api.ts` bypasses React state via `location.href` — keep that in mind when reasoning about logout.
- `useAuth()` must be called inside `AuthProvider`.

### UI components

`src/components/ui/` holds shadcn-style primitives (`button`, `card`, `input`, `label`, `table`) built with `class-variance-authority`. Compose `className`s with the `cn()` helper from `src/lib/utils.ts` (clsx + tailwind-merge). Icons come from `lucide-react`. UI copy is in Russian.

### Adding a feature

Follow the `users` feature as the template: create `src/features/<name>/api.ts` with typed fetch functions against `api`, then a page in `src/pages/` that wires them through React Query and renders with the `ui/` primitives. Register the route in `src/App.tsx` under the `AdminLayout` group.

## Notes

- Backend response shapes are not finalized — `src/features/users/api.ts` carries a comment to adjust paths/shapes to the real fitnow backend. Verify field names against the Go API rather than trusting the local interfaces.
- `README.md` is the default Vite template and not project-specific.
