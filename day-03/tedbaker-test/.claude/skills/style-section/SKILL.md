---
description: Style one named section of the page following its spec
argument-hint: "[section name]"
disable-model-invocation: true
---
Style this section: $ARGUMENTS

Follow its entry in docs/SECTIONS.md and the rules in .claude/rules/css.md.

1. Restate the target layout at 375px and at 1024px+ in two lines. If anything in
   the spec is unclear, ask one question and wait.
2. Add only the classes and CSS for that section. Use tokens from css/tokens.css.
3. Reply with: summary, Bootstrap class → plain CSS table, and 2–3 properties I
   should toggle off in DevTools to learn what they do.
