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

load('teams.js', context);
load('generated-team-pools.js', context);
load('generated-club-coefficients.js', context);
load('qualification-bracket.js', context);
load('qualification-current-state.js', context);
load('team-pool-loader.js', context);
load('coefficient-pots.js', context);
load('roster-manager.js', context);

const data = context.window.UCLDRAW_DATA;
const manager = context.window.UCLDRAW_ROSTER_MANAGER;
const state = context.window.UCLDRAW_QUALIFICATION_STATE;
const competition = data.competitions.ucl;
const all = manager.allTeams('ucl');

assert.equal(manager.currentStateVersion, '2026-08-12');
assert.ok(all.length > competition.teams.length, 'UCL search must include unresolved playoff alternatives');
assert.ok(all.some((team) => team.poolSlug === 'fenerbahce'), 'Fenerbahçe must stay searchable as a live UCL playoff participant');
assert.ok(all.some((team) => team.poolSlug === 'lyon'), 'Lyon must stay searchable as a live UCL playoff participant');
for (const eliminatedId of state.eliminatedFromUclIds) {
  assert.ok(!all.some((team) => team.poolSlug === eliminatedId), `${eliminatedId} must disappear from Champions League search`);
  assert.equal(manager.candidateTeam('ucl', eliminatedId), null, `${eliminatedId} must not be a UCL candidate anymore`);
}

const livePlayoffIds = ['fenerbahce', 'lyon'];
const selectedPlayoffTeams = competition.teams.filter((team) => livePlayoffIds.includes(team.poolSlug));
assert.equal(selectedPlayoffTeams.length, 1, 'Fenerbahçe vs Lyon must produce exactly one UCL league-phase club');
const playoffWinner = selectedPlayoffTeams[0];

const pathScenarios = manager.incomingScenarios('ucl', playoffWinner);
assert.equal(pathScenarios.length, 1, 'the live UCL playoff berth must have only the other playoff club as an alternative');
assert.equal(
  pathScenarios[0].incoming.poolSlug,
  livePlayoffIds.find((id) => id !== playoffWinner.poolSlug),
  'Sturm Graz and Sparta Praha must no longer be selectable for the Fenerbahçe/Lyon UCL berth'
);
assert.equal(pathScenarios[0].outgoing.poolSlug, playoffWinner.poolSlug);

const incomingSlug = pathScenarios[0].incoming.poolSlug;
const incoming = manager.candidateTeam('ucl', incomingSlug);
const reverseScenarios = manager.replacementScenarios('ucl', incoming);
assert.equal(reverseScenarios.length, 1, 'the remaining playoff club may replace only the active holder of that UCL berth');
assert.equal(reverseScenarios[0].outgoing.poolSlug, playoffWinner.poolSlug);

const fixedEuropaIds = ['olympiacos', 'union', 'strumgraz', 'spartapraha'];
for (const teamId of fixedEuropaIds) {
  const team = data.competitions.uel.teams.find((candidate) => candidate.poolSlug === teamId);
  assert.ok(team, `${teamId} must be present in Europa League`);
  assert.ok(manager.isGuaranteed(team), `${teamId} must be treated as a locked league-phase participant`);
  assert.ok(!manager.isRemovable('uel', team), `${teamId} must not be manually removable after the UCL Q3 result`);
  assert.equal(manager.incomingScenarios('uel', team).length, 0, `${teamId} must not expose replacement choices`);
  assert.throws(
    () => manager.simulateReplacement('uel', 'fenerbahce', team),
    /kesinleşti/,
    `${teamId} fixed Europa League place must reject replacement attempts`
  );
}

const guaranteed = competition.teams.filter((team) => manager.isGuaranteed(team));
assert.ok(guaranteed.length > 0, 'the active roster needs guaranteed participants');
assert.throws(
  () => manager.simulateReplacement('ucl', incoming, guaranteed[0]),
  /Garanti katılımcılar/,
  'guaranteed participants must be impossible to remove'
);

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

const fourTeamPathIds = ['fenerbahce', 'strumgraz', 'spartapraha', 'lyon'];
const europaPathIds = data.competitions.uel.teams
  .filter((team) => fourTeamPathIds.includes(team.poolSlug))
  .map((team) => team.poolSlug);
assert.deepEqual(
  new Set(europaPathIds),
  new Set(fourTeamPathIds.filter((id) => id !== incomingSlug)),
  'Sturm and Sparta stay fixed in UEL while the Fenerbahçe/Lyon playoff loser also lands there'
);
assert.equal(data.competitions.uecl.teams.filter((team) => fourTeamPathIds.includes(team.poolSlug)).length, 0);

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

console.log('Resolved qualification-slot roster checks passed.');