/**
 * Day 04 — Task 1: array drills (8 functions).
 *
 * Rule for this file: the caller's array is never modified. Only
 * non-mutating methods (map, filter, reduce, slice, concat) are used on input.
 * Mutating methods (push, splice, sort, reverse) are only ever used on arrays
 * this function created itself.
 */
import { assertArray, assertInteger, assertFunction } from "./assert.js";

/**
 * Remove duplicates, keeping the first occurrence's order.
 * A Set only stores each value once. Comparison is by ===, so two different
 * objects with the same contents are NOT duplicates (they are different references).
 */
export function unique(arr) {
  assertArray(arr, "arr");
  return [...new Set(arr)];
}

/**
 * Flatten nested arrays up to `depth` levels (default: fully).
 * The built-in arr.flat(depth) does the same thing; this version shows the
 * recursion that reduce makes possible.
 */
export function flatten(arr, depth = Infinity) {
  assertArray(arr, "arr");
  if (depth !== Infinity) assertInteger(depth, "depth", { min: 0 });

  return arr.reduce((result, item) => {
    if (Array.isArray(item) && depth > 0) {
      // concat returns a new array; `result` from the previous step is not touched.
      return result.concat(flatten(item, depth - 1));
    }
    return result.concat([item]); // wrap in [] so concat does not unpack arrays at depth 0
  }, []);
}

/**
 * Split an array into groups of `size`: chunk([1,2,3,4,5], 2) -> [[1,2],[3,4],[5]].
 * Array.from({ length }) builds exactly the number of chunks needed,
 * and slice copies each window without touching the input.
 */
export function chunk(arr, size) {
  assertArray(arr, "arr");
  assertInteger(size, "size", { min: 1 });
  const chunkCount = Math.ceil(arr.length / size);
  return Array.from({ length: chunkCount }, (_, index) =>
    arr.slice(index * size, index * size + size),
  );
}

/**
 * Values present in both arrays, without duplicates, in the order of `a`.
 * Converting `b` to a Set makes each lookup O(1), so the whole function is
 * O(n + m) instead of O(n * m) with b.includes().
 */
export function intersect(a, b) {
  assertArray(a, "a");
  assertArray(b, "b");
  const inB = new Set(b);
  return unique(a).filter((value) => inB.has(value));
}

/** Values in `a` that are not in `b` (duplicates in `a` are kept). */
export function difference(a, b) {
  assertArray(a, "a");
  assertArray(b, "b");
  const inB = new Set(b);
  return a.filter((value) => !inB.has(value));
}

/**
 * Group items by a property name or by a function.
 *   groupBy(users, "city")            -> { Lahore: [...], Karachi: [...] }
 *   groupBy(nums, (n) => n % 2 === 0 ? "even" : "odd")
 *
 * Writing into `groups` inside reduce is fine: it is the accumulator this
 * function created, not the caller's data. The items themselves are placed
 * into the groups by reference (not copied).
 */
export function groupBy(arr, keyOrFn) {
  assertArray(arr, "arr");
  let getKey;
  if (typeof keyOrFn === "string") {
    getKey = (item) => item[keyOrFn];
  } else {
    assertFunction(keyOrFn, "keyOrFn");
    getKey = keyOrFn;
  }

  return arr.reduce((groups, item) => {
    const key = getKey(item);
    // ??= creates the group only the first time this key is seen.
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Remove every falsy value: false, 0, -0, 0n, "", null, undefined, NaN.
 * Careful: this also removes 0 and "", which are often real data.
 * Only use it when those values genuinely mean "nothing".
 */
export function compact(arr) {
  assertArray(arr, "arr");
  return arr.filter(Boolean);
}

/**
 * Sum a numeric value taken from each item: sumBy(orders, (o) => o.total).
 * Starting reduce at 0 matters: without an initial value, reduce on an empty
 * array throws, and on objects it would start with the first object, not a number.
 * A non-number result throws instead of producing NaN or string concatenation.
 */
export function sumBy(arr, fn) {
  assertArray(arr, "arr");
  // Accept a property name as a shortcut: sumBy(orders, "total").
  const getValue = typeof fn === "string" ? (item) => item[fn] : fn;
  assertFunction(getValue, "fn");

  return arr.reduce((total, item, index) => {
    const value = getValue(item);
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new TypeError(`sumBy: item at index ${index} did not produce a number`);
    }
    return total + value;
  }, 0);
}
