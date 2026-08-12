'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function load(file, context) {
  vm.runInContext(read(file), context, { filename: file });
}

function createContext() {
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
    TypeError
  });
  context.window = context;
  context.UCLDRAW_CLUB_COEFFICIENTS = {
    clubs: {
      fenerbahce: { coefficient: 47 },
      strumgraz: { coefficient: 25 },
      spartapraha: { coefficient: 30.5 },
      lyon: { coefficient: 44 }
    }
  };
  load('generated-team-pools.js', context);
  load('qualification-bracket.js', context);
  load('qualification-current-state.js', context);
  return context;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const html = read('index.html');
assert.ok(
  html.indexOf('qualification-bracket.js') < html.indexOf('qualification-current-state.js')
    && html.indexOf('qualification-current-state.js') < html.indexOf('team-pool-loader.js'),
  'current qualification state must load after the base bracket and before roster generation'
);

const context = createContext();
const bracket = context.UCLDRAW_QUALIFICATION_BRACKET;
const state = context.UCLDRAW_QUALIFICATION_STATE;
assert.ok(bracket?.simulate, 'qualification bracket runtime must be exposed');
assert.equal(bracket.currentStateVersion, '2026-08-12');
assert.equal(state?.snapshotDate, '2026-08-12');
assert.deepEqual(
  Array.from(bracket.rounds, (round) => round.ties.length),
  [10, 7, 13, 12, 30, 24],
  'all current Q3 and playoff ties must be represented'
);

assert.equal(bracket.teams.kaunozalgiris.name, 'Kauno Žalgiris');
assert.equal(bracket.teams.zalgiris.name, 'FK Žalgiris');
assert.notEqual(bracket.teams.kaunozalgiris.id, bracket.teams.zalgiris.id);
assert.equal(bracket.teams.hapoelbeersheva.name, "Hapoel Be'er Sheva");
assert.equal(bracket.teams.hapoeltelaviv.name, 'Hapoel Tel Aviv');
assert.notEqual(bracket.teams.hapoelbeersheva.id, bracket.teams.hapoeltelaviv.id);
assert.equal(bracket.teams.iberia1999.name, 'Iberia 1999 Tbilisi');
assert.equal(bracket.teams.cska1948.name, 'CSKA 1948');

const expectedResolved = {
  'ucl-q3-dinamo-kauno': ['dinamo', 'kaunozalgiris'],
  'ucl-q3-mjallby-slovan': ['slovanbratislava', 'mjallby'],
  'ucl-q3-levski-kairat': ['levskisofia', 'kairat'],
  'ucl-q3-aarhus-sabah': ['sabah', 'aarhus'],
  'ucl-q3-ararat-celje': ['celje', 'ararat'],
  'ucl-q3-hapoel-crvena': ['hapoelbeersheva', 'crvenazvezda'],
  'ucl-q3-olympiacos-nec': ['nec', 'olympiacos'],
  'ucl-q3-union-bodo': ['bodo', 'union'],
  'ucl-q3-fener-sturm': ['fenerbahce', 'strumgraz'],
  'ucl-q3-sparta-lyon': ['lyon', 'spartapraha']
};

assert.equal(Object.keys(state.resolvedUclQ3).length, 10, 'all ten completed UCL Q3 ties must resolve from the moved crest files');
for (const [tieId, [winnerId, loserId]] of Object.entries(expectedResolved)) {
  assert.equal(state.resolvedUclQ3[tieId]?.winnerId, winnerId, `${tieId} winner must be locked`);
  assert.equal(state.resolvedUclQ3[tieId]?.loserId, loserId, `${tieId} loser must be locked`);
}

assert.deepEqual(
  new Set(state.fixedUelLeaguePhaseIds),
  new Set(['olympiacos', 'union', 'strumgraz', 'spartapraha']),
  'league-path Q3 losers must have fixed Europa League league-phase places'
);
assert.equal(state.runtimeDirectEuropaCount, 13, 'runtime direct Europa entrants must remain the original 13 before four fixed Q3 transfers are added');

const currentLeaguePlayoff = bracket.rounds.find((round) => round.id === 'ucl-playoffs').ties
  .find((tie) => tie.id === 'ucl-po-fener-sturm-sparta-lyon');
assert.deepEqual(
  new Set([currentLeaguePlayoff.first.id, currentLeaguePlayoff.second.id]),
  new Set(['fenerbahce', 'lyon']),
  'the live UCL playoff path must now be Fenerbahçe vs Lyon only'
);

for (let run = 1; run <= 50; run += 1) {
  const result = bracket.simulate(seededRandom(run));
  assert.equal(result.qualifiers.ucl.length, 7);
  assert.equal(result.qualifiers.uel.length, 23);
  assert.equal(result.qualifiers.uecl.length, 36);
  assert.equal(result.diagnostics.bracketVersion, '2026-08-12');
  assert.equal(result.diagnostics.resolvedUclQ3Count, 10);

  const all = Object.values(result.qualifiers).flat();
  const ids = all.map((team) => team.id);
  assert.equal(new Set(ids).size, 66, 'qualifier destinations must be mutually exclusive');

  for (const [tieId, [winnerId, loserId]] of Object.entries(expectedResolved)) {
    const outcome = result.rounds['ucl-q3'].find((tie) => tie.id === tieId);
    assert.equal(outcome.winner.id, winnerId, `${tieId} must not be re-simulated after its result is known`);
    assert.equal(outcome.loser.id, loserId, `${tieId} loser must stay fixed`);
  }

  const leaguePlayoff = result.rounds['ucl-playoffs']
    .find((tie) => tie.id === 'ucl-po-fener-sturm-sparta-lyon');
  assert.deepEqual(
    new Set([leaguePlayoff.first.id, leaguePlayoff.second.id]),
    new Set(['fenerbahce', 'lyon']),
    'completed Q3 losers must not leak back into the Champions playoff'
  );

  const uclIds = new Set(result.qualifiers.ucl.map((team) => team.id));
  const uelIds = new Set(result.qualifiers.uel.map((team) => team.id));
  state.eliminatedFromUclIds.forEach((teamId) => assert.ok(!uclIds.has(teamId), `${teamId} is eliminated from UCL`));
  state.fixedUelLeaguePhaseIds.forEach((teamId) => assert.ok(uelIds.has(teamId), `${teamId} must stay in the Europa League league phase`));

  assert.deepEqual(
    JSON.parse(JSON.stringify(result.diagnostics.transferCounts)),
    {
      uclPlayoffWinners: 7,
      uclLeaguePathQ3LosersToUel: 4,
      uclPlayoffLosersToUel: 7,
      uelPlayoffWinners: 12,
      uelPlayoffLosersToUecl: 12,
      ueclPlayoffWinners: 24
    }
  );
}

console.log('Qualification bracket and resolved UCL Q3 checks passed.');