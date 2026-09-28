/**
 * Tests for Task 2.
 *
 * The expected numbers below were worked out by hand from data.json,
 * not copied from the program's output. A test that just records whatever
 * the code printed would pass even if the code were wrong.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  orderTotal,
  revenuePerCustomer,
  topProductsByQuantity,
  ordersByMonth,
  customersWhoNeverOrderedCategory,
} from "./questions.js";

const data = JSON.parse(readFileSync(new URL("./data.json", import.meta.url), "utf8"));
const dataBefore = structuredClone(data);

test("orderTotal sums quantity * unitPrice", () => {
  // o9: 1 x 12000 + 2 x 3200
  const o9 = data.orders.find((order) => order.id === "o9");
  assert.equal(orderTotal(o9), 18400);
  assert.equal(orderTotal({ items: [] }), 0);
});

test("Q1: revenue per customer, descending, cancelled order excluded, zero included", () => {
  assert.deepEqual(revenuePerCustomer(data), [
    { customerId: "c1", name: "Ayesha Khan", revenue: 22800 }, // 4400 + 18400 (o4 cancelled)
    { customerId: "c2", name: "Bilal Ahmed", revenue: 17300 }, // 9700 + 5700 + 1900
    { customerId: "c5", name: "Hira Siddiqui", revenue: 12800 }, // 3800 + 9000
    { customerId: "c3", name: "Sana Malik", revenue: 11050 }, // 6550 + 4500
    { customerId: "c4", name: "Usman Tariq", revenue: 10400 }, // 7600 + 2800
    { customerId: "c6", name: "Fahad Raza", revenue: 0 }, // no orders at all
  ]);
});

test("Q2: top 3 products by quantity, ties broken by name", () => {
  // Green Tea: 2 + 3 + 4 + 1 + 2 = 12. Three products tie on 3 units;
  // alphabetical order puts Basmati and Cotton ahead of USB-C.
  assert.deepEqual(topProductsByQuantity(data), [
    { productId: "p7", name: "Green Tea 100 Bags", quantity: 12 },
    { productId: "p6", name: "Basmati Rice 5kg", quantity: 3 },
    { productId: "p8", name: "Cotton Kurta", quantity: 3 },
  ]);
  assert.throws(() => topProductsByQuantity(data, 0), RangeError);
});

test("Q2: an order line for a product that does not exist fails loudly", () => {
  const broken = {
    ...data,
    orders: [{ id: "x", customerId: "c1", date: "2026-09-01", status: "completed",
      items: [{ productId: "p999", quantity: 1, unitPrice: 100 }] }],
  };
  assert.throws(() => topProductsByQuantity(broken), /unknown product "p999"/);
});

test("Q3: orders grouped by month in chronological order", () => {
  assert.deepEqual(ordersByMonth(data), [
    { month: "2026-07", orderCount: 3, total: 20650 }, // o1, o2, o3 (o4 cancelled)
    { month: "2026-08", orderCount: 4, total: 21600 }, // o5, o6, o7, o8
    { month: "2026-09", orderCount: 4, total: 32100 }, // o9, o10, o11, o12
  ]);
});

test("Q4: customers who never ordered a category", () => {
  // Electronics buyers: c1 (o1, o9) and c2 (o6). c1's cancelled keyboard order does not matter.
  assert.deepEqual(customersWhoNeverOrderedCategory(data, "electronics").map((c) => c.customerId),
    ["c3", "c4", "c5", "c6"]);
  // Books buyers: c2 (o2), c3 (o8), c5 (o11).
  assert.deepEqual(customersWhoNeverOrderedCategory(data, "books").map((c) => c.customerId),
    ["c1", "c4", "c6"]);
});

test("Q4: a misspelled category throws instead of returning every customer", () => {
  assert.throws(() => customersWhoNeverOrderedCategory(data, "electronic"), /Unknown category/);
});

test("none of the questions mutate the dataset", () => {
  revenuePerCustomer(data);
  topProductsByQuantity(data);
  ordersByMonth(data);
  customersWhoNeverOrderedCategory(data, "grocery");
  assert.deepEqual(data, dataBefore);
});
