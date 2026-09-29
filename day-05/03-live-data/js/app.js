/**
 * Day 5 · Task 3: a live-data application.
 *
 * Handles reality, not just the happy path:
 *   - loading, empty, success and error are explicit states (one `status` field, not 4 booleans)
 *   - a human error message with a working Retry
 *   - debounced search-as-you-type
 *   - AbortController cancels stale requests, so a slow old response can't overwrite a newer one
 *   - every request has a timeout, so nothing can hang forever
 *   - a detail view for a single record, with its own loading and error states
 */

import { searchProducts, getProduct, describeError } from './api.js';
import { debounce, formatPrice, formatRating } from './utils.js';

const PAGE_SIZE = 12;
const SEARCH_DELAY_MS = 350;

// ---------------------------------------------------------------------------
// Elements
// ---------------------------------------------------------------------------

const els = {
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search'),
  simulateFailure: document.getElementById('simulate-failure'),
  resultsHeading: document.getElementById('results-heading'),
  summary: document.getElementById('summary'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  errorMessage: document.getElementById('error-message'),
  retry: document.getElementById('retry'),
  empty: document.getElementById('empty'),
  results: document.getElementById('results'),
  pagination: document.getElementById('pagination'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  pageInfo: document.getElementById('page-info'),
  detail: document.getElementById('detail'),
  detailTitle: document.getElementById('detail-title'),
  detailBody: document.getElementById('detail-body'),
  detailClose: document.getElementById('detail-close'),
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** status: 'idle' | 'loading' | 'success' | 'error'. "Empty" = success with zero items. */
let list = { status: 'idle', query: '', page: 0, items: [], total: 0, error: null };

/** status: 'closed' | 'loading' | 'success' | 'error' */
let detail = { status: 'closed', id: null, product: null, error: null };

let listController = null;
let detailController = null;
let lastDetailTrigger = null;

function setList(patch) {
  list = { ...list, ...patch };
  renderList();
}

function setDetail(patch) {
  detail = { ...detail, ...patch };
  renderDetail();
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

async function loadProducts({ query = list.query, page = 0, focusResults = false } = {}) {
  listController?.abort(); // cancel whatever is still in flight
  const controller = new AbortController();
  listController = controller;

  setList({ status: 'loading', query, page, error: null });

  try {
    const data = await searchProducts(query, {
      limit: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      signal: controller.signal,
      simulateFailure: els.simulateFailure.checked,
    });

    // Belt and braces: ignore a response that is no longer the latest request.
    if (controller !== listController) return;

    setList({ status: 'success', items: data.products ?? [], total: data.total ?? 0 });
    syncUrl();
    if (focusResults) els.resultsHeading.focus();
  } catch (error) {
    const message = describeError(error);
    if (message === null) return; // aborted on purpose: a newer search replaced this one
    console.error('Loading products failed:', error); // fail loudly for the developer too
    setList({ status: 'error', error: message });
  }
}

async function loadDetail(id) {
  detailController?.abort();
  const controller = new AbortController();
  detailController = controller;

  setDetail({ status: 'loading', id, product: null, error: null });

  try {
    const product = await getProduct(id, { signal: controller.signal });
    if (controller !== detailController) return;
    setDetail({ status: 'success', product });
  } catch (error) {
    const message = describeError(error);
    if (message === null) return;
    console.error(`Loading product ${id} failed:`, error);
    setDetail({ status: 'error', error: message });
  }
}

/** Keep the search in the address bar, so a reload or a shared link shows the same results. */
function syncUrl() {
  const url = new URL(window.location.href);
  if (list.query) url.searchParams.set('q', list.query);
  else url.searchParams.delete('q');
  if (list.page > 0) url.searchParams.set('page', String(list.page + 1));
  else url.searchParams.delete('page');
  window.history.replaceState(null, '', url);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderList() {
  const { status, query, page, items, total, error } = list;
  const isSuccess = status === 'success';
  const hasItems = isSuccess && items.length > 0;

  els.loading.hidden = status !== 'loading';
  els.error.hidden = status !== 'error';
  els.errorMessage.textContent = error ?? '';

  els.empty.hidden = !(isSuccess && items.length === 0);
  els.empty.textContent = query
    ? `No products match "${query}". Try a different word.` // textContent: user text stays text
    : 'No products are available right now.';

  els.results.hidden = !hasItems;
  els.results.replaceChildren(...(hasItems ? items.map(createProductCard) : []));

  if (hasItems) {
    const start = page * PAGE_SIZE + 1;
    const end = page * PAGE_SIZE + items.length;
    const what = query ? `results for "${query}"` : 'products';
    els.summary.textContent = `Showing ${start}–${end} of ${total} ${what}`;
  } else {
    els.summary.textContent = '';
  }

  const pageCount = Math.ceil(total / PAGE_SIZE);
  els.pagination.hidden = !(hasItems && pageCount > 1);
  els.prev.disabled = page === 0;
  els.next.disabled = page + 1 >= pageCount;
  els.pageInfo.textContent = `Page ${page + 1} of ${pageCount}`;
}

/** If an image fails to load, replace it with a neutral placeholder instead of a broken icon. */
function swapOnImageError(image) {
  image.addEventListener(
    'error',
    () => {
      const placeholder = document.createElement('span');
      placeholder.className = `${image.className} image-placeholder`.trim();
      if (image.alt) {
        placeholder.setAttribute('role', 'img');
        placeholder.setAttribute('aria-label', image.alt);
      } else {
        placeholder.setAttribute('aria-hidden', 'true');
      }
      placeholder.textContent = 'No image';
      image.replaceWith(placeholder);
    },
    { once: true },
  );
}

function createProductCard(product) {
  const item = document.createElement('li');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'product-card';
  button.dataset.productId = String(product.id);

  const image = document.createElement('img');
  image.src = product.thumbnail;
  image.alt = ''; // decorative here: the button's text already names the product
  image.width = 300;
  image.height = 300;
  image.loading = 'lazy';
  image.decoding = 'async';
  swapOnImageError(image);

  const title = document.createElement('span');
  title.className = 'product-card__title';
  title.textContent = product.title;

  const meta = document.createElement('span');
  meta.className = 'product-card__meta';
  meta.textContent = [product.brand, product.category].filter(Boolean).join(' · ');

  const footer = document.createElement('span');
  footer.className = 'product-card__footer';

  const price = document.createElement('span');
  price.className = 'product-card__price';
  price.textContent = formatPrice(product.price);

  const rating = document.createElement('span');
  rating.className = 'product-card__rating';
  rating.textContent = `★ ${formatRating(product.rating)}`;

  footer.append(price, rating);
  button.append(image, title, meta, footer);
  item.append(button);
  return item;
}

function renderDetail() {
  const { status, product, error } = detail;

  els.detailTitle.textContent = status === 'success' ? product.title : 'Product details';

  if (status === 'loading') {
    const loading = document.createElement('p');
    loading.className = 'state state--loading';
    loading.setAttribute('role', 'status');
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    loading.append(spinner, 'Loading product…');
    els.detailBody.replaceChildren(loading);
    return;
  }

  if (status === 'error') {
    const box = document.createElement('div');
    box.className = 'state state--error';
    box.setAttribute('role', 'alert');
    const message = document.createElement('p');
    message.textContent = error;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.dataset.action = 'retry-detail';
    retry.textContent = 'Try again';
    box.append(message, retry);
    els.detailBody.replaceChildren(box);
    return;
  }

  if (status === 'success') {
    els.detailBody.replaceChildren(createProductDetail(product));
    return;
  }

  els.detailBody.replaceChildren();
}

function createProductDetail(product) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-detail';

  const image = document.createElement('img');
  image.src = product.images?.[0] ?? product.thumbnail;
  image.alt = product.title;
  image.width = 600;
  image.height = 600;
  image.className = 'product-detail__image';
  swapOnImageError(image);

  const facts = document.createElement('dl');
  facts.className = 'product-detail__facts';

  const rows = [
    ['Price', formatPrice(product.price)],
    ['Rating', formatRating(product.rating)],
    ['Brand', product.brand],
    ['Category', product.category],
    ['In stock', product.stock],
    ['Availability', product.availabilityStatus],
    ['Shipping', product.shippingInformation],
  ];

  rows
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .forEach(([label, value]) => {
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      description.textContent = String(value);
      facts.append(term, description);
    });

  const description = document.createElement('p');
  description.className = 'product-detail__description';
  description.textContent = product.description;

  wrapper.append(image, facts, description);
  return wrapper;
}

// ---------------------------------------------------------------------------
// Detail dialog
// ---------------------------------------------------------------------------

function openDetail(id, trigger) {
  lastDetailTrigger = trigger;
  if (!els.detail.open) els.detail.showModal(); // modal <dialog>: focus trap + Esc for free
  loadDetail(id);
}

els.detail.addEventListener('close', () => {
  detailController?.abort(); // nobody is looking any more, so stop the request
  detail = { status: 'closed', id: null, product: null, error: null };
  renderDetail();

  // Return focus to the card that opened the dialog, but only if focus is actually lost.
  // The `close` event fires asynchronously, so the user may already have moved focus
  // somewhere else (e.g. pressed "/"). Don't yank it back.
  const active = document.activeElement;
  const focusIsLost = !active || active === document.body || els.detail.contains(active);
  if (focusIsLost && lastDetailTrigger?.isConnected) lastDetailTrigger.focus();
});

els.detailClose.addEventListener('click', () => els.detail.close());

// Clicking the dimmed backdrop (the <dialog> element itself, outside its content) closes it.
els.detail.addEventListener('click', (event) => {
  if (event.target === els.detail) els.detail.close();
});

els.detailBody.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="retry-detail"]') && detail.id !== null) {
    loadDetail(detail.id);
  }
});

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

const debouncedSearch = debounce((query) => {
  if (query === list.query && list.status === 'success') return; // e.g. only a space was added
  loadProducts({ query, page: 0 });
}, SEARCH_DELAY_MS);

els.searchInput.addEventListener('input', (event) => {
  debouncedSearch(event.target.value.trim());
});

// Enter searches immediately, and the pending debounced call is dropped.
els.searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  debouncedSearch.cancel();
  loadProducts({ query: els.searchInput.value.trim(), page: 0 });
});

els.retry.addEventListener('click', () => {
  loadProducts({ query: list.query, page: list.page });
});

els.simulateFailure.addEventListener('change', () => {
  loadProducts({ query: list.query, page: list.page });
});

els.prev.addEventListener('click', () => {
  loadProducts({ page: list.page - 1, focusResults: true });
});

els.next.addEventListener('click', () => {
  loadProducts({ page: list.page + 1, focusResults: true });
});

// Delegation: one listener handles every product card, whatever page is showing.
els.results.addEventListener('click', (event) => {
  const card = event.target.closest('[data-product-id]');
  if (card) openDetail(card.dataset.productId, card);
});

// "/" jumps to the search box, unless the user is already typing somewhere.
document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
  if (els.detail.open) return;
  event.preventDefault(); // otherwise "/" is typed into the box
  els.searchInput.focus();
});

// ---------------------------------------------------------------------------
// Start: restore the search from the URL, then load
// ---------------------------------------------------------------------------

const params = new URLSearchParams(window.location.search);
const initialQuery = (params.get('q') ?? '').trim();
const initialPage = Math.max(0, (Number.parseInt(params.get('page') ?? '1', 10) || 1) - 1);

els.searchInput.value = initialQuery;
loadProducts({ query: initialQuery, page: initialPage });
