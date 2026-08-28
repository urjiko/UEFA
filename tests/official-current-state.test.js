'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function load(file, context) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(source, context, { filename: file });
}

const stored = new Map();
class TestCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

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
  TypeError,
  CustomEvent: TestCustomEvent
});
context.window = context;
context.window.dispatchEvent = () => {};
context.window.sessionStorage = {
  getItem(key) { return stored.has(key) ? stored.get(key) : null; },
  setItem(key, value) { stored.set(key, String(value)); },
  removeItem(key) { stored.delete(key); }
};

for (const file of [
  'teams.js',
  'generated-team-pools.js',
  'generated-club-coefficients.js',
  'qualification-bracket.js',
  'qualification-current-state.js',
  'qualification-identity-fixes.js',
  'team-pool-loader.js',
  'qualification-storage-reset.js',
  'coefficient-pots.js',
  'roster-manager.js',
  'official-league-phase-state.js',
  'current-fixtures.js',
  'prediction-engine.js'
]) load(file, context);

const data = context.window.UCLDRAW_DATA;
const official = context.window.UCLDRAW_OFFICIAL_LEAGUE_PHASE;
const current = context.window.UCLDRAW_CURRENT_FIXTURES;
const manager = context.window.UCLDRAW_ROSTER_MANAGER;
const prediction = context.window.UCLDRAW_PREDICTION_ENGINE;

assert.equal(official.snapshotDate, '2026-08-28');
assert.equal(current.snapshotDate, '2026-08-28');
assert.equal(manager.officialLeaguePhaseVersion, '2026-08-28');

const expectedPots = {
  ucl: [
    ['psg','bayern','real','liverpool','inter','city','arsenal','barcelona','atleti'],
    ['bvb','roma','sporting','astonvilla','porto','manu','brugge','realbetis','psv'],
    ['feyenoord','lille','bodo','napoli','leipzig','villareal','fenerbahce','shakhtar','galatasaray'],
    ['slavia','slovanbratislava','stuttgart','aek','lask','como','lens','viking','sabah']
  ],
  uel: [
    ['bayerleverkusen','benfica','juventus','milan','lyon','azalkmaar','olympiacos','realsociedad','marseille'],
    ['ferencvarosi','viktoriaplzen','union','dinamo','salzburg','celtic','spartapraha','rennais','anderlecht'],
    ['strumgraz','poznan','crystalpalace','bournemouth','sunderland','celje','jagiellonia','omonia','celtavigo'],
    ['hoffenheim','besiktas','torreense','hapoelbeersheva','nec','crete','lillestrom','levskisofia','ararat']
  ],
  uecl: [
    ['atalanta','braga','ajax','freiburg','monaco','copenhagen'],
    ['midtjylland','crvenazvezda','gent','panathinaikos','pafos','brighton'],
    ['lugano','getafe','kuopio','twente','lincoln','borac'],
    ['truidense','brann','hearts','kairat','trabzonspor','craiova'],
    ['riga','hajduksplit','jablonec','nordsjaelland','aarhus','interclubdescaldes'],
    ['thun','cskasofia','kaunozalgiris','mjallby','iberia1999','egnatia']
  ]
};

for (const [competitionId, pots] of Object.entries(expectedPots)) {
  const competition = data.competitions[competitionId];
  assert.equal(competition.teams.length, 36, `${competitionId} must have 36 final teams`);
  assert.equal(manager.allTeams(competitionId).length, 36, `${competitionId} search must expose only final teams`);
  assert.equal(manager.reserveTeams(competitionId).length, 0, `${competitionId} must have no qualification reserves`);

  pots.forEach((expectedSlugs, index) => {
    const actual = competition.teams
      .filter((team) => team.pot === index + 1)
      .map((team) => team.poolSlug);
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), expectedSlugs, `${competitionId} Pot ${index + 1} must match UEFA's confirmed pots`);
  });

  for (const team of competition.teams) {
    assert.equal(team.qualificationStage, 'guaranteed');
    assert.ok(manager.isGuaranteed(team), `${team.poolSlug} must be locked`);
    assert.ok(!manager.isRemovable(competitionId, team), `${team.poolSlug} must not be removable`);
  }
}

const allSlugs = Object.values(data.competitions).flatMap((competition) => competition.teams.map((team) => team.poolSlug));
assert.equal(allSlugs.length, 108);
assert.equal(new Set(allSlugs).size, 108, 'all three league phases must contain 108 unique clubs');

assert.equal(current.available('ucl'), true);
assert.equal(current.available('uel'), false);
assert.equal(current.available('uecl'), false);
assert.equal(current.metadata.ucl.schedulePublished, false);

const ucl = data.competitions.ucl;
const table = current.buildTable(ucl);
assert.ok(table);

const pairs = new Set();
for (const team of ucl.teams) {
  const fixtures = table[team.name];
  assert.equal(fixtures.length, 8, `${team.name} must have eight current opponents`);
  assert.equal(fixtures.filter((fixture) => fixture.home).length, 4, `${team.name} must have four home fixtures`);
  assert.equal(fixtures.filter((fixture) => !fixture.home).length, 4, `${team.name} must have four away fixtures`);
  assert.deepEqual(
    fixtures.map((fixture) => fixture.matchday).sort((a, b) => a - b),
    [1,2,3,4,5,6,7,8],
    `${team.name} internal prediction schedule must use each round once`
  );

  fixtures.forEach((fixture) => {
    const reciprocal = table[fixture.opponent.name].find((candidate) => candidate.opponent.name === team.name);
    assert.ok(reciprocal, `${team.name} vs ${fixture.opponent.name} must be reciprocal`);
    assert.equal(reciprocal.home, !fixture.home);
    assert.equal(reciprocal.matchday, fixture.matchday);
    assert.equal(fixture.date, null);
    pairs.add([team.name, fixture.opponent.name].sort().join('::'));
  });
}
assert.equal(pairs.size, 144, 'the current UCL draw must contain 144 unique matches');

const fenerbahce = ucl.teams.find((team) => team.poolSlug === 'fenerbahce');
const fenerFixtures = table[fenerbahce.name];
assert.deepEqual(
  new Set(fenerFixtures.filter((fixture) => fixture.home).map((fixture) => fixture.opponent.poolSlug)),
  new Set(['liverpool','roma','villareal','slavia'])
);
assert.deepEqual(
  new Set(fenerFixtures.filter((fixture) => !fixture.home).map((fixture) => fixture.opponent.poolSlug)),
  new Set(['atleti','astonvilla','shakhtar','lask'])
);

const state = prediction.createState(ucl, table, 'ucl', fenerbahce.name, 'current-fixture-test');
assert.equal(state.matches.length, 144);
assert.ok(state.matches.every((match) => match.date === null), 'unpublished UEFA match dates must stay blank');

console.log('Official 2026/27 rosters and current Champions League fixture mode checks passed.');
