'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync('prediction-lock-fix-v2.js', 'utf8');

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
  teamLocks: { 'Team Lock FC': true },
  activeMatchdays: { 1: true },
  rerollVersion: { 1: 4 },
  aiPredictionVersion: 1,
  seed: 'seed',
  comp: { id: 'ucl' }
};

let legacySetManualCalls = 0;
let legacyPredictAllCalls = 0;
let appliedEvent = null;

const legacyEngine = {
  setManualScore(target, matchId) {
    legacySetManualCalls += 1;
    target.scores[matchId] = { homeGoals: 9, awayGoals: 9, source: 'legacy' };
    for (const match of target.matches) target.scores[match.id] = { homeGoals: 8, awayGoals: 8, source: 'legacy-reroll' };
    return target.scores[matchId];
  }
};

const legacyAI = {
  getState: () => state,
  predictAll(target) {
    legacyPredictAllCalls += 1;
    target.scores = {
      'locked-match': { homeGoals: 6, awayGoals: 6, source: 'legacy-ai' },
      'team-locked-match': { homeGoals: 5, awayGoals: 5, source: 'legacy-ai' },
      'open-match': { homeGoals: 4, awayGoals: 4, source: 'legacy-ai' }
    };
    target.matchLocks = {};
    target.teamLocks = {};
    return target;
  }
};

const homeAdvantageModel = {
  simulateMatchday(target, matchday) {
    target.activeMatchdays[matchday] = true;
    target.rerollVersion[matchday] = Number(target.rerollVersion[matchday] || 0) + 1;
    for (const match of target.matches.filter((candidate) => candidate.matchday === matchday)) {
      const protectedResult = Boolean(target.scores[match.id] && (
        target.matchLocks[match.id]
        || target.teamLocks[match.home.name]
        || target.teamLocks[match.away.name]
      ));
      if (protectedResult) continue;
      target.scores[match.id] = { homeGoals: 3, awayGoals: 2, source: 'new-ai' };
    }
  }
};

const body = {};
const document = {
  body,
  addEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; }
};

class MutationObserver {
  constructor(callback) { this.callback = callback; }
  observe() {}
}

class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

const window = {
  UCLDRAW_PREDICTION_ENGINE: legacyEngine,
  UCLDRAW_PREDICTION_AI: legacyAI,
  UCLDRAW_HOME_ADVANTAGE_MODEL: homeAdvantageModel,
  requestAnimationFrame(callback) { callback(); return 1; },
  addEventListener() {},
  dispatchEvent(event) {
    if (event.type === 'ucldraw:ai-predictions-applied') appliedEvent = event;
  }
};

const context = vm.createContext({
  window,
  document,
  MutationObserver,
  CustomEvent,
  console,
  Number,
  Object,
  Math
});

vm.runInContext(source, context, { filename: 'prediction-lock-fix-v2.js' });

assert.equal(window.UCLDRAW_PREDICTION_ENGINE.__stableMatchLock, true);
assert.equal(window.UCLDRAW_PREDICTION_AI.__stableLockPrediction, true);

const otherBeforeManual = { ...state.scores['locked-match'] };
const manual = window.UCLDRAW_PREDICTION_ENGINE.setManualScore(state, 'open-match', 4, 1);
assert.equal(legacySetManualCalls, 0, 'Locking a score must not call the legacy full-matchday reroll path.');
assert.deepEqual(manual, { homeGoals: 4, awayGoals: 1, source: 'user-score' });
assert.equal(state.matchLocks['open-match'], true, 'Manual score must become explicitly locked.');
assert.deepEqual(state.scores['locked-match'], otherBeforeManual, 'Locking one match must not reroll another match.');

// Re-open this fixture so the full-AI test has one deliberately unlocked score.
delete state.matchLocks['open-match'];
state.scores['open-match'] = { homeGoals: 0, awayGoals: 0, source: 'old-ai' };

window.UCLDRAW_PREDICTION_AI.predictAll(state);

assert.equal(legacyPredictAllCalls, 0, 'Stable AI prediction must not call the legacy reset-all path when the adjusted model is available.');

const lockedScore = state.scores['locked-match'];
assert.equal(lockedScore.homeGoals, 2, 'Explicitly locked home score must survive a full AI rerun.');
assert.equal(lockedScore.awayGoals, 1, 'Explicitly locked away score must survive a full AI rerun.');
assert.equal(lockedScore.source, 'manual');
assert.equal(lockedScore.model?.marker, 'locked');

const teamLockedScore = state.scores['team-locked-match'];
assert.equal(teamLockedScore.homeGoals, 1, 'Team-locked home score must survive a full AI rerun.');
assert.equal(teamLockedScore.awayGoals, 0, 'Team-locked away score must survive a full AI rerun.');
assert.equal(teamLockedScore.source, 'manual');
assert.equal(teamLockedScore.model?.marker, 'team-locked');

const openScore = state.scores['open-match'];
assert.equal(openScore.homeGoals, 3, 'Unlocked home score must receive the new AI prediction.');
assert.equal(openScore.awayGoals, 2, 'Unlocked away score must receive the new AI prediction.');
assert.equal(openScore.source, 'new-ai');

assert.equal(state.matchLocks['locked-match'], true, 'Explicit match lock must remain present throughout AI prediction.');
assert.equal(state.teamLocks['Team Lock FC'], true, 'Team lock must remain present throughout AI prediction.');
assert.equal(appliedEvent?.detail?.mode, 'all-preserve-locks');
assert.equal(appliedEvent?.detail?.lockFixVersion, 2);

assert.match(source, /stateLabel\.textContent = 'Tahmin edildi'/, 'Locked copy should be reduced to the button icon, not a second lock label.');
assert.match(source, /button\.textContent = locked \? '🔒' : 'Kilitle'/);

console.log('Stable AI lock-preservation and no-reroll regression checks passed.');
