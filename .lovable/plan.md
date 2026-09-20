# Apply the official Venue Vue color palette

## Changes
- Replace the current dark slate and gold theme values with the five official colors through the existing semantic theme variables.
- Use Slate Blue for primary controls and headings, Soft Lavender for borders and secondary treatments, Soft Cyan for cards and highlighted rows, Light Lilac for the application background and surfaces, and Warm Brown for actions and focus states.
- Retune foreground, muted, status, shadow, and interaction colors for readable contrast while preserving all existing layouts and behavior.
- Keep existing component class names intact so the login, application shell, sidebar, buttons, badges, and dashboard cards update together.

## Validation
- Check the login and authenticated dashboard at desktop and compact widths.
- Confirm text contrast, active navigation, buttons, badges, cards, and focus treatments use the new palette without overlap or regressions.

## Technical details
- Update semantic variables and shared interaction styles in the global Tailwind v4 stylesheet.
- Preserve authentication, login validation, routing, and all application logic.
