/**
 * Pure task functions (Day 4 style): no DOM, no storage, no clock, no randomness.
 * Every function takes data in and returns NEW data out; nothing is mutated.
 * That is what makes them trivially testable (see tests/tasks.test.js).
 */

export const FILTERS = Object.freeze(['all', 'active', 'done']);
export const MAX_TITLE_LENGTH = 100;

/**
 * Returns a human-readable error message, or null when the title is valid.
 * `ignoreId` lets an edit keep its own title without tripping the duplicate check.
 */
export function validateTitle(title, { tasks = [], ignoreId = null } = {}) {
  const trimmed = String(title ?? '').trim();

  if (trimmed === '') return 'Task title is required.';
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `Keep it under ${MAX_TITLE_LENGTH} characters (currently ${trimmed.length}).`;
  }

  const isDuplicate = tasks.some(
    (task) => task.id !== ignoreId && task.title.toLowerCase() === trimmed.toLowerCase(),
  );
  if (isDuplicate) return 'You already have a task with that title.';

  return null;
}

/** The id and timestamp are passed in, so this function stays pure and testable. */
export function createTask(title, { id, now }) {
  return { id, title: title.trim(), done: false, createdAt: now };
}

export function addTask(tasks, task) {
  return [...tasks, task];
}

export function toggleTask(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

export function renameTask(tasks, id, title) {
  return tasks.map((task) => (task.id === id ? { ...task, title: title.trim() } : task));
}

export function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function clearCompleted(tasks) {
  return tasks.filter((task) => !task.done);
}

export function visibleTasks(tasks, filter) {
  if (filter === 'active') return tasks.filter((task) => !task.done);
  if (filter === 'done') return tasks.filter((task) => task.done);
  return tasks;
}

export function countRemaining(tasks) {
  return tasks.filter((task) => !task.done).length;
}

export function isValidFilter(filter) {
  return FILTERS.includes(filter);
}
