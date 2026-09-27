---
description: Audit the page against the definition of done and fix everything found
disable-model-invocation: true
---
Audit index.html, css/tokens.css and css/main.css against the Definition of Done in
CLAUDE.md and the rules in .claude/rules, then fix every problem you find directly.

Check: landmarks and heading order; one h1; alt text; labels on form inputs;
links vs buttons; aria-label on icon-only controls; visible :focus-visible on every
interactive element; horizontal overflow at 320px; fixed heights on text containers;
!important; hard-coded values that should be tokens; unused CSS; invalid HTML
(duplicate ids, bad nesting, missing attributes); reduced-motion handling.

If I paste W3C validator errors or Lighthouse findings, fix those too.
Reply with a short list of fixes and anything left for me to check manually.
