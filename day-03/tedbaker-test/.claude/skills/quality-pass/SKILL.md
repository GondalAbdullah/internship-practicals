---
description: Audit the whole page against the definition of done without editing
disable-model-invocation: true
allowed-tools: Read Grep
---
Audit index.html and the CSS files against the Definition of Done in CLAUDE.md.
Do NOT edit files.

Check and report per section:
- semantic structure and heading order
- keyboard access and visible focus
- likely overflow or breakage at 320, 768, 1024, 1440px
- fixed heights, magic numbers, !important, unused CSS
- missing alt text or labels

Output a prioritized checklist I can work through, marking each item Must / Should / Nice.
