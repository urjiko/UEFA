(() => {
  'use strict';

  // UEFA published the 2026/27 Champions League opponent draw on 27 August.
  // Match dates/order were not yet published when this snapshot was created,
  // so matchday numbers below are an internal valid 8-round arrangement only.
  const UCL_MATCHES = Object.freeze([["aek","real",8],["aek","roma",3],["aek","galatasaray",4],["aek","lask",7],["arsenal","real",6],["arsenal","bvb",8],["arsenal","lille",4],["arsenal","sabah",2],["astonvilla","psg",4],["astonvilla","bvb",5],["astonvilla","fenerbahce",1],["astonvilla","viking",6],["atleti","bayern",2],["atleti","manu",8],["atleti","fenerbahce",6],["atleti","viking",3],["barcelona","city",5],["barcelona","astonvilla",8],["barcelona","feyenoord",6],["barcelona","como",4],["bayern","arsenal",3],["bayern","realbetis",4],["bayern","bodo",8],["bayern","slavia",6],["bodo","atleti",1],["bodo","bvb",4],["bodo","lille",3],["bodo","lask",5],["brugge","liverpool",4],["brugge","astonvilla",2],["brugge","bodo",6],["brugge","lens",1],["bvb","inter",7],["bvb","realbetis",2],["bvb","villareal",3],["bvb","aek",1],["city","psg",6],["city","sporting",7],["city","napoli",4],["city","aek",2],["como","psg",7],["como","manu",5],["como","leipzig",8],["como","aek",6],["fenerbahce","liverpool",5],["fenerbahce","roma",2],["fenerbahce","villareal",7],["fenerbahce","slavia",4],["feyenoord","inter",4],["feyenoord","porto",3],["feyenoord","leipzig",7],["feyenoord","como",1],["galatasaray","barcelona",1],["galatasaray","astonvilla",7],["galatasaray","feyenoord",2],["galatasaray","stuttgart",8],["inter","liverpool",6],["inter","brugge",5],["inter","shakhtar",2],["inter","stuttgart",3],["lask","liverpool",1],["lask","porto",4],["lask","fenerbahce",3],["lask","slovanbratislava",6],["leipzig","city",3],["leipzig","psv",2],["leipzig","shakhtar",4],["leipzig","lens",6],["lens","city",8],["lens","sporting",4],["lens","bodo",7],["lens","como",2],["lille","bayern",1],["lille","realbetis",8],["lille","galatasaray",5],["lille","slovanbratislava",2],["liverpool","atleti",7],["liverpool","porto",8],["liverpool","villareal",2],["liverpool","lens",3],["manu","bayern",7],["manu","roma",6],["manu","leipzig",1],["manu","sabah",3],["napoli","arsenal",5],["napoli","brugge",3],["napoli","bodo",2],["napoli","viking",1],["porto","city",1],["porto","psv",5],["porto","napoli",7],["porto","slavia",2],["psg","barcelona",2],["psg","roma",8],["psg","galatasaray",3],["psg","slovanbratislava",5],["psv","atleti",4],["psv","brugge",8],["psv","shakhtar",6],["psv","stuttgart",1],["real","inter",1],["real","psv",3],["real","leipzig",5],["real","lask",2],["realbetis","arsenal",1],["realbetis","porto",6],["realbetis","feyenoord",5],["realbetis","como",3],["roma","real",4],["roma","sporting",5],["roma","lille",7],["roma","slovanbratislava",1],["sabah","barcelona",7],["sabah","bvb",6],["sabah","napoli",8],["sabah","slavia",1],["shakhtar","real",7],["shakhtar","sporting",1],["shakhtar","fenerbahce",8],["shakhtar","aek",5],["slavia","arsenal",7],["slavia","astonvilla",3],["slavia","villareal",8],["slavia","lens",5],["slovanbratislava","inter",8],["slovanbratislava","realbetis",7],["slovanbratislava","shakhtar",3],["slovanbratislava","stuttgart",4],["sporting","barcelona",3],["sporting","manu",2],["sporting","galatasaray",6],["sporting","lask",8],["stuttgart","atleti",5],["stuttgart","brugge",7],["stuttgart","lille",6],["stuttgart","viking",2],["viking","bayern",5],["viking","psv",7],["viking","feyenoord",8],["viking","sabah",4],["villareal","psg",1],["villareal","manu",4],["villareal","napoli",6],["villareal","sabah",5]]);

  const metadata = Object.freeze({
    ucl: Object.freeze({
      available: true,
      opponentsPublished: true,
      schedulePublished: false,
      sourceDate: '2026-08-27',
      note: 'UEFA rakipleri ve ev/deplasman yönlerini açıkladı. Kesin maç tarihleri henüz yayınlanmadı.'
    }),
    uel: Object.freeze({
      available: false,
      opponentsPublished: false,
      schedulePublished: false,
      sourceDate: null,
      note: 'Europa League lig aşaması kurası henüz yapılmadı.'
    }),
    uecl: Object.freeze({
      available: false,
      opponentsPublished: false,
      schedulePublished: false,
      sourceDate: null,
      note: 'Conference League lig aşaması kurası henüz yapılmadı.'
    })
  });

  function buildUclTable(competition) {
    const bySlug = new Map((competition?.teams || []).map((team) => [team.poolSlug, team]));
    const table = Object.fromEntries((competition?.teams || []).map((team) => [team.name, []]));

    for (const [homeSlug, awaySlug, matchday] of UCL_MATCHES) {
      const home = bySlug.get(homeSlug);
      const away = bySlug.get(awaySlug);
      if (!home || !away) {
        throw new Error(`Güncel UCL fikstüründe takım bulunamadı: ${homeSlug} - ${awaySlug}`);
      }
      table[home.name].push({
        opponent: away,
        pot: away.pot,
        home: true,
        matchday,
        date: null,
        officialFixture: true
      });
      table[away.name].push({
        opponent: home,
        pot: home.pot,
        home: false,
        matchday,
        date: null,
        officialFixture: true
      });
    }

    for (const team of competition.teams) {
      const fixtures = table[team.name] || [];
      const homes = fixtures.filter((fixture) => fixture.home).length;
      const aways = fixtures.length - homes;
      if (fixtures.length !== 8 || homes !== 4 || aways !== 4) {
        throw new Error(`${team.name} için güncel UCL fikstürü 4 iç saha + 4 deplasman değil.`);
      }
      fixtures.sort((first, second) => first.matchday - second.matchday);
    }

    return table;
  }

  function buildTable(competition) {
    if (!competition?.id) return null;
    const info = metadata[competition.id];
    if (!info?.available) return null;
    if (competition.id === 'ucl') return buildUclTable(competition);
    return null;
  }

  function available(leagueId) {
    return Boolean(metadata[leagueId]?.available);
  }

  window.UCLDRAW_CURRENT_FIXTURES = Object.freeze({
    snapshotDate: '2026-08-28',
    metadata,
    uclMatches: UCL_MATCHES,
    available,
    buildTable
  });
})();