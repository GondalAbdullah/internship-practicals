/**
 * Day 04 — Task 1: object drills (7 functions).
 *
 * Objects are passed by reference. If a function writes to an object it was
 * given, the caller's object changes too. Every function here builds and
 * returns a new object instead.
 */
import { assertPlainObject, assertArray, assertFunction } from "./assert.js";

/**
 * Safely read a nested value: get(user, "address.city", "Unknown").
 * The path may be a dotted string or an array of keys (["items", 0, "name"]).
 *
 * The fallback is used only when the value is undefined (missing).
 * A value deliberately set to null is returned as null: "empty on purpose"
 * and "not there at all" are different facts.
 */
export function get(obj, path, fallback = undefined) {
  if (obj === null || typeof obj !== "object") {
    throw new TypeError("get: obj must be an object or array");
  }
  const keys = typeof path === "string" ? path.split(".") : path;
  assertArray(keys, "path");

  const result = keys.reduce((current, key) => {
    // Written out in full instead of `current == null`: == is avoided in this
    // codebase, so both cases are spelled out.
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);

  return result === undefined ? fallback : result;
}

/**
 * Swap keys and values: { a: "x", b: "y" } -> { x: "a", y: "b" }.
 * Object keys are always strings, so values are converted with String().
 * If two keys share a value, the later one wins (a collision loses data).
 */
export function invert(obj) {
  assertPlainObject(obj, "obj");
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [String(value), key]));
}

/**
 * Copy only the listed keys: pick(user, ["id", "name"]).
 * Keys that do not exist are skipped rather than added as undefined.
 * Object.hasOwn ignores inherited properties such as "toString".
 */
export function pick(obj, keys) {
  assertPlainObject(obj, "obj");
  assertArray(keys, "keys");
  return Object.fromEntries(
    keys.filter((key) => Object.hasOwn(obj, key)).map((key) => [key, obj[key]]),
  );
}

/** Copy everything except the listed keys: omit(user, ["passwordHash"]). */
export function omit(obj, keys) {
  assertPlainObject(obj, "obj");
  assertArray(keys, "keys");
  const excluded = new Set(keys);
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !excluded.has(key)));
}

/**
 * True when an object has no own keys.
 * `if (obj)` cannot answer this: {} is truthy in JavaScript
 * (unlike an empty dict in Python, which is falsy).
 */
export function isEmptyObject(obj) {
  assertPlainObject(obj, "obj");
  return Object.keys(obj).length === 0;
}

/** Apply a function to every value, keeping the keys: mapValues(prices, (p) => p * 2). */
export function mapValues(obj, fn) {
  assertPlainObject(obj, "obj");
  assertFunction(fn, "fn");
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key)]));
}

/**
 * Deep copy of plain objects and arrays.
 *
 * Spread ({ ...obj }) is a SHALLOW copy: nested objects are still shared, so
 * editing copy.address.city also changes original.address.city.
 * This walks the whole structure and copies every level.
 *
 * In real code prefer the built-in structuredClone(obj), which also handles
 * Dates, Maps, Sets and circular references. This version exists to show the
 * mechanics.
 */
export function deepClone(value) {
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  if (value !== null && typeof value === "object") {
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      // Date, Map, class instances etc. would be silently turned into plain
      // objects and lose their behaviour. Refuse instead of copying wrongly.
      throw new TypeError("deepClone only supports plain objects and arrays; use structuredClone");
    }
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, deepClone(inner)]));
  }
  // Primitives (string, number, boolean, null, undefined, bigint, symbol)
  // are copied by value already, so they are returned as-is.
  return value;
}
