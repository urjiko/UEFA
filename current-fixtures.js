(() => {
  'use strict';

  // Opponents + H/A are official UEFA draw outcomes.
  // Until UEFA publishes each exact pairing date, matchday numbers below are only
  // an internal collision-free ordering used by the prediction engine.
  const OFFICIAL_MATCHES = Object.freeze({
    ucl: Object.freeze([["aek","real",8],["aek","roma",3],["aek","galatasaray",4],["aek","lask",7],["arsenal","real",6],["arsenal","bvb",8],["arsenal","lille",4],["arsenal","sabah",2],["astonvilla","psg",4],["astonvilla","bvb",5],["astonvilla","fenerbahce",1],["astonvilla","viking",6],["atleti","bayern",2],["atleti","manu",8],["atleti","fenerbahce",6],["atleti","viking",3],["barcelona","city",5],["barcelona","astonvilla",8],["barcelona","feyenoord",6],["barcelona","como",4],["bayern","arsenal",3],["bayern","realbetis",4],["bayern","bodo",8],["bayern","slavia",6],["bodo","atleti",1],["bodo","bvb",4],["bodo","lille",3],["bodo","lask",5],["brugge","liverpool",4],["brugge","astonvilla",2],["brugge","bodo",6],["brugge","lens",1],["bvb","inter",7],["bvb","realbetis",2],["bvb","villareal",3],["bvb","aek",1],["city","psg",6],["city","sporting",7],["city","napoli",4],["city","aek",2],["como","psg",7],["como","manu",5],["como","leipzig",8],["como","aek",6],["fenerbahce","liverpool",5],["fenerbahce","roma",2],["fenerbahce","villareal",7],["fenerbahce","slavia",4],["feyenoord","inter",4],["feyenoord","porto",3],["feyenoord","leipzig",7],["feyenoord","como",1],["galatasaray","barcelona",1],["galatasaray","astonvilla",7],["galatasaray","feyenoord",2],["galatasaray","stuttgart",8],["inter","liverpool",6],["inter","brugge",5],["inter","shakhtar",2],["inter","stuttgart",3],["lask","liverpool",1],["lask","porto",4],["lask","fenerbahce",3],["lask","slovanbratislava",6],["leipzig","city",3],["leipzig","psv",2],["leipzig","shakhtar",4],["leipzig","lens",6],["lens","city",8],["lens","sporting",4],["lens","bodo",7],["lens","como",2],["lille","bayern",1],["lille","realbetis",8],["lille","galatasaray",5],["lille","slovanbratislava",2],["liverpool","atleti",7],["liverpool","porto",8],["liverpool","villareal",2],["liverpool","lens",3],["manu","bayern",7],["manu","roma",6],["manu","leipzig",1],["manu","sabah",3],["napoli","arsenal",5],["napoli","brugge",3],["napoli","bodo",2],["napoli","viking",1],["porto","city",1],["porto","psv",5],["porto","napoli",7],["porto","slavia",2],["psg","barcelona",2],["psg","roma",8],["psg","galatasaray",3],["psg","slovanbratislava",5],["psv","atleti",4],["psv","brugge",8],["psv","shakhtar",6],["psv","stuttgart",1],["real","inter",1],["real","psv",3],["real","leipzig",5],["real","lask",2],["realbetis","arsenal",1],["realbetis","porto",6],["realbetis","feyenoord",5],["realbetis","como",3],["roma","real",4],["roma","sporting",5],["roma","lille",7],["roma","slovanbratislava",1],["sabah","barcelona",7],["sabah","bvb",6],["sabah","napoli",8],["sabah","slavia",1],["shakhtar","real",7],["shakhtar","sporting",1],["shakhtar","fenerbahce",8],["shakhtar","aek",5],["slavia","arsenal",7],["slavia","astonvilla",3],["slavia","villareal",8],["slavia","lens",5],["slovanbratislava","inter",8],["slovanbratislava","realbetis",7],["slovanbratislava","shakhtar",3],["slovanbratislava","stuttgart",4],["sporting","barcelona",3],["sporting","manu",2],["sporting","galatasaray",6],["sporting","lask",8],["stuttgart","atleti",5],["stuttgart","brugge",7],["stuttgart","lille",6],["stuttgart","viking",2],["viking","bayern",5],["viking","psv",7],["viking","feyenoord",8],["viking","sabah",4],["villareal","psg",1],["villareal","manu",4],["villareal","napoli",6],["villareal","sabah",5]]),
    uel: Object.freeze([["realsociedad","torreense",1],["spartapraha","lillestrom",1],["celje","olympiacos",1],["ararat","nec",1],["dinamo","bayerleverkusen",1],["omonia","celtic",1],["marseille","anderlecht",1],["sunderland","jagiellonia",1],["hapoelbeersheva","celtavigo",1],["hoffenheim","lyon",1],["benfica","crete",1],["strumgraz","rennais",1],["bournemouth","milan",1],["ferencvarosi","viktoriaplzen",1],["levskisofia","salzburg",1],["union","poznan",1],["azalkmaar","juventus",1],["besiktas","crystalpalace",1],["ferencvarosi","torreense",2],["olympiacos","milan",2],["ararat","spartapraha",2],["hoffenheim","besiktas",2],["juventus","rennais",2],["hapoelbeersheva","dinamo",2],["benfica","azalkmaar",2],["nec","omonia",2],["union","realsociedad",2],["sunderland","levskisofia",2],["strumgraz","marseille",2],["celje","salzburg",2],["lillestrom","bournemouth",2],["poznan","bayerleverkusen",2],["lyon","crystalpalace",2],["viktoriaplzen","jagiellonia",2],["crete","anderlecht",2],["celtic","celtavigo",2],["celtavigo","lillestrom",3],["celje","omonia",3],["nec","levskisofia",3],["realsociedad","viktoriaplzen",3],["rennais","olympiacos",3],["ferencvarosi","juventus",3],["crete","poznan",3],["salzburg","ararat",3],["besiktas","union",3],["hoffenheim","strumgraz",3],["jagiellonia","crystalpalace",3],["torreense","celtic",3],["bayerleverkusen","marseille",3],["anderlecht","lyon",3],["spartapraha","bournemouth",3],["milan","benfica",3],["sunderland","dinamo",3],["azalkmaar","hapoelbeersheva",3],["torreense","sunderland",4],["rennais","dinamo",4],["marseille","olympiacos",4],["viktoriaplzen","union",4],["spartapraha","azalkmaar",4],["crete","bayerleverkusen",4],["crystalpalace","hoffenheim",4],["omonia","celtavigo",4],["jagiellonia","anderlecht",4],["juventus","nec",4],["ararat","celje",4],["benfica","poznan",4],["levskisofia","lillestrom",4],["celtic","ferencvarosi",4],["realsociedad","lyon",4],["besiktas","hapoelbeersheva",4],["bournemouth","strumgraz",4],["salzburg","milan",4],["strumgraz","crete",5],["union","celtic",5],["bayerleverkusen","salzburg",5],["crystalpalace","spartapraha",5],["omonia","besiktas",5],["hapoelbeersheva","juventus",5],["dinamo","anderlecht",5],["realsociedad","bournemouth",5],["poznan","torreense",5],["ferencvarosi","celje",5],["jagiellonia","ararat",5],["viktoriaplzen","benfica",5],["olympiacos","hoffenheim",5],["lyon","lillestrom",5],["sunderland","azalkmaar",5],["levskisofia","milan",5],["nec","rennais",5],["marseille","celtavigo",5],["crete","hoffenheim",6],["nec","benfica",6],["celtavigo","union",6],["spartapraha","rennais",6],["salzburg","crystalpalace",6],["lillestrom","realsociedad",6],["torreense","olympiacos",6],["viktoriaplzen","levskisofia",6],["juventus","omonia",6],["bayerleverkusen","besiktas",6],["jagiellonia","lyon",6],["celtic","marseille",6],["poznan","ferencvarosi",6],["azalkmaar","dinamo",6],["anderlecht","sunderland",6],["strumgraz","celje",6],["bournemouth","hapoelbeersheva",6],["milan","ararat",6],["hapoelbeersheva","crete",7],["milan","sunderland",7],["lillestrom","viktoriaplzen",7],["anderlecht","salzburg",7],["crystalpalace","poznan",7],["lyon","union",7],["olympiacos","spartapraha",7],["benfica","celtic",7],["azalkmaar","strumgraz",7],["celtavigo","bournemouth",7],["besiktas","marseille",7],["levskisofia","jagiellonia",7],["dinamo","nec",7],["juventus","realsociedad",7],["rennais","omonia",7],["hoffenheim","ferencvarosi",7],["torreense","ararat",7],["bayerleverkusen","celje",7],["rennais","crete",8],["lyon","bayerleverkusen",8],["lillestrom","torreense",8],["marseille","levskisofia",8],["milan","ferencvarosi",8],["poznan","sunderland",8],["anderlecht","hoffenheim",8],["celje","nec",8],["union","hapoelbeersheva",8],["celtic","besiktas",8],["olympiacos","jagiellonia",8],["bournemouth","viktoriaplzen",8],["dinamo","strumgraz",8],["ararat","azalkmaar",8],["celtavigo","juventus",8],["salzburg","spartapraha",8],["omonia","benfica",8],["crystalpalace","realsociedad",8]]),
    uecl: Object.freeze([["getafe","lugano",1],["twente","pafos",1],["midtjylland","hajduksplit",1],["thun","hearts",1],["gent","aarhus",1],["crvenazvezda","copenhagen",1],["trabzonspor","jablonec",1],["kairat","mjallby",1],["interclubdescaldes","craiova",1],["brighton","monaco",1],["nordsjaelland","panathinaikos",1],["braga","egnatia",1],["truidense","iberia1999",1],["brann","lincoln",1],["borac","riga",1],["kaunozalgiris","freiburg",1],["ajax","atalanta",1],["kuopio","cskasofia",1],["freiburg","panathinaikos",2],["cskasofia","trabzonspor",2],["brighton","kaunozalgiris",2],["atalanta","kairat",2],["monaco","lincoln",2],["hearts","nordsjaelland",2],["twente","thun",2],["interclubdescaldes","copenhagen",2],["mjallby","borac",2],["hajduksplit","ajax",2],["lugano","truidense",2],["braga","kuopio",2],["gent","crvenazvezda",2],["riga","jablonec",2],["brann","aarhus",2],["pafos","midtjylland",2],["craiova","egnatia",2],["iberia1999","getafe",2],["atalanta","pafos",3],["mjallby","interclubdescaldes",3],["iberia1999","crvenazvezda",3],["braga","gent",3],["lincoln","midtjylland",3],["ajax","getafe",3],["freiburg","jablonec",3],["hajduksplit","nordsjaelland",3],["aarhus","twente",3],["copenhagen","lugano",3],["truidense","brann",3],["hearts","monaco",3],["cskasofia","thun",3],["kuopio","trabzonspor",3],["riga","kairat",3],["brighton","craiova",3],["panathinaikos","borac",3],["egnatia","kaunozalgiris",3],["lincoln","hajduksplit",4],["panathinaikos","brighton",4],["twente","kairat",4],["atalanta","mjallby",4],["nordsjaelland","kuopio",4],["midtjylland","truidense",4],["jablonec","iberia1999",4],["trabzonspor","freiburg",4],["ajax","thun",4],["craiova","getafe",4],["crvenazvezda","interclubdescaldes",4],["lugano","kaunozalgiris",4],["hearts","borac",4],["pafos","riga",4],["aarhus","egnatia",4],["gent","brann",4],["cskasofia","monaco",4],["copenhagen","braga",4],["lincoln","twente",5],["kuopio","gent",5],["craiova","copenhagen",5],["interclubdescaldes","aarhus",5],["monaco","freiburg",5],["crvenazvezda","trabzonspor",5],["nordsjaelland","cskasofia",5],["truidense","ajax",5],["pafos","hearts",5],["jablonec","lugano",5],["getafe","brighton",5],["iberia1999","mjallby",5],["thun","hajduksplit",5],["borac","atalanta",5],["kairat","panathinaikos",5],["brann","braga",5],["egnatia","midtjylland",5],["kaunozalgiris","riga",5],["freiburg","twente",6],["jablonec","brighton",6],["borac","kuopio",6],["kairat","craiova",6],["egnatia","lincoln",6],["copenhagen","iberia1999",6],["kaunozalgiris","brann",6],["monaco","nordsjaelland",6],["aarhus","braga",6],["midtjylland","ajax",6],["mjallby","pafos",6],["thun","gent",6],["lugano","crvenazvezda",6],["getafe","interclubdescaldes",6],["panathinaikos","cskasofia",6],["hajduksplit","truidense",6],["riga","atalanta",6],["trabzonspor","hearts",6]])
  });

  const metadata = Object.freeze({
    ucl: Object.freeze({
      available: true,
      opponentsPublished: true,
      schedulePublished: false,
      sourceDate: '2026-08-29',
      matchdayDates: Object.freeze([
        '8–10 Eylül 2026',
        '13/14 Ekim 2026',
        '20/21 Ekim 2026',
        '3/4 Kasım 2026',
        '24/25 Kasım 2026',
        '8/9 Aralık 2026',
        '19/20 Ocak 2027',
        '27 Ocak 2027'
      ]),
      note: 'UEFA rakipleri ve ev/deplasman yönlerini açıkladı. Kesin eşleşme günü/saatleri bu güncellemede henüz doğrulanmadı.'
    }),
    uel: Object.freeze({
      available: true,
      opponentsPublished: true,
      schedulePublished: false,
      sourceDate: '2026-08-28',
      matchdayDates: Object.freeze([
        '16/17 Eylül 2026',
        '15 Ekim 2026',
        '22 Ekim 2026',
        '5 Kasım 2026',
        '26 Kasım 2026',
        '10 Aralık 2026',
        '21 Ocak 2027',
        '28 Ocak 2027'
      ]),
      note: 'UEFA Europa League rakipleri ve ev/deplasman yönlerini açıkladı. Kesin eşleşme günü/saatleri en geç 30 Ağustos’ta yayınlanacak.'
    }),
    uecl: Object.freeze({
      available: true,
      opponentsPublished: true,
      schedulePublished: false,
      sourceDate: '2026-08-28',
      matchdayDates: Object.freeze([
        '15 Ekim 2026',
        '22 Ekim 2026',
        '5 Kasım 2026',
        '26 Kasım 2026',
        '10 Aralık 2026',
        '17 Aralık 2026'
      ]),
      note: 'UEFA Conference League rakipleri ve ev/deplasman yönlerini açıkladı. Kesin eşleşme günü/saatleri en geç 30 Ağustos’ta yayınlanacak.'
    })
  });

  function buildOfficialTable(competition) {
    const matches = OFFICIAL_MATCHES[competition?.id];
    if (!matches) return null;
    const bySlug = new Map((competition?.teams || []).map((team) => [team.poolSlug, team]));
    const table = Object.fromEntries((competition?.teams || []).map((team) => [team.name, []]));

    for (const [homeSlug, awaySlug, matchday] of matches) {
      const home = bySlug.get(homeSlug);
      const away = bySlug.get(awaySlug);
      if (!home || !away) {
        throw new Error(`Güncel ${competition.id.toUpperCase()} fikstüründe takım bulunamadı: ${homeSlug} - ${awaySlug}`);
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

    const expectedFixtures = competition.id === 'uecl' ? 6 : 8;
    const expectedHome = expectedFixtures / 2;
    for (const team of competition.teams) {
      const fixtures = table[team.name] || [];
      const homes = fixtures.filter((fixture) => fixture.home).length;
      const aways = fixtures.length - homes;
      if (fixtures.length !== expectedFixtures || homes !== expectedHome || aways !== expectedHome) {
        throw new Error(`${team.name} için güncel ${competition.id.toUpperCase()} fikstürü ${expectedHome} iç saha + ${expectedHome} deplasman değil.`);
      }
      fixtures.sort((first, second) => first.matchday - second.matchday);
    }

    return table;
  }

  function buildTable(competition) {
    if (!competition?.id || !metadata[competition.id]?.available) return null;
    return buildOfficialTable(competition);
  }

  function available(leagueId) {
    return Boolean(metadata[leagueId]?.available);
  }

  window.UCLDRAW_CURRENT_FIXTURES = Object.freeze({
    snapshotDate: '2026-08-29',
    metadata,
    matches: OFFICIAL_MATCHES,
    uclMatches: OFFICIAL_MATCHES.ucl,
    uelMatches: OFFICIAL_MATCHES.uel,
    ueclMatches: OFFICIAL_MATCHES.uecl,
    available,
    buildTable
  });
})();