'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync('ui-refinement-v5.js', 'utf8');

function classList(initial = []) {
  const values = new Set(initial);
  return {
    contains: (name) => values.has(name),
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    toggle(name, force) {
      if (force === true) values.add(name);
      else if (force === false) values.delete(name);
      else if (values.has(name)) values.delete(name);
      else values.add(name);
      return values.has(name);
    }
  };
}

const state = {
  matches: [
    { id: 'locked-match', matchday: 1, home: { name: 'Locked FC' }, away: { name: 'Open FC' } },
    { id: 'team-locked-match', matchday: 1, home: { name: 'Team Lock FC' }, away: { name: 'Other FC' } },
    { id: 'open-match', matchday: 1, home: { name: 'Free FC' }, away: { name: 'Free Away' } }
  ],
  scores: {
    'locked-match': { homeGoals: 2, awayGoals: 1, source: 'manual', model: { marker: 'locked' } },
    'team-locked-match': { homeGoals: 1, awayGoals: 0, source: 'manual', model: { marker: 'team-locked' } },
    'open-match': { homeGoals: 0, awayGoals: 0, source: 'old-ai' }
  },
  matchLocks: { 'locked-match': true },
  teamLocks: { 'Team Lock FC': true }
};

let clickHandler = null;
let restoredEvent = null;

const body = {
  dataset: {},
  classList: classList(),
  appendChild() {},
  contains() { return false; }
};

const document = {
  body,
  fonts: null,
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement(tag) {
    return {
      tagName: String(tag).toUpperCase(),
      className: '',
      dataset: {},
      style: {},
      hidden: false,
      disabled: false,
      textContent: '',
      classList: classList(),
      setAttribute() {},
      appendChild() {},
      addEventListener() {}
    };
  },
  addEventListener(type, handler, capture) {
    if (type === 'click' && capture === true) clickHandler = handler;
  }
};

class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

class MutationObserver {
  constructor(callback) { this.callback = callback; }
  observe() {}
  disconnect() {}
}

const AI = {
  getState: () => state,
  predictAll(target) {
    target.scores = {
      'locked-match': { homeGoals: 6, awayGoals: 6, source: 'ai-overwrite' },
      'team-locked-match': { homeGoals: 5, awayGoals: 5, source: 'ai-overwrite' },
      'open-match': { homeGoals: 3, awayGoals: 2, source: 'new-ai' }
    };
    target.matchLocks = {};
    target.teamLocks = {};
    return target;
  }
};

const window = {
  UCLDRAW_PREDICTION_AI: AI,
  UCLDRAW_DISABLE_LEGACY_SHARE_UI: true,
  requestAnimationFrame(callback) { callback(); return 1; },
  setInterval() { return 1; },
  clearInterval() {},
  setTimeout() { return 1; },
  addEventListener() {},
  dispatchEvent(event) {
    if (event.type === 'ucldraw:ai-predictions-restored-locks') restoredEvent = event;
  }
};

const context = vm.createContext({
  window,
  document,
  MutationObserver,
  CustomEvent,
  IntersectionObserver: undefined,
  console
});

vm.runInContext(source, context, { filename: 'ui-refinement-v5.js' });
assert.equal(typeof clickHandler, 'function', 'UI refinement must register a capture-phase click handler.');

const button = {
  dataset: {},
  disabled: false,
  textContent: 'Yapay Zeka Tahmini'
};

const event = {
  target: {
    closest(selector) {
      return selector === '.prediction-ai-button' ? button : null;
    }
  },
  preventDefaultCalled: false,
  stopImmediatePropagationCalled: false,
  preventDefault() { this.preventDefaultCalled = true; },
  stopImmediatePropagation() { this.stopImmediatePropagationCalled = true; }
};

clickHandler(event);

assert.deepEqual(
  state.scores['locked-match'],
  { homeGoals: 2, awayGoals: 1, source: 'manual', model: { marker: 'locked' } },
  'Explicitly locked match score must survive a full AI rerun.'
);
assert.deepEqual(
  state.scores['team-locked-match'],
  { homeGoals: 1, awayGoals: 0, source: 'manual', model: { marker: 'team-locked' } },
  'A score involving a locked team must survive a full AI rerun.'
);
assert.deepEqual(
  state.scores['open-match'],
  { homeGoals: 3, awayGoals: 2, source: 'new-ai' },
  'Unlocked matches must still receive the new AI prediction.'
);
assert.equal(state.matchLocks['locked-match'], true, 'Explicit match lock must be restored after AI prediction.');
assert.equal(state.teamLocks['Team Lock FC'], true, 'Team lock must be restored after AI prediction.');
assert.equal(event.preventDefaultCalled, true, 'Capture handler must block the legacy AI click handler.');
assert.equal(event.stopImmediatePropagationCalled, true, 'Capture handler must stop duplicate AI execution.');
assert.equal(button.disabled, false, 'AI button must be re-enabled after prediction.');
assert.equal(button.textContent, 'Yapay Zeka Tahmini');
assert.equal(restoredEvent?.detail?.protectedMatches, 2, 'Restoration event must report both protected scores.');

console.log('AI runtime lock-preservation regression checks passed.');
