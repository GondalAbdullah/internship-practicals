/**
 * Input validation for the inventory app.
 *
 * Validation lives in its own module so state.js can assume clean data and
 * stay focused on state changes. Every validator either returns a cleaned-up
 * (normalized) value or throws a ValidationError listing every problem found.
 */
import { ValidationError } from "./errors.js";

/**
 * One rule per item field.
 *  - check:     returns null when the value is valid, or a problem message.
 *  - normalize: tidies a valid value (trim spaces, fix case) before storing.
 *
 * Keeping the rules in data (instead of a long chain of if-statements) means
 * adding a field is one new entry here, and the same rules serve both
 * "add" and "update".
 */
const FIELD_RULES = {
  sku: {
    check: (value) =>
      typeof value === "string" && /^[A-Za-z0-9-]{2,20}$/.test(value.trim())
        ? null
        : "sku must be 2-20 characters: letters, digits or dashes",
    normalize: (value) => value.trim().toUpperCase(),
  },
  name: {
    check: (value) =>
      typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 80
        ? null
        : "name must be a string of 2-80 characters",
    normalize: (value) => value.trim(),
  },
  category: {
    check: (value) =>
      typeof value === "string" && value.trim().length > 0 ? null : "category must be a non-empty string",
    normalize: (value) => value.trim().toLowerCase(),
  },
  quantity: {
    // Number.isInteger rejects "5", 2.5, NaN and Infinity in one check.
    check: (value) =>
      Number.isInteger(value) && value >= 0 ? null : "quantity must be a whole number >= 0",
    normalize: (value) => value,
  },
  price: {
    // Whole PKR only: integer money never suffers floating-point rounding.
    check: (value) =>
      Number.isInteger(value) && value >= 0 ? null : "price must be a whole number of PKR >= 0",
    normalize: (value) => value,
  },
};

const ITEM_FIELDS = Object.keys(FIELD_RULES);
export const SORTABLE_FIELDS = ["id", ...ITEM_FIELDS];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Shared core for add and update.
 * @param {object} input        raw user input
 * @param {boolean} requireAll  true for "add" (every field needed), false for "update"
 */
function validateFields(input, requireAll) {
  if (!isPlainObject(input)) {
    throw new ValidationError(["input must be an object"]);
  }

  const problems = [];

  // Unknown keys are rejected rather than ignored. A typo like "quantiy"
  // would otherwise be silently dropped and the user would think it saved.
  for (const key of Object.keys(input)) {
    if (key === "id") {
      problems.push("id is assigned automatically and cannot be set or changed");
    } else if (!Object.hasOwn(FIELD_RULES, key)) {
      problems.push(`unknown field "${key}"`);
    }
  }

  const cleaned = {};
  for (const field of ITEM_FIELDS) {
    if (!Object.hasOwn(input, field)) {
      if (requireAll) problems.push(`${field} is required`);
      continue;
    }
    const problem = FIELD_RULES[field].check(input[field]);
    if (problem) {
      problems.push(problem);
    } else {
      cleaned[field] = FIELD_RULES[field].normalize(input[field]);
    }
  }

  // Collect everything first, then throw once, so the user sees every mistake together.
  if (problems.length > 0) throw new ValidationError(problems);
  return cleaned;
}

/** Validate a complete new item. Returns { sku, name, category, quantity, price }. */
export function validateNewItem(input) {
  return validateFields(input, true);
}

/** Validate a partial update. At least one field must be provided. */
export function validateChanges(changes) {
  const cleaned = validateFields(changes, false);
  if (Object.keys(cleaned).length === 0) {
    throw new ValidationError(["provide at least one field to update"]);
  }
  return cleaned;
}

/** Item ids are positive integers. */
export function validateId(id) {
  if (!Number.isInteger(id) || id < 1) {
    throw new ValidationError([`id must be a positive whole number, received ${String(id)}`]);
  }
  return id;
}

/** A search needs real text: an empty query would "match" everything by accident. */
export function validateSearchQuery(query) {
  if (typeof query !== "string" || query.trim().length === 0) {
    throw new ValidationError(["search query must be a non-empty string"]);
  }
  return query.trim().toLowerCase();
}

/**
 * Filter criteria: { category?, inStock?, minQuantity?, maxQuantity? }.
 * All are optional, but at least one is required and unknown keys are errors.
 */
export function validateFilterCriteria(criteria) {
  if (!isPlainObject(criteria)) {
    throw new ValidationError(["filter criteria must be an object"]);
  }
  const allowed = ["category", "inStock", "minQuantity", "maxQuantity"];
  const problems = [];

  for (const key of Object.keys(criteria)) {
    if (!allowed.includes(key)) problems.push(`unknown filter "${key}"`);
  }
  if (Object.keys(criteria).length === 0) {
    problems.push(`provide at least one filter: ${allowed.join(", ")}`);
  }

  const { category, inStock, minQuantity, maxQuantity } = criteria;
  if (category !== undefined && (typeof category !== "string" || category.trim() === "")) {
    problems.push("category must be a non-empty string");
  }
  if (inStock !== undefined && typeof inStock !== "boolean") {
    problems.push("inStock must be true or false");
  }
  for (const [key, value] of [["minQuantity", minQuantity], ["maxQuantity", maxQuantity]]) {
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
      problems.push(`${key} must be a whole number >= 0`);
    }
  }
  if (Number.isInteger(minQuantity) && Number.isInteger(maxQuantity) && minQuantity > maxQuantity) {
    problems.push("minQuantity cannot be greater than maxQuantity");
  }

  if (problems.length > 0) throw new ValidationError(problems);

  // Return a new object; category is normalized the same way items store it.
  // Spreading `false` adds nothing, so the second spread only applies when a
  // category was given.
  return {
    ...criteria,
    ...(category !== undefined && { category: category.trim().toLowerCase() }),
  };
}

/** Sort field must be a real field; direction is "asc" or "desc". */
export function validateSort(field, direction) {
  const problems = [];
  if (!SORTABLE_FIELDS.includes(field)) {
    problems.push(`cannot sort by "${field}"; choose one of: ${SORTABLE_FIELDS.join(", ")}`);
  }
  if (direction !== "asc" && direction !== "desc") {
    problems.push(`direction must be "asc" or "desc", received "${direction}"`);
  }
  if (problems.length > 0) throw new ValidationError(problems);
  return { field, direction };
}
