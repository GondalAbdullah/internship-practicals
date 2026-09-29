/**
 * Day 5 · Task 2: the interactive task manager.
 *
 * The one rule this file follows:  event → new state → render(state).
 * Handlers never edit the DOM directly. They compute new state with the pure functions in
 * tasks.js and call setState(). render() is the ONLY function that writes to the list, so
 * the screen can never drift out of sync with the data.
 */

import * as Tasks from './tasks.js';
import { loadState, saveState, STORAGE_KEY } from './storage.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const saved = loadState();

let state = {
  // durable (saved to localStorage)
  tasks: saved?.tasks ?? [],
  filter: saved?.filter ?? 'all',
  // UI-only (never saved)
  formError: null,
  editingId: null,
  editDraft: null,
  editError: null,
  storageFailed: false,
};

/** A CSS selector to focus after the next render. Focus is managed on purpose, not by accident. */
let focusAfterRender = null;

function setState(patch) {
  const previous = state;
  state = { ...state, ...patch };

  if (state.tasks !== previous.tasks || state.filter !== previous.filter) {
    const ok = saveState({ tasks: state.tasks, filter: state.filter });
    state = { ...state, storageFailed: !ok };
  }

  render();
}

// ---------------------------------------------------------------------------
// Elements (looked up once)
// ---------------------------------------------------------------------------

const els = {
  form: document.getElementById('task-form'),
  input: document.getElementById('task-title'),
  formError: document.getElementById('task-error'),
  list: document.getElementById('task-list'),
  empty: document.getElementById('empty-state'),
  summary: document.getElementById('summary'),
  filters: document.getElementById('filters'),
  clearDone: document.getElementById('clear-done'),
  storageWarning: document.getElementById('storage-warning'),
};

// ---------------------------------------------------------------------------
// Rendering: the interface is a function of state
// ---------------------------------------------------------------------------

function emptyMessage() {
  if (state.tasks.length === 0) return 'No tasks yet. Add your first one above.';
  if (state.filter === 'active') return 'Nothing left to do. Every task is complete.';
  if (state.filter === 'done') return 'No completed tasks yet.';
  return '';
}

function render() {
  const visible = Tasks.visibleTasks(state.tasks, state.filter);

  // List: rebuilt from state in one DOM operation.
  els.list.replaceChildren(...visible.map(createTaskElement));

  // Empty state is a real state, not a missing one.
  els.empty.hidden = visible.length > 0;
  els.empty.textContent = emptyMessage();

  // Summary and bulk action.
  const remaining = Tasks.countRemaining(state.tasks);
  els.summary.textContent =
    state.tasks.length === 0 ? '' : `${remaining} of ${state.tasks.length} remaining`;
  els.clearDone.hidden = !state.tasks.some((task) => task.done);

  // Add-form validation.
  els.formError.textContent = state.formError ?? '';
  els.input.setAttribute('aria-invalid', String(Boolean(state.formError)));

  // Filter buttons reflect state through aria-pressed (CSS styles it).
  els.filters.querySelectorAll('[data-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === state.filter));
  });

  els.storageWarning.hidden = !state.storageFailed;

  if (focusAfterRender) {
    const target = document.querySelector(focusAfterRender);
    focusAfterRender = null;
    if (target) {
      target.focus();
      if (target.tagName === 'INPUT' && target.type === 'text') {
        target.setSelectionRange(target.value.length, target.value.length); // caret at the end
      }
    }
  }
}

function createButton(text, action, label, className = 'btn-small') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.action = action;
  button.textContent = text;
  if (label) button.setAttribute('aria-label', label);
  return button;
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = 'task';
  item.dataset.taskId = task.id;
  item.classList.toggle('is-done', task.done);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task__checkbox';
  checkbox.id = `task-${task.id}`;
  checkbox.checked = task.done;
  checkbox.dataset.action = 'toggle';

  if (state.editingId === task.id) {
    checkbox.disabled = true;
    item.append(checkbox, createEditForm(task));
    return item;
  }

  const title = document.createElement('label');
  title.className = 'task__title';
  title.htmlFor = checkbox.id;
  title.textContent = task.title; // user text → textContent, never innerHTML

  const actions = document.createElement('div');
  actions.className = 'task__actions';
  actions.append(
    createButton('Edit', 'edit', `Edit "${task.title}"`),
    createButton('Delete', 'delete', `Delete "${task.title}"`, 'btn-small btn-danger'),
  );

  item.append(checkbox, title, actions);
  return item;
}

function createEditForm(task) {
  const form = document.createElement('form');
  form.className = 'task__edit';
  form.dataset.role = 'edit-form';
  form.noValidate = true;

  const inputId = `edit-${task.id}`;
  const errorId = `edit-error-${task.id}`;

  const label = document.createElement('label');
  label.className = 'visually-hidden';
  label.htmlFor = inputId;
  label.textContent = 'Task title';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = inputId;
  input.name = 'title';
  input.autocomplete = 'off';
  input.dataset.role = 'edit-input';
  input.value = state.editDraft ?? task.title;
  input.setAttribute('aria-describedby', errorId);
  input.setAttribute('aria-invalid', String(Boolean(state.editError)));

  const save = document.createElement('button');
  save.type = 'submit';
  save.className = 'btn-small btn-primary';
  save.textContent = 'Save';

  const cancel = createButton('Cancel', 'cancel-edit');

  const error = document.createElement('p');
  error.id = errorId;
  error.className = 'field-error task__edit-error';
  error.setAttribute('role', 'alert');
  error.textContent = state.editError ?? '';

  form.append(label, input, save, cancel, error);
  return form;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function newId() {
  // crypto.randomUUID only exists in secure contexts (https or localhost).
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function taskSelector(id) {
  return `[data-task-id="${CSS.escape(id)}"]`;
}

function startEditing(id) {
  focusAfterRender = '[data-role="edit-input"]';
  setState({ editingId: id, editDraft: null, editError: null });
}

function cancelEditing() {
  const id = state.editingId;
  focusAfterRender = `${taskSelector(id)} [data-action="edit"]`;
  setState({ editingId: null, editDraft: null, editError: null });
}

function saveEdit(id, value) {
  const error = Tasks.validateTitle(value, { tasks: state.tasks, ignoreId: id });
  if (error) {
    focusAfterRender = '[data-role="edit-input"]';
    setState({ editDraft: value, editError: error }); // keep what they typed
    return;
  }
  focusAfterRender = `${taskSelector(id)} [data-action="edit"]`;
  setState({
    tasks: Tasks.renameTask(state.tasks, id, value),
    editingId: null,
    editDraft: null,
    editError: null,
  });
}

function deleteTask(id) {
  const visible = Tasks.visibleTasks(state.tasks, state.filter);
  const index = visible.findIndex((task) => task.id === id);
  const neighbour = visible[index + 1] ?? visible[index - 1];

  // The focused Delete button is about to disappear. Move focus to the next task, or the input.
  focusAfterRender = neighbour
    ? `${taskSelector(neighbour.id)} [data-action="delete"]`
    : '#task-title';

  setState({ tasks: Tasks.removeTask(state.tasks, id) });
}

// ---------------------------------------------------------------------------
// Events: listen on stable parents (delegation), never inside render()
// ---------------------------------------------------------------------------

els.form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the browser's default full-page submit and reload

  const title = els.input.value;
  const error = Tasks.validateTitle(title, { tasks: state.tasks });
  if (error) {
    focusAfterRender = '#task-title';
    setState({ formError: error });
    return;
  }

  const task = Tasks.createTask(title, { id: newId(), now: Date.now() });
  els.form.reset();
  setState({
    tasks: Tasks.addTask(state.tasks, task),
    formError: null,
    // A new task is never "done", so leave the Done filter or the user won't see it appear.
    filter: state.filter === 'done' ? 'all' : state.filter,
  });
});

// Clear the error as soon as the user starts fixing it.
els.input.addEventListener('input', () => {
  if (state.formError) setState({ formError: null });
});

els.list.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action]');
  if (!trigger || !els.list.contains(trigger)) return;

  const id = trigger.closest('[data-task-id]')?.dataset.taskId;
  if (!id) return;

  switch (trigger.dataset.action) {
    case 'toggle':
      focusAfterRender = `#task-${CSS.escape(id)}`;
      setState({ tasks: Tasks.toggleTask(state.tasks, id) });
      break;
    case 'edit':
      startEditing(id);
      break;
    case 'cancel-edit':
      cancelEditing();
      break;
    case 'delete':
      deleteTask(id);
      break;
    default:
      break;
  }
});

// `submit` bubbles, so the edit forms (created and destroyed by render) are handled here too.
els.list.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-role="edit-form"]');
  if (!form) return;
  event.preventDefault();

  const id = form.closest('[data-task-id]').dataset.taskId;
  saveEdit(id, form.elements.title.value);
});

els.list.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && event.target.dataset.role === 'edit-input') {
    cancelEditing();
  }
});

els.filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button || !Tasks.isValidFilter(button.dataset.filter)) return;
  setState({ filter: button.dataset.filter, editingId: null, editDraft: null, editError: null });
});

els.clearDone.addEventListener('click', () => {
  focusAfterRender = '#task-title';
  setState({ tasks: Tasks.clearCompleted(state.tasks) });
});

// Another tab changed the saved tasks: adopt them without saving again (avoids a ping-pong loop).
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  const latest = loadState();
  state = {
    ...state,
    tasks: latest?.tasks ?? [],
    filter: latest?.filter ?? 'all',
    editingId: null,
    editDraft: null,
    editError: null,
  };
  render();
});

render();
