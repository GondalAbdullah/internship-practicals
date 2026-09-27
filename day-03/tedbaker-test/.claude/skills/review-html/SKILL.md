---
description: Review one section's HTML for semantics and accessibility without editing
argument-hint: "[section name]"
disable-model-invocation: true
allowed-tools: Read Grep
---
Review the HTML of this section in index.html: $ARGUMENTS

Check it against .claude/rules/html.md and its entry in docs/SECTIONS.md.

Do NOT edit any files. Reply with:
1. Issues, most important first, each with the line and a one-line reason.
2. For each issue, a hint pointing me to the fix, not the fixed code.
3. One thing I did well.
