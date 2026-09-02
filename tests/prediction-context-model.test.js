'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const sources = Object.fromEntries([
  'generated-club-coefficients.js',
  'current-fixtures.js',
  'prediction-context-data.js',
  'prediction-context-model.js'
].map((file) => [file, fs.readFileSync(file, 'utf8')]));
const controller = fs.readFileSync('prediction-ai-controller.js', 'utf8');

const context = vm.createContext({
  window: {},
  Object, Math, Number, String, Date, Set, Map, JSON, RegExp, console
});
context.window = context;

for (const file of [
  'generated-club-coefficients.js',
  'current-fixtures.js',
  'prediction-context-data.js',
  'prediction-context-model.js'
]) {
  vm.runInContext(sources[file], context, { filename: file });
}

const data = context.UCLDRAW_PREDICTION_CONTEXT_DATA;
const model = context.UCLDRAW_PREDICTION_CONTEXT_MODEL;
const coefficients = context.UCLDRAW_CLUB_COEFFICIENTS.clubs;
const fixtures = context.UCLDRAW_CURRENT_FIXTURES.uclMatches;

assert.equal(data.version, 25);
assert.equal(data.reviewedAt, '2026-09-02');
assert.equal(data.matches.length, 559);
assert.equal(model.methodology.recencyHalfLifeYears, 3);
assert.equal(model.methodology.homePriorMatches, 8);
assert.equal(model.methodology.awayPriorMatches, 8);
assert.equal(model.methodology.associationMinimumSample, 2);
assert.equal(model.methodology.pairMinimumSample, 2);

const duplicateKeys = new Set();
for (const match of data.matches) {
  assert.match(match.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(['home', 'away', 'neutral'].includes(match.venue), `Invalid venue for ${match.teamSlug}: ${match.venue}`);
  assert.ok(Number.isFinite(match.goalsFor));
  assert.ok(Number.isFinite(match.goalsAgainst));
  const key = [match.date, match.teamSlug, match.opponentSlug, match.venue].join('|');
  assert.ok(!duplicateKeys.has(key), `Duplicate context match: ${key}`);
  duplicateKeys.add(key);
}

for (const slug of [
  'galatasaray','fenerbahce','lille','feyenoord','bodo','napoli','leipzig','villareal','shakhtar',
  'bvb','roma','sporting','astonvilla','porto','manu','brugge','realbetis','psv',
  'psg','bayern','real','liverpool','inter','city','arsenal','barcelona','atleti',
  'slavia','slovanbratislava','stuttgart','aek','lask','lens','viking','sabah'
]) {
  assert.ok(model.profiles[slug], `${slug} should have a European context profile`);
}
assert.equal(model.profiles.como, undefined, 'Como intentionally has no recent UEFA sample and must retain neutral European context.');

assert.equal(model.profiles.galatasaray.overall.samples, 26);
assert.equal(model.profiles.fenerbahce.overall.samples, 34);
assert.equal(model.profiles.besiktas.overall.samples, 20);
assert.equal(model.profiles.trabzonspor.overall.samples, 18);
assert.equal(model.profiles.galatasaray.associationMatchups.ENG.samples, 7);
assert.equal(model.profiles.galatasaray.pairMatchups.liverpool.samples, 3);
assert.equal(model.profiles.fenerbahce.associationMatchups.ENG.samples, 4);
assert.equal(model.profiles.fenerbahce.pairMatchups.feyenoord.samples, 2);

function team(slug) {
  return {
    name: slug,
    poolSlug: slug,
    country: coefficients[slug]?.country || ''
  };
}

const matchupKeys = new Set(['association', 'pair', 'historicalSignal', 'historicalPairSignal', 'analogueSignal']);
let fixtureSpecificCoverage = 0;
let reciprocalHistoricPairFixtures = 0;
let associationPlusHistoricFixtures = 0;
let capHits = 0;

for (const [homeSlug, awaySlug] of fixtures) {
  const home = model.teamModifiers(team(homeSlug), team(awaySlug), 'home');
  const away = model.teamModifiers(team(awaySlug), team(homeSlug), 'away');

  for (const value of [home.attack, home.defense, away.attack, away.defense]) {
    assert.ok(value >= 0.88 && value <= 1.12, `${homeSlug}-${awaySlug} modifier out of safety bounds: ${value}`);
    if (value <= 0.8801 || value >= 1.1199) capHits += 1;
  }

  const homeKeys = Object.keys(home.details);
  const awayKeys = Object.keys(away.details);
  if (homeKeys.some((key) => matchupKeys.has(key)) || awayKeys.some((key) => matchupKeys.has(key))) {
    fixtureSpecificCoverage += 1;
  }

  if (home.details.historicalPairSignal && away.details.historicalPairSignal) {
    reciprocalHistoricPairFixtures += 1;
    const rawHome = data.historicalPairSignals?.[homeSlug]?.[awaySlug]?.confidence;
    const rawAway = data.historicalPairSignals?.[awaySlug]?.[homeSlug]?.confidence;
    if (Number.isFinite(rawHome)) {
      assert.ok(Math.abs(home.details.historicalPairSignal.appliedConfidence - rawHome * 0.5) < 1e-8);
    }
    if (Number.isFinite(rawAway)) {
      assert.ok(Math.abs(away.details.historicalPairSignal.appliedConfidence - rawAway * 0.5) < 1e-8);
    }
  }

  for (const [mods, slug, opponent] of [[home, homeSlug, awaySlug], [away, awaySlug, homeSlug]]) {
    if (mods.details.association && mods.details.historicalSignal) {
      associationPlusHistoricFixtures += 1;
      const raw = data.historicalSignals?.[slug]?.[coefficients[opponent]?.country]?.confidence;
      if (Number.isFinite(raw)) {
        assert.ok(mods.details.historicalSignal.appliedConfidence <= raw * 0.5 + 1e-8);
      }
    }
  }
}

assert.equal(fixtures.length, 144);
assert.ok(fixtureSpecificCoverage >= 119, `Only ${fixtureSpecificCoverage}/144 UCL fixtures have matchup-specific evidence.`);
assert.ok(reciprocalHistoricPairFixtures > 0);
assert.ok(associationPlusHistoricFixtures > 0);
assert.equal(capHits, 0, 'Overlapping context layers should not slam any 2026/27 UCL fixture into the 0.88/1.12 modifier caps.');

const lensCity = model.teamModifiers(team('lens'), team('city'), 'home');
assert.ok(lensCity.details.analogueSignal, 'Lens-Man City should use the Arsenal home analogue.');

const slovanBetis = model.teamModifiers(team('slovanbratislava'), team('realbetis'), 'home');
assert.ok(slovanBetis.details.analogueSignal, 'Slovan-Betis should use the recent Rayo home analogue.');

const atletiViking = model.teamModifiers(team('atleti'), team('viking'), 'home');
assert.ok(atletiViking.details.analogueSignal, 'Atletico-Viking should use the recent Bodo home analogue.');

const barcelonaComo = model.teamModifiers(team('barcelona'), team('como'), 'home');
assert.ok(barcelonaComo.details.analogueSignal, 'Barcelona-Como should use the recent Atalanta home analogue.');

const bodoAtleti = model.teamModifiers(team('bodo'), team('atleti'), 'home');
assert.ok(bodoAtleti.details.historicalPairSignal, 'Bodo-Atletico should retain the January 2026 direct meeting.');

const galaVilla = model.teamModifiers(team('galatasaray'), team('astonvilla'), 'home');
assert.ok(galaVilla.details.home);
assert.ok(galaVilla.details.association);
assert.ok(galaVilla.details.historicalSignal);
assert.ok(galaVilla.details.squad);
assert.ok(galaVilla.details.historicalSignal.appliedConfidence < galaVilla.details.historicalSignal.confidence);

const unknown = { name: 'Other', poolSlug: 'other', country: 'SUI' };
const neutral = model.teamModifiers(unknown, team('galatasaray'), 'home');
assert.equal(neutral.attack, 1);
assert.equal(neutral.defense, 1);

const adjusted = model.adjustExpectedGoals({ home: team('galatasaray'), away: team('astonvilla') }, 1.5, 1.1);
assert.ok(adjusted.homeExpected >= 0.15 && adjusted.homeExpected <= 4);
assert.ok(adjusted.awayExpected >= 0.15 && adjusted.awayExpected <= 4);

assert.match(sources['prediction-context-model.js'], /reciprocalHistoricPair/);
assert.match(sources['prediction-context-model.js'], /appliedConfidence/);
assert.match(sources['prediction-context-model.js'], /analogueSignals/);
assert.match(controller, /prediction-context-data\.js\?v=20260902auditv25/);
assert.match(controller, /prediction-context-model\.js\?v=20260902auditv25/);
assert.match(controller, /contextModel\(\)\?\.adjustExpectedGoals/);
assert.match(controller, /__contextMatchupModel: true/);

console.log(`UCL context audit passed: ${fixtureSpecificCoverage}/144 fixtures have matchup-specific evidence, no modifier cap hits.`);
