const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function load(file, context) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(source, context, { filename: file });
}

const stored = new Map();
class TestCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

const context = vm.createContext({
  console: { warn() {}, log() {}, error() {} },
  Math,
  Object,
  Array,
  Map,
  Set,
  String,
  Number,
  Boolean,
  RegExp,
  JSON,
  TypeError,
  CustomEvent: TestCustomEvent
});
context.window = context;
context.window.dispatchEvent = () => {};
context.window.sessionStorage = {
  getItem(key) { return stored.has(key) ? stored.get(key) : null; },
  setItem(key, value) { stored.set(key, String(value)); },
  removeItem(key) { stored.delete(key); }
};

for (const file of [
  'teams.js',
  'generated-team-pools.js',
  'generated-club-coefficients.js',
  'qualification-bracket.js',
  'qualification-current-state.js',
  'qualification-identity-fixes.js',
  'team-pool-loader.js',
  'coefficient-pots.js',
  'roster-manager.js'
]) load(file, context);

const data = context.window.UCLDRAW_DATA;
const manager = context.window.UCLDRAW_ROSTER_MANAGER;
const state = context.window.UCLDRAW_QUALIFICATION_STATE;

assert.equal(manager.currentStateVersion, '2026-08-26');
assert.equal(state.snapshotDate, '2026-08-26');
assert.equal(Object.keys(state.resolvedUclPlayoffs).length, 7);

const fixedUclIds = ['aek', 'lask', 'viking', 'slovanbratislava', 'sabah', 'fenerbahce', 'bodo'];
const fixedPlayoffUelIds = ['levskisofia', 'celtic', 'dinamo', 'celje', 'hapoelbeersheva', 'lyon', 'nec'];
const fixedQ3UelIds = ['olympiacos', 'union', 'strumgraz', 'spartapraha'];

for (const teamId of fixedUclIds) {
  const team = data.competitions.ucl.teams.find((candidate) => candidate.poolSlug === teamId);
  assert.ok(team, `${teamId} must be present in Champions League`);
  assert.ok(manager.isGuaranteed(team), `${teamId} must be locked after its playoff win`);
  assert.ok(!manager.isRemovable('ucl', team), `${teamId} must not be manually removable`);
  assert.equal(manager.incomingScenarios('ucl', team).length, 0, `${teamId} must expose no replacement choices`);
}

for (const teamId of [...fixedQ3UelIds, ...fixedPlayoffUelIds]) {
  const team = data.competitions.uel.teams.find((candidate) => candidate.poolSlug === teamId);
  assert.ok(team, `${teamId} must be present in Europa League`);
  assert.ok(manager.isGuaranteed(team), `${teamId} must be treated as a locked league-phase participant`);
  assert.ok(!manager.isRemovable('uel', team), `${teamId} must not be manually removable after its result`);
  assert.equal(manager.incomingScenarios('uel', team).length, 0, `${teamId} must expose no replacement choices`);
}

assert.ok(manager.selectedTeam('ucl', 'slovanbratislava'), 'Slovan Bratislava must be fixed in Champions League');
assert.ok(manager.selectedTeam('uel', 'celje'), 'Celje must be fixed in Europa League');
assert.equal(manager.candidateTeam('ucl', 'celje'), null, 'Celje must disappear from Champions League search');
assert.equal(manager.candidateTeam('uel', 'slovanbratislava'), null, 'Slovan Bratislava must disappear from Europa League search');

assert.ok(manager.selectedTeam('ucl', 'fenerbahce'), 'Fenerbahçe must be fixed in Champions League');
assert.ok(manager.selectedTeam('uel', 'lyon'), 'Lyon must be fixed in Europa League');
assert.equal(manager.candidateTeam('ucl', 'lyon'), null, 'Lyon must disappear from Champions League search');
assert.equal(manager.candidateTeam('uel', 'fenerbahce'), null, 'Fenerbahçe must disappear from Europa League search');

assert.equal(
  data.competitions.ucl.teams.filter((team) => manager.isRemovable('ucl', team)).length,
  0,
  'all seven Champions League playoff berths must now be final'
);
assert.equal(
  data.competitions.uel.teams.filter((team) => manager.isRemovable('uel', team)).length,
  12,
  'only the twelve Europa League playoff winner slots may still vary'
);
assert.equal(
  data.competitions.uecl.teams.filter((team) => manager.isRemovable('uecl', team)).length,
  36,
  'Conference League playoff slots remain unresolved'
);

for (const id of ['ucl', 'uel', 'uecl']) {
  assert.equal(data.competitions[id].teams.length, 36, `${id} must still contain 36 clubs`);
  const capacity = data.competitions[id].teams.length / data.competitions[id].potCount;
  for (let pot = 1; pot <= data.competitions[id].potCount; pot += 1) {
    assert.equal(
      data.competitions[id].teams.filter((team) => team.pot === pot).length,
      capacity,
      `${id} Pot ${pot} must remain full`
    );
  }
}

const finalIds = Object.values(data.competitions)
  .flatMap((entry) => entry.teams)
  .map((team) => team.qualificationId || team.poolSlug);
assert.equal(new Set(finalIds).size, 108, 'final UCL playoff state must preserve 108 globally unique clubs');

console.log('All seven UCL playoff results are locked in the roster manager.');
require('./latest-qualification-state.test.js');
