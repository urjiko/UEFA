'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const controllerSource = read('prediction-ai-controller.js');
const builderSource = read('scripts/build-home-advantage-profiles.mjs');
const generatedSource = read('generated-home-advantage-profiles.js');
const strengthSource = read('current-team-strength-profiles.js');

const dataDirectory = path.join(root, 'data', 'home-advantage-matches');
const dataFiles = [
  'data/home-advantage-matches.json',
  ...fs.readdirSync(dataDirectory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => `data/home-advantage-matches/${name}`)
];
const records = dataFiles.flatMap((file) => JSON.parse(read(file)));
const matchKeys = records.map((match) => [
  match.date,
  match.competitionType,
  match.competition || '',
  match.homeSlug,
  match.awaySlug
].join('|'));

assert.equal(records.length, 1359, 'Stored source archive must include the batch-1 research records.');
assert.equal(new Set(matchKeys).size, records.length, 'Stored home matches must be unique.');
assert.equal(records.filter((match) => match.competitionType === 'domestic').length, 1323);
assert.equal(records.filter((match) => match.competitionType === 'europe').length, 36);
assert.equal(
  records.filter((match) => match.sourceFile === 'does-not-exist').length,
  0
);
assert.equal(
  records.filter((match) => match.homeSlug === 'galatasaray' && match.competitionType === 'europe').length,
  18
);
assert.equal(
  records.filter((match) => match.homeSlug === 'fenerbahce' && match.competitionType === 'europe').length,
  15
);
assert.ok(dataFiles.includes('data/home-advantage-matches/batch1-galatasaray-fenerbahce-europe-2024-26.json'));

assert.match(builderSource, /recencyHalfLifeYears:\s*3/);
assert.match(builderSource, /minimumAssociationSample:\s*3/);
assert.match(builderSource, /minimumAssociationEffectiveSample:\s*2\.0/);
assert.match(builderSource, /directPriorMatches:\s*10/);
assert.match(builderSource, /minimumDirectSample:\s*2/);
assert.match(builderSource, /minimumDirectEffectiveSample:\s*1\.2/);
assert.match(builderSource, /directOpponents:\s*new Map\(\)/);
assert.match(builderSource, /directMatchups/);
assert.match(builderSource, /Duplicate home-advantage match/);

const generatedContext = { window: {}, Object };
vm.runInNewContext(generatedSource, generatedContext, {
  filename: 'generated-home-advantage-profiles.js'
});
const generated = generatedContext.window.UCLDRAW_HOME_ADVANTAGE_PROFILES;

assert.equal(generated.version, 2);
assert.equal(generated.latestMatchDate, '2026-08-18');
assert.equal(generated.sourceSummary.storedMatches, 1359);
assert.equal(generated.sourceSummary.matches, 1323);
assert.equal(generated.sourceSummary.excludedStoredMatches, 36);
assert.equal(generated.sourceSummary.teams, 69);
assert.equal(generated.sourceSummary.activeTeamScope, 132);
assert.equal(generated.sourceSummary.domesticMatches, 1287);
assert.equal(generated.sourceSummary.europeanMatches, 36);
assert.equal(generated.sourceSummary.latestIncludedMatchDate, '2026-08-18');
assert.ok(generated.sourceSummary.files.includes('data/home-advantage-matches/batch1-galatasaray-fenerbahce-europe-2024-26.json'));
assert.equal(generated.methodology.minimumAssociationSample, 3);
assert.equal(generated.methodology.minimumAssociationEffectiveSample, 2);
assert.equal(generated.methodology.minimumDirectSample, 2);
assert.equal(generated.methodology.minimumDirectEffectiveSample, 1.2);
assert.equal(generated.scope.teams.length, 132);
assert.equal(new Set(generated.scope.teams).size, 132);

const gala = generated.profiles.galatasaray;
assert.ok(gala);
assert.equal(gala.samples.europe.raw, 18);
assert.equal(gala.samples.europe.effective, 12.23);
assert.equal(gala.associationMatchups.ENG.samples, 4);
assert.equal(gala.associationMatchups.ENG.effectiveSample, 2.92);
assert.ok(gala.associationMatchups.ENG.attack > 1, 'Recent English home sample should increase Galatasaray attack expectation.');
assert.ok(gala.associationMatchups.ENG.defense < 1, 'Recent English home sample should reduce opponent scoring expectation.');
assert.equal(gala.directMatchups.liverpool.samples, 2);
assert.equal(gala.directMatchups.liverpool.effectiveSample, 1.72);
assert.ok(gala.directMatchups.liverpool.defense < 1);

const fener = generated.profiles.fenerbahce;
assert.ok(fener);
assert.equal(fener.samples.europe.raw, 15);
assert.equal(fener.samples.europe.effective, 12.2);
assert.equal(fener.associationMatchups.ENG.samples, 3);
assert.equal(fener.associationMatchups.ENG.effectiveSample, 2.43);
assert.ok(fener.associationMatchups.ENG.attack < 1, 'Recent English home sample should dampen Fenerbahçe attack expectation.');
assert.ok(fener.associationMatchups.ENG.defense > 1, 'Recent English home sample should reflect increased goals conceded.');
assert.equal(fener.directMatchups.lyon.samples, 2);
assert.equal(fener.directMatchups.lyon.effectiveSample, 1.7);

const strengthContext = { window: {}, Object };
vm.runInNewContext(strengthSource, strengthContext, {
  filename: 'current-team-strength-profiles.js'
});
const strengthProfiles = strengthContext.window.UCLDRAW_CURRENT_TEAM_STRENGTH;
assert.equal(strengthProfiles.version, 1);
assert.equal(strengthProfiles.sourceDate, '2026-09-01');
assert.deepEqual(Array.from(strengthProfiles.methodology.factorBounds), [0.94, 1.06]);
assert.equal(strengthProfiles.profiles.galatasaray.attackImpact, 3.9);
assert.equal(strengthProfiles.profiles.fenerbahce.defenseImpact, 1.7);
assert.ok(strengthProfiles.profiles.galatasaray.evidence.some((item) => item.includes('Rafael Leao')));
assert.ok(strengthProfiles.profiles.fenerbahce.evidence.some((item) => item.includes('Nathan Ake')));

const home = { name: 'Galatasaray', poolSlug: 'galatasaray', country: 'TUR', coefficient: 53.5, pot: 3 };
const strongerAway = { name: 'Liverpool', poolSlug: 'liverpool', country: 'ENG', coefficient: 130, pot: 1 };
const neutralHome = { name: 'Neutral FC', poolSlug: 'neutral-fc', country: 'NED', coefficient: 53.5, pot: 3 };

const baseEngine = {
  createState(comp, table, leagueId, selectedTeamName, seed = 'test') {
    return {
      comp, table, leagueId, selectedTeamName, seed,
      matches: [], scores: {}, matchLocks: {}, teamLocks: {},
      activeMatchdays: {}, rerollVersion: {}
    };
  },
  applyOutcome(state, matchId) {
    state.scores[matchId] = { homeGoals: 1, awayGoals: 0, source: 'user-outcome' };
    state.matchLocks[matchId] = true;
    const match = state.matches.find((candidate) => candidate.id === matchId);
    state.rerollVersion[match.matchday] = Number(state.rerollVersion[match.matchday] || 0) + 1;
    return state.scores[matchId];
  },
  applyPoints(state, matchId) {
    return this.applyOutcome(state, matchId);
  },
  setManualScore(state, matchId, homeGoals, awayGoals) {
    state.scores[matchId] = {
      homeGoals: Number(homeGoals),
      awayGoals: Number(awayGoals),
      source: 'user-score'
    };
    state.matchLocks[matchId] = true;
    const match = state.matches.find((candidate) => candidate.id === matchId);
    state.rerollVersion[match.matchday] = Number(state.rerollVersion[match.matchday] || 0) + 1;
    return state.scores[matchId];
  }
};

const context = vm.createContext({
  window: {
    UCLDRAW_PREDICTION_ENGINE: baseEngine,
    UCLDRAW_HOME_ADVANTAGE_PROFILES: {
      version: 2,
      methodology: {
        opponentStrengthThreshold: 0.55,
        attackBounds: [0.84, 1.18],
        defenseBounds: [0.82, 1.16]
      },
      profiles: {
        galatasaray: {
          attack: { overall: 1.05, europe: 1.10, vsStronger: 1.12 },
          defense: { overall: 0.98, europe: 0.94, vsStronger: 0.92 },
          confidence: { overall: 0.8, europe: 0.7, vsStronger: 0.6 },
          defenseConfidence: { overall: 0.8, europe: 0.7, vsStronger: 0.6 },
          associationMatchups: {
            ENG: { attack: 1.12, defense: 0.94, confidence: 0.4, samples: 4 }
          },
          directMatchups: {
            liverpool: { attack: 1.08, defense: 0.9, confidence: 0.3, samples: 2 }
          }
        }
      }
    },
    UCLDRAW_CURRENT_TEAM_STRENGTH: {
      version: 1,
      methodology: {
        impactPointPercent: 0.01,
        maximumAbsoluteImpactPoints: 6,
        factorBounds: [0.94, 1.06]
      },
      profiles: {
        galatasaray: {
          attackImpact: 4,
          defenseImpact: 2,
          attackConfidence: 0.5,
          defenseConfidence: 0.5
        },
        liverpool: {
          attackImpact: 2,
          defenseImpact: 2,
          attackConfidence: 0.5,
          defenseConfidence: 0.5
        }
      }
    },
    dispatchEvent() {}
  },
  CustomEvent: class CustomEvent {
    constructor(type, options) { this.type = type; this.detail = options?.detail; }
  },
  console, Math, Object, Number, String, Boolean, Array, Map, Set, JSON
});
context.window.window = context.window;
vm.runInContext(controllerSource, context, { filename: 'prediction-ai-controller.js' });

const model = context.window.UCLDRAW_HOME_ADVANTAGE_MODEL;
const engine = context.window.UCLDRAW_PREDICTION_ENGINE;
assert.ok(model);
assert.equal(engine.__homeAdvantageModel, true);
assert.equal(model.opponentBand(home, strongerAway, 4), 'vsStronger');
assert.equal(model.currentStrengthFactor(home, 'attack'), 1.02);
assert.equal(model.currentStrengthFactor(home, 'defense'), 0.99);
assert.equal(model.currentStrengthFactor(strongerAway, 'attack'), 1.01);
assert.equal(model.currentStrengthFactor(strongerAway, 'defense'), 0.99);
assert.equal(model.currentStrengthFactor(neutralHome, 'attack'), 1);

const adjusted = model.adjustExpectedGoals(
  { home, away: strongerAway },
  { id: 'ucl', potCount: 4 },
  1.5,
  1
);
assert.ok(adjusted.homeExpected > 1.5);
assert.ok(adjusted.awayExpected < 1);
assert.ok(adjusted.attackMultiplier <= 1.18);
assert.ok(adjusted.defenseMultiplier >= 0.82);
assert.equal(adjusted.homeSquadAttack, 1.02);
assert.equal(adjusted.homeSquadDefense, 0.99);
assert.equal(adjusted.awaySquadAttack, 1.01);
assert.equal(adjusted.awaySquadDefense, 0.99);
assert.equal(adjusted.profileSlug, 'galatasaray');

const neutral = model.adjustExpectedGoals(
  { home: neutralHome, away: { ...strongerAway, poolSlug: 'unknown', country: 'SCO' } },
  { id: 'ucl', potCount: 4 },
  1.5,
  1
);
assert.equal(neutral.homeExpected, 1.5);
assert.equal(neutral.awayExpected, 1);
assert.equal(neutral.profileSlug, null);

const match = { id: '1:galatasaray:liverpool', matchday: 1, home, away: strongerAway };
const state = {
  comp: { id: 'ucl', potCount: 4 },
  seed: 'fixed-seed',
  matches: [match],
  scores: {},
  matchLocks: {},
  teamLocks: {},
  activeMatchdays: {},
  rerollVersion: { 1: 0 }
};
engine.simulateMatchday(state, 1);
assert.equal(state.scores[match.id].source, 'model-home-adjusted');
assert.equal(state.scores[match.id].model.homeProfile, 'galatasaray');
assert.equal(state.scores[match.id].model.currentStrengthVersion, 1);
assert.equal(state.scores[match.id].model.homeSquadAttackMultiplier, 1.02);
const firstScore = JSON.stringify(state.scores[match.id]);

state.scores = {};
state.activeMatchdays = {};
state.rerollVersion[1] = 0;
engine.simulateMatchday(state, 1);
assert.equal(JSON.stringify(state.scores[match.id]), firstScore);

console.log('Batch-1 European home, association, H2H and current-squad model checks passed.');
