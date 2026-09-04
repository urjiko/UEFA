'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(file, 'utf8');
const sources = {
  coefficients: read('generated-club-coefficients.js'),
  fixtures: read('current-fixtures.js'),
  profiles: read('generated-home-advantage-profiles.js'),
  contextData: read('prediction-context-data.js'),
  contextModel: read('prediction-context-model.js'),
  controller: read('prediction-ai-controller.js'),
  official: read('official-league-phase-state.js')
};

const context = vm.createContext({
  window: {},
  Object, Math, Number, String, Date, Set, Map, JSON, RegExp, console
});
context.window = context;
context.UCLDRAW_PREDICTION_ENGINE = { createState() { return {}; } };
context.dispatchEvent = () => {};

for (const source of [sources.coefficients, sources.fixtures, sources.profiles, sources.contextData, sources.contextModel]) {
  vm.runInContext(source, context);
}
vm.runInContext(sources.controller, context, { filename: 'prediction-ai-controller.js' });

// Capture FINAL_POTS without making the test depend on the roster-manager bootstrap.
context.UCLDRAW_DATA = { competitions: { ucl: {}, uel: {}, uecl: {} } };
context.UCLDRAW_POOL_MANIFEST = {};
context.UCLDRAW_QUALIFICATION_BRACKET = { teams: {} };
const officialProbe = sources.official.replace(
  '  function stem(entry) {',
  '  window.__CALIBRATION_FINAL_POTS = FINAL_POTS;\n  return;\n\n  function stem(entry) {'
);
vm.runInContext(officialProbe, context, { filename: 'official-league-phase-state.js' });

const pots = context.__CALIBRATION_FINAL_POTS;
const coefficients = context.UCLDRAW_CLUB_COEFFICIENTS.clubs;
const fixtures = context.UCLDRAW_CURRENT_FIXTURES;
const homeModel = context.UCLDRAW_HOME_ADVANTAGE_MODEL;
assert.ok(pots?.ucl && pots?.uel && pots?.uecl, 'Official 2026/27 pots must be available for calibration.');
assert.ok(homeModel?.adjustExpectedGoals, 'Prediction home/context adjustment model must be available.');

const competitions = {
  ucl: { potCount: 4, fixtures: fixtures.uclMatches, expectedMatches: 144 },
  uel: { potCount: 4, fixtures: fixtures.uelMatches, expectedMatches: 144 },
  uecl: { potCount: 6, fixtures: fixtures.ueclMatches, expectedMatches: 108 }
};

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function strength(team, potCount) {
  return Math.log2(Number(team.coefficient || 0) + 8)
    + (potCount - Number(team.pot || potCount)) * 0.16;
}

function potMap(competitionId) {
  const map = new Map();
  pots[competitionId].forEach((slugs, index) => slugs.forEach((slug) => map.set(slug, index + 1)));
  return map;
}

function team(slug, pot) {
  const record = coefficients[slug];
  assert.ok(record, `Missing coefficient record for ${slug}`);
  assert.ok(Number.isFinite(Number(record.coefficient)), `Invalid coefficient for ${slug}`);
  assert.ok(record.country, `Missing country for ${slug}`);
  return {
    name: slug,
    poolSlug: slug,
    country: record.country,
    coefficient: Number(record.coefficient),
    pot
  };
}

function poisson(lambda, maximum = 12) {
  const values = [Math.exp(-lambda)];
  for (let k = 1; k <= maximum; k += 1) values.push(values[k - 1] * lambda / k);
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map((value) => value / total);
}

function outcomeProbabilities(homeExpected, awayExpected) {
  const home = poisson(homeExpected);
  const away = poisson(awayExpected);
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  for (let h = 0; h < home.length; h += 1) {
    for (let a = 0; a < away.length; a += 1) {
      const probability = home[h] * away[a];
      if (h > a) homeWin += probability;
      else if (h === a) draw += probability;
      else awayWin += probability;
    }
  }
  return { homeWin, draw, awayWin };
}

function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * fraction)));
  return sorted[index];
}

const report = {};
let allFixtures = 0;
let allExtremeTotals = 0;
let allLargeShifts = 0;

for (const [competitionId, competition] of Object.entries(competitions)) {
  assert.equal(competition.fixtures.length, competition.expectedMatches, `${competitionId} fixture count changed unexpectedly.`);
  const teamPots = potMap(competitionId);
  const totals = [];
  const homeValues = [];
  const awayValues = [];
  const shifts = [];
  const outcomeRows = [];

  for (const [homeSlug, awaySlug] of competition.fixtures) {
    const homePot = teamPots.get(homeSlug);
    const awayPot = teamPots.get(awaySlug);
    assert.ok(homePot, `Missing ${competitionId} pot for ${homeSlug}`);
    assert.ok(awayPot, `Missing ${competitionId} pot for ${awaySlug}`);

    const home = team(homeSlug, homePot);
    const away = team(awaySlug, awayPot);
    const difference = strength(home, competition.potCount) - strength(away, competition.potCount);
    const baseHomeExpected = clamp(1.48 + difference * 0.28, 0.25, 3.45);
    const baseAwayExpected = clamp(1.02 - difference * 0.24, 0.20, 3.10);
    const adjusted = homeModel.adjustExpectedGoals(
      { home, away, id: `${competitionId}:${homeSlug}:${awaySlug}` },
      { id: competitionId, potCount: competition.potCount },
      baseHomeExpected,
      baseAwayExpected
    );

    const homeExpected = Number(adjusted.homeExpected);
    const awayExpected = Number(adjusted.awayExpected);
    const totalExpected = homeExpected + awayExpected;
    const baseTotal = baseHomeExpected + baseAwayExpected;
    const shift = totalExpected / baseTotal;

    assert.ok(Number.isFinite(homeExpected) && Number.isFinite(awayExpected), `${competitionId} ${homeSlug}-${awaySlug} produced non-finite xG.`);
    assert.ok(homeExpected >= 0.15 && homeExpected <= 4.0, `${competitionId} ${homeSlug}-${awaySlug} home xG out of bounds: ${homeExpected}`);
    assert.ok(awayExpected >= 0.15 && awayExpected <= 4.0, `${competitionId} ${homeSlug}-${awaySlug} away xG out of bounds: ${awayExpected}`);
    assert.ok(shift >= 0.68 && shift <= 1.38, `${competitionId} ${homeSlug}-${awaySlug} context/profile shifted total xG too far from base: ${shift}`);

    totals.push(totalExpected);
    homeValues.push(homeExpected);
    awayValues.push(awayExpected);
    shifts.push(shift);
    outcomeRows.push(outcomeProbabilities(homeExpected, awayExpected));
    if (totalExpected > 4.25) allExtremeTotals += 1;
    if (shift < 0.78 || shift > 1.25) allLargeShifts += 1;
    allFixtures += 1;
  }

  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const meanTotal = mean(totals);
  const meanHome = mean(homeValues);
  const meanAway = mean(awayValues);
  const meanShift = mean(shifts);
  const meanHomeWin = mean(outcomeRows.map((row) => row.homeWin));
  const meanDraw = mean(outcomeRows.map((row) => row.draw));
  const meanAwayWin = mean(outcomeRows.map((row) => row.awayWin));

  assert.ok(meanTotal >= 2.05 && meanTotal <= 3.15, `${competitionId} mean total xG looks miscalibrated: ${meanTotal}`);
  assert.ok(meanHome > meanAway, `${competitionId} should retain a league-wide home scoring edge.`);
  assert.ok(meanHomeWin >= 0.37 && meanHomeWin <= 0.58, `${competitionId} mean home-win probability looks implausible: ${meanHomeWin}`);
  assert.ok(meanDraw >= 0.18 && meanDraw <= 0.32, `${competitionId} mean draw probability looks implausible: ${meanDraw}`);
  assert.ok(meanAwayWin >= 0.20 && meanAwayWin <= 0.41, `${competitionId} mean away-win probability looks implausible: ${meanAwayWin}`);
  assert.ok(meanShift >= 0.92 && meanShift <= 1.08, `${competitionId} context/profile layer has a systematic total-xG bias: ${meanShift}`);
  assert.ok(percentile(totals, 0.95) <= 3.85, `${competitionId} 95th percentile total xG is too high.`);

  report[competitionId] = {
    fixtures: competition.fixtures.length,
    meanTotalXg: Number(meanTotal.toFixed(3)),
    meanHomeXg: Number(meanHome.toFixed(3)),
    meanAwayXg: Number(meanAway.toFixed(3)),
    p95TotalXg: Number(percentile(totals, 0.95).toFixed(3)),
    meanProfileContextShift: Number(meanShift.toFixed(3)),
    homeWinProbability: Number(meanHomeWin.toFixed(3)),
    drawProbability: Number(meanDraw.toFixed(3)),
    awayWinProbability: Number(meanAwayWin.toFixed(3))
  };
}

assert.equal(allFixtures, 396, 'Calibration must cover all 396 league-phase fixtures across UCL, UEL and UECL.');
assert.ok(allExtremeTotals <= 8, `Too many fixtures have >4.25 total xG: ${allExtremeTotals}`);
assert.ok(allLargeShifts <= 24, `Too many fixtures receive >25% total-xG movement from context/profile layers: ${allLargeShifts}`);

console.log(`Prediction calibration audit passed: ${JSON.stringify(report)}`);
