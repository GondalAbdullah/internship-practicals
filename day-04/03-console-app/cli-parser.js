/**
 * Turns one line of user input into a structured command. Pure — no I/O.
 *
 *   add sku=KB-01 name="Mechanical Keyboard" quantity=5
 *   -> { command: "add",
 *        positional: [],
 *        options: { sku: "KB-01", name: "Mechanical Keyboard", quantity: 5 } }
 *
 *   sort price desc
 *   -> { command: "sort", positional: ["price", "desc"], options: {} }
 *
 * Everything typed at a terminal arrives as text. This module converts only
 * the fields that are meant to be numbers or booleans. Anything that does not
 * convert cleanly is left as text so the validators reject it with a clear
 * message — "quantity=abc" must be an error, not NaN and not 0.
 */

const NUMBER_KEYS = new Set(["quantity", "price", "minQuantity", "maxQuantity"]);
const BOOLEAN_KEYS = new Set(["inStock"]);

/**
 * Matches, in order of preference:
 *   key="value with spaces"  |  key=value  |  "quoted words"  |  word
 * Capture groups: 1 key, 2 quoted value, 3 bare value, 4 quoted word, 5 bare word.
 */
const TOKEN_PATTERN = /(\w+)=(?:"([^"]*)"|(\S+))|"([^"]*)"|(\S+)/g;

export function parseCommand(line) {
  if (typeof line !== "string") {
    throw new TypeError("parseCommand expects a string");
  }

  const positional = [];
  const options = {};

  // matchAll returns an iterator of every match with its capture groups.
  for (const match of line.trim().matchAll(TOKEN_PATTERN)) {
    const [, key, quotedValue, bareValue, quotedWord, bareWord] = match;
    if (key !== undefined) {
      // ?? picks the quoted value when present, even if it is "" (|| would skip "").
      options[key] = convertValue(key, quotedValue ?? bareValue);
    } else {
      positional.push(quotedWord ?? bareWord);
    }
  }

  // The first positional word is the command; the rest are its arguments.
  const [command = "", ...args] = positional;
  return { command: command.toLowerCase(), positional: args, options };
}

/** Convert a raw text value based on which key it belongs to. */
export function convertValue(key, raw) {
  if (NUMBER_KEYS.has(key)) {
    // Only convert text that is fully numeric. Number("") is 0 and
    // parseInt("5abc") is 5 — both would hide a typo, so neither is used alone.
    return /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw;
  }
  if (BOOLEAN_KEYS.has(key)) {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return raw; // e.g. "yes" -> stays text -> validator explains the allowed values
  }
  return raw;
}

/** Parse an id argument ("3" -> 3). Non-numeric text becomes NaN, which validateId rejects. */
export function parseId(raw) {
  return /^\d+$/.test(raw ?? "") ? Number(raw) : Number.NaN;
}
