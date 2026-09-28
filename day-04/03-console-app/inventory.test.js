/**
 * Tests for Task 3: state functions, validation, the parser and the command runner.
 *
 * The most important property checked here is immutability: after every
 * operation, the state that went in must be unchanged.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  createState, nextId, getItem, addItem, updateItem, removeItem,
  searchItems, filterItems, sortItems, summarize,
} from "./state.js";
import { ValidationError, NotFoundError, DuplicateError, InventoryError } from "./errors.js";
import { parseCommand, parseId } from "./cli-parser.js";
import { runCommand } from "./index.js";
import { seedItems } from "./seed.js";

const keyboard = { sku: "KB-02", name: "Compact Keyboard", category: "electronics", quantity: 5, price: 9000 };

/** Fresh state for every test, so tests never depend on each other. */
const freshState = () => createState(seedItems);

describe("addItem", () => {
  test("adds an item with the next id and normalized fields", () => {
    const before = freshState();
    const after = addItem(before, { ...keyboard, sku: " kb-02 ", category: " Electronics " });
    assert.equal(after.length, before.length + 1);
    assert.deepEqual(after.at(-1), { id: 7, ...keyboard });
  });

  test("leaves the original state untouched", () => {
    const before = freshState();
    const snapshot = structuredClone(before);
    addItem(before, keyboard);
    assert.deepEqual(before, snapshot);
  });

  test("rejects a duplicate SKU (case-insensitive, because SKUs are uppercased)", () => {
    assert.throws(() => addItem(freshState(), { ...keyboard, sku: "ms-01" }), DuplicateError);
  });

  test("reports every validation problem at once", () => {
    // assert.throws accepts a checker function: it receives the thrown error
    // and must return true for the test to pass.
    assert.throws(
      () => addItem(freshState(), { sku: "?", name: "", quantity: -1, price: 1.5, extra: true }),
      (error) => {
        assert.ok(error instanceof ValidationError);
        assert.equal(error.problems.length, 6); // extra, sku, name, category, quantity, price
        return true;
      },
    );
  });

  test("rejects numbers given as strings (no silent coercion)", () => {
    assert.throws(() => addItem(freshState(), { ...keyboard, quantity: "5" }), ValidationError);
  });
});

describe("updateItem / removeItem / getItem", () => {
  test("updates only the target item and keeps the others as the same objects", () => {
    const before = freshState();
    const after = updateItem(before, 3, { quantity: 10, price: 11500 });
    assert.equal(getItem(after, 3).quantity, 10);
    assert.equal(getItem(after, 3).price, 11500);
    assert.equal(getItem(before, 3).quantity, 4); // original unchanged
    assert.equal(after[0], before[0]); // untouched items are reused, not copied
  });

  test("cannot change id, cannot use an empty update, cannot steal another SKU", () => {
    const state = freshState();
    assert.throws(() => updateItem(state, 1, { id: 99 }), ValidationError);
    assert.throws(() => updateItem(state, 1, {}), ValidationError);
    assert.throws(() => updateItem(state, 1, { sku: "KB-01" }), DuplicateError);
    // Re-saving an item's own SKU is fine.
    assert.doesNotThrow(() => updateItem(state, 1, { sku: "MS-01" }));
  });

  test("missing ids and bad ids fail loudly", () => {
    const state = freshState();
    assert.throws(() => updateItem(state, 99, { quantity: 1 }), NotFoundError);
    assert.throws(() => removeItem(state, 99), NotFoundError);
    assert.throws(() => getItem(state, "1"), ValidationError);
    assert.throws(() => getItem(state, 0), ValidationError);
  });

  test("removeItem returns a new state without the item", () => {
    const before = freshState();
    const after = removeItem(before, 2);
    assert.equal(after.length, before.length - 1);
    assert.ok(!after.some((item) => item.id === 2));
    assert.equal(before.length, 6);
  });

  test("ids are never reused while a higher id exists", () => {
    const state = removeItem(freshState(), 3);
    assert.equal(nextId(state), 7);
    assert.equal(nextId(createState()), 1);
  });
});

describe("state is frozen", () => {
  test("direct mutation throws instead of silently changing shared data", () => {
    const state = freshState();
    assert.throws(() => state.push({}), TypeError);
    assert.throws(() => {
      state[0].quantity = 999;
    }, TypeError);
    assert.throws(() => state.sort(), TypeError);
  });
});

describe("search / filter / sort / summarize", () => {
  test("search is case-insensitive over name and SKU", () => {
    const state = freshState();
    assert.deepEqual(searchItems(state, "WIRELESS").map((i) => i.id), [1]);
    assert.deepEqual(searchItems(state, "gr-").map((i) => i.id), [5, 6]);
    assert.deepEqual(searchItems(state, "nothing-like-this"), []);
    assert.throws(() => searchItems(state, "   "), ValidationError);
  });

  test("filter combines criteria, and 0 / false are real values", () => {
    const state = freshState();
    assert.deepEqual(filterItems(state, { category: "Electronics", inStock: true }).map((i) => i.id), [1, 3]);
    assert.deepEqual(filterItems(state, { inStock: false }).map((i) => i.id), [2]);
    assert.deepEqual(filterItems(state, { maxQuantity: 0 }).map((i) => i.id), [2]);
    assert.deepEqual(filterItems(state, { minQuantity: 5, maxQuantity: 30 }).map((i) => i.id), [1, 4]);
    assert.throws(() => filterItems(state, { minQuantity: 10, maxQuantity: 5 }), ValidationError);
    assert.throws(() => filterItems(state, { colour: "red" }), ValidationError);
    assert.throws(() => filterItems(state, {}), ValidationError);
  });

  test("sort numbers numerically and strings alphabetically, without touching state", () => {
    const state = freshState();
    // Prices 950 and 12000: a default text sort would put "12000" before "950".
    assert.deepEqual(sortItems(state, "price").map((i) => i.price), [950, 1850, 2500, 3200, 4500, 12000]);
    assert.equal(sortItems(state, "name", "desc")[0].name, "Wireless Mouse");
    assert.deepEqual(state.map((i) => i.id), [1, 2, 3, 4, 5, 6]);
    assert.throws(() => sortItems(state, "weight"), ValidationError);
    assert.throws(() => sortItems(state, "price", "up"), ValidationError);
  });

  test("summarize", () => {
    assert.deepEqual(summarize(freshState()), {
      itemCount: 6,
      totalUnits: 79, // 25 + 0 + 4 + 7 + 40 + 3
      stockValue: 62500 + 0 + 48000 + 31500 + 74000 + 2850,
      outOfStock: 1,
    });
  });
});

describe("cli parser", () => {
  test("parses quoted values and converts numeric/boolean fields only", () => {
    assert.deepEqual(parseCommand('ADD sku=AB-1 name="Big Box" quantity=3 price=100'), {
      command: "add",
      positional: [],
      options: { sku: "AB-1", name: "Big Box", quantity: 3, price: 100 },
    });
    assert.deepEqual(parseCommand("sort price desc"), {
      command: "sort", positional: ["price", "desc"], options: {},
    });
  });

  test("bad numbers stay as text so validation can reject them", () => {
    assert.equal(parseCommand("add quantity=abc").options.quantity, "abc");
    assert.equal(parseCommand("add quantity=5abc").options.quantity, "5abc");
    assert.equal(parseCommand("filter inStock=yes").options.inStock, "yes");
    assert.equal(parseCommand("add sku=1234").options.sku, "1234"); // SKU is never converted
  });

  test("parseId", () => {
    assert.equal(parseId("12"), 12);
    assert.ok(Number.isNaN(parseId("abc")));
    assert.ok(Number.isNaN(parseId(undefined)));
  });
});

describe("runCommand (the app without the terminal)", () => {
  test("a full session: add, update, remove", () => {
    let state = freshState();
    ({ state } = runCommand(state, 'add sku=HP-01 name="Headphones" category=electronics quantity=2 price=8500'));
    ({ state } = runCommand(state, "update 7 quantity=5"));
    ({ state } = runCommand(state, "remove 1"));
    assert.equal(getItem(state, 7).quantity, 5);
    assert.throws(() => getItem(state, 1), NotFoundError);
  });

  test("user mistakes raise InventoryError subclasses; unknown commands just return a message", () => {
    const state = freshState();
    assert.throws(() => runCommand(state, "update abc quantity=1"), InventoryError);
    assert.throws(() => runCommand(state, "add sku=X"), InventoryError);
    assert.match(runCommand(state, "fly").message, /Unknown command/);
    assert.match(runCommand(state, "toString").message, /Unknown command/);
    assert.equal(runCommand(state, "   ").state, state);
  });
});
