/**
 * Day 04 — Task 3: console inventory manager.
 * Run from the day-04 folder with: npm run inventory   (type "help" for commands)
 *
 * Layout of the app (one responsibility per file):
 *   errors.js      custom error types
 *   validators.js  every input rule
 *   state.js       pure functions: (state, input) -> new state
 *   cli-parser.js  text line -> { command, positional, options }
 *   seed.js        starting data
 *   index.js       this file: the only place with I/O (reading lines, printing)
 *
 * The command handlers below are pure too: they take the current state and the
 * parsed command, and return { state, items?, message? }. The loop at the
 * bottom does all the printing. Keeping I/O at the edge is what lets Day 5
 * reuse state.js unchanged behind a web page.
 */
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";
import {
  createState, getItem, addItem, updateItem, removeItem,
  searchItems, filterItems, sortItems, summarize,
} from "./state.js";
import { parseCommand, parseId } from "./cli-parser.js";
import { InventoryError, ValidationError } from "./errors.js";
import { seedItems } from "./seed.js";

const HELP = `
Commands:
  list                                   show all items
  show <id>                              show one item
  add sku=<SKU> name="<name>" category=<category> quantity=<n> price=<pkr>
  update <id> <field>=<value> ...        e.g. update 3 quantity=10 price=11500
  remove <id>                            delete an item
  search <text>                          match name or SKU (case-insensitive)
  filter [category=<c>] [inStock=true|false] [minQuantity=<n>] [maxQuantity=<n>]
  sort <field> [asc|desc]                fields: id, sku, name, category, quantity, price
  stats                                  totals across the inventory
  help                                   show this message
  exit                                   quit
Wrap values containing spaces in double quotes.`;

/**
 * Command table: command name -> handler(state, parsed).
 * A lookup object instead of a long switch statement: adding a command is one
 * new entry, and an unknown command is simply a missing key.
 */
const commands = {
  help: (state) => ({ state, message: HELP }),

  list: (state) => ({ state, items: state }),

  show: (state, { positional }) => ({ state, items: [getItem(state, parseId(positional[0]))] }),

  add: (state, { options }) => {
    const next = addItem(state, options);
    const added = next[next.length - 1];
    return { state: next, message: `Added #${added.id} ${added.name}` };
  },

  update: (state, { positional, options }) => {
    const id = parseId(positional[0]);
    const next = updateItem(state, id, options);
    return { state: next, message: `Updated #${id}`, items: [getItem(next, id)] };
  },

  remove: (state, { positional }) => {
    const id = parseId(positional[0]);
    const { name } = getItem(state, id);
    return { state: removeItem(state, id), message: `Removed #${id} ${name}` };
  },

  // Multi-word searches ("search green tea") arrive as several positional words.
  search: (state, { positional }) => ({ state, items: searchItems(state, positional.join(" ")) }),

  filter: (state, { options }) => ({ state, items: filterItems(state, options) }),

  sort: (state, { positional }) => {
    const [field = "id", direction = "asc"] = positional;
    return { state, items: sortItems(state, field, direction.toLowerCase()) };
  },

  stats: (state) => {
    const { itemCount, totalUnits, stockValue, outOfStock } = summarize(state);
    return {
      state,
      message:
        `Items: ${itemCount} | Units: ${totalUnits} | ` +
        `Stock value: ${formatPkr(stockValue)} | Out of stock: ${outOfStock}`,
    };
  },
};

/** Run one line of input against the current state. Pure: no printing here. */
export function runCommand(state, line) {
  const parsed = parseCommand(line);
  if (parsed.command === "") return { state };

  // Object.hasOwn stops inherited names like "toString" being treated as commands.
  if (!Object.hasOwn(commands, parsed.command)) {
    return { state, message: `Unknown command "${parsed.command}". Type "help".` };
  }
  return commands[parsed.command](state, parsed);
}

function formatPkr(amount) {
  return `PKR ${new Intl.NumberFormat("en-PK").format(amount)}`;
}

function printItems(items) {
  if (items.length === 0) {
    console.log("No items match."); // empty state: say so instead of printing nothing
    return;
  }
  console.table(
    items.map(({ id, sku, name, category, quantity, price }) => ({
      id, sku, name, category, quantity, price: formatPkr(price),
    })),
  );
}

/** Interactive loop. Only runs when this file is executed directly. */
async function main() {
  // `let` because this binding is replaced after every successful command.
  // The state arrays themselves are never modified — only swapped for new ones.
  let state = createState(seedItems);

  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "inventory> " });
  console.log(`Inventory loaded with ${state.length} items. Type "help" for commands.`);
  rl.prompt();

  for await (const line of rl) {
    if (line.trim().toLowerCase() === "exit") break;

    try {
      const result = runCommand(state, line);
      state = result.state;
      if (result.message) console.log(result.message);
      if (result.items) printItems(result.items);
    } catch (error) {
      if (error instanceof ValidationError) {
        // Show every problem on its own line so all of them can be fixed at once.
        console.log("Error:");
        error.problems.forEach((problem) => console.log(`  - ${problem}`));
      } else if (error instanceof InventoryError) {
        console.log(`Error: ${error.message}`);
      } else {
        // Anything else is a bug in this program, not a user mistake.
        // Re-throw so it crashes with a full stack trace instead of being hidden.
        rl.close();
        throw error;
      }
    }
    rl.prompt();
  }

  rl.close();
  console.log("Goodbye.");
}

// True only when run as `node index.js`, not when imported by the tests.
// pathToFileURL handles Windows paths (C:\\...) as well as macOS/Linux ones.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
