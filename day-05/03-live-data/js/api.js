/**
 * The service layer: every network call in this app goes through this file.
 * UI code never calls fetch() directly. It calls searchProducts() / getProduct().
 */

const BASE_URL = 'https://dummyjson.com';
const TIMEOUT_MS = 10_000;

/** A 4xx/5xx response turned into a real error. fetch() alone would NOT reject on these. */
export class HttpError extends Error {
  constructor(status, body) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Combine the caller's cancel signal with a timeout, so a request can never hang forever.
 * AbortSignal.any is recent; older browsers fall back to the caller's signal alone.
 */
function withTimeout(signal) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  if (!signal) return timeout;
  return typeof AbortSignal.any === 'function' ? AbortSignal.any([signal, timeout]) : signal;
}

export async function request(url, { method = 'GET', body, headers = {}, signal } = {}) {
  const response = await fetch(url, {
    method,
    signal: withTimeout(signal),
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Read as text first: handles 204 (empty body) and servers that return HTML error pages.
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.slice(0, 200) };
    }
  }

  if (!response.ok) throw new HttpError(response.status, data);
  return data;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const LIST_FIELDS = 'id,title,price,thumbnail,category,rating,brand';

/** An empty query lists all products; otherwise it searches. Both return { products, total }. */
export function searchProducts(query, { limit, skip, signal, simulateFailure = false }) {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip), select: LIST_FIELDS });
  let path = '/products';

  if (query) {
    path = '/products/search';
    params.set('q', query);
  }

  // Testing aid: a path that does not exist, so the API genuinely answers 404.
  if (simulateFailure) path = '/products/this-route-does-not-exist/force-an-error';

  return request(`${BASE_URL}${path}?${params}`, { signal });
}

export function getProduct(id, { signal } = {}) {
  return request(`${BASE_URL}/products/${encodeURIComponent(id)}`, { signal });
}

// ---------------------------------------------------------------------------
// Errors → human messages
// ---------------------------------------------------------------------------

/** Returns null for cancellations (not a failure: a newer request replaced this one). */
export function describeError(error) {
  if (error?.name === 'AbortError') return null;
  if (error?.name === 'TimeoutError') return 'The server took too long to answer. Please try again.';

  if (error instanceof HttpError) {
    if (error.status === 404) return 'We could not find what you asked for (404).';
    if (error.status === 429) return 'Too many requests. Wait a moment, then try again.';
    if (error.status >= 500) return 'The product service is having trouble right now. Please try again.';
    return `The request was rejected (${error.status}).`;
  }

  // fetch rejects with a TypeError when no response arrives at all: offline, DNS, CORS.
  if (error instanceof TypeError) return 'Could not reach the server. Check your connection and try again.';

  return 'Something went wrong. Please try again.';
}
