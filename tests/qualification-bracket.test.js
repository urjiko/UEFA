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
assert.equal(bracket.currentStateVersion, '2026-08-15');
assert.equal(state?.snapshotDate, '2026-08-15');
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

const expectedUclQ3 = {
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

const expectedUelQ3 = {
  'uel-q3-larne-iberia': ['iberia1999', 'larne'],
  'uel-q3-lincoln-omonia': ['omonia', 'lincoln'],
  'uel-q3-kuopio-craiova': ['craiova', 'kuopio'],
  'uel-q3-shamrock-egnatia': ['egnatia', 'shamrockrovers'],
  'uel-q3-poznan-klaksvik': ['poznan', 'klaksvik'],
  'uel-q3-thun-vikingur': ['thun', 'vikingurreykjavik'],
  'uel-q3-hradec-besiktas': ['besiktas', 'hradeckralove'],
  'uel-q3-jagiellonia-rangers': ['jagiellonia', 'rangers'],
  'uel-q3-paok-anderlecht': ['anderlecht', 'paok'],
  'uel-q3-pafos-salzburg': ['salzburg', 'pafos'],
  'uel-q3-benfica-hearts': ['benfica', 'hearts'],
  'uel-q3-maccabi-cska': ['cskasofia', 'maccabitelaviv'],
  'uel-q3-ferencvaros-gornik': ['ferencvarosi', 'gornikzabrze']
};

const expectedUeclQ3 = {
  'uecl-q3-fiori-drita': ['drita', 'fiori'],
  'uecl-q3-borac-vitebsk': ['borac', 'vitebsk'],
  'uecl-q3-tallinn-inter': ['interclubdescaldes', 'tallinn'],
  'uecl-q3-riga-gyor': ['riga', 'gyor'],
  'uecl-q3-helsinki-motherwell': ['motherwell', 'helsinki'],
  'uecl-q3-interturku-vaduz': ['interturku', 'vaduz'],
  'uecl-q3-debreceni-copenhagen': ['copenhagen', 'debreceni'],
  'uecl-q3-paide-rapid': ['rapid', 'paide'],
  'uecl-q3-cluj-tromso': ['tromso', 'cluj'],
  'uecl-q3-zalgiris-hajduk': ['hajduksplit', 'zalgiris'],
  'uecl-q3-rakow-hammarby': ['rakow', 'hammarby'],
  'uecl-q3-panathinaikos-cska1948': ['panathinaikos', 'cska1948'],
  'uecl-q3-goteborg-gent': ['gent', 'goteborg'],
  'uecl-q3-hibernian-shkendija': ['hibernian', 'shkendija'],
  'uecl-q3-brann-apollon': ['brann', 'apollon'],
  'uecl-q3-hapoel-katowice': ['hapoeltelaviv', 'katowice'],
  'uecl-q3-bohemian-midtjylland': ['midtjylland', 'bohemian'],
  'uecl-q3-rijeka-tampere': ['rijeka', 'tampere'],
  'uecl-q3-jablonec-rfs': ['jablonec', 'rfs'],
  'uecl-q3-valur-nordsjaelland': ['nordsjaelland', 'valur'],
  'uecl-q3-sheriff-gallen': ['gallen', 'sherifftiraspol'],
  'uecl-q3-auda-dinamocity': ['dinamocity', 'auda'],
  'uecl-q3-noah-sion': ['sion', 'noah'],
  'uecl-q3-ajax-shelbourne': ['ajax', 'shelbourne'],
  'uecl-q3-braga-dinamominsk': ['braga', 'dinamominsk'],
  'uecl-q3-beitar-austria': ['austriawien', 'beitar'],
  'uecl-q3-twente-dac': ['twente', 'dac'],
  'uecl-q3-dynamo-qarabag': ['qarabag', 'dynamokyiv'],
  'uecl-q3-partizan-tobol': ['partizan', 'tobol'],
  'uecl-q3-lugano-runavik': ['lugano', 'runavik']
};

function assertResolved(actual, expected, label) {
  assert.equal(Object.keys(actual).length, Object.keys(expected).length, `${label} completed ties must all resolve from moved crest files`);
  for (const [tieId, [winnerId, loserId]] of Object.entries(expected)) {
    assert.equal(actual[tieId]?.winnerId, winnerId, `${tieId} winner must be locked`);
    assert.equal(actual[tieId]?.loserId, loserId, `${tieId} loser must be locked`);
  }
}

assertResolved(state.resolvedUclQ3, expectedUclQ3, 'UCL Q3');
assertResolved(state.resolvedUelQ3, expectedUelQ3, 'UEL Q3');
assertResolved(state.resolvedUeclQ3, expectedUeclQ3, 'UECL Q3');

assert.deepEqual(
  new Set(state.fixedUelLeaguePhaseIds),
  new Set(['olympiacos', 'union', 'strumgraz', 'spartapraha']),
  'league-path Q3 losers must have fixed Europa League league-phase places'
);
assert.equal(state.runtimeDirectEuropaCount, 13, 'runtime direct Europa entrants must remain the original 13 before four fixed Q3 transfers are added');
assert.equal(bracket.teams.klaksvik.source.competitionKey, 'conference');
assert.equal(bracket.teams.klaksvik.source.stage, 'playoffs');
assert.equal(bracket.teams.klaksvik.source.fileSlug, 'klaksvik');
assert.equal(bracket.teams.kuopio.source.fileSlug, 'kuopio');
assert.equal(bracket.teams.shamrockrovers.source.fileSlug, 'shamrockrovers');
assert.equal(bracket.teams.rangers.source.competitionKey, 'conference');
assert.equal(bracket.teams.jagiellonia.source.competitionKey, 'europa');

const currentLeaguePlayoff = bracket.rounds.find((round) => round.id === 'ucl-playoffs').ties
  .find((tie) => tie.id === 'ucl-po-fener-sturm-sparta-lyon');
assert.deepEqual(
  new Set([currentLeaguePlayoff.first.id, currentLeaguePlayoff.second.id]),
  new Set(['fenerbahce', 'lyon']),
  'the live UCL playoff path must now be Fenerbahçe vs Lyon only'
);

const expectedPlayoffPairings = {
  'uel-po-jagiellonia-rangers-larne-iberia': ['jagiellonia', 'iberia1999'],
  'uel-po-poznan-klaksvik-thun-vikingur': ['poznan', 'thun'],
  'uecl-po-jagiellonia-rangers-jablonec-rfs': ['rangers', 'jablonec'],
  'uecl-po-poznan-klaksvik-riga-gyor': ['klaksvik', 'riga'],
  'uecl-po-helsinki-motherwell-freiburg': ['motherwell', 'freiburg']
};
for (const [tieId, expectedIds] of Object.entries(expectedPlayoffPairings)) {
  const entry = bracket.rounds.flatMap((round) => round.ties).find((tie) => tie.id === tieId);
  assert.ok(entry, `${tieId} must exist`);
  assert.deepEqual(
    new Set([entry.first.id, entry.second.id]),
    new Set(expectedIds),
    `${tieId} must collapse to the actual playoff opponents`
  );
}

for (let run = 1; run <= 50; run += 1) {
  const result = bracket.simulate(seededRandom(run));
  assert.equal(result.qualifiers.ucl.length, 7);
  assert.equal(result.qualifiers.uel.length, 23);
  assert.equal(result.qualifiers.uecl.length, 36);
  assert.equal(result.diagnostics.bracketVersion, '2026-08-15');
  assert.equal(result.diagnostics.resolvedUclQ3Count, 10);
  assert.equal(result.diagnostics.resolvedUelQ3Count, 13);
  assert.equal(result.diagnostics.resolvedUeclQ3Count, 30);

  const all = Object.values(result.qualifiers).flat();
  const ids = all.map((team) => team.id);
  assert.equal(new Set(ids).size, 66, 'qualifier destinations must be mutually exclusive');

  for (const [roundId, expected] of [
    ['ucl-q3', expectedUclQ3],
    ['uel-q3', expectedUelQ3],
    ['uecl-q3', expectedUeclQ3]
  ]) {
    for (const [tieId, [winnerId, loserId]] of Object.entries(expected)) {
      const outcome = result.rounds[roundId].find((tie) => tie.id === tieId);
      assert.equal(outcome.winner.id, winnerId, `${tieId} must not be re-simulated after its result is known`);
      assert.equal(outcome.loser.id, loserId, `${tieId} loser must stay fixed`);
    }
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
  const ueclIds = new Set(result.qualifiers.uecl.map((team) => team.id));
  state.eliminatedFromUclIds.forEach((teamId) => assert.ok(!uclIds.has(teamId), `${teamId} is eliminated from UCL`));
  state.fixedUelLeaguePhaseIds.forEach((teamId) => assert.ok(uelIds.has(teamId), `${teamId} must stay in the Europa League league phase`));
  state.eliminatedFromUelIds.forEach((teamId) => assert.ok(!uelIds.has(teamId), `${teamId} is eliminated from UEL`));
  state.eliminatedFromEuropeIds.forEach((teamId) => assert.ok(!ueclIds.has(teamId), `${teamId} is eliminated from Europe`));

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

console.log('Qualification bracket and resolved Q3 checks passed.');
