# Offline presentation mode for Venue Vue

Goal: the app must be fully usable during an offline school presentation — sign-in,
dashboard, and module screens all work with no internet. Scope stays light (~20%:
no full POS features, just enough that every screen shows real content offline).

## Current state (verified)

- `src/routes/_authenticated/route.tsx` gates with `supabase.auth.getUser()` — a
  network call. Offline it errors and redirects to `/login`, even for a valid
  locally-cached session.
- `src/routes/index.tsx` always renders the login form; it never checks for an
  existing session.
- `src/components/DashboardShell.tsx` `useMe()` already reads the cached user from
  IndexedDB first — offline-safe.
- `src/lib/offline-storage.ts` already queues offline mutations and syncs them when
  back online; also has `getUserFromLocal()` / `storeUserLocally()`.
- Fonts, styles, and scripts are fully self-hosted — the app shell loads offline.

## Changes

1. Offline-safe session gate (`_authenticated/route.tsx`)
   - Switch the check to `supabase.auth.getSession()` (reads the local session only,
     no network). If a session exists, the user stays in — even fully offline.
   - No session → redirect to `/login` as today.

2. Login page remembers the last user (`src/components/LoginPage.tsx`, `index.tsx`)
   - On mount, check `getSession()`. If a session exists, show a "Continue as
     <email>" button above the form (and navigating to `/dashboard` works directly).
   - Store the last signed-in email in IndexedDB (reuse `storeUserLocally`, already
     called by `useMe`).
   - Offline fallback: if `signInWithPassword` fails because the device is offline
     (`navigator.onLine === false` or network-type error) and we have a cached last
     user, show a notice with a "Continue offline as <email>" button that enters the
     dashboard in offline mode. Wrong-password errors still show "Invalid
     credentials" exactly as now.

3. Demo content cached offline (`src/lib/demo-data.ts` + module pages)
   - Add a small seed of sample data written to IndexedDB on first online load:
     a short product list (drinks/snacks with prices) and one sample event.
   - Register/Sales page: render the cached product list with add-to-cart that
     queues offline orders through the existing `queueMutation` flow (no checkout
     logic — carts are demo-level).
   - Events page: render the cached sample event.
   - Dashboard metric cards: read today's queued orders from IndexedDB so
     "Orders today / Net sales" show real numbers offline instead of "—".
   - Reports/Settings stay as placeholders (out of 20% scope).

4. No PWA/service-worker changes — the Lovable preview forbids them and the
   presentation runs from a normal browser tab. Offline behavior comes from the
   local session + IndexedDB cache, which is enough.

## Verification

- Playwright: sign in online, then `context.set_offline(True)` and confirm:
  dashboard loads, register page shows products, adding to cart queues an order,
  events page shows the sample event, theme toggle works.
- Reload while offline → still on dashboard (no kick to login).
- Online again → wrong-password and no-session flows still behave exactly as
  before; queued orders sync.
