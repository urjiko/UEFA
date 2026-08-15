'use strict';

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
  'roster-manager.js',
  'direct-playoff-replacement.js'
]) load(file, context);

const data = context.window.UCLDRAW_DATA;
const manager = context.window.UCLDRAW_ROSTER_MANAGER;
const direct = context.window.UCLDRAW_DIRECT_PLAYOFF_REPLACEMENT;

assert.ok(direct, 'direct playoff replacement helper must load');

const expectedRemovable = Object.freeze({ ucl: 7, uel: 19, uecl: 36 });

for (const competitionId of ['ucl', 'uel', 'uecl']) {
  const removableTeams = data.competitions[competitionId].teams
    .filter((team) => manager.isRemovable(competitionId, team));

  assert.equal(
    removableTeams.length,
    expectedRemovable[competitionId],
    `${competitionId} must expose the expected number of unresolved playoff league-phase slots`
  );

  for (const originalTeam of [...removableTeams]) {
    const originalSlug = originalTeam.poolSlug;
    const slot = manager.slotForTeam(originalTeam);
    assert.ok(slot, `${originalSlug} must have a qualification slot`);
    assert.equal(
      slot.candidateIds.length,
      2,
      `${originalSlug} slot ${slot.id} must have exactly one direct playoff opponent`
    );

    const firstPair = direct.directOpponent(competitionId, originalTeam);
    assert.ok(firstPair, `${originalSlug} must expose its direct playoff opponent`);
    assert.notEqual(firstPair.opponent.poolSlug, originalSlug);

    const firstScenario = direct.directOpponentScenario(competitionId, originalTeam);
    assert.ok(firstScenario, `${originalSlug} -> ${firstPair.opponent.poolSlug} must be a valid replacement scenario`);

    const opponentSlug = firstPair.opponent.poolSlug;
    const inserted = direct.replaceWithDirectOpponent(competitionId, originalTeam);
    assert.equal(inserted.poolSlug, opponentSlug, `${originalSlug} must switch to ${opponentSlug}`);
    assert.equal(manager.selectedTeam(competitionId, originalSlug), null, `${originalSlug} must leave ${competitionId}`);

    const switchedTeam = manager.selectedTeam(competitionId, opponentSlug);
    assert.ok(switchedTeam, `${opponentSlug} must become selected in ${competitionId}`);

    const reversePair = direct.directOpponent(competitionId, switchedTeam);
    assert.ok(reversePair, `${opponentSlug} must remain switchable after the first replacement`);
    assert.equal(
      reversePair.opponent.poolSlug,
      originalSlug,
      `${opponentSlug} must point back to ${originalSlug}`
    );

    const reverseScenario = direct.directOpponentScenario(competitionId, switchedTeam);
    assert.ok(reverseScenario, `${opponentSlug} -> ${originalSlug} must be a valid reverse scenario`);

    const restored = direct.replaceWithDirectOpponent(competitionId, switchedTeam);
    assert.equal(restored.poolSlug, originalSlug, `${originalSlug} must be restorable after a round trip`);
    assert.ok(manager.selectedTeam(competitionId, originalSlug), `${originalSlug} must be selected again`);
  }
}

for (const competitionId of ['ucl', 'uel', 'uecl']) {
  assert.equal(data.competitions[competitionId].teams.length, 36, `${competitionId} must still contain 36 clubs`);
}

const finalIds = Object.values(data.competitions)
  .flatMap((competition) => competition.teams)
  .map((team) => team.qualificationId || team.poolSlug);
assert.equal(new Set(finalIds).size, 108, 'round-trip switching must preserve global club uniqueness');

console.log('All removable playoff slots expose exactly one opponent and support repeated two-way switching.');
