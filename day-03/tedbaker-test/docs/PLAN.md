# One-day plan (~8.5 hours)

Tick a box only after you can explain the change out loud.
Commit at every 💾.

## 0. Setup and study — 45 min
- [ ] On the feature branch, open ONLY `day-03/tedbaker-test` as the Cursor workspace
- [ ] Screenshot tedbaker.com at 375, 768, 1024, 1440px → `docs/screenshots/`
- [ ] DevTools: note the colors, font families, base font size and max content width
      → write them into `css/tokens.css` as custom properties (you write this file)
- [ ] DevTools Network → Img: copy product image URLs into `docs/SECTIONS.md`
- [ ] Copy the Bootstrap CSS/JS bundle and Bootstrap Icons CDN tags from their official sites
- [ ] 💾 `chore: project scaffold and design tokens`

## 1. HTML skeleton, no CSS — 1h 45m  (YOU write it; use Tab completion only)
- [ ] `<head>`: lang, charset, viewport, title, description, CDN links, tokens.css, main.css
- [ ] Skip link, header, nav, main, all MVP sections, footer
- [ ] `/review-html` on each section → fix issues yourself
- [ ] W3C validator: zero errors
- [ ] Tab through the whole page with keyboard only
- [ ] 💾 `feat: semantic HTML skeleton for homepage`

## 2. Styling, one section at a time — 4h
Loop per section: `/style-section` → read diff → `/explain` anything unclear →
toggle properties in DevTools → tick → 💾

MVP (do in this order):
- [ ] Announcement bar — 💾
- [ ] Header + nav (mobile offcanvas) — 💾
- [ ] Hero — 💾
- [ ] New arrivals carousel (scroll-snap) — 💾
- [ ] Workwear tiles — 💾
- [ ] Footer (hand-written CSS Grid) — 💾

Stretch — only if MVP is done by ~6h mark:
- [ ] Campaign banner
- [ ] Video tiles
- [ ] Workwear favorites grid
- [ ] Mega-menu dropdown for one nav item
- [ ] Rotating announcement messages (CSS animation, reduced-motion safe)

## 3. Quality pass — 1h
- [ ] `/quality-pass` → fix all "Must" items
- [ ] Check 320 / 768 / 1024 / 1440px: no horizontal scroll
- [ ] Hover + focus-visible on every interactive element
- [ ] One transition + one entrance animation inside prefers-reduced-motion
- [ ] Lighthouse accessibility — aim for 100
- [ ] 💾 `fix: responsive and accessibility pass`

## 4. Wrap-up — 45 min
- [ ] `/quiz-me` on the header and the carousel
- [ ] Fill in README.md and LEARNING-LOG.md
- [ ] 💾 `docs: README and learning log`
- [ ] Push branch, open a pull request into main, send the link to your mentor

## If you fall behind
Cut stretch items first, then simplify the header (no offcanvas, links wrap).
Never cut the quality pass — it is what the handbook grades.
