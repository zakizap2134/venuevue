# Complete the authenticated dashboard landing page

## What will change

- Keep the existing email/password validation and working account authentication intact.
- Add a dedicated `/login` page while preserving `/` as a compatible sign-in entry.
- Route successful sign-ins to `/dashboard`; unauthenticated dashboard visits and logouts return to `/login`.
- Refine the existing POS navigation into a responsive, collapsible sidebar with all five requested modules and active-page highlighting.
- Keep the authenticated header with user initials, automatically resolved role, connection state, and logout control.
- Keep the dashboard welcome banner and three requested summary cards, improving only layout behavior where needed.

## Validation

- Verify sign-in, active navigation, sidebar collapse/mobile access, logout, and protected-route redirection in the running preview.
- Confirm each content page retains unique title and sharing metadata.

## Technical details

- Continue using the existing Lovable Cloud session and `user_roles` lookup rather than introducing a separate mock session that could conflict with working authentication.
- Add the `/login` route through TanStack Router and update redirects/navigation targets without changing generated route files.  
  
Please proceed with the proposed plan to complete the authenticated Dashboard landing page:
  1. Keep all existing email/password validation and backend authentication intact.
  2. Add a dedicated `/login` route using TanStack Router while maintaining `/` as a compatible entry point.
  3. Route successful sign-ins directly to `/dashboard`. Ensure unauthenticated visits to `/dashboard` and clicking "Log Out" redirect back to `/login`.
  4. Refine the existing POS navigation into a responsive, collapsible sidebar with active-page highlighting for all 5 modules: Dashboard, Register / Sales POS, Event Management, Reports & Analytics, and System Settings.
  5. Keep the header section featuring the user initials, automatically resolved role badge, connection status indicator, and functioning Logout control.
  6. Preserve the dashboard welcome banner ("Welcome to Venue Vue POS") and 3 summary metrics cards (Total Sales, Active Events, Inventory Status).
  7. Maintain the existing user_roles database lookup rather than introducing mock session state.