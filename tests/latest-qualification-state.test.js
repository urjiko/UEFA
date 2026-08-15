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

load('teams.js', context);
load('generated-team-pools.js', context);
load('generated-club-coefficients.js', context);
load('qualification-bracket.js', context);
load('qualification-current-state.js', context);

const manifest = JSON.parse(JSON.stringify(context.window.UCLDRAW_POOL_MANIFEST));
function removeEverywhere(competitionKey, filename) {
  Object.keys(manifest[competitionKey] || {}).forEach((stage) => {
    manifest[competitionKey][stage] = (manifest[competitionKey][stage] || [])
      .filter((entry) => (typeof entry === 'string' ? entry : entry.file) !== filename);
  });
}
function move(competitionKey, filename, targetCompetitionKey, targetStage) {
  removeEverywhere(competitionKey, filename);
  removeEverywhere(targetCompetitionKey, filename);
  manifest[targetCompetitionKey][targetStage] = [...(manifest[targetCompetitionKey][targetStage] || []), filename];
}

// Known Q3 outcomes used to exercise the folder-driven resolver.
// Jagiellonia eliminated Rangers from the Europa League; Rangers dropped to Conference play-offs.
move('europa', 'jagiellonia.png', 'europa', 'playoffs');
move('europa', 'rangers.png', 'conference', 'playoffs');
// Lech Poznań eliminated KÍ Klaksvík; KÍ also drops to the Conference play-offs.
move('europa', 'poznan.png', 'europa', 'playoffs');
move('europa', 'klaksvik.png', 'conference', 'playoffs');
// Motherwell eliminated HJK from the Conference League and advanced to face Freiburg.
move('conference', 'motherwell.png', 'conference', 'playoffs');
removeEverywhere('conference', 'helsinki.png');
context.window.UCLDRAW_POOL_MANIFEST = manifest;

load('team-pool-loader.js', context);
load('coefficient-pots.js', context);
load('roster-manager.js', context);

const latest = context.window.UCLDRAW_LATEST_QUALIFICATION_STATE;
const bracket = context.window.UCLDRAW_QUALIFICATION_BRACKET;
const manager = context.window.UCLDRAW_ROSTER_MANAGER;
const data = context.window.UCLDRAW_DATA;

assert.equal(latest.snapshotDate, '2026-08-15');
assert.equal(latest.resolvedUelQ3['uel-q3-jagiellonia-rangers'].winnerId, 'jagiellonia');
assert.equal(latest.resolvedUelQ3['uel-q3-jagiellonia-rangers'].loserId, 'rangers');
assert.equal(latest.resolvedUelQ3['uel-q3-poznan-klaksvik'].winnerId, 'poznan');
assert.equal(latest.resolvedUelQ3['uel-q3-poznan-klaksvik'].loserId, 'klaksvik');
assert.equal(latest.resolvedUeclQ3['uecl-q3-helsinki-motherwell'].winnerId, 'motherwell');
assert.equal(latest.resolvedUeclQ3['uecl-q3-helsinki-motherwell'].loserId, 'helsinki');

const uelPlayoff = bracket.rounds.find((round) => round.id === 'uel-playoffs');
const jagielloniaPlayoff = uelPlayoff.ties.find((tie) => tie.id === 'uel-po-jagiellonia-rangers-larne-iberia');
assert.equal(jagielloniaPlayoff.first.id, 'jagiellonia', 'Europa play-off must use the resolved Jagiellonia winner');
const poznanPlayoff = uelPlayoff.ties.find((tie) => tie.id === 'uel-po-poznan-klaksvik-thun-vikingur');
assert.equal(poznanPlayoff.first.id, 'poznan', 'Lech Poznań must advance into its assigned Europa play-off');

const ueclPlayoff = bracket.rounds.find((round) => round.id === 'uecl-playoffs');
const rangersPlayoff = ueclPlayoff.ties.find((tie) => tie.id === 'uecl-po-jagiellonia-rangers-jablonec-rfs');
assert.equal(rangersPlayoff.first.id, 'rangers', 'Rangers must drop into their assigned Conference play-off');
const klaksvikPlayoff = ueclPlayoff.ties.find((tie) => tie.id === 'uecl-po-poznan-klaksvik-riga-gyor');
assert.equal(klaksvikPlayoff.first.id, 'klaksvik', 'KÍ must drop into its assigned Conference play-off');
const motherwellPlayoff = ueclPlayoff.ties.find((tie) => tie.id === 'uecl-po-helsinki-motherwell-freiburg');
assert.equal(motherwellPlayoff.first.id, 'motherwell');
assert.equal(motherwellPlayoff.second.id, 'freiburg');

assert.equal(manager.candidateTeam('uel', 'rangers'), null, 'Europa loser must disappear from Europa search');
assert.equal(manager.candidateTeam('uel', 'klaksvik'), null, 'KÍ must disappear from Europa search after losing Q3');
assert.ok(manager.allTeams('uecl').some((team) => team.poolSlug === 'rangers'), 'Europa loser must remain available in Conference');
assert.ok(manager.allTeams('uecl').some((team) => team.poolSlug === 'klaksvik'), 'KÍ must remain available in Conference');
assert.equal(manager.candidateTeam('uecl', 'helsinki'), null, 'Conference Q3 loser must disappear from Conference search');
assert.ok(manager.allTeams('uecl').some((team) => team.poolSlug === 'motherwell'));

for (const id of ['ucl', 'uel', 'uecl']) {
  assert.equal(data.competitions[id].teams.length, 36, `${id} must still contain 36 clubs`);
}
const ids = Object.values(data.competitions)
  .flatMap((competition) => competition.teams)
  .map((team) => team.qualificationId || team.poolSlug);
assert.equal(new Set(ids).size, 108, 'resolved Q3 paths must keep the three league phases globally unique');

for (let run = 0; run < 10; run += 1) {
  const result = bracket.simulate(() => (run + 1) / 12);
  const jagielloniaResult = result.rounds['uel-q3'].find((tie) => tie.id === 'uel-q3-jagiellonia-rangers');
  assert.equal(jagielloniaResult.winner.id, 'jagiellonia');
  assert.equal(jagielloniaResult.loser.id, 'rangers');
  const poznanResult = result.rounds['uel-q3'].find((tie) => tie.id === 'uel-q3-poznan-klaksvik');
  assert.equal(poznanResult.winner.id, 'poznan');
  assert.equal(poznanResult.loser.id, 'klaksvik');
  const motherwellResult = result.rounds['uecl-q3'].find((tie) => tie.id === 'uecl-q3-helsinki-motherwell');
  assert.equal(motherwellResult.winner.id, 'motherwell');
  assert.equal(motherwellResult.loser.id, 'helsinki');
}

console.log('Latest Europa/Conference qualification-state checks passed.');
