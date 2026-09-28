/**
 * Inventory state and the pure functions that change it.
 *
 * State is an array of item objects:
 *   { id, sku, name, category, quantity, price }
 *
 * THE RULE: no function here ever modifies the state it receives. Each one
 * returns a brand-new array (and new item objects where something changed).
 * The caller replaces its old state with the returned one:
 *
 *   state = addItem(state, input);
 *
 * Benefits: the previous state is still intact (undo is trivial), each
 * function is testable with plain input/output, and a bug in one operation
 * cannot corrupt data another part of the program is holding.
 *
 * To enforce the rule rather than just promise it, every state returned is
 * frozen (see freezeState). In an ES module (always strict mode), writing to
 * a frozen object throws a TypeError, so an accidental mutation fails loudly
 * instead of silently changing shared data.
 */
import {
  validateNewItem,
  validateChanges,
  validateId,
  validateSearchQuery,
  validateFilterCriteria,
  validateSort,
} from "./validators.js";
import { NotFoundError, DuplicateError } from "./errors.js";

/**
 * Freeze the array and each item in it.
 * Object.freeze is shallow, so the items have to be frozen individually;
 * freezing only the array would still allow item.quantity = 999.
 */
function freezeState(items) {
  return Object.freeze(items.map((item) => Object.freeze(item)));
}

/** Build a valid initial state from raw records (e.g. seed data), validating each one. */
export function createState(records = []) {
  return records.reduce((state, record) => addItem(state, record), freezeState([]));
}

/**
 * Next id = highest existing id + 1 (1 for an empty inventory).
 * Derived from the state itself, so no hidden global counter is needed and
 * the function stays pure. Ids are never reused while higher ones exist.
 */
export function nextId(state) {
  return state.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

/** Find one item by id, or throw NotFoundError. */
export function getItem(state, id) {
  validateId(id);
  const item = state.find((entry) => entry.id === id);
  if (!item) throw new NotFoundError(id);
  return item;
}

/**
 * Add a new item. Returns the new state.
 * Throws ValidationError for bad input and DuplicateError for a taken SKU.
 */
export function addItem(state, input) {
  const fields = validateNewItem(input);
  if (state.some((item) => item.sku === fields.sku)) {
    throw new DuplicateError(fields.sku);
  }
  // Spread creates a new array: the old items plus the new one at the end.
  return freezeState([...state, { id: nextId(state), ...fields }]);
}

/**
 * Update some fields of one item. Returns the new state.
 * Only the changed item gets a new object; untouched items are reused as-is
 * (safe, because they are frozen and can never change underneath anyone).
 */
export function updateItem(state, id, changes) {
  const existing = getItem(state, id); // validates id and throws if missing
  const fields = validateChanges(changes);

  if (fields.sku !== undefined && state.some((item) => item.sku === fields.sku && item.id !== id)) {
    throw new DuplicateError(fields.sku);
  }

  const updated = { ...existing, ...fields }; // later spread wins, so changes override
  return freezeState(state.map((item) => (item.id === id ? updated : item)));
}

/** Remove one item by id. Returns the new state. */
export function removeItem(state, id) {
  getItem(state, id); // throws NotFoundError: removing something that is not there is an error
  return freezeState(state.filter((item) => item.id !== id));
}

/** Case-insensitive search on name and SKU. Returns a new array (possibly empty). */
export function searchItems(state, query) {
  const needle = validateSearchQuery(query);
  return state.filter(
    (item) => item.name.toLowerCase().includes(needle) || item.sku.toLowerCase().includes(needle),
  );
}

/**
 * Filter by any combination of: category, inStock (true / false),
 * minQuantity, maxQuantity. Every criterion given must match.
 */
export function filterItems(state, criteria) {
  const { category, inStock, minQuantity, maxQuantity } = validateFilterCriteria(criteria);

  // Each check passes automatically when its criterion was not provided.
  // `!== undefined` is used instead of a truthiness check because 0 and false
  // are real criteria values: maxQuantity: 0 means "out of stock only".
  return state.filter(
    (item) =>
      (category === undefined || item.category === category) &&
      (inStock === undefined || (item.quantity > 0) === inStock) &&
      (minQuantity === undefined || item.quantity >= minQuantity) &&
      (maxQuantity === undefined || item.quantity <= maxQuantity),
  );
}

/**
 * Sort by a field, ascending or descending. Returns a new array.
 *
 * toSorted() returns a sorted copy and leaves the original alone (works even
 * on the frozen state). The older equivalent is [...state].sort(...);
 * plain state.sort() would try to reorder the frozen array and throw.
 *
 * Strings are compared with localeCompare; numbers by subtraction. Never rely
 * on the default sort() for numbers: it compares them as text, so 10 < 9.
 * Ties fall back to id so the order is always predictable.
 */
export function sortItems(state, field = "id", direction = "asc") {
  validateSort(field, direction);
  const sign = direction === "asc" ? 1 : -1;

  return state.toSorted((a, b) => {
    const comparison =
      typeof a[field] === "string" ? a[field].localeCompare(b[field]) : a[field] - b[field];
    return sign * comparison || a.id - b.id;
  });
}

/** Summary numbers for the "stats" command. */
export function summarize(state) {
  return {
    itemCount: state.length,
    totalUnits: state.reduce((sum, item) => sum + item.quantity, 0),
    stockValue: state.reduce((sum, item) => sum + item.quantity * item.price, 0),
    outOfStock: state.filter((item) => item.quantity === 0).length,
  };
}
