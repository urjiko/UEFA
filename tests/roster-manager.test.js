const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function load(file, context) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(source, context, { filename: file });
}

const dispatched = [];
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
context.window.dispatchEvent = (event) => dispatched.push(event);
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
const competition = data.competitions.ucl;
const all = manager.allTeams('ucl');

assert.equal(manager.currentStateVersion, '2026-08-26');
assert.equal(state.snapshotDate, '2026-08-26');

const fixedUclIds = ['aek', 'lask', 'viking', 'sabah', 'fenerbahce', 'bodo'];
const fixedPlayoffUelIds = ['levskisofia', 'celtic', 'dinamo', 'hapoelbeersheva', 'lyon', 'nec'];
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

assert.ok(manager.selectedTeam('ucl', 'fenerbahce'), 'Fenerbahçe must be fixed in Champions League');
assert.ok(manager.selectedTeam('uel', 'lyon'), 'Lyon must be fixed in Europa League');
assert.equal(manager.candidateTeam('ucl', 'lyon'), null, 'Lyon must disappear from Champions League search');
assert.equal(manager.candidateTeam('uel', 'fenerbahce'), null, 'Fenerbahçe must disappear from Europa League search');
assert.throws(
  () => manager.simulateReplacement('ucl', 'celje', manager.selectedTeam('ucl', 'fenerbahce')),
  /kesinleşti|Garanti katılımcılar/,
  'confirmed Fenerbahçe berth must reject replacement attempts'
);

for (const eliminatedId of state.eliminatedFromUclIds) {
  assert.ok(!all.some((team) => team.poolSlug === eliminatedId), `${eliminatedId} must disappear from Champions League search`);
  assert.equal(manager.candidateTeam('ucl', eliminatedId), null, `${eliminatedId} must not be a UCL candidate anymore`);
}

const livePlayoffIds = ['slovanbratislava', 'celje'];
assert.ok(all.some((team) => team.poolSlug === 'slovanbratislava'), 'Slovan must stay searchable while its playoff is live');
assert.ok(all.some((team) => team.poolSlug === 'celje'), 'Celje must stay searchable while its playoff is live');

const selectedPlayoffTeams = competition.teams.filter((team) => livePlayoffIds.includes(team.poolSlug));
assert.equal(selectedPlayoffTeams.length, 1, 'Slovan vs Celje must produce exactly one provisional UCL league-phase club');
const playoffWinner = selectedPlayoffTeams[0];

const pathScenarios = manager.incomingScenarios('ucl', playoffWinner);
assert.equal(pathScenarios.length, 1, 'the final unresolved UCL playoff berth must have one alternative');
assert.equal(
  pathScenarios[0].incoming.poolSlug,
  livePlayoffIds.find((id) => id !== playoffWinner.poolSlug),
  'the only UCL alternative must be the other Slovan/Celje participant'
);
assert.equal(pathScenarios[0].outgoing.poolSlug, playoffWinner.poolSlug);

const incomingSlug = pathScenarios[0].incoming.poolSlug;
const incoming = manager.candidateTeam('ucl', incomingSlug);
const reverseScenarios = manager.replacementScenarios('ucl', incoming);
assert.equal(reverseScenarios.length, 1, 'the live playoff reserve may replace only the active holder');
assert.equal(reverseScenarios[0].outgoing.poolSlug, playoffWinner.poolSlug);

const preview = reverseScenarios[0];
for (const id of ['ucl', 'uel', 'uecl']) {
  assert.equal(preview.competitionUpdates[id].length, 36, `${id} preview must preserve 36 clubs`);
}
const previewIds = Object.values(preview.competitionUpdates)
  .flat()
  .map((team) => team.qualificationId || team.poolSlug);
assert.equal(new Set(previewIds).size, 108, 'preview must keep all three league phases globally unique');

const inserted = manager.replaceTeam('ucl', incomingSlug, playoffWinner.poolSlug);
assert.equal(inserted.poolSlug, incomingSlug);
assert.equal(data.competitions.ucl.teams.filter((team) => livePlayoffIds.includes(team.poolSlug)).length, 1);
assert.equal(data.competitions.ucl.teams.find((team) => livePlayoffIds.includes(team.poolSlug)).poolSlug, incomingSlug);

const uelLivePathIds = data.competitions.uel.teams
  .filter((team) => livePlayoffIds.includes(team.poolSlug))
  .map((team) => team.poolSlug);
assert.deepEqual(
  new Set(uelLivePathIds),
  new Set(livePlayoffIds.filter((id) => id !== incomingSlug)),
  'the loser of the only unresolved UCL playoff must occupy its Europa League berth'
);

const finalIds = Object.values(data.competitions)
  .flatMap((entry) => entry.teams)
  .map((team) => team.qualificationId || team.poolSlug);
assert.equal(new Set(finalIds).size, 108, 'manual replacement must not duplicate a club across competitions');

for (const [id, entry] of Object.entries(data.competitions)) {
  const capacity = entry.teams.length / entry.potCount;
  for (let pot = 1; pot <= entry.potCount; pot += 1) {
    assert.equal(entry.teams.filter((team) => team.pot === pot).length, capacity, `${id} Pot ${pot} must remain full`);
  }
}

assert.equal(dispatched.at(-1)?.type, 'ucldraw:roster-changed');
assert.equal(dispatched.at(-1)?.detail?.incoming?.poolSlug, incomingSlug);
assert.ok(dispatched.at(-1)?.detail?.affectedCompetitionIds.includes('ucl'));
assert.ok(dispatched.at(-1)?.detail?.affectedCompetitionIds.includes('uel'));
assert.ok(Array.isArray(dispatched.at(-1)?.detail?.slotChanges));
assert.ok(stored.has('ucldraw:qualification-slot-assignments:v1'), 'coherent slot assignments must persist across league route reloads');

console.log('Confirmed UCL playoff roster locks and the final unresolved berth check passed.');
require('./latest-qualification-state.test.js');
