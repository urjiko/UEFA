'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const stored = new Map();

function load(file, context) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(source, context, { filename: file });
}

class TestCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

function createRuntime() {
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
    'roster-manager.js',
    'direct-playoff-replacement.js'
  ]) load(file, context);

  return {
    context,
    data: context.window.UCLDRAW_DATA,
    manager: context.window.UCLDRAW_ROSTER_MANAGER,
    direct: context.window.UCLDRAW_DIRECT_PLAYOFF_REPLACEMENT
  };
}

let runtime = createRuntime();
assert.ok(runtime.direct, 'direct playoff replacement helper must load');

const expectedRemovable = Object.freeze({ ucl: 7, uel: 19, uecl: 36 });
const removableSlugs = {};

for (const competitionId of ['ucl', 'uel', 'uecl']) {
  const removableTeams = runtime.data.competitions[competitionId].teams
    .filter((team) => runtime.manager.isRemovable(competitionId, team));
  removableSlugs[competitionId] = removableTeams.map((team) => team.poolSlug);

  assert.equal(
    removableTeams.length,
    expectedRemovable[competitionId],
    `${competitionId} must expose the expected number of unresolved playoff league-phase slots`
  );

  for (const team of removableTeams) {
    const slot = runtime.manager.slotForTeam(team);
    assert.ok(slot, `${team.poolSlug} must have a qualification slot`);
    assert.equal(
      slot.candidateIds.length,
      2,
      `${team.poolSlug} slot ${slot.id} must have exactly one direct playoff opponent`
    );
    const pair = runtime.direct.directOpponent(competitionId, team);
    assert.ok(pair, `${team.poolSlug} must expose its one direct playoff opponent`);
    assert.notEqual(pair.opponent.poolSlug, team.poolSlug);
  }
}

for (const competitionId of ['ucl', 'uel', 'uecl']) {
  for (const originalSlug of removableSlugs[competitionId]) {
    runtime = createRuntime();
    const originalTeam = runtime.manager.selectedTeam(competitionId, originalSlug);
    assert.ok(originalTeam, `${originalSlug} must be selected before its round-trip test`);

    const firstPair = runtime.direct.directOpponent(competitionId, originalTeam);
    assert.ok(firstPair, `${originalSlug} must expose its direct playoff opponent`);
    const opponentSlug = firstPair.opponent.poolSlug;

    const firstSwap = runtime.direct.replaceWithDirectOpponent(competitionId, originalTeam);
    assert.equal(firstSwap.incoming.poolSlug, opponentSlug, `${originalSlug} must persist a switch to ${opponentSlug}`);
    assert.equal(firstSwap.requiresReload, true, 'direct slot swaps are applied on the next runtime reload');

    runtime = createRuntime();
    assert.equal(runtime.manager.selectedTeam(competitionId, originalSlug), null, `${originalSlug} must leave ${competitionId} after reload`);
    const switchedTeam = runtime.manager.selectedTeam(competitionId, opponentSlug);
    assert.ok(switchedTeam, `${opponentSlug} must become selected in ${competitionId} after reload`);

    const reversePair = runtime.direct.directOpponent(competitionId, switchedTeam);
    assert.ok(reversePair, `${opponentSlug} must remain switchable after the first replacement`);
    assert.equal(
      reversePair.opponent.poolSlug,
      originalSlug,
      `${opponentSlug} must point directly back to ${originalSlug}`
    );

    const reverseSwap = runtime.direct.replaceWithDirectOpponent(competitionId, switchedTeam);
    assert.equal(reverseSwap.incoming.poolSlug, originalSlug, `${opponentSlug} must persist the reverse switch to ${originalSlug}`);

    runtime = createRuntime();
    assert.ok(runtime.manager.selectedTeam(competitionId, originalSlug), `${originalSlug} must be restored after the second reload`);
    assert.equal(runtime.manager.selectedTeam(competitionId, opponentSlug), null, `${opponentSlug} must leave ${competitionId} after restoration`);
  }
}

runtime = createRuntime();
for (const competitionId of ['ucl', 'uel', 'uecl']) {
  assert.equal(runtime.data.competitions[competitionId].teams.length, 36, `${competitionId} must still contain 36 clubs`);
}

const finalIds = Object.values(runtime.data.competitions)
  .flatMap((competition) => competition.teams)
  .map((team) => team.qualificationId || team.poolSlug);
assert.equal(new Set(finalIds).size, 108, 'all round trips must preserve 108 globally unique league-phase clubs');

console.log('All 62 removable playoff slots expose one opponent and survive repeated two-way reload-backed switching.');
