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
