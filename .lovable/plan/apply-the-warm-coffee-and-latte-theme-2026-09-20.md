# Apply the warm coffee and latte theme

## Changes
- Replace the current global palette with the specified coffee, latte, cream, charcoal, status, violet, and sky-blue values.
- Map those colors to the existing semantic Tailwind tokens so login fields, navigation, buttons, badges, panels, and dashboard cards update consistently without changing behavior.
- Keep class-based dark mode and the existing saved preference, while ensuring dark backgrounds, cards, text, borders, disabled states, status colors, and selected navigation use the requested dark values.
- Keep the Sun/Moon control in the authenticated top header and make initial theme application persist cleanly across reloads.

## Validation
- Check the login and authenticated dashboard in light and dark modes at desktop and compact widths.
- Confirm theme persistence after reload, readable contrast, active navigation, status badges, buttons, inputs, and metric cards.

## Technical details
- Update Tailwind v4 theme mappings and semantic variables in the global stylesheet.
- Reuse the existing `dark` root class and `venue-vue-theme` local storage key.
- Preserve all authentication, routing, validation, and dashboard behavior.
