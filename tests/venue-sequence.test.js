'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const baseEngine = require('../draw-engine-v2.js');
const venueSequence = require('../venue-sequence-v4.js');

const engine = venueSequence.wrapEngine(baseEngine);
const teamsSource = fs.readFileSync(path.resolve(__dirname, '..', 'teams.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(teamsSource, sandbox, { filename: 'teams.js' });
const competitions = sandbox.window.UCLDRAW_DATA.competitions;

const doubleAllowed = venueSequence.sequenceViolations([true, true, false, true, false, false]).triples === 0;
const tripleRejected = venueSequence.sequenceViolations([true, true, true, false, true, false]).triples > 0;
if (!doubleAllowed || !tripleRejected) {
  throw new Error('Venue rule must allow two consecutive matches and reject three consecutive matches.');
}


const customCompetition = competitions.ucl;
const customSelected = customCompetition.teams[0];
const baseCustomTable = engine.generateCompetitionDraw(customCompetition);
const originalCustomFixtures = baseCustomTable[customSelected.name];
const originalOpponentNames = new Set(originalCustomFixtures.map((fixture) => fixture.opponent.name));
const targetFixture = originalCustomFixtures[0];
const selectedCountryCounts = originalCustomFixtures.reduce((counts, fixture) => {
  counts[fixture.opponent.country] = (counts[fixture.opponent.country] || 0) + 1;
  return counts;
}, {});
selectedCountryCounts[targetFixture.opponent.country] -= 1;
const replacement = customCompetition.teams.find((team) => (
  team.pot === targetFixture.opponent.pot
  && team !== customSelected
  && team.country !== customSelected.country
  && !originalOpponentNames.has(team.name)
  && (selectedCountryCounts[team.country] || 0) < 2
));
if (!replacement) throw new Error('Could not find a valid custom replacement candidate for the fixed-fixture test.');

const fixedFixtures = originalCustomFixtures.map((fixture, index) => ({
  team: customSelected,
  opponent: index === 0 ? replacement : fixture.opponent,
  home: fixture.home
}));
const customTable = engine.generateCompetitionDraw(customCompetition, {
  fixedFixtures,
  venueSequenceAttempts: 12
});
const customValidation = engine.validateCompetitionDraw(customCompetition, customTable);
if (!customValidation.valid) throw new Error(`custom fixed draw: ${customValidation.reason}`);

for (const fixed of fixedFixtures) {
  const actual = customTable[customSelected.name].find((fixture) => fixture.opponent === fixed.opponent);
  if (!actual) throw new Error(`Custom opponent was not preserved: ${fixed.opponent.name}`);
  if (actual.home !== fixed.home) throw new Error(`Custom H/A direction was not preserved: ${fixed.opponent.name}`);
}
if (customTable[customSelected.name].some((fixture) => fixture.opponent === targetFixture.opponent)) {
  throw new Error('The replaced automatic opponent leaked back into the customized team schedule.');
}
if (customTable[customSelected.name].length !== customCompetition.potCount * customCompetition.opponentsPerPot) {
  throw new Error('Customized team must still have the full league-phase fixture count.');
}
console.log('Fixed custom fixture regeneration passed.');

for (const competition of Object.values(competitions)) {
  console.log(`testing ${competition.id}...`);
  for (let run = 0; run < 3; run += 1) {
    const table = engine.generateCompetitionDraw(competition);
    const validation = engine.validateCompetitionDraw(competition, table);
    if (!validation.valid) throw new Error(`${competition.id}: ${validation.reason}`);

    for (const team of competition.teams) {
      const fixtures = table[team.name];
      const sequence = fixtures.map((fixture) => fixture.home);
      for (let index = 2; index < sequence.length; index += 1) {
        if (sequence[index] === sequence[index - 1] && sequence[index] === sequence[index - 2]) {
          throw new Error(`${competition.id}/${team.name}: three identical venue statuses in a row.`);
        }
      }
    }
  }
  console.log(`${competition.id}: venue sequence passed.`);
}
