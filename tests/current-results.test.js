'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'current-results.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const aek = { name: 'AEK Athens', poolSlug: 'aek' };
const lask = { name: 'LASK', poolSlug: 'lask' };
const baseEngine = {
  createState(comp, table, leagueId, selectedTeamName, seed) {
    return {
      comp,
      table,
      leagueId,
      selectedTeamName,
      seed,
      matches: [{
        id: '1:aek-athens:lask',
        matchday: 1,
        home: aek,
        away: lask,
        date: '2026-09-08'
      }],
      scores: {},
      matchLocks: {},
      activeMatchdays: {}
    };
  }
};

class TestCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

const context = vm.createContext({
  console,
  Object,
  Array,
  String,
  Number,
  Boolean,
  JSON,
  CustomEvent: TestCustomEvent,
  setTimeout() { return 1; }
});
context.window = context;
context.window.UCLDRAW_PREDICTION_ENGINE = baseEngine;
context.window.dispatchEvent = () => {};
context.window.addEventListener = () => {};

vm.runInContext(source, context, { filename: 'current-results.js' });

const api = context.window.UCLDRAW_CURRENT_RESULTS;
assert.ok(api, 'Official current-results layer must install.');
assert.equal(api.snapshotDate, '2026-09-11');
assert.equal(api.results.ucl.length, 18, 'September 8-10 UCL snapshot must contain all eighteen completed Matchday 1 matches.');
assert.ok(api.results.ucl.some((row) => row.home === 'fenerbahce' && row.away === 'roma' && row.homeGoals === 1 && row.awayGoals === 1));
assert.ok(api.results.ucl.some((row) => row.home === 'psv' && row.away === 'shakhtar' && row.homeGoals === 1 && row.awayGoals === 1));
assert.ok(api.results.ucl.some((row) => row.home === 'como' && row.away === 'leipzig' && row.homeGoals === 4 && row.awayGoals === 1));
assert.ok(api.results.ucl.some((row) => row.home === 'bayern' && row.away === 'bodo' && row.homeGoals === 5 && row.awayGoals === 0));
assert.ok(api.results.ucl.some((row) => row.home === 'manu' && row.away === 'sabah' && row.homeGoals === 4 && row.awayGoals === 0));
assert.ok(api.results.ucl.some((row) => row.home === 'slavia' && row.away === 'lens' && row.homeGoals === 2 && row.awayGoals === 3));

const officialTable = {
  'AEK Athens': [{ opponent: lask, home: true, matchday: 1, date: '2026-09-08', officialFixture: true }],
  LASK: [{ opponent: aek, home: false, matchday: 1, date: '2026-09-08', officialFixture: true }]
};
const officialState = context.window.UCLDRAW_PREDICTION_ENGINE.createState(
  { id: 'ucl' }, officialTable, 'ucl', 'AEK Athens', 'official-test'
);
assert.deepEqual(
  JSON.parse(JSON.stringify(officialState.scores['1:aek-athens:lask'])),
  {
    homeGoals: 1,
    awayGoals: 0,
    source: 'official-result',
    official: true,
    final: true,
    playedDate: '2026-09-08',
    resultSnapshotDate: '2026-09-11'
  }
);
assert.equal(officialState.matchLocks['1:aek-athens:lask'], true, 'Played matches must arrive locked by default.');
assert.equal(officialState.officialResultsApplied, 1);

const simulatedState = context.window.UCLDRAW_PREDICTION_ENGINE.createState(
  { id: 'ucl' }, { 'AEK Athens': [{ opponent: lask }] }, 'ucl', 'AEK Athens', 'simulation-test'
);
assert.equal(Object.keys(simulatedState.scores).length, 0, 'Simulated draws must never inherit real-world scores.');

assert.ok(html.includes('current-results.js?v=20260911a'));
assert.ok(html.indexOf('current-results.js?v=20260911a') < html.indexOf('prediction-ui.js?v=20260831a'));
assert.match(html, /oynanmış resmî skorları yükle/);
assert.match(source, /Oynandı · Resmî skor/);
assert.match(source, /choice\.disabled = true/);
assert.match(source, /Resmî skor kilidini aç/);
assert.match(source, /source: 'official-result'/);
assert.match(source, /choice\.prepend\(currentButton\)/);
assert.match(source, /await navigator\.share\(\{ title, text, url, files: \[file\] \}\)/);
assert.doesNotMatch(source, /const text = `[^`]*\\n\$\{url\}`/);

console.log('Current mode loads all completed Matchday 1 scores and share payload uses a single URL.');
