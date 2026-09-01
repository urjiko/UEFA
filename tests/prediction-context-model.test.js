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
        liverpool: { coefficient: 130 },
        manu: { coefficient: 76.5 },
        city: { coefficient: 125.5 },
        astonvilla: { coefficient: 83 },
        juventus: { coefficient: 72.25 },
        lyon: { coefficient: 65.75 },
        feyenoord: { coefficient: 71 },
        benfica: { coefficient: 90 }
      }
    }
  },
  Object, Math, Number, String, Date, Set, Map, console
};
vm.runInNewContext(dataSource, context, { filename: 'prediction-context-data.js' });
vm.runInNewContext(modelSource, context, { filename: 'prediction-context-model.js' });

const data = context.window.UCLDRAW_PREDICTION_CONTEXT_DATA;
const model = context.window.UCLDRAW_PREDICTION_CONTEXT_MODEL;
assert.equal(data.version, 1);
assert.equal(data.reviewedAt, '2026-09-01');
assert.equal(data.matches.filter((match) => match.teamSlug === 'galatasaray').length, 15);
assert.equal(data.matches.filter((match) => match.teamSlug === 'fenerbahce').length, 22);
assert.equal(model.methodology.recencyHalfLifeYears, 3);
assert.equal(model.methodology.associationMinimumSample, 3);
assert.equal(model.methodology.pairMinimumSample, 2);

assert.ok(model.profiles.galatasaray);
assert.ok(model.profiles.fenerbahce);
assert.equal(model.profiles.galatasaray.associationMatchups.ENG.samples, 7);
assert.equal(model.profiles.galatasaray.pairMatchups.liverpool.samples, 3);
assert.equal(model.profiles.galatasaray.pairMatchups.juventus.samples, 2);
assert.equal(model.profiles.fenerbahce.associationMatchups.ENG.samples, 4);
assert.equal(model.profiles.fenerbahce.pairMatchups.lyon.samples, 2);
assert.equal(model.profiles.fenerbahce.pairMatchups.feyenoord.samples, 2);

const gala = { name: 'Galatasaray', poolSlug: 'galatasaray', country: 'TUR' };
const villa = { name: 'Aston Villa', poolSlug: 'astonvilla', country: 'ENG' };
const fener = { name: 'Fenerbahçe', poolSlug: 'fenerbahce', country: 'TUR' };
const lyon = { name: 'Lyon', poolSlug: 'lyon', country: 'FRA' };
const neutral = { name: 'Other', poolSlug: 'other', country: 'SUI' };

const galaHomeEnglish = model.teamModifiers(gala, villa, 'home');
assert.equal(galaHomeEnglish.profileSlug, 'galatasaray');
assert.ok(galaHomeEnglish.details.association, 'Galatasaray vs English history should be active.');
assert.ok(galaHomeEnglish.details.historicalSignal, 'Long-run Galatasaray home-vs-English signal should be active.');
assert.ok(galaHomeEnglish.details.squad, '2026 Galatasaray squad review should be active.');
assert.ok(galaHomeEnglish.attack > 1, 'Galatasaray English-home context should lift attack modestly.');

const fenerAwayLyon = model.teamModifiers(fener, lyon, 'away');
assert.equal(fenerAwayLyon.profileSlug, 'fenerbahce');
assert.ok(fenerAwayLyon.details.away, 'Fenerbahce away-Europe context should be active.');
assert.ok(fenerAwayLyon.details.pair, 'Recent Lyon direct H2H should be active.');
assert.ok(fenerAwayLyon.details.squad, '2026 Fenerbahce squad review should be active.');

const neutralModifier = model.teamModifiers(neutral, gala, 'home');
assert.equal(neutralModifier.attack, 1);
assert.equal(neutralModifier.defense, 1);

const adjusted = model.adjustExpectedGoals({ home: gala, away: villa }, 1.5, 1.1);
assert.ok(adjusted.homeExpected !== 1.5 || adjusted.awayExpected !== 1.1);
assert.ok(adjusted.homeExpected >= 0.15 && adjusted.homeExpected <= 4);
assert.ok(adjusted.awayExpected >= 0.15 && adjusted.awayExpected <= 4);

assert.match(controller, /CONTEXT_DATA_SCRIPT_ID/);
assert.match(controller, /prediction-context-data\.js\?v=20260901a/);
assert.match(controller, /prediction-context-model\.js\?v=20260901a/);
assert.match(controller, /contextModel\(\)\?\.adjustExpectedGoals/);
assert.match(controller, /context-v\$\{contextVersion\}/);
assert.match(controller, /model-context-adjusted/);
assert.match(controller, /__contextMatchupModel: true/);

console.log('Galatasaray/Fenerbahce recency, association, H2H and squad context checks passed.');
