'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const controller = fs.readFileSync(path.join(root, 'prediction-ai-controller.js'), 'utf8');
const community = fs.readFileSync(path.join(root, 'prediction-community.js'), 'utf8');
const shareV4 = fs.readFileSync(path.join(root, 'prediction-share-v4.js'), 'utf8');
const predictionUi = fs.readFileSync(path.join(root, 'prediction-ui.js'), 'utf8');

const home = { name: 'Home FC', poolSlug: 'home', country: 'TUR', coefficient: 70, pot: 2 };
const away = { name: 'Away FC', poolSlug: 'away', country: 'ENG', coefficient: 80, pot: 1 };
const third = { name: 'Third FC', poolSlug: 'third', country: 'ESP', coefficient: 60, pot: 3 };

const base = {
  createState() {
    return {
      comp: { id: 'ucl', potCount: 4, teams: [home, away, third] },
      seed: 'finish-missing-test',
      matches: [
        { id: 'm1', matchday: 1, home, away },
        { id: 'm2', matchday: 2, home: third }
      ],
      scores: {},
      matchLocks: {},
      teamLocks: {},
      activeMatchdays: {},
      rerollVersion: { 1: 0, 2: 0 }
    };
  },
  applyOutcome() {},
  applyPoints() {},
  setManualScore() {},
  simulateMatchday() {}
};

class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

const events = [];
const context = {
  window: {
    UCLDRAW_PREDICTION_ENGINE: base,
    dispatchEvent(event) { events.push(event); }
  },
  CustomEvent,
  console,
  Math,
  Object,
  Number,
  String,
  Boolean,
  Array,
  Map,
  Set,
  JSON
};

vm.runInNewContext(controller, context, { filename: 'prediction-ai-controller.js' });
const engine = context.window.UCLDRAW_PREDICTION_ENGINE;
const ai = context.window.UCLDRAW_PREDICTION_AI;
const state = engine.createState();
state.scores.m1 = { homeGoals: 3, awayGoals: 1, source: 'user-outcome' };
const original = JSON.stringify(state.scores.m1);

ai.predictMissing(state);

assert.equal(JSON.stringify(state.scores.m1), original, 'Finish AI fill must preserve an existing user prediction.');
assert.ok(state.scores.m2, 'Finish AI fill must create a score for a missing prediction.');
assert.match(state.scores.m2.source, /^model/);
assert.equal(state.scores.m2.model.fillMode, 'missing');
assert.equal(state.aiPredictionVersion, 1);
assert.ok(events.some((event) => event.type === 'ucldraw:ai-predictions-applied' && event.detail?.mode === 'missing'));

assert.match(community, /matches\.filter\(\(match\) => state\?\.scores\?\.\[match\.id\]\)/);
assert.doesNotMatch(community, /state\.matchLocks/);
assert.match(community, /if \(!progress\.done\)[\s\S]*ai\.predictMissing\(state\)/);
assert.match(community, /session\.refresh\?\.\(\)/);
assert.match(shareV4, /createActionButton\('Bitir'/);
assert.match(shareV4, /Yapay Zeka Tahmini/);
assert.match(shareV4, /row\.append\(aiButton, shareButton\)/);
assert.match(shareV4, /finishCurrentPrediction/);
assert.doesNotMatch(shareV4, /shareButton\.hidden = !complete/);
assert.match(predictionUi, /matches\.every\(\(match\) => predictionState\?\.scores\?\.\[match\.id\]\)/);
assert.match(predictionUi, /refresh\(\) \{[\s\S]*render\(\)/);

console.log('Finish preserves user picks, fills only missing predictions with AI and needs no match locks.');
