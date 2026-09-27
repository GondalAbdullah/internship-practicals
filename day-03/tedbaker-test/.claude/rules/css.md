---
paths:
  - "**/*.css"
---
# CSS and Bootstrap rules (handbook Day 3)

- Load order: Bootstrap → css/tokens.css → css/main.css. Custom CSS lives only in main.css.
- Never use !important. Override Bootstrap by (a) setting its --bs-* custom properties,
  or (b) a selector of equal/higher specificity. Say which you used and why.
- All colors, spacing, radii and font sizes come from custom properties in tokens.css.
  Use clamp() for fluid headline sizes.
- Mobile-first: base styles for small screens, then min-width media queries only.
- No fixed heights on anything containing text. Use min-height or aspect-ratio for media.
- Flexbox for one-dimensional rows (nav, card meta, button groups); Grid for
  two-dimensional layouts (footer, tile grids). State the choice in a comment.
- The product carousel is a horizontal scroll container with scroll-snap. No JS.
- Every interactive element gets :hover and :focus-visible styles. Never remove the
  focus outline without replacing it.
- Animations/transitions go inside @media (prefers-reduced-motion: no-preference).
- One short comment above each section block: /* === Section: name === */
- The footer uses hand-written CSS Grid, not Bootstrap's grid (deliberate learning).
