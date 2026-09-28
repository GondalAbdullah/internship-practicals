/**
 * Day 04 — Task 1: string drills (8 functions).
 *
 * Strings in JavaScript are immutable primitives: every method here returns a
 * new string and the input is never changed. All functions are pure.
 */
import { assertString, assertInteger } from "./assert.js";

/**
 * Reverse a string.
 * Array.from splits by Unicode code point, so emoji and other characters made
 * of two UTF-16 units ("surrogate pairs") survive. str.split("") would cut
 * them in half and produce garbage.
 */
export function reverseString(str) {
  assertString(str, "str");
  return Array.from(str).reverse().join("");
  // .reverse() mutates, but it mutates the brand-new array Array.from created,
  // not anything the caller owns, so the function stays pure.
}

/** Uppercase the first character; leave the rest exactly as given. */
export function capitalize(str) {
  assertString(str, "str");
  if (str.length === 0) return str;
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Capitalize every word.
 * Splitting on a single space (instead of a regex like /\b\w/) keeps the
 * original spacing and does not break words with apostrophes ("don't" must not
 * become "Don'T").
 */
export function capitalizeWords(str) {
  assertString(str, "str");
  return str.split(" ").map(capitalize).join(" ");
}

/**
 * Count non-overlapping occurrences of `sub` in `str`.
 * Splitting on the substring gives (occurrences + 1) pieces.
 * An empty substring is rejected: "abc".split("") would report 2 matches,
 * which is meaningless.
 */
export function countOccurrences(str, sub) {
  assertString(str, "str");
  assertString(sub, "sub");
  if (sub.length === 0) {
    throw new RangeError("sub must not be an empty string");
  }
  return str.split(sub).length - 1;
}

/**
 * Turn a title into a URL slug: "Héllo, World!" -> "hello-world".
 * 1. normalize("NFKD") splits "é" into "e" + a combining accent mark.
 * 2. The ̀-ͯ range removes those accent marks.
 * 3. Any run of non-alphanumeric characters becomes a single "-".
 * 4. Leading and trailing dashes are trimmed.
 */
export function slugify(str) {
  assertString(str, "str");
  return str
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Shorten a string to at most `maxLength` characters, including the suffix.
 * The result never exceeds maxLength, so the caller can rely on the limit
 * (for example a database column or a UI width).
 */
export function truncate(str, maxLength, suffix = "...") {
  assertString(str, "str");
  assertInteger(maxLength, "maxLength", { min: 0 });
  assertString(suffix, "suffix");
  if (str.length <= maxLength) return str;
  if (maxLength < suffix.length) {
    throw new RangeError(`maxLength (${maxLength}) is shorter than the suffix "${suffix}"`);
  }
  // trimEnd avoids results like "Hello ..." with a dangling space.
  return str.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}

/**
 * Palindrome check that ignores case, spaces and punctuation, so
 * "A man, a plan, a canal: Panama" counts.
 */
export function isPalindrome(str) {
  assertString(str, "str");
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === reverseString(cleaned);
}

/**
 * Count vowels (a, e, i, o, u), case-insensitive.
 * String.match returns null — not an empty array — when nothing matches.
 * `?? []` turns that null into an empty array so .length is always safe.
 */
export function countVowels(str) {
  assertString(str, "str");
  return (str.match(/[aeiou]/gi) ?? []).length;
}
