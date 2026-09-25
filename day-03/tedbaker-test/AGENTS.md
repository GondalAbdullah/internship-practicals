# Ted Baker homepage clone — agent guide

## What this project is
A Day 3 assessment for my Technier internship: replicate the tedbaker.com homepage
with HTML + CSS + Bootstrap (CDN). It is a learning exercise, not affiliated with
Ted Baker. **Deadline: one working day.**

## Who you are working with
An intern with a backend background (Python/Django), learning frontend. My mentor
will point at random lines and ask "why is this here?", so I must understand every
line I commit. Optimize for my understanding *within the deadline*: short, precise
explanations, not lectures.

## Files
- `index.html` — the whole page (single file)
- `css/tokens.css` — design tokens as CSS custom properties (colors, spacing, type)
- `css/main.css` — all custom styles, loaded AFTER Bootstrap and tokens.css
- `assets/` — logo and any local assets
- `docs/SECTIONS.md` — the spec for every section (source of truth)
- `docs/PLAN.md` — the build order and time box
- `docs/LEARNING-LOG.md` — my notes (I write this, not you)

## Stack and hard constraints
- Bootstrap CSS + JS bundle and Bootstrap Icons via jsDelivr CDN. Read the exact
  version from the `<link>` tags in `index.html` before suggesting classes.
- No other libraries. No npm, no build step, no preprocessors.
- No custom JavaScript. Bootstrap's bundle only (navbar collapse, offcanvas, dropdown).
- Images are hotlinked from the URLs in `docs/SECTIONS.md`.
- Static page: search, cart, wishlist, size picker and add-to-cart look real but do nothing.

## How we work — every task
1. Restate the task in one sentence and list the files you will touch.
2. One section per task. Never edit a section I did not name.
3. Follow `docs/SECTIONS.md`. If the spec is ambiguous, ask ONE question instead of guessing.
4. After every change, reply with:
   - a 2–4 line summary of what changed and why,
   - a table: each Bootstrap class used → the plain CSS it applies,
   - 2–3 properties I should toggle off in DevTools to see what they do.
5. Do not tick checkboxes in `docs/PLAN.md` — I do that after I have understood the change.
6. Never run terminal or git commands unless I ask. Version control is mine.

## Definition of done (per section) — from the handbook, Days 2 and 3
- Correct semantic elements; heading levels not skipped; valid HTML.
- Reachable and usable with keyboard only; visible focus state.
- Correct at 320, 768, 1024 and 1440px; no horizontal scroll; no fixed heights on text.
- Uses tokens from `css/tokens.css`; no magic numbers; no `!important`.

## Out of scope — do not build
Working search, cart drawer, wishlist logic, add-to-cart, size selection, cookie
banner, login, any JavaScript beyond Bootstrap's bundle.
