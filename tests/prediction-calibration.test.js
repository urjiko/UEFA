'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const REPORT_PATH = 'prediction-calibration-report.json';
const diagnostic = { generatedAt: new Date().toISOString(), competitions: {}, problems: [] };
process.on('exit', () => {
  try { fs.writeFileSync(REPORT_PATH, `${JSON.stringify(diagnostic, null, 2)}\n`); } catch {}
});

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

const context = vm.createContext({ window: {}, Object, Math, Number, String, Date, Set, Map, JSON, RegExp, console });
context.window = context;
context.UCLDRAW_PREDICTION_ENGINE = { createState() { return {}; } };
context.dispatchEvent = () => {};
for (const source of [sources.coefficients, sources.fixtures, sources.profiles, sources.contextData, sources.contextModel]) vm.runInContext(source, context);
vm.runInContext(sources.controller, context, { filename: 'prediction-ai-controller.js' });

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

const competitions = {
  ucl: { potCount: 4, fixtures: fixtures.uclMatches, expectedMatches: 144 },
  uel: { potCount: 4, fixtures: fixtures.uelMatches, expectedMatches: 144 },
  uecl: { potCount: 6, fixtures: fixtures.ueclMatches, expectedMatches: 108 }
};

function check(condition, message) {
  if (!condition) diagnostic.problems.push(message);
}
function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }
function strength(team, potCount) {
  return Math.log2(Number(team.coefficient || 0) + 8) + (potCount - Number(team.pot || potCount)) * 0.16;
}
function potMap(competitionId) {
  const map = new Map();
  (pots?.[competitionId] || []).forEach((slugs, index) => slugs.forEach((slug) => map.set(slug, index + 1)));
  return map;
}
function team(slug, pot) {
  const record = coefficients[slug];
  check(Boolean(record), `Missing coefficient record for ${slug}`);
  check(Number.isFinite(Number(record?.coefficient)), `Invalid coefficient for ${slug}`);
  check(Boolean(record?.country), `Missing country for ${slug}`);
  return { name: slug, poolSlug: slug, country: record?.country || '', coefficient: Number(record?.coefficient) || 0, pot };
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
  let homeWin = 0, draw = 0, awayWin = 0;
  for (let h = 0; h < home.length; h += 1) for (let a = 0; a < away.length; a += 1) {
    const probability = home[h] * away[a];
    if (h > a) homeWin += probability;
    else if (h === a) draw += probability;
    else awayWin += probability;
  }
  return { homeWin, draw, awayWin };
}
function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * fraction)));
  return sorted[index];
}
function mean(values) { return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length); }

check(Boolean(pots?.ucl && pots?.uel && pots?.uecl), 'Official 2026/27 pots must be available for calibration.');
check(Boolean(homeModel?.adjustExpectedGoals), 'Prediction home/context adjustment model must be available.');

let allFixtures = 0;
let allExtremeTotals = 0;
let allLargeShifts = 0;

for (const [competitionId, competition] of Object.entries(competitions)) {
  check(competition.fixtures.length === competition.expectedMatches, `${competitionId} fixture count changed unexpectedly: ${competition.fixtures.length}`);
  const teamPots = potMap(competitionId);
  const totals = [], homeValues = [], awayValues = [], shifts = [], outcomeRows = [];
  const extremes = [];
  const largestShifts = [];

  for (const [homeSlug, awaySlug] of competition.fixtures) {
    const homePot = teamPots.get(homeSlug);
    const awayPot = teamPots.get(awaySlug);
    check(Boolean(homePot), `Missing ${competitionId} pot for ${homeSlug}`);
    check(Boolean(awayPot), `Missing ${competitionId} pot for ${awaySlug}`);
    const home = team(homeSlug, homePot || competition.potCount);
    const away = team(awaySlug, awayPot || competition.potCount);
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

    check(Number.isFinite(homeExpected) && Number.isFinite(awayExpected), `${competitionId} ${homeSlug}-${awaySlug} produced non-finite xG.`);
    check(homeExpected >= 0.15 && homeExpected <= 4.0, `${competitionId} ${homeSlug}-${awaySlug} home xG out of bounds: ${homeExpected}`);
    check(awayExpected >= 0.15 && awayExpected <= 4.0, `${competitionId} ${homeSlug}-${awaySlug} away xG out of bounds: ${awayExpected}`);
    check(shift >= 0.68 && shift <= 1.38, `${competitionId} ${homeSlug}-${awaySlug} shifted total xG too far from base: ${shift.toFixed(3)}`);

    totals.push(totalExpected); homeValues.push(homeExpected); awayValues.push(awayExpected); shifts.push(shift);
    outcomeRows.push(outcomeProbabilities(homeExpected, awayExpected));
    if (totalExpected > 4.25) { allExtremeTotals += 1; extremes.push({ homeSlug, awaySlug, totalExpected }); }
    if (shift < 0.78 || shift > 1.25) { allLargeShifts += 1; largestShifts.push({ homeSlug, awaySlug, shift }); }
    allFixtures += 1;
  }

  const meanTotal = mean(totals);
  const meanHome = mean(homeValues);
  const meanAway = mean(awayValues);
  const meanShift = mean(shifts);
  const meanHomeWin = mean(outcomeRows.map((row) => row.homeWin));
  const meanDraw = mean(outcomeRows.map((row) => row.draw));
  const meanAwayWin = mean(outcomeRows.map((row) => row.awayWin));
  const p95Total = percentile(totals, 0.95);

  check(meanTotal >= 2.05 && meanTotal <= 3.15, `${competitionId} mean total xG looks miscalibrated: ${meanTotal.toFixed(3)}`);
  check(meanHome > meanAway, `${competitionId} should retain a league-wide home scoring edge: ${meanHome.toFixed(3)} vs ${meanAway.toFixed(3)}`);
  check(meanHomeWin >= 0.37 && meanHomeWin <= 0.58, `${competitionId} mean home-win probability looks implausible: ${meanHomeWin.toFixed(3)}`);
  check(meanDraw >= 0.18 && meanDraw <= 0.32, `${competitionId} mean draw probability looks implausible: ${meanDraw.toFixed(3)}`);
  check(meanAwayWin >= 0.20 && meanAwayWin <= 0.41, `${competitionId} mean away-win probability looks implausible: ${meanAwayWin.toFixed(3)}`);
  check(meanShift >= 0.92 && meanShift <= 1.08, `${competitionId} context/profile layer has systematic total-xG bias: ${meanShift.toFixed(3)}`);
  check(p95Total <= 3.85, `${competitionId} 95th percentile total xG is too high: ${p95Total.toFixed(3)}`);

  diagnostic.competitions[competitionId] = {
    fixtures: competition.fixtures.length,
    meanTotalXg: Number(meanTotal.toFixed(3)),
    meanHomeXg: Number(meanHome.toFixed(3)),
    meanAwayXg: Number(meanAway.toFixed(3)),
    p95TotalXg: Number(p95Total.toFixed(3)),
    maxTotalXg: Number(Math.max(...totals).toFixed(3)),
    minTotalXg: Number(Math.min(...totals).toFixed(3)),
    meanProfileContextShift: Number(meanShift.toFixed(3)),
    minShift: Number(Math.min(...shifts).toFixed(3)),
    maxShift: Number(Math.max(...shifts).toFixed(3)),
    homeWinProbability: Number(meanHomeWin.toFixed(3)),
    drawProbability: Number(meanDraw.toFixed(3)),
    awayWinProbability: Number(meanAwayWin.toFixed(3)),
    extremeTotals: extremes.sort((a, b) => b.totalExpected - a.totalExpected).slice(0, 10),
    largeShifts: largestShifts.sort((a, b) => Math.abs(b.shift - 1) - Math.abs(a.shift - 1)).slice(0, 10)
  };
}

check(allFixtures === 396, `Calibration must cover all 396 fixtures, got ${allFixtures}.`);
check(allExtremeTotals <= 8, `Too many fixtures have >4.25 total xG: ${allExtremeTotals}`);
check(allLargeShifts <= 24, `Too many fixtures receive >25% total-xG movement: ${allLargeShifts}`);
diagnostic.summary = { allFixtures, allExtremeTotals, allLargeShifts };
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(diagnostic, null, 2)}\n`);

assert.equal(diagnostic.problems.length, 0, `Prediction calibration problems: ${diagnostic.problems.join(' | ')}`);
console.log(`Prediction calibration audit passed: ${JSON.stringify(diagnostic.competitions)}`);
