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

assert.equal(data.version, 54);
assert.equal(data.reviewedAt, '2026-09-02');
assert.equal(data.matches.length, 1279);
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
assert.equal(model.profiles.strumgraz.overall.samples, 16);
assert.equal(model.profiles.poznan.overall.samples, 10);
assert.equal(model.profiles.crystalpalace.overall.samples, 15);
assert.equal(model.profiles.celje.overall.samples, 22);
assert.equal(model.profiles.jagiellonia.overall.samples, 20);
assert.equal(model.profiles.omonia.overall.samples, 16);
assert.equal(model.profiles.celtavigo.overall.samples, 8);
assert.equal(model.profiles.hoffenheim.overall.samples, 8);
assert.equal(model.profiles.hapoelbeersheva.overall.samples, 6);
assert.equal(model.profiles.lillestrom.overall.samples, 4);
assert.equal(model.profiles.crete.overall.samples, 2);
assert.equal(model.profiles.ararat.overall.samples, 6);
assert.equal(model.profiles.nec.overall.samples, 4);
assert.equal(model.profiles.levskisofia.overall.samples, 6);
assert.equal(model.profiles.torreense, undefined, 'Torreense has no pre-2026/27 UEFA sample and must retain neutral European context.');
assert.equal(model.profiles.atalanta.overall.samples, 20);
assert.equal(model.profiles.braga.overall.samples, 22);
assert.equal(model.profiles.ajax.overall.samples, 16);
assert.equal(model.profiles.freiburg.overall.samples, 15);
assert.equal(model.profiles.monaco.overall.samples, 18);
assert.equal(model.profiles.copenhagen.overall.samples, 18);
assert.equal(model.profiles.midtjylland.overall.samples, 16);
assert.equal(model.profiles.crvenazvezda.overall.samples, 16);
assert.equal(model.profiles.gent.overall.samples, 8);
assert.equal(model.profiles.panathinaikos.overall.samples, 18);
assert.equal(model.profiles.pafos.overall.samples, 18);
assert.equal(model.profiles.brighton.overall.samples, 8);
assert.equal(model.profiles.trabzonspor.overall.samples, 18);
assert.equal(model.profiles.twente.overall.samples, 12);
assert.equal(model.profiles.hearts.overall.samples, 8);
assert.equal(model.profiles.lugano.overall.samples, 12);
assert.equal(model.profiles.nordsjaelland.overall.samples, 10);
assert.equal(model.profiles.cskasofia.overall.samples, 10);
assert.equal(model.profiles.truidense.overall.samples, 2);
assert.equal(model.profiles.brann.overall.samples, 10);
assert.equal(model.profiles.kairat.overall.samples, 10);
assert.equal(model.profiles.craiova.overall.samples, 8);
assert.equal(model.profiles.getafe.overall.samples, 10);
assert.equal(model.profiles.kuopio.overall.samples, 16);
assert.equal(model.profiles.lincoln.overall.samples, 14);
assert.equal(model.profiles.borac.overall.samples, 18);
assert.equal(model.profiles.bournemouth, undefined, 'Bournemouth has no recent UEFA sample before the 2026/27 league phase.');
assert.equal(model.profiles.sunderland, undefined, 'Sunderland has no recent UEFA sample before the 2026/27 league phase.');
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

let uelFixtureSpecificCoverage = 0;
let uelCapHits = 0;
for (const [homeSlug, awaySlug] of context.UCLDRAW_CURRENT_FIXTURES.uelMatches) {
  const home = model.teamModifiers(team(homeSlug), team(awaySlug), 'home');
  const away = model.teamModifiers(team(awaySlug), team(homeSlug), 'away');
  const homeKeys = Object.keys(home.details);
  const awayKeys = Object.keys(away.details);
  if (homeKeys.some((key) => matchupKeys.has(key)) || awayKeys.some((key) => matchupKeys.has(key))) {
    uelFixtureSpecificCoverage += 1;
  }
  for (const value of [home.attack, home.defense, away.attack, away.defense]) {
    assert.ok(value >= 0.88 && value <= 1.12, `UEL ${homeSlug}-${awaySlug} modifier out of bounds: ${value}`);
    if (value <= 0.8801 || value >= 1.1199) uelCapHits += 1;
  }
}
assert.equal(context.UCLDRAW_CURRENT_FIXTURES.uelMatches.length, 144);
assert.ok(uelFixtureSpecificCoverage >= 66, `Only ${uelFixtureSpecificCoverage}/144 UEL fixtures have matchup-specific evidence after Pot 3.`);
assert.equal(uelCapHits, 0, 'Europa League context should not hit safety caps.');

let ueclFixtureSpecificCoverage = 0;
let ueclCapHits = 0;
for (const [homeSlug, awaySlug] of context.UCLDRAW_CURRENT_FIXTURES.ueclMatches) {
  const home = model.teamModifiers(team(homeSlug), team(awaySlug), 'home');
  const away = model.teamModifiers(team(awaySlug), team(homeSlug), 'away');
  const homeKeys = Object.keys(home.details);
  const awayKeys = Object.keys(away.details);
  if (homeKeys.some((key) => matchupKeys.has(key)) || awayKeys.some((key) => matchupKeys.has(key))) {
    ueclFixtureSpecificCoverage += 1;
  }
  for (const value of [home.attack, home.defense, away.attack, away.defense]) {
    assert.ok(value >= 0.88 && value <= 1.12, `UECL ${homeSlug}-${awaySlug} modifier out of bounds: ${value}`);
    if (value <= 0.8801 || value >= 1.1199) ueclCapHits += 1;
  }
}
assert.equal(context.UCLDRAW_CURRENT_FIXTURES.ueclMatches.length, 108);
assert.ok(ueclFixtureSpecificCoverage >= 35, `Only ${ueclFixtureSpecificCoverage}/108 UECL fixtures have matchup-specific evidence through official Pot 4.`);
assert.equal(ueclCapHits, 0, 'Conference League context should not hit safety caps.');




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


const lechBenfica = model.teamModifiers(team('poznan'), team('benfica'), 'away');
assert.ok(lechBenfica.details.historicalPairSignal, 'Lech at Benfica should retain the 2020 direct H2H.');

const celtaCeltic = model.teamModifiers(team('celtavigo'), team('celtic'), 'away');
assert.ok(celtaCeltic.details.historicalPairSignal, 'Celta at Celtic should retain the 2002 Glasgow H2H at low confidence.');

const celtaMarseille = model.teamModifiers(team('celtavigo'), team('marseille'), 'away');
assert.ok(celtaMarseille.details.historicalPairSignal, 'Celta at Marseille should retain the old exact-venue H2H at trace confidence.');

const palaceLyon = model.teamModifiers(team('crystalpalace'), team('lyon'), 'away');
assert.ok(palaceLyon.details.analogueSignal, 'Crystal Palace at Lyon should use the recent Strasbourg away analogue.');

const sturmAz = model.teamModifiers(team('strumgraz'), team('azalkmaar'), 'away');
assert.ok(sturmAz.details.analogueSignal, 'Sturm at AZ should use the recent Feyenoord away analogue.');

const jagiAnderlecht = model.teamModifiers(team('jagiellonia'), team('anderlecht'), 'home');
assert.ok(jagiAnderlecht.details.analogueSignal, 'Jagiellonia-Anderlecht should use the recent Cercle Brugge home analogue.');


const hoffenheimLyon = model.teamModifiers(team('hoffenheim'), team('lyon'), 'home');
assert.ok(hoffenheimLyon.details.historicalPairSignal, 'Hoffenheim-Lyon should use the 2024 exact home repeat.');

const hoffenheimAnderlecht = model.teamModifiers(team('hoffenheim'), team('anderlecht'), 'away');
assert.ok(hoffenheimAnderlecht.details.historicalPairSignal, 'Hoffenheim at Anderlecht should use the January 2025 exact repeat.');

const hapoelBesiktas = model.teamModifiers(team('hapoelbeersheva'), team('besiktas'), 'away');
assert.ok(hapoelBesiktas.details.historicalPairSignal, 'Hapoel at Besiktas should retain the 2017 direct H2H.');

const hapoelJuve = model.teamModifiers(team('hapoelbeersheva'), team('juventus'), 'home');
assert.ok(hapoelJuve.details.historicalSignal, 'Hapoel-Juventus should use the old Inter Italian-club analogue at low confidence.');

const levskiSalzburg = model.teamModifiers(team('levskisofia'), team('salzburg'), 'home');
assert.ok(levskiSalzburg.details.historicalPairSignal, 'Levski-Salzburg should retain the 2009 direct H2H.');

const araratCelje = model.teamModifiers(team('ararat'), team('celje'), 'home');
assert.ok(araratCelje.details.pair, 'Ararat-Celje should use the 2026 recent direct pair.');
assert.ok(araratCelje.details.historicalPairSignal, 'Ararat-Celje should also retain the home-specific 2020/2026 signal.');

const necDinamo = model.teamModifiers(team('nec'), team('dinamo'), 'away');
assert.ok(necDinamo.details.historicalPairSignal, 'NEC at Dinamo should retain the old Zagreb H2H at trace confidence.');


const ajaxAtalanta = model.teamModifiers(team('ajax'), team('atalanta'), 'home');
assert.ok(ajaxAtalanta.details.historicalPairSignal, 'Ajax-Atalanta should retain the 2020 Amsterdam H2H.');

const ajaxMidtjylland = model.teamModifiers(team('ajax'), team('midtjylland'), 'away');
assert.ok(ajaxMidtjylland.details.historicalPairSignal, 'Ajax at Midtjylland should use the 2020 exact away H2H.');

const copenhagenLugano = model.teamModifiers(team('copenhagen'), team('lugano'), 'home');
assert.ok(copenhagenLugano.details.historicalPairSignal, 'Copenhagen-Lugano should retain the 2019 exact home H2H.');

const freiburgPana = model.teamModifiers(team('freiburg'), team('panathinaikos'), 'home');
assert.ok(freiburgPana.details.historicalSignal, 'Freiburg-Panathinaikos should use the Olympiacos Greek-club home analogue.');

const bragaCopenhagen = model.teamModifiers(team('braga'), team('copenhagen'), 'away');
assert.ok(bragaCopenhagen.details.analogueSignal, 'Braga at Copenhagen should use the Midtjylland Danish-away analogue.');

const monacoBrighton = model.teamModifiers(team('monaco'), team('brighton'), 'away');
assert.ok(monacoBrighton.details.analogueSignal, 'Monaco at Brighton should use the recent Arsenal away analogue.');


const midtjyllandAjax = model.teamModifiers(team('midtjylland'), team('ajax'), 'home');
assert.ok(midtjyllandAjax.details.historicalPairSignal, 'Midtjylland-Ajax should retain the 2020 direct H2H.');

const crvenaGent = model.teamModifiers(team('crvenazvezda'), team('gent'), 'away');
assert.ok(crvenaGent.details.historicalPairSignal, 'Crvena Zvezda at Gent should use the 2020 exact-away H2H.');

const gentCrvena = model.teamModifiers(team('gent'), team('crvenazvezda'), 'home');
assert.ok(gentCrvena.details.historicalPairSignal, 'Gent-Crvena Zvezda should use the 2020 exact-home H2H.');

const crvenaTrabzon = model.teamModifiers(team('crvenazvezda'), team('trabzonspor'), 'home');
assert.ok(crvenaTrabzon.details.historicalPairSignal, 'Crvena-Trabzonspor should use the 2022 Belgrade repeat.');

const gentBraga = model.teamModifiers(team('gent'), team('braga'), 'away');
assert.ok(gentBraga.details.historicalPairSignal, 'Gent at Braga should retain the balanced 2016 H2H.');

const brightonPana = model.teamModifiers(team('brighton'), team('panathinaikos'), 'away');
assert.ok(brightonPana.details.analogueSignal, 'Brighton at Panathinaikos should use the AEK Greek-away analogue.');

const pafosAtalanta = model.teamModifiers(team('pafos'), team('atalanta'), 'away');
assert.ok(pafosAtalanta.details.association, 'Pafos at Atalanta should use its recent Italian-away association sample.');


const trabzonCrvena = model.teamModifiers(team('trabzonspor'), team('crvenazvezda'), 'away');
assert.ok(trabzonCrvena.details.historicalPairSignal, 'Trabzonspor at Crvena Zvezda should retain the 2022 Belgrade H2H.');

const luganoCopenhagen = model.teamModifiers(team('lugano'), team('copenhagen'), 'away');
assert.ok(luganoCopenhagen.details.historicalPairSignal, 'Lugano at Copenhagen should retain the 2019 exact-away H2H.');

const luganoJablonec = model.teamModifiers(team('lugano'), team('jablonec'), 'away');
assert.ok(luganoJablonec.details.analogueSignal, 'Lugano at Jablonec should use the Mlada Boleslav Czech-away analogue.');

const luganoTruidense = model.teamModifiers(team('lugano'), team('truidense'), 'home');
assert.ok(luganoTruidense.details.analogueSignal, 'Lugano-Sint-Truiden should use the recent Gent home analogue.');

const cskaPana = model.teamModifiers(team('cskasofia'), team('panathinaikos'), 'away');
assert.ok(cskaPana.details.association, 'CSKA at Panathinaikos should use the fresh OFI Greek association sample.');
assert.ok(cskaPana.details.historicalPairSignal, 'CSKA at Panathinaikos should retain the old Athens H2H only at trace confidence.');

const cskaTrabzon = model.teamModifiers(team('cskasofia'), team('trabzonspor'), 'home');
assert.ok(cskaTrabzon.details.historicalSignal, 'CSKA-Trabzonspor should use the low-confidence Turkish-club home history.');

const cskaThun = model.teamModifiers(team('cskasofia'), team('thun'), 'home');
assert.ok(cskaThun.details.analogueSignal, 'CSKA-Thun should use the old Basel Swiss analogue at low confidence.');


const brannAarhus = model.teamModifiers(team('brann'), team('aarhus'), 'home');
assert.ok(brannAarhus.details.analogueSignal, 'Brann-Aarhus should use the January 2026 Midtjylland home analogue.');

const kairatAtalanta = model.teamModifiers(team('kairat'), team('atalanta'), 'away');
assert.ok(kairatAtalanta.details.analogueSignal, 'Kairat at Atalanta should use the recent Inter away analogue.');

const kairatPana = model.teamModifiers(team('kairat'), team('panathinaikos'), 'home');
assert.ok(kairatPana.details.analogueSignal, 'Kairat-Panathinaikos should use the recent Olympiacos home analogue.');

const heartsNordsjaelland = model.teamModifiers(team('hearts'), team('nordsjaelland'), 'home');
assert.ok(heartsNordsjaelland.details.analogueSignal, 'Hearts-Nordsjaelland should use the low-confidence Copenhagen country analogue.');


const getafeLugano = model.teamModifiers(team('getafe'), team('lugano'), 'home');
assert.ok(getafeLugano.details.analogueSignal, 'Getafe-Lugano should use the old Basel home analogue at low confidence.');

const lincolnHajduk = model.teamModifiers(team('lincoln'), team('hajduksplit'), 'home');
assert.ok(lincolnHajduk.details.analogueSignal, 'Lincoln-Hajduk should use the recent Rijeka home analogue.');

const boracPana = model.teamModifiers(team('borac'), team('panathinaikos'), 'away');
assert.ok(boracPana.details.historicalPairSignal, 'Borac at Panathinaikos should retain the recent direct H2H with venue-reversal shrinkage.');

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
assert.match(controller, /prediction-context-data\.js\?v=20260903ueclpot3backfillv54/);
assert.match(controller, /prediction-context-model\.js\?v=20260903ueclpot3backfillv54/);
assert.match(controller, /contextModel\(\)\?\.adjustExpectedGoals/);
assert.match(controller, /__contextMatchupModel: true/);

console.log(`UCL context audit passed: ${fixtureSpecificCoverage}/144 fixtures have matchup-specific evidence, no modifier cap hits.`);
