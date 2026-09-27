# Ted Baker homepage clone

Day 3 assessment for my Technier internship: replicate the tedbaker.com homepage
with HTML + CSS + Bootstrap (CDN). Learning exercise, not affiliated with Ted Baker.
**Deadline: one working day.**

## Who you're working with
An intern with a backend background (Python/Django), learning frontend. My mentor
will point at random lines and ask "why is this here?", so I must understand every
line I commit. Optimize for my understanding within the deadline: short, precise
explanations, not lectures.

## Files
- `index.html`: the whole page (single file)
- `css/tokens.css`: design tokens as CSS custom properties (I write this)
- `css/main.css`: all custom styles, loaded AFTER Bootstrap and tokens.css
- `assets/`: logo and local assets
- @docs/SECTIONS.md: spec for every section (source of truth)
- `docs/PLAN.md`: build order and time box
- `docs/LEARNING-LOG.md`: my notes (I write this, not you)

## Stack and hard constraints
- Bootstrap CSS + JS bundle and Bootstrap Icons via jsDelivr CDN. Read the exact
  version from the `<link>` tags in `index.html` before suggesting classes.
- No other libraries. No npm, no build step, no preprocessors.
- No custom JavaScript. Bootstrap's bundle only (navbar collapse, offcanvas, dropdown).
- Images are hotlinked from the URLs in docs/SECTIONS.md.
- Static page: search, cart, wishlist, size picker and add-to-cart look real but do nothing.

## How we work (every task)
1. Restate the task in one sentence and list the files you will touch.
2. One section per task. Never edit a section I did not name.
3. Follow docs/SECTIONS.md. If the spec is ambiguous, ask ONE question instead of guessing.
4. If you are about to write more than ~60 lines at once, stop and propose a smaller step.
5. After every change, reply with:
   - a 2–4 line summary of what changed and why,
   - a table: each Bootstrap class used → the plain CSS it applies,
   - 2–3 properties I should toggle off in DevTools to see what they do.
6. Prefer the simplest solution I can explain over the cleverest one.
7. If the real Ted Baker markup is non-semantic (e.g. two h2s and no h1), copy the
   LOOK, not the markup mistake, and tell me you did so.
8. Don't tick checkboxes in docs/PLAN.md. I do that after I understand the change.
9. Never run git commands. Version control is mine.
10. When I paste a screenshot, compare it against the spec and say what differs.

## Definition of done (per section), from the handbook, Days 2 and 3
- Correct semantic elements; heading levels not skipped; valid HTML.
- Reachable and usable with keyboard only; visible focus state.
- Correct at 320, 768, 1024 and 1440px; no horizontal scroll; no fixed heights on text.
- Uses tokens from css/tokens.css; no magic numbers; no `!important`.

## Out of scope: do not build
Working search, cart drawer, wishlist logic, add-to-cart, size selection, cookie
banner, login, any JavaScript beyond Bootstrap's bundle.
