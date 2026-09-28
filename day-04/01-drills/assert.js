/**
 * Shared input guards for the drills.
 *
 * Every drill validates its arguments before doing any work. JavaScript does not
 * stop you from calling reverseString(42) — it would quietly coerce or crash
 * somewhere deep inside. Checking at the boundary means a bad call fails
 * immediately, with a message that says exactly what was wrong.
 */

export function assertString(value, name = "value") {
  if (typeof value !== "string") {
    throw new TypeError(`${name} must be a string, received ${describe(value)}`);
  }
}

export function assertArray(value, name = "value") {
  // typeof [] is "object", so Array.isArray is the only reliable array check.
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array, received ${describe(value)}`);
  }
}

export function assertPlainObject(value, name = "value") {
  // typeof null is also "object" (a historical bug), and arrays are objects too,
  // so both have to be ruled out explicitly.
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be a plain object, received ${describe(value)}`);
  }
}

export function assertFunction(value, name = "value") {
  if (typeof value !== "function") {
    throw new TypeError(`${name} must be a function, received ${describe(value)}`);
  }
}

export function assertInteger(value, name = "value", { min = -Infinity } = {}) {
  // Number.isInteger rejects NaN, Infinity, 2.5 and non-numbers like "5",
  // so there is no need for a separate typeof check.
  if (!Number.isInteger(value)) {
    throw new TypeError(`${name} must be an integer, received ${describe(value)}`);
  }
  if (value < min) {
    throw new RangeError(`${name} must be >= ${min}, received ${value}`);
  }
}

/** Human-readable type name for error messages. */
function describe(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isNaN(value)) return "NaN";
  return typeof value;
}
