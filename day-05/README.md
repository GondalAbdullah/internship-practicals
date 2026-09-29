# Day 5: JavaScript in the Browser

Technier Software Engineer Intern Handbook · Phase 2: Programming

The DOM, events and asynchronous JavaScript: reading and changing the page, responding to what users do, and handling data that has not arrived yet. No frameworks and no libraries, only plain HTML, CSS and JavaScript modules.

## What's inside

| Task | Folder | Deliverable |
|---|---|---|
| 1. DOM drills | [`01-dom-drills/`](01-dom-drills/) | Restyle every second table row · build a list from an array of objects · a button that removes its own card via event delegation · tabs and an accordion with no library |
| 2. Interactive task manager | [`02-task-manager/`](02-task-manager/) | Add, edit, complete, delete and filter · state persisted to `localStorage` and restored on reload · inline validation errors · one `render()` function derived from state |
| 3. Live data application | [`03-live-data/`](03-live-data/) | Remote list with loading, empty, success and error states · human error message with Retry · debounced search · stale requests cancelled with `AbortController` · pagination · detail view |

## How to run

The pages use ES modules (`<script type="module">`). Browsers refuse to load modules from `file://`, so opening `index.html` by double-clicking will not work. Serve the folder over HTTP instead, with any one of these from inside `day-05/`:

```bash
npm start                      # uses `serve` via npx, then open http://localhost:5500
python -m http.server 5500     # then open http://localhost:5500
```

VS Code's **Live Server** extension also works. Task 3 needs an internet connection (it calls `https://dummyjson.com`).

## How to test

```bash
npm test     # Node's built-in test runner, no dependencies to install (Node 22+)
```

The unit tests cover the pure task functions (validation, immutability, filtering) and the debounce utility (with mocked timers).

Manual checks worth doing in DevTools:

- **Task 2:** add a task, reload, and it is still there. Application → Local Storage → edit the saved value into invalid JSON and reload: the app starts fresh instead of crashing. Add a task titled `<img src=x onerror=alert(1)>`: it shows as plain text and never runs.
- **Task 3:** Network → throttle to *Slow 4G* and type quickly. Earlier requests show as *(canceled)* and only the latest results appear. Switch Network to *Offline* and search: you get a clear error with *Try again*. Search for `zzzz`: you get the empty state. Tick **Testing tools → Make list requests fail** to force the error state on demand.
- **All pages:** use only the keyboard (Tab, Enter, Space, Esc, arrow keys on tabs, `/` for search in Task 3), and resize to 320px wide. There should be no horizontal scrolling.

## Structure

```
day-05/
├── index.html                # overview page linking to the three tasks
├── shared/base.css           # design tokens, reset, form controls, focus styles (light + dark)
├── 01-dom-drills/
│   ├── index.html
│   ├── drills.js
│   └── styles.css
├── 02-task-manager/
│   ├── index.html
│   ├── styles.css
│   └── js/
│       ├── tasks.js          # pure functions: no DOM, no storage, no clock
│       ├── storage.js        # localStorage load/save with validation and error handling
│       └── app.js            # state, render(), event listeners
├── 03-live-data/
│   ├── index.html
│   ├── styles.css
│   └── js/
│       ├── api.js            # service layer: request(), HttpError, timeouts, error messages
│       ├── utils.js          # debounce (closure), formatters
│       └── app.js            # list + detail state machines, rendering, events
├── tests/
│   ├── tasks.test.js
│   └── utils.test.js
└── package.json              # `npm start`, `npm test`
```

## Key decisions

**The interface is derived from state.** In Tasks 2 and 3, event handlers never edit the DOM directly. They compute new state (with pure functions in Task 2) and call `render()`, which is the only code that writes to the list. The screen therefore cannot drift out of sync with the data. This is the same idea React is built on.

**Event delegation everywhere lists change.** A single listener on a stable parent (`#task-list`, `#results`, `#card-grid`) handles clicks for every child, including children created later. Nothing is attached inside a loop or inside `render()`.

**One `status` field instead of several booleans.** Task 3 models each view as `idle | loading | success | error`, so impossible combinations like "loading and error at the same time" cannot happen. "Empty" is a success with zero items and gets its own message.

**`fetch` does not reject on 404/500.** `api.js` checks `response.ok` and throws an `HttpError`, so a single `try/catch` handles network failures, timeouts, HTTP errors and bad JSON. `describeError()` turns each case into a message a user can act on.

**Race conditions are handled, not hoped away.** Each new search aborts the previous request with `AbortController`. Debouncing alone reduces requests but cannot guarantee response order. Every request also has a 10-second timeout, so nothing can hang forever.

**Untrusted data is always text.** User input and API data are inserted with `textContent` / `createElement`, never `innerHTML`, which prevents XSS. Saved `localStorage` data is validated on load, because it can be corrupted or edited by hand.

**Accessibility is not optional.** Every page uses labelled inputs, visible focus states, `aria-pressed` on filter buttons, `aria-invalid` and `role="alert"` for errors, `aria-live` summaries, full keyboard support for the tabs, and deliberate focus management (after delete, after save, and when the detail dialog closes). It also respects `prefers-reduced-motion`.

## Self-check (answered)

- **In what order do a synchronous log, a promise resolution and a zero-delay timeout run?** Synchronous first, then the promise callback (microtask queue, fully drained after the current task), then the timeout (task queue, next turn of the event loop).
- **Why does a click listener added at page load not work on an item added later?** The listener was attached to the elements that existed at that moment. New elements have none. Delegation fixes this because the click bubbles up to a parent that does have a listener.
- **What is the difference between `preventDefault` and `stopPropagation`?** `preventDefault` cancels the browser's default action (form submit, link navigation). `stopPropagation` stops the event from travelling to other elements' listeners. They are independent.
- **When would you choose debounce over throttle?** Debounce when only the final value after activity stops matters (search-as-you-type, autosave). Throttle when you need regular updates during continuous activity (scroll position, dragging).
