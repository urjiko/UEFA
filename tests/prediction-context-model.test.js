'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const dataSource = fs.readFileSync('prediction-context-data.js', 'utf8');
const modelSource = fs.readFileSync('prediction-context-model.js', 'utf8');
const controller = fs.readFileSync('prediction-ai-controller.js', 'utf8');

const context = {
  window: {
    UCLDRAW_CLUB_COEFFICIENTS: {
      clubs: {
        galatasaray: { coefficient: 53.5 },
        fenerbahce: { coefficient: 57.75 },
        besiktas: { coefficient: 15.5 },
        trabzonspor: { coefficient: 11 },
        liverpool: { coefficient: 130 },
        manu: { coefficient: 76.5 },
        city: { coefficient: 125.5 },
        astonvilla: { coefficient: 83 },
        juventus: { coefficient: 72.25 },
        lyon: { coefficient: 65.75 },
        feyenoord: { coefficient: 71 },
        benfica: { coefficient: 90 },
        hapoelbeersheva: { coefficient: 14 },
        bayerleverkusen: { coefficient: 105 },
        freiburg: { coefficient: 56.5 },
        crvenazvezda: { coefficient: 46.5 },
        ferencvarosi: { coefficient: 51.25 },
        copenhagen: { coefficient: 54.375 },
        monaco: { coefficient: 56 },
        rapid: { coefficient: 29.75 },
        midtjylland: { coefficient: 48.25 },
        shakhtar: { coefficient: 56.25 }
      }
    }
  },
  Object, Math, Number, String, Date, Set, Map, console
};
vm.runInNewContext(dataSource, context, { filename: 'prediction-context-data.js' });
vm.runInNewContext(modelSource, context, { filename: 'prediction-context-model.js' });

const data = context.window.UCLDRAW_PREDICTION_CONTEXT_DATA;
const model = context.window.UCLDRAW_PREDICTION_CONTEXT_MODEL;
assert.equal(data.version, 2);
assert.equal(data.reviewedAt, '2026-09-01');
assert.equal(data.matches.filter((match) => match.teamSlug === 'galatasaray').length, 15);
assert.equal(data.matches.filter((match) => match.teamSlug === 'fenerbahce').length, 22);
assert.equal(data.matches.filter((match) => match.teamSlug === 'besiktas').length, 20);
assert.equal(data.matches.filter((match) => match.teamSlug === 'trabzonspor').length, 18);
assert.equal(model.methodology.recencyHalfLifeYears, 3);
assert.equal(model.methodology.homePriorMatches, 8);
assert.equal(model.methodology.awayPriorMatches, 8);
assert.equal(model.methodology.associationMinimumSample, 3);
assert.equal(model.methodology.pairMinimumSample, 2);

assert.ok(model.profiles.galatasaray);
assert.ok(model.profiles.fenerbahce);
assert.ok(model.profiles.besiktas);
assert.ok(model.profiles.trabzonspor);
assert.equal(model.profiles.galatasaray.associationMatchups.ENG.samples, 7);
assert.equal(model.profiles.galatasaray.pairMatchups.liverpool.samples, 3);
assert.equal(model.profiles.galatasaray.pairMatchups.juventus.samples, 2);
assert.equal(model.profiles.fenerbahce.associationMatchups.ENG.samples, 4);
assert.equal(model.profiles.fenerbahce.pairMatchups.lyon.samples, 2);
assert.equal(model.profiles.fenerbahce.pairMatchups.feyenoord.samples, 2);

assert.equal(model.profiles.besiktas.overall.samples, 20);
assert.equal(model.profiles.besiktas.home.samples, 9);
assert.equal(model.profiles.besiktas.away.samples, 10);
assert.equal(data.matches.filter((match) => match.teamSlug === 'besiktas' && match.venue === 'neutral').length, 1);
assert.equal(model.profiles.besiktas.pairMatchups.shakhtar.samples, 2);
assert.equal(model.profiles.besiktas.pairMatchups.midtjylland.samples, 2);
assert.equal(model.profiles.trabzonspor.overall.samples, 18);
assert.equal(model.profiles.trabzonspor.home.samples, 9);
assert.equal(model.profiles.trabzonspor.away.samples, 9);
assert.equal(model.profiles.trabzonspor.pairMatchups.crvenazvezda.samples, 2);
assert.equal(model.profiles.trabzonspor.pairMatchups.ferencvarosi.samples, 4);
assert.equal(model.profiles.trabzonspor.pairMatchups.monaco.samples, 2);

const gala = { name: 'Galatasaray', poolSlug: 'galatasaray', country: 'TUR' };
const villa = { name: 'Aston Villa', poolSlug: 'astonvilla', country: 'ENG' };
const fener = { name: 'Fenerbahçe', poolSlug: 'fenerbahce', country: 'TUR' };
const lyon = { name: 'Lyon', poolSlug: 'lyon', country: 'FRA' };
const besiktas = { name: 'Beşiktaş', poolSlug: 'besiktas', country: 'TUR' };
const hapoel = { name: 'Hapoel Beer-Sheva', poolSlug: 'hapoelbeersheva', country: 'ISR' };
const leverkusen = { name: 'Bayer Leverkusen', poolSlug: 'bayerleverkusen', country: 'GER' };
const trabzonspor = { name: 'Trabzonspor', poolSlug: 'trabzonspor', country: 'TUR' };
const freiburg = { name: 'Freiburg', poolSlug: 'freiburg', country: 'GER' };
const crvena = { name: 'Crvena Zvezda', poolSlug: 'crvenazvezda', country: 'SRB' };
const neutral = { name: 'Other', poolSlug: 'other', country: 'SUI' };

const galaHomeEnglish = model.teamModifiers(gala, villa, 'home');
assert.equal(galaHomeEnglish.profileSlug, 'galatasaray');
assert.ok(galaHomeEnglish.details.home, 'Galatasaray home-Europe context should now be explicit.');
assert.ok(galaHomeEnglish.details.association, 'Galatasaray vs English history should be active.');
assert.ok(galaHomeEnglish.details.historicalSignal, 'Long-run Galatasaray home-vs-English signal should be active.');
assert.ok(galaHomeEnglish.details.squad, '2026 Galatasaray squad review should be active.');

const fenerAwayLyon = model.teamModifiers(fener, lyon, 'away');
assert.equal(fenerAwayLyon.profileSlug, 'fenerbahce');
assert.ok(fenerAwayLyon.details.away, 'Fenerbahce away-Europe context should be active.');
assert.ok(fenerAwayLyon.details.pair, 'Recent Lyon direct H2H should be active.');
assert.ok(fenerAwayLyon.details.squad, '2026 Fenerbahce squad review should be active.');

const besiktasHomeHapoel = model.teamModifiers(besiktas, hapoel, 'home');
assert.equal(besiktasHomeHapoel.profileSlug, 'besiktas');
assert.ok(besiktasHomeHapoel.details.home, 'Besiktas European home profile should be active.');
assert.ok(besiktasHomeHapoel.details.historicalPairSignal, 'Old Hapoel direct H2H should survive as a tiny separate signal.');
assert.ok(besiktasHomeHapoel.details.squad, 'Current Besiktas squad review should be active.');

const besiktasAwayGerman = model.teamModifiers(besiktas, leverkusen, 'away');
assert.ok(besiktasAwayGerman.details.away, 'Besiktas away-Europe profile should be active.');
assert.ok(besiktasAwayGerman.details.historicalSignal, 'Long-run German association history should be active.');
assert.equal(besiktasAwayGerman.details.historicalSignal.sample, 14);
assert.ok(besiktasAwayGerman.details.squad);

const trabzonHomeFreiburg = model.teamModifiers(trabzonspor, freiburg, 'home');
assert.equal(trabzonHomeFreiburg.profileSlug, 'trabzonspor');
assert.ok(trabzonHomeFreiburg.details.home, 'Trabzonspor European home profile should be active.');
assert.ok(trabzonHomeFreiburg.details.squad, 'Current Trabzonspor squad review should be active.');

const trabzonAwayCrvena = model.teamModifiers(trabzonspor, crvena, 'away');
assert.ok(trabzonAwayCrvena.details.away, 'Trabzonspor away-Europe profile should be active.');
assert.ok(trabzonAwayCrvena.details.pair, 'Trabzonspor-Crvena recent direct H2H should be active.');
assert.equal(trabzonAwayCrvena.details.pair.samples, 2);
assert.ok(trabzonAwayCrvena.details.squad);

const neutralModifier = model.teamModifiers(neutral, gala, 'home');
assert.equal(neutralModifier.attack, 1);
assert.equal(neutralModifier.defense, 1);

for (const modifiers of [
  galaHomeEnglish, fenerAwayLyon, besiktasHomeHapoel, besiktasAwayGerman, trabzonHomeFreiburg, trabzonAwayCrvena
]) {
  assert.ok(modifiers.attack >= 0.88 && modifiers.attack <= 1.12);
  assert.ok(modifiers.defense >= 0.88 && modifiers.defense <= 1.12);
}

const adjusted = model.adjustExpectedGoals({ home: besiktas, away: hapoel }, 1.5, 1.1);
assert.ok(adjusted.homeExpected !== 1.5 || adjusted.awayExpected !== 1.1);
assert.ok(adjusted.homeExpected >= 0.15 && adjusted.homeExpected <= 4);
assert.ok(adjusted.awayExpected >= 0.15 && adjusted.awayExpected <= 4);

assert.match(modelSource, /record\.venue === 'neutral'/);
assert.match(modelSource, /historicalPairSignals/);
assert.match(controller, /CONTEXT_DATA_SCRIPT_ID/);
assert.match(controller, /prediction-context-data\.js\?v=20260901b/);
assert.match(controller, /prediction-context-model\.js\?v=20260901b/);
assert.match(controller, /contextModel\(\)\?\.adjustExpectedGoals/);
assert.match(controller, /context-v\$\{contextVersion\}/);
assert.match(controller, /model-context-adjusted/);
assert.match(controller, /__contextMatchupModel: true/);

console.log('Four-team European home, away, association, H2H and squad context checks passed.');
