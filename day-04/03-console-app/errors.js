/**
 * Custom error types for the inventory app.
 *
 * Each kind of failure gets its own class so the caller can react to it
 * specifically (`error instanceof NotFoundError`) instead of parsing message
 * strings. They all extend InventoryError, so index.js can tell "expected,
 * user-caused problem — show the message" apart from "a real bug — crash".
 */

export class InventoryError extends Error {
  constructor(message) {
    super(message);
    // Without this, error.name would be the generic "Error" in stack traces.
    this.name = this.constructor.name;
  }
}

/** Input is missing, the wrong type, or out of range. */
export class ValidationError extends InventoryError {
  /**
   * @param {string[]} problems every problem found, not just the first one,
   *   so the user can fix all of them in one go.
   */
  constructor(problems) {
    super(`Invalid input: ${problems.join("; ")}`);
    this.problems = problems;
  }
}

/** No item with the requested id exists. */
export class NotFoundError extends InventoryError {
  constructor(id) {
    super(`No item with id ${id}`);
    this.id = id;
  }
}

/** An item with the same SKU already exists (SKUs must be unique). */
export class DuplicateError extends InventoryError {
  constructor(sku) {
    super(`An item with SKU "${sku}" already exists`);
    this.sku = sku;
  }
}
