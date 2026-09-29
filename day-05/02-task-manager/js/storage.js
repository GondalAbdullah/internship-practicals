/**
 * Persisting state to localStorage.
 *
 * - localStorage stores STRINGS only, so state is serialised with JSON.
 * - Anything read back is treated as untrusted input: it may be corrupted, edited by hand
 *   in DevTools, or saved by an older version of the app. It is validated before use.
 * - Reads and writes can throw (quota exceeded, storage disabled in some private modes),
 *   so both are wrapped. A storage failure should never turn into a white screen.
 * - The key carries a version. If the saved shape ever changes, bump it to v2 and migrate.
 */

import { isValidFilter } from './tasks.js';

export const STORAGE_KEY = 'day05.task-manager.v1';

function isValidTask(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.done === 'boolean' &&
    typeof value.createdAt === 'number'
  );
}

/** Returns { tasks, filter } or null when nothing usable is stored. */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tasks)) return null;

    return {
      tasks: parsed.tasks.filter(isValidTask),
      filter: isValidFilter(parsed.filter) ? parsed.filter : 'all',
    };
  } catch (error) {
    console.warn('Saved tasks could not be read; starting fresh.', error);
    return null;
  }
}

/** Only durable data is saved. UI-only state (what is being edited, errors) is not. */
export function saveState({ tasks, filter }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, filter }));
    return true;
  } catch (error) {
    console.error('Tasks could not be saved.', error);
    return false;
  }
}
