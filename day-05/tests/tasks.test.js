// Run with:  npm test   (uses Node's built-in test runner, no dependencies)
import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as Tasks from '../02-task-manager/js/tasks.js';

const sample = () => [
  { id: 'a', title: 'Buy milk', done: false, createdAt: 1 },
  { id: 'b', title: 'Write notes', done: true, createdAt: 2 },
  { id: 'c', title: 'Push commits', done: false, createdAt: 3 },
];

test('validateTitle rejects empty and whitespace-only titles', () => {
  assert.equal(Tasks.validateTitle(''), 'Task title is required.');
  assert.equal(Tasks.validateTitle('   '), 'Task title is required.');
  assert.equal(Tasks.validateTitle(undefined), 'Task title is required.');
});

test('validateTitle enforces the maximum length after trimming', () => {
  assert.equal(Tasks.validateTitle('x'.repeat(Tasks.MAX_TITLE_LENGTH)), null);
  assert.match(Tasks.validateTitle('x'.repeat(Tasks.MAX_TITLE_LENGTH + 1)), /under 100/);
  assert.equal(Tasks.validateTitle(`  ${'x'.repeat(Tasks.MAX_TITLE_LENGTH)}  `), null);
});

test('validateTitle rejects case-insensitive duplicates but allows a task to keep its own title', () => {
  const tasks = sample();
  assert.match(Tasks.validateTitle('buy MILK', { tasks }), /already have/);
  assert.equal(Tasks.validateTitle('Buy milk', { tasks, ignoreId: 'a' }), null);
});

test('createTask trims the title and starts not done', () => {
  assert.deepEqual(Tasks.createTask('  Call Ali  ', { id: 'z', now: 42 }), {
    id: 'z',
    title: 'Call Ali',
    done: false,
    createdAt: 42,
  });
});

test('addTask, toggleTask, renameTask and removeTask never mutate their input', () => {
  const original = sample();
  const snapshot = structuredClone(original);

  const added = Tasks.addTask(original, { id: 'd', title: 'New', done: false, createdAt: 4 });
  const toggled = Tasks.toggleTask(original, 'a');
  const renamed = Tasks.renameTask(original, 'a', '  Buy oat milk ');
  const removed = Tasks.removeTask(original, 'b');

  assert.deepEqual(original, snapshot, 'input array must be unchanged');
  assert.equal(added.length, 4);
  assert.equal(toggled.find((t) => t.id === 'a').done, true);
  assert.equal(renamed.find((t) => t.id === 'a').title, 'Buy oat milk');
  assert.deepEqual(removed.map((t) => t.id), ['a', 'c']);
  assert.notEqual(toggled[0], original[0], 'changed task is a new object');
  assert.equal(toggled[1], original[1], 'unchanged tasks are reused');
});

test('visibleTasks filters by status', () => {
  const tasks = sample();
  assert.deepEqual(Tasks.visibleTasks(tasks, 'all').map((t) => t.id), ['a', 'b', 'c']);
  assert.deepEqual(Tasks.visibleTasks(tasks, 'active').map((t) => t.id), ['a', 'c']);
  assert.deepEqual(Tasks.visibleTasks(tasks, 'done').map((t) => t.id), ['b']);
});

test('clearCompleted and countRemaining', () => {
  const tasks = sample();
  assert.deepEqual(Tasks.clearCompleted(tasks).map((t) => t.id), ['a', 'c']);
  assert.equal(Tasks.countRemaining(tasks), 2);
  assert.equal(Tasks.countRemaining([]), 0);
});

test('isValidFilter only accepts known filters', () => {
  assert.equal(Tasks.isValidFilter('active'), true);
  assert.equal(Tasks.isValidFilter('archived'), false);
  assert.equal(Tasks.isValidFilter(undefined), false);
});
