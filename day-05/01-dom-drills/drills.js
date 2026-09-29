/**
 * Day 5 · Task 1: DOM drills.
 * Each drill is set up by its own init function so the drills stay independent.
 */

// ---------------------------------------------------------------------------
// Drill 1: select and restyle every second row of a table
// ---------------------------------------------------------------------------

function initStripeDrill() {
  const toggle = document.getElementById('stripe-toggle');
  const table = document.getElementById('orders-table');

  toggle.addEventListener('click', () => {
    const isOn = toggle.getAttribute('aria-pressed') === 'true';

    // querySelectorAll returns a STATIC NodeList, so it is safe to loop over while we change
    // classes. Styling lives in CSS (.is-striped); JavaScript only says which rows are striped.
    table.querySelectorAll('tbody tr:nth-child(even)').forEach((row) => {
      row.classList.toggle('is-striped', !isOn);
    });

    toggle.setAttribute('aria-pressed', String(!isOn));
    toggle.textContent = isOn ? 'Stripe rows' : 'Remove stripes';
  });
}

// ---------------------------------------------------------------------------
// Drill 2: build a list from an array of objects
// ---------------------------------------------------------------------------

const TEAM = [
  { id: 1, name: 'Sara Malik', role: 'Frontend engineer', joined: '2024-03-11', active: true },
  { id: 2, name: 'Bilal Ahmed', role: 'Backend engineer', joined: '2023-08-02', active: true },
  { id: 3, name: 'Hina Raza', role: 'QA engineer', joined: '2025-01-20', active: false },
  { id: 4, name: 'Ayesha Khan', role: 'Engineering manager', joined: '2021-11-15', active: true },
  { id: 5, name: 'Omar Farooq', role: 'DevOps engineer', joined: '2024-09-30', active: true },
];

/** Parse "YYYY-MM-DD" as a LOCAL date. `new Date('2024-03-11')` would be UTC midnight. */
function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function createMemberItem(member) {
  const item = document.createElement('li');
  item.className = 'team-list__item';
  item.dataset.memberId = String(member.id);
  item.classList.toggle('is-inactive', !member.active);

  const name = document.createElement('strong');
  name.className = 'team-list__name';
  name.textContent = member.name; // textContent: data is always treated as text, never markup

  const role = document.createElement('span');
  role.className = 'team-list__role';
  role.textContent = member.role;

  const joined = document.createElement('time');
  joined.className = 'team-list__joined';
  joined.dateTime = member.joined;
  joined.textContent = `Joined ${formatDate(member.joined)}`;

  item.append(name, role, joined);

  if (!member.active) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'On leave';
    item.append(badge);
  }

  return item;
}

function initTeamDrill() {
  const list = document.getElementById('team-list');
  const summary = document.getElementById('team-summary');

  // Sort a COPY; Array#sort mutates in place and TEAM should stay untouched.
  const sorted = [...TEAM].sort((a, b) => a.name.localeCompare(b.name));

  // Build everything off-screen, then touch the live DOM once (one reflow, not five).
  const fragment = document.createDocumentFragment();
  sorted.forEach((member) => fragment.append(createMemberItem(member)));
  list.replaceChildren(fragment);

  const activeCount = TEAM.filter((member) => member.active).length;
  summary.textContent = `${TEAM.length} team members, ${activeCount} active.`;
}

// ---------------------------------------------------------------------------
// Drill 3: a button that removes its own parent card, via event delegation
// ---------------------------------------------------------------------------

function initCardDrill() {
  const grid = document.getElementById('card-grid');
  const addButton = document.getElementById('add-card');
  const emptyMessage = document.getElementById('cards-empty');
  let cardsCreated = 0;

  function createCard() {
    cardsCreated += 1;

    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.cardId = String(cardsCreated);

    const title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = `Card ${cardsCreated}`;

    const body = document.createElement('p');
    body.textContent = 'Created at ' + new Date().toLocaleTimeString();

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn-small btn-danger';
    remove.dataset.action = 'remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove card ${cardsCreated}`);

    card.append(title, body, remove);
    return card;
  }

  function updateEmptyState() {
    emptyMessage.hidden = grid.children.length > 0;
  }

  // ONE listener on the stable parent. Clicks on any card's button bubble up to here,
  // so cards added later work automatically and nothing needs re-attaching.
  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="remove"]');
    if (!button || !grid.contains(button)) return;

    button.closest('.card').remove();
    updateEmptyState();
    addButton.focus(); // the focused button no longer exists; give focus somewhere sensible
  });

  addButton.addEventListener('click', () => {
    grid.append(createCard());
    updateEmptyState();
  });

  grid.append(createCard(), createCard(), createCard());
  updateEmptyState();
}

// ---------------------------------------------------------------------------
// Drill 4: tabs and accordion, no library
// ---------------------------------------------------------------------------

function initTabs(tablist) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  function selectTab(selected) {
    tabs.forEach((tab) => {
      const isSelected = tab === selected;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1; // "roving tabindex": only the active tab is in Tab order
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
    });
  }

  tablist.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) selectTab(tab);
  });

  tablist.addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;

    const keyToIndex = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in keyToIndex)) return;

    event.preventDefault(); // stop Home/End from scrolling the page
    const next = tabs[keyToIndex[event.key]];
    next.focus();
    selectTab(next);
  });
}

function initAccordion(root) {
  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('button[aria-expanded]');
    if (!trigger || !root.contains(trigger)) return;

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!isExpanded));
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = isExpanded;
  });
}

// ---------------------------------------------------------------------------

initStripeDrill();
initTeamDrill();
initCardDrill();
initTabs(document.getElementById('phase-tabs'));
initAccordion(document.getElementById('faq'));
