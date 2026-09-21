# Offline mode: sign in and use the dashboard with no connection

Goal: with the internet fully off, a returning user can open the app, sign in, land on the dashboard, and move between pages — no error screens, no bounce back to login.

## What changes for the user

1. **The app loads offline.** The page itself (layout, fonts, styles, pages) is stored on the device the first time it is opened online, so it still opens with the connection off.
2. **Offline sign-in.** After a person has signed in online at least once on that device, their account is remembered. Offline, they type the same email and password and get in. An account never used on that device can't sign in offline — nothing to check against.
3. **Stays signed in.** Closing the browser and reopening offline keeps the session; the dashboard no longer kicks people back to login just because the server can't be reached.
4. **Clear status.** The header badge already shows Online / Offline mode. Offline, the dashboard shows a short note that data is from the last sync, and any action that truly needs the server is disabled rather than failing.
5. **Auto-catch-up.** When the connection returns, anything queued while offline is sent to the backend automatically and the note disappears.

## Technical approach

**Service worker (app shell caching)**
- Add a service worker that precaches the built assets and serves an offline fallback for navigations. Registered from `src/routes/__root.tsx` after hydration, production + preview only.
- Without this the browser can't even load the page offline, so this is step one.

**Offline credential vault (`src/lib/offline-storage.ts`)**
- Extend the existing IndexedDB layer with an `offlineAuth` record per user: `email`, `userId`, `role`, `salt`, `passwordHash` (PBKDF2-SHA256 via WebCrypto, ~150k iterations), `cachedAt`.
- Written on every successful **online** sign-in in `LoginPage.tsx` (the only moment the plaintext password is in hand).
- `verifyOfflineCredentials(email, password)` recomputes the hash and returns the cached user + role on match.
- Store the last Supabase session JSON alongside it so the app can restore identity offline.

**Login flow (`src/components/LoginPage.tsx`)**
- Keep current validation, styling, and layout untouched; no role selector.
- On submit: if `navigator.onLine` is false (or the Supabase call fails as a network error), fall through to `verifyOfflineCredentials`.
- Success offline → mark an offline session in IndexedDB + localStorage and navigate to `/dashboard`.
- Failure offline → "No connection, and this account hasn't been used on this device yet. Connect once to sign in."

**Route gate (`src/routes/_authenticated/route.tsx`)**
- Replace `supabase.auth.getUser()` (always a network call) with `supabase.auth.getSession()` (local) and, if that is empty, the cached offline session. Only redirect to `/login` when both are absent.

**Dashboard shell (`src/components/DashboardShell.tsx`)**
- `useMe()` reads the cached user/role first, then refreshes from `user_roles` when online; never throws offline.
- TanStack Query configured with `networkMode: "offlineFirst"` and cached data reused offline.
- Sign-out clears the offline session marker but keeps the credential vault, so the person can sign back in offline.

**Sync on reconnect**
- A small `useOfflineSync` hook listens for the `online` event, replays `getPendingMutations()` through Supabase, marks each synced, and clears them.

## Out of scope for this step
- Real POS / event / report data (module pages stay placeholders).
- Multi-device conflict resolution beyond last-write-wins on the queue.
