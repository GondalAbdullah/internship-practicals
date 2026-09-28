/**
 * Tests for all 30 drills. Run from the day-04 folder with: npm test
 *
 * Uses Node's built-in test runner (node:test), so there is nothing to install.
 * Each function is checked with a normal case, an edge case, and bad input.
 * assert/strict uses === comparisons and deep equality for objects/arrays.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  reverseString, capitalize, capitalizeWords, countOccurrences,
  slugify, truncate, isPalindrome, countVowels,
} from "./strings.js";
import {
  unique, flatten, chunk, intersect, difference, groupBy, compact, sumBy,
} from "./arrays.js";
import { get, invert, pick, omit, isEmptyObject, mapValues, deepClone } from "./objects.js";
import {
  fizzBuzz, isPrime, factorialIterative, factorialRecursive, fibonacci, gcd, isLeapYear,
} from "./logic.js";

describe("strings", () => {
  test("reverseString", () => {
    assert.equal(reverseString("hello"), "olleh");
    assert.equal(reverseString(""), "");
    assert.equal(reverseString("a😀b"), "b😀a"); // emoji stays intact
    assert.throws(() => reverseString(42), TypeError);
  });

  test("capitalize / capitalizeWords", () => {
    assert.equal(capitalize("lahore"), "Lahore");
    assert.equal(capitalize(""), "");
    assert.equal(capitalizeWords("don't stop  now"), "Don't Stop  Now");
    assert.throws(() => capitalize(null), TypeError);
  });

  test("countOccurrences", () => {
    assert.equal(countOccurrences("banana", "an"), 2);
    assert.equal(countOccurrences("aaaa", "aa"), 2); // non-overlapping
    assert.equal(countOccurrences("abc", "z"), 0);
    assert.throws(() => countOccurrences("abc", ""), RangeError);
  });

  test("slugify", () => {
    assert.equal(slugify("  Héllo, World!  "), "hello-world");
    assert.equal(slugify("Day 04 -- JS Core"), "day-04-js-core");
    assert.equal(slugify("!!!"), "");
  });

  test("truncate", () => {
    assert.equal(truncate("Hello world", 8), "Hello...");
    assert.equal(truncate("Short", 10), "Short");
    assert.ok(truncate("abcdefghijk", 7).length <= 7);
    assert.throws(() => truncate("Hello world", 2), RangeError);
    assert.throws(() => truncate("Hello", -1), RangeError);
  });

  test("isPalindrome", () => {
    assert.equal(isPalindrome("A man, a plan, a canal: Panama"), true);
    assert.equal(isPalindrome("hello"), false);
    assert.equal(isPalindrome(""), true);
  });

  test("countVowels", () => {
    assert.equal(countVowels("Technier"), 3);
    assert.equal(countVowels("rhythm"), 0); // match() returned null here
  });
});

describe("arrays", () => {
  test("unique", () => {
    assert.deepEqual(unique([1, 2, 2, 3, 1]), [1, 2, 3]);
    assert.deepEqual(unique([]), []);
    assert.throws(() => unique("abc"), TypeError);
  });

  test("flatten", () => {
    assert.deepEqual(flatten([1, [2, [3, [4]]]]), [1, 2, 3, 4]);
    assert.deepEqual(flatten([1, [2, [3]]], 1), [1, 2, [3]]);
    assert.deepEqual(flatten([[1], [2]], 0), [[1], [2]]);
  });

  test("chunk", () => {
    assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
    assert.deepEqual(chunk([], 3), []);
    assert.throws(() => chunk([1, 2], 0), RangeError);
  });

  test("intersect / difference", () => {
    assert.deepEqual(intersect([1, 2, 2, 3], [2, 3, 4]), [2, 3]);
    assert.deepEqual(difference([1, 2, 3, 4], [2, 4]), [1, 3]);
    assert.deepEqual(intersect([], [1]), []);
  });

  test("groupBy", () => {
    const people = [
      { name: "Ali", city: "Lahore" },
      { name: "Sara", city: "Karachi" },
      { name: "Omar", city: "Lahore" },
    ];
    assert.deepEqual(groupBy(people, "city"), {
      Lahore: [people[0], people[2]],
      Karachi: [people[1]],
    });
    assert.deepEqual(groupBy([1, 2, 3], (n) => (n % 2 === 0 ? "even" : "odd")), {
      odd: [1, 3],
      even: [2],
    });
    assert.throws(() => groupBy(people, 5), TypeError);
  });

  test("compact", () => {
    assert.deepEqual(compact([0, 1, "", "a", null, undefined, NaN, false, true]), [1, "a", true]);
  });

  test("sumBy", () => {
    const orders = [{ total: 100 }, { total: 250 }];
    assert.equal(sumBy(orders, "total"), 350);
    assert.equal(sumBy(orders, (o) => o.total * 2), 700);
    assert.equal(sumBy([], "total"), 0);
    assert.throws(() => sumBy([{ total: "100" }], "total"), TypeError);
  });

  test("no array function mutates its input", () => {
    const input = Object.freeze([3, [1, 2], 3]); // frozen: any mutation would throw
    unique(input);
    flatten(input);
    chunk(input, 2);
    intersect(input, [3]);
    difference(input, [3]);
    compact(input);
    assert.deepEqual(input, [3, [1, 2], 3]);
  });
});

describe("objects", () => {
  const user = { id: 1, name: "Ali", address: { city: "Lahore", zip: null }, tags: ["a", "b"] };

  test("get", () => {
    assert.equal(get(user, "address.city"), "Lahore");
    assert.equal(get(user, ["tags", 1]), "b");
    assert.equal(get(user, "address.street.name", "N/A"), "N/A");
    assert.equal(get(user, "address.zip", "N/A"), null); // null is a real value
    assert.throws(() => get(null, "a"), TypeError);
  });

  test("invert", () => {
    assert.deepEqual(invert({ a: "x", b: 2 }), { x: "a", 2: "b" });
  });

  test("pick / omit", () => {
    assert.deepEqual(pick(user, ["id", "name", "missing"]), { id: 1, name: "Ali" });
    assert.deepEqual(omit({ a: 1, b: 2, c: 3 }, ["b"]), { a: 1, c: 3 });
    assert.throws(() => pick([], ["id"]), TypeError);
  });

  test("isEmptyObject", () => {
    assert.equal(isEmptyObject({}), true);
    assert.equal(isEmptyObject({ a: undefined }), false);
  });

  test("mapValues", () => {
    assert.deepEqual(mapValues({ a: 1, b: 2 }, (v) => v * 10), { a: 10, b: 20 });
  });

  test("deepClone copies every level", () => {
    const copy = deepClone(user);
    assert.deepEqual(copy, user);
    copy.address.city = "Karachi";
    copy.tags.push("c");
    assert.equal(user.address.city, "Lahore"); // original untouched
    assert.deepEqual(user.tags, ["a", "b"]);
    assert.throws(() => deepClone({ when: new Date() }), TypeError);
  });

  test("spread is only a shallow copy (the bug deepClone avoids)", () => {
    const original = { address: { city: "Lahore" } };
    const shallow = { ...original };
    shallow.address.city = "Multan";
    assert.equal(original.address.city, "Multan");
  });
});

describe("logic", () => {
  test("fizzBuzz", () => {
    assert.deepEqual(fizzBuzz(15).slice(-3), ["13", "14", "FizzBuzz"]);
    assert.deepEqual(fizzBuzz(5), ["1", "2", "Fizz", "4", "Buzz"]);
    assert.deepEqual(fizzBuzz(0), []);
  });

  test("isPrime", () => {
    const primes = Array.from({ length: 30 }, (_, i) => i).filter(isPrime);
    assert.deepEqual(primes, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    assert.equal(isPrime(-7), false);
    assert.throws(() => isPrime(2.5), TypeError);
  });

  test("factorial (both versions agree, exact beyond 2^53)", () => {
    assert.equal(factorialIterative(0), 1n);
    assert.equal(factorialIterative(5), 120n);
    assert.equal(factorialRecursive(5), 120n);
    assert.equal(factorialIterative(25), factorialRecursive(25));
    assert.equal(factorialIterative(20), 2432902008176640000n);
    assert.throws(() => factorialIterative(-1), RangeError);
  });

  test("fibonacci", () => {
    assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map(fibonacci), [0, 1, 1, 2, 3, 5, 8, 13]);
    assert.ok(Number.isSafeInteger(fibonacci(78)));
    assert.throws(() => fibonacci(79), RangeError);
  });

  test("gcd", () => {
    assert.equal(gcd(48, 18), 6);
    assert.equal(gcd(-12, 8), 4);
    assert.equal(gcd(7, 0), 7);
  });

  test("isLeapYear", () => {
    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(1900), false);
    assert.equal(isLeapYear(2000), true);
    assert.equal(isLeapYear(2026), false);
  });
});
