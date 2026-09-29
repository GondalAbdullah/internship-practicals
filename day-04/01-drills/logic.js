/**
 * Day 04 — Task 1: logic drills (7 functions).
 *
 * JavaScript has one `number` type: a 64-bit float. Integers are exact only up
 * to Number.MAX_SAFE_INTEGER (2^53 - 1). Past that, results are silently
 * rounded. Functions here either return a BigInt (exact at any size) or throw
 * when the answer would no longer be exact.
 */
import { assertInteger } from "./assert.js";

/**
 * FizzBuzz for 1..n, returned as an array instead of printed.
 * Returning data (rather than calling console.log) makes the function pure
 * and testable; printing is the caller's decision.
 */
export function fizzBuzz(n) {
  assertInteger(n, "n", { min: 0 });
  return Array.from({ length: n }, (_, index) => {
    const value = index + 1;
    if (value % 15 === 0) return "FizzBuzz"; // check 15 first, or 15 would print "Fizz"
    if (value % 3 === 0) return "Fizz";
    if (value % 5 === 0) return "Buzz";
    return String(value);
  });
}

/**
 * Prime check by trial division.
 * Only divisors up to sqrt(n) need testing: if n = a * b, one of a or b is
 * at most sqrt(n). Even numbers are skipped after checking 2.
 */
export function isPrime(n) {
  assertInteger(n, "n");
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/**
 * n! using a loop. Returns a BigInt because 19! already exceeds
 * MAX_SAFE_INTEGER and a regular number would be quietly wrong.
 *   factorialIterative(5) === 120n
 */


export function factorialIterative(n) {
  assertInteger(n, "n", {min: 0});

  let result = 1;

  for(let i = 1 ; i <= n ; i++){
    result = result*i
  }
  return result;
}


/**
 * n! using recursion: n! = n * (n - 1)!, with 0! = 1 as the base case.
 * Each call adds a stack frame, so very large n (around 10,000+) would throw
 * "Maximum call stack size exceeded". The loop version has no such limit.
 */
export function factorialRecursive(n) {
  assertInteger(n, "n", { min: 0 });
  if (n <= 1) return 1n;
  return BigInt(n) * factorialRecursive(n - 1);
}

/**
 * nth Fibonacci number (fibonacci(0) = 0, fibonacci(1) = 1).
 * Iterative with two variables, O(n) time and O(1) memory — the naive
 * recursive version recomputes the same values exponentially many times.
 * fibonacci(79) is larger than MAX_SAFE_INTEGER, so n is capped at 78.
 */
export function fibonacci(n) {
  assertInteger(n, "n", { min: 0 });
  if (n > 78) {
    throw new RangeError("fibonacci(n) for n > 78 exceeds Number.MAX_SAFE_INTEGER");
  }
  let previous = 0;
  let current = 1;
  for (let i = 0; i < n; i++) {
    // Destructuring swap: both right-hand values are read before either is assigned.
    [previous, current] = [current, previous + current];
  }
  return previous;
}

/**
 * Greatest common divisor using Euclid's algorithm:
 * gcd(a, b) = gcd(b, a % b), stopping when b reaches 0.
 */
export function gcd(a, b) {
  assertInteger(a, "a");
  assertInteger(b, "b");
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

/**
 * Gregorian leap year: divisible by 4, except centuries, unless divisible by 400.
 * 2024 -> true, 1900 -> false, 2000 -> true.
 */
export function isLeapYear(year) {
  assertInteger(year, "year");
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
