/**
 * Starting inventory so the app has something to work with on launch.
 * Passed through createState(), so the seed is validated exactly like user
 * input — a typo here fails at startup instead of lurking in the data.
 */
export const seedItems = [
  { sku: "MS-01", name: "Wireless Mouse", category: "electronics", quantity: 25, price: 2500 },
  { sku: "CH-01", name: "USB-C Charger", category: "electronics", quantity: 0, price: 3200 },
  { sku: "KB-01", name: "Mechanical Keyboard", category: "electronics", quantity: 4, price: 12000 },
  { sku: "BK-01", name: "Clean Code", category: "books", quantity: 7, price: 4500 },
  { sku: "GR-01", name: "Basmati Rice 5kg", category: "grocery", quantity: 40, price: 1850 },
  { sku: "GR-02", name: "Green Tea 100 Bags", category: "grocery", quantity: 3, price: 950 },
];
