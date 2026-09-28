/**
 * Day 04 — Task 2: answering business questions with map / filter / reduce.
 *
 * Every function takes the whole dataset ({ customers, products, orders }) and
 * returns a new value. Nothing reads files or prints here — that lives in
 * run.js — so every answer can be unit-tested with a small fixture.
 *
 * Data decisions (stated once, applied everywhere):
 *  - Money is stored as whole PKR integers. Integer arithmetic is exact;
 *    float amounts like 0.1 + 0.2 are not.
 *  - Only orders with status "completed" count. A cancelled order is not
 *    revenue, not a sale, and not evidence that a customer bought something.
 *  - The price charged is the order line's unitPrice, not the product's current
 *    list price (prices change; what the customer paid does not).
 */

/** Orders that actually happened. Used as the starting point for every question. */
export function completedOrders(data) {
  return data.orders.filter((order) => order.status === "completed");
}

/** Total of one order: sum of quantity * unitPrice across its line items. */
export function orderTotal(order) {
  return order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

/**
 * Turn an array into an object keyed by id, for O(1) lookups:
 *   [{ id: "p1", ... }] -> { p1: { id: "p1", ... } }
 * Without this, every lookup would be a .find() over the whole array.
 */
export function indexById(records) {
  return records.reduce((lookup, record) => {
    lookup[record.id] = record;
    return lookup;
  }, {});
}

/**
 * Question 1 — Total revenue per customer, sorted descending.
 * Returns [{ customerId, name, revenue }].
 *
 * Customers with no completed orders are included with revenue 0: leaving
 * them out would hide exactly the customers a business wants to know about.
 * Ties are broken by name so the output order is always the same.
 */
export function revenuePerCustomer(data) {
  // Step 1: fold every completed order into { customerId: revenue }.
  const revenueByCustomer = completedOrders(data).reduce((totals, order) => {
    totals[order.customerId] = (totals[order.customerId] ?? 0) + orderTotal(order);
    return totals;
  }, {});

  // Step 2: start from the customer list (not the orders) so nobody is missed.
  return data.customers
    .map((customer) => ({
      customerId: customer.id,
      name: customer.name,
      // ?? rather than ||: both work here, but ?? states the intent —
      // "use 0 only when there is no entry", never "when the entry is 0".
      revenue: revenueByCustomer[customer.id] ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));
  // sort() mutates, but it is sorting the new array map() just created.
  // `b.revenue - a.revenue` gives descending order; when it is 0 (a tie),
  // || falls through to the name comparison.
}

/**
 * Question 2 — The best-selling products by quantity (default: top 3).
 * Returns [{ productId, name, quantity }].
 *
 * flatMap turns "array of orders, each with an array of items" into one flat
 * array of items, which is much easier to reduce over.
 */
export function topProductsByQuantity(data, limit = 3) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`limit must be a positive integer, received ${limit}`);
  }
  const productsById = indexById(data.products);

  const quantityByProduct = completedOrders(data)
    .flatMap((order) => order.items)
    .reduce((totals, item) => {
      totals[item.productId] = (totals[item.productId] ?? 0) + item.quantity;
      return totals;
    }, {});

  return Object.entries(quantityByProduct)
    .map(([productId, quantity]) => {
      const product = productsById[productId];
      if (!product) {
        // An order referencing a product that does not exist is a data error.
        // Fail loudly instead of reporting a nameless product.
        throw new Error(`Order item references unknown product "${productId}"`);
      }
      return { productId, name: product.name, quantity };
    })
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/**
 * Question 3 — Orders grouped by month, with a count and a total for each.
 * Returns [{ month: "2026-07", orderCount, total }] in chronological order.
 *
 * The month is taken from the date string ("2026-07-03".slice(0, 7)) instead
 * of new Date(). A "YYYY-MM-DD" string is parsed as UTC midnight, and
 * getMonth() uses local time, so in a timezone behind UTC the 1st of a month
 * would be counted in the previous month. Slicing the string has no such trap.
 */
export function ordersByMonth(data) {
  const byMonth = completedOrders(data).reduce((groups, order) => {
    const month = order.date.slice(0, 7);
    groups[month] ??= { month, orderCount: 0, total: 0 };
    groups[month].orderCount += 1;
    groups[month].total += orderTotal(order);
    return groups;
  }, {});

  // "YYYY-MM" strings sort correctly as text, so localeCompare gives chronological order.
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Question 4 — Customers who have never (successfully) ordered from a category.
 * Returns [{ customerId, name }].
 *
 * An unknown category throws. Otherwise a typo like "electronic" would match
 * no products and wrongly report that every customer has never ordered it.
 */
export function customersWhoNeverOrderedCategory(data, category) {
  const categories = new Set(data.products.map((product) => product.category));
  if (!categories.has(category)) {
    throw new Error(
      `Unknown category "${category}". Valid categories: ${[...categories].join(", ")}`,
    );
  }

  // Set of product ids in the category, e.g. { "p1", "p2", "p3" }.
  const productIdsInCategory = new Set(
    data.products.filter((product) => product.category === category).map((product) => product.id),
  );

  // Set of customers with at least one completed order containing such a product.
  const buyers = new Set(
    completedOrders(data)
      .filter((order) => order.items.some((item) => productIdsInCategory.has(item.productId)))
      .map((order) => order.customerId),
  );

  return data.customers
    .filter((customer) => !buyers.has(customer.id))
    .map((customer) => ({ customerId: customer.id, name: customer.name }));
}
