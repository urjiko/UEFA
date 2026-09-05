'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'prediction-community-v2.js'), 'utf8');
const resultsUi = fs.readFileSync(path.join(root, 'prediction-community-v3.js'), 'utf8');
const resultsCss = fs.readFileSync(path.join(root, 'prediction-community-v3.css'), 'utf8');
const config = fs.readFileSync(path.join(root, 'community-config.js'), 'utf8');
const safety = fs.readFileSync(path.join(root, 'prediction-share-export-safety.js'), 'utf8');
const fidelity = fs.readFileSync(path.join(root, 'prediction-share-fidelity-patch.js'), 'utf8');
const sql = fs.readFileSync(path.join(root, 'supabase/community-predictions.sql'), 'utf8');
const approximately = (actual, expected, epsilon = 1e-9) => assert.ok(
  Math.abs(actual - expected) <= epsilon,
  `expected ${actual} to be within ${epsilon} of ${expected}`
);

const storage = new Map();
let uuidCounter = 0;
const localStorage = {
  get length() { return storage.size; },
  key(index) { return [...storage.keys()][index] ?? null; },
  getItem(key) { return storage.get(key) ?? null; },
  setItem(key, value) { storage.set(key, String(value)); }
};

const listeners = new Map();
const windowObject = {
  UCLDRAW_COMMUNITY_CONFIG: { supabaseUrl: '', supabaseAnonKey: '' },
  UCLDRAW_COMMUNITY: {
    backendConfigured: () => false,
    buildSubmission: () => null,
    finishProgress: () => ({ completed: 0, total: 0, done: false }),
    openAveragePage: async () => ({ rows: [], team: null, competition: null })
  },
  addEventListener(type, handler) { listeners.set(type, handler); },
  setInterval() { return 1; },
  clearInterval() {},
  setTimeout() { return 1; }
};

const documentObject = {
  getElementById() { return null; },
  querySelector() { return null; }
};

const context = {
  window: windowObject,
  document: documentObject,
  localStorage,
  crypto: { randomUUID: () => `00000000-0000-4000-8000-${String(++uuidCounter).padStart(12, '0')}` },
  fetch: async () => { throw new Error('fetch should not run'); },
  console,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Math,
  Map,
  Set,
  JSON,
  Promise
};

vm.runInNewContext(source, context, { filename: 'prediction-community-v2.js' });
const community = windowObject.UCLDRAW_COMMUNITY_V2;
assert.ok(community, 'Community V2 must install over the base community API.');

const firstPayload = {
  leagueId: 'ucl',
  teamSlug: 'galatasaray',
  fixtureVersion: '2026-27',
  predictions: [{ outcome: 'win' }]
};
const secondPayload = {
  ...firstPayload,
  predictions: [{ outcome: 'loss' }]
};
const firstId = community.stableSubmissionId(firstPayload);
const secondId = community.stableSubmissionId(secondPayload);
assert.equal(firstId, secondId, 'Changing predictions must update the same browser/team/version submission.');
assert.equal(uuidCounter, 1, 'Stable submission identity must allocate only one UUID.');

const team = { name: 'Team FC', poolSlug: 'team' };
const opponentOne = { name: 'One FC', poolSlug: 'one' };
const opponentTwo = { name: 'Two FC', poolSlug: 'two' };
const fixtures = [
  { home: true, opponent: opponentOne },
  { home: false, opponent: opponentTwo }
];
const rows = [
  {
    match_key: 'team--one', total_votes: 100, win_votes: 60, draw_votes: 20, loss_votes: 20,
    manual_score_votes: 50, avg_selected_goals: 1.8, avg_opponent_goals: 1.2, submission_count: 120
  },
  {
    match_key: 'two--team', total_votes: 50, win_votes: 10, draw_votes: 20, loss_votes: 20,
    manual_score_votes: 30, avg_selected_goals: 1.0, avg_opponent_goals: 1.4, submission_count: 120
  }
];
const summary = community.computeCommunitySummary(rows, fixtures, team);
assert.equal(summary.submissionCount, 120);
assert.equal(summary.coveredFixtures, 2);
approximately(summary.expectedPoints, 3);
approximately(summary.expectedWins, 0.8);
approximately(summary.expectedDraws, 0.6);
approximately(summary.expectedLosses, 0.6);
approximately(summary.confidence, 0.5);
approximately(summary.averageSelectedGoals, 2.8);
approximately(summary.averageOpponentGoals, 2.6);
assert.equal(summary.scoreSamples, 80);

assert.match(source, /window\.addEventListener\('click'/);
assert.match(source, /prediction-community-finish-button/);
assert.match(source, /event\.stopImmediatePropagation\(\)/);
assert.match(source, /UCLDRAW_PREDICTION_SHARE_V9/);
assert.match(source, /MIN_STRONG_SAMPLE\s*=\s*20/);

assert.match(resultsUi, /Tahmin Görselini İndir/);
assert.match(resultsUi, /Tahmin Linkini Kopyala/);
assert.match(resultsUi, /control\.remove\(\)/);
assert.match(resultsUi, /retry\.textContent = 'Tekrar Tahmin Et'/);
assert.match(resultsUi, /community-match-toolbar/);
assert.match(resultsUi, /En tartışmalı/);
assert.match(resultsUi, /community-match-verdict/);
assert.match(resultsCss, /community-actions-simplified/);
assert.match(resultsCss, /align-items:\s*center\s*!important/);
assert.match(resultsCss, /justify-content:\s*center\s*!important/);
assert.match(resultsCss, /community-match-filters/);
assert.match(resultsCss, /community-results-hero/);

assert.match(sql, /on conflict \(id\) do update/i);
assert.match(sql, /prediction_source'\s*=\s*'user'/);
assert.match(sql, /'updated', v_existing/);
assert.match(sql, /revoke all on table public\.prediction_submissions from anon, authenticated/i);
assert.match(config, /prediction-community-v2\.js\?v=20260905a/);
assert.match(config, /prediction-community-v3\.js\?v=20260905a/);
assert.match(config, /prediction-community-v3\.css\?v=20260905a/);
assert.match(config, /prediction-share-export-safety\.js\?v=20260905b/);
assert.match(config, /UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH/);
assert.match(config, /disabled:\s*true/);
assert.match(safety, /if \(fidelity\.disabled\)/);
assert.match(safety, /passthrough:\s*true/);
assert.match(fidelity, /disabled:\s*true/);
assert.doesNotMatch(fidelity, /prototype\.toBlob\s*=/);
assert.doesNotMatch(fidelity, /copyCleanStrip/);

console.log('Community UI keeps one vote identity, simplifies result actions and provides interactive match filters.');
