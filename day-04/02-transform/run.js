/**
 * Prints the answer to every Task 2 question for data.json.
 * Run from the day-04 folder with: npm run transform
 *
 * This file is the only place that touches the file system or the console.
 * The logic itself is in questions.js.
 */
import { readFileSync } from "node:fs";
import {
  revenuePerCustomer,
  topProductsByQuantity,
  ordersByMonth,
  customersWhoNeverOrderedCategory,
} from "./questions.js";

// new URL(..., import.meta.url) resolves the path relative to THIS file, so the
// script works no matter which folder it is run from.
const dataPath = new URL("./data.json", import.meta.url);
const data = JSON.parse(readFileSync(dataPath, "utf8"));

// Intl.NumberFormat adds thousands separators: 22800 -> "22,800".
const pkr = (amount) => `PKR ${new Intl.NumberFormat("en-PK").format(amount)}`;

console.log("1. Total revenue per customer (descending)");
console.table(
  revenuePerCustomer(data).map(({ name, revenue }) => ({ customer: name, revenue: pkr(revenue) })),
);

console.log("2. Top 3 products by quantity sold");
console.table(topProductsByQuantity(data, 3));

console.log("3. Orders grouped by month");
console.table(
  ordersByMonth(data).map(({ month, orderCount, total }) => ({ month, orderCount, total: pkr(total) })),
);

const category = "electronics";
console.log(`4. Customers who have never ordered from "${category}"`);
console.table(customersWhoNeverOrderedCategory(data, category));
