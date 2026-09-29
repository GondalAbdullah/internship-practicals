/**
 * Debounce: run `fn` only after `delay` ms have passed with no new calls.
 * It is a closure: the returned function remembers its private `timerId` between calls.
 * `.cancel()` drops a pending call (used when Enter triggers an immediate search).
 */
export function debounce(fn, delay) {
  let timerId = null;

  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      fn.apply(this, args);
    }, delay);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
  };

  return debounced;
}

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(value) {
  return priceFormatter.format(value);
}

export function formatRating(value) {
  return `${Number(value).toFixed(1)} / 5`;
}
