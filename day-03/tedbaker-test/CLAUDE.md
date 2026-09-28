# Ted Baker homepage clone

Technier internship, Day 3 assessment: replicate the tedbaker.com homepage with
HTML + CSS + Bootstrap (CDN). Learning exercise, not affiliated with Ted Baker.
**Goal: finish today. Speed over explanation.**

## Files
- `index.html`: the whole page (single file)
- `css/tokens.css`: design tokens as CSS custom properties
- `css/main.css`: all custom styles, loaded AFTER Bootstrap and tokens.css
- `assets/`: logo and local assets
- @docs/SECTIONS.md: spec for every section (source of truth)
- `docs/screenshots/`: reference screenshots of the real site

## Stack and hard constraints
- Bootstrap 5 CSS + JS bundle and Bootstrap Icons via jsDelivr CDN. Use the latest
  stable versions and keep them consistent.
- No other libraries. No npm, no build step, no preprocessors.
- No custom JavaScript. Bootstrap's bundle only (navbar collapse, offcanvas, dropdown).
- Images hotlinked from the URLs in docs/SECTIONS.md (request smaller widths, not 3840).
- Static page: search, cart, wishlist, size picker and add-to-cart look real but do nothing.
- Footer includes the line "Learning exercise, not affiliated with Ted Baker."

## How we work
- Build complete sections, or the whole page, in one go. Don't ask to confirm steps.
- Make reasonable assumptions instead of asking; list them at the end of your reply.
- When I paste screenshots, treat the real site's screenshot as the target and fix
  every visible difference in spacing, typography, color and layout.
- Keep replies short: what changed, and anything I need to check in the browser.
- Never run git commands. Version control is mine.

## Definition of done (from the handbook, Days 2 and 3)
- Semantic landmarks, one h1, no skipped heading levels, valid HTML (W3C).
- Keyboard usable with visible focus; Lighthouse accessibility 100.
- Correct at 320, 768, 1024 and 1440px; no horizontal scroll; no fixed heights on text.
- Colors, spacing and type come from tokens.css; no `!important`.

## Out of scope
Working search, cart drawer, wishlist logic, add-to-cart, size selection, cookie
banner, login, any JavaScript beyond Bootstrap's bundle.
