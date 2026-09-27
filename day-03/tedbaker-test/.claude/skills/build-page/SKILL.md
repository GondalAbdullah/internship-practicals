---
description: Build the complete Ted Baker homepage clone in one pass
disable-model-invocation: true
---
Build the complete Ted Baker homepage clone in one pass, following CLAUDE.md,
docs/SECTIONS.md and the rules in .claude/rules.

1. Fetch https://www.tedbaker.com/ to confirm structure, copy and current image URLs.
   Update docs/SECTIONS.md if any URL changed. Look at any images in docs/screenshots/.
2. Create css/tokens.css: colors, font families (closest Google Fonts match to the
   real site), spacing scale, type scale, container width.
3. Create index.html with EVERY section in SECTIONS.md (MVP and stretch), in order:
   announcement bar, header + nav (offcanvas on mobile, one mega-menu), hero,
   campaign banner, video tiles, new-arrivals carousel (scroll-snap, 8 cards),
   workwear tiles, workwear favorites grid, footer (CSS Grid, newsletter form,
   social links, disclaimer line).
4. Create css/main.css with all styles, one commented block per section.
5. Mobile-first; correct at 320/768/1024/1440px; no custom JS.

Finish with: assumptions made, anything you couldn't match, and what I should check
first in the browser.
