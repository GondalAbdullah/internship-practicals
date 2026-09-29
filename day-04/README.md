# Day 04 — JavaScript Language Core

Plain JavaScript on Node.js. No browser, no DOM, no frameworks, no dependencies.

## Requirements

Node.js 20 or newer (`node --version`).

## Run

From this `day-04/` folder:

```bash
npm test            # runs every *.test.js file with Node's built-in test runner
npm run transform   # prints the answers to the Task 2 business questions
npm run inventory   # starts the Task 3 console app (type "help")
```

## Contents

| Folder | Task | What it contains |
|---|---|---|
| `01-drills/` | Task 1 — Fundamentals drills | 30 pure functions: `strings.js` (8), `arrays.js` (8), `objects.js` (7), `logic.js` (7). Shared input checks in `assert.js`. Tests in `drills.test.js`. |
| `02-transform/` | Task 2 — Data transformation | `data.json` (customers, products, orders), `questions.js` (one pure function per question), `run.js` (prints the answers), `questions.test.js` (hand-checked expected results). |
| `03-console-app/` | Task 3 — Console application | Inventory manager: `state.js` (pure state functions), `validators.js`, `errors.js`, `cli-parser.js`, `seed.js`, `index.js` (the only file with I/O), `inventory.test.js`. |

## Task 2 answers (data.json)

Only orders with status `completed` are counted; the cancelled order `o4` is excluded. Amounts are in PKR.

1. **Revenue per customer:** Ayesha Khan 22,800 · Bilal Ahmed 17,300 · Hira Siddiqui 12,800 · Sana Malik 11,050 · Usman Tariq 10,400 · Fahad Raza 0
2. **Top 3 products by quantity:** Green Tea 100 Bags (12) · Basmati Rice 5kg (3) · Cotton Kurta (3). USB-C Charger also sold 3; ties are broken alphabetically.
3. **Orders by month:** 2026-07: 3 orders, 20,650 · 2026-08: 4 orders, 21,600 · 2026-09: 4 orders, 32,100
4. **Never ordered electronics:** Sana Malik, Usman Tariq, Hira Siddiqui, Fahad Raza

## Design decisions

- **Pure functions everywhere except the edges.** Only `02-transform/run.js` and `03-console-app/index.js` read input or print output. Everything else takes values and returns values, which is why it can be tested without mocks.
- **Inputs are never mutated.** Non-mutating array methods are used on caller data. In the console app, every returned state is frozen with `Object.freeze`, so an accidental mutation throws a `TypeError` instead of silently corrupting data. The tests check this explicitly.
- **Fail loudly.** Bad input throws a specific error (`TypeError`, `RangeError`, `ValidationError`, `NotFoundError`, `DuplicateError`) with a message that says what was wrong. Validation collects every problem before throwing, so the user can fix them all at once. Unexpected errors in the console app are re-thrown, not swallowed.
- **Money as integers.** Prices are whole PKR, so totals are exact. Floating-point amounts are not (`0.1 + 0.2 !== 0.3`).
- **Exact big numbers.** Factorials return `BigInt`. `fibonacci` refuses inputs whose result would exceed `Number.MAX_SAFE_INTEGER`.
- **Dates as strings.** Months are taken with `date.slice(0, 7)` rather than `new Date().getMonth()`, which mixes UTC parsing with local time and can put the 1st of a month in the previous month.

## Console app commands

```text
list
show <id>
add sku=<SKU> name="<name>" category=<category> quantity=<n> price=<pkr>
update <id> <field>=<value> ...
remove <id>
search <text>
filter [category=<c>] [inStock=true|false] [minQuantity=<n>] [maxQuantity=<n>]
sort <field> [asc|desc]
stats
help
exit
```
