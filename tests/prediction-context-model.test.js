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

assert.equal(data.version, 35);
assert.equal(data.reviewedAt, '2026-09-02');
assert.equal(data.matches.length, 803);
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
assert.equal(model.profiles.bayerleverkusen.overall.samples, 16);
assert.equal(model.profiles.benfica.overall.samples, 16);
assert.equal(model.profiles.juventus.overall.samples, 16);
assert.equal(model.profiles.milan.overall.samples, 8);
assert.equal(model.profiles.lyon.overall.samples, 16);
assert.equal(model.profiles.azalkmaar.overall.samples, 20);
assert.equal(model.profiles.olympiacos.overall.samples, 16);
assert.equal(model.profiles.realsociedad.overall.samples, 8);
assert.equal(model.profiles.marseille.overall.samples, 8);
assert.equal(model.profiles.ferencvarosi.overall.samples, 18);
assert.equal(model.profiles.viktoriaplzen.overall.samples, 18);
assert.equal(model.profiles.union.overall.samples, 10);
assert.equal(model.profiles.dinamo.overall.samples, 16);
assert.equal(model.profiles.salzburg.overall.samples, 16);
assert.equal(model.profiles.celtic.overall.samples, 16);
assert.equal(model.profiles.spartapraha.overall.samples, 8);
assert.equal(model.profiles.rennais.overall.samples, 8);
assert.equal(model.profiles.anderlecht.overall.samples, 10);
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


for (const slug of ['city','psg','bayern','real','liverpool','inter','bodo','atleti']) {
  assert.ok(data.historicalPairSignals[slug], `Historical pair tree lost top-level ${slug}`);
}
assert.deepEqual(
  Object.keys(data.historicalPairSignals.bodo),
  ['atleti'],
  'Bodo historical pair branch should not swallow unrelated team branches.'
);
assert.ok(data.historicalPairSignals.city.psg);
assert.ok(data.historicalPairSignals.liverpool.porto);
assert.ok(data.historicalPairSignals.inter.bvb);

const celticFerenc = model.teamModifiers(team('celtic'), team('ferencvarosi'), 'home');
assert.ok(celticFerenc.details.historicalPairSignal, 'Celtic-Ferencvaros should use the 2020 Glasgow H2H.');

const ferencJuve = model.teamModifiers(team('ferencvarosi'), team('juventus'), 'home');
assert.ok(ferencJuve.details.historicalPairSignal, 'Ferencvaros-Juventus should retain the 2020 direct H2H.');

const dinamoAnderlecht = model.teamModifiers(team('dinamo'), team('anderlecht'), 'home');
assert.ok(dinamoAnderlecht.details.historicalPairSignal, 'Dinamo-Anderlecht should retain their UEFA H2H.');

const anderlechtHoffenheim = model.teamModifiers(team('anderlecht'), team('hoffenheim'), 'home');
assert.ok(anderlechtHoffenheim.details.historicalPairSignal, 'Anderlecht-Hoffenheim should use the January 2025 exact home repeat.');

const viktoriaBenfica = model.teamModifiers(team('viktoriaplzen'), team('benfica'), 'home');
assert.ok(viktoriaBenfica.details.analogueSignal, 'Viktoria-Benfica should use the recent Porto home analogue.');

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


const leverkusenSalzburg = model.teamModifiers(team('bayerleverkusen'), team('salzburg'), 'home');
assert.ok(leverkusenSalzburg.details.historicalPairSignal, 'Leverkusen-Salzburg should use the exact 5-0 home repeat.');

const lyonHoffenheim = model.teamModifiers(team('lyon'), team('hoffenheim'), 'away');
assert.ok(lyonHoffenheim.details.historicalPairSignal, 'Lyon at Hoffenheim should retain the 2024 2-2 same-venue repeat.');

const milanOlympiacos = model.teamModifiers(team('milan'), team('olympiacos'), 'away');
assert.ok(milanOlympiacos.details.historicalPairSignal, 'Milan at Olympiacos should use the 2018 Piraeus venue signal.');

const marseilleBesiktas = model.teamModifiers(team('marseille'), team('besiktas'), 'away');
assert.ok(marseilleBesiktas.details.historicalPairSignal, 'Marseille at Besiktas should retain the Istanbul H2H signal.');

const benficaAz = model.teamModifiers(team('benfica'), team('azalkmaar'), 'home');
assert.ok(benficaAz.details.historicalPairSignal, 'Benfica-AZ should retain the old quarter-final signal at low confidence.');

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
assert.match(controller, /prediction-context-data\.js\?v=20260902uelpot2v35/);
assert.match(controller, /prediction-context-model\.js\?v=20260902uelpot2v35/);
assert.match(controller, /contextModel\(\)\?\.adjustExpectedGoals/);
assert.match(controller, /__contextMatchupModel: true/);

console.log(`UCL context audit passed: ${fixtureSpecificCoverage}/144 fixtures have matchup-specific evidence, no modifier cap hits.`);
