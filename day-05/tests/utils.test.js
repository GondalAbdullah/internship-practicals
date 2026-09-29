// Debounce behaviour, tested with Node's mock timers (no real waiting).
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

import { debounce, formatPrice, formatRating } from '../03-live-data/js/utils.js';

test('debounce runs once, with the last arguments, after the calls stop', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const calls = [];
  const search = debounce((query) => calls.push(query), 300);

  search('r');
  search('re');
  search('react');
  mock.timers.tick(299);
  assert.deepEqual(calls, [], 'nothing runs before the delay');

  mock.timers.tick(1);
  assert.deepEqual(calls, ['react']);
  mock.timers.reset();
});

test('debounce.cancel drops the pending call', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const calls = [];
  const search = debounce((query) => calls.push(query), 300);

  search('phone');
  search.cancel();
  mock.timers.tick(1000);
  assert.deepEqual(calls, []);
  mock.timers.reset();
});

test('formatters', () => {
  assert.equal(formatPrice(9.5), '$9.50');
  assert.equal(formatRating(4.56), '4.6 / 5');
});
