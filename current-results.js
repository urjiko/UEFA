(() => {
  'use strict';

  if (window.UCLDRAW_CURRENT_RESULTS) return;

  const SNAPSHOT_DATE = '2026-10-24';
  const SOURCE_LABEL = 'UEFA';
  const RESULTS = Object.freeze({
    ucl: Object.freeze([
      Object.freeze({ home: 'aek', away: 'lask', matchday: 1, date: '2026-09-08', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'brugge', away: 'astonvilla', matchday: 1, date: '2026-09-08', homeGoals: 2, awayGoals: 3 }),
      Object.freeze({ home: 'bvb', away: 'villareal', matchday: 1, date: '2026-09-08', homeGoals: 3, awayGoals: 2 }),
      Object.freeze({ home: 'porto', away: 'city', matchday: 1, date: '2026-09-08', homeGoals: 0, awayGoals: 2 }),
      Object.freeze({ home: 'lille', away: 'realbetis', matchday: 1, date: '2026-09-08', homeGoals: 2, awayGoals: 3 }),
      Object.freeze({ home: 'real', away: 'inter', matchday: 1, date: '2026-09-08', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'barcelona', away: 'feyenoord', matchday: 1, date: '2026-09-09', homeGoals: 5, awayGoals: 1 }),
      Object.freeze({ home: 'stuttgart', away: 'viking', matchday: 1, date: '2026-09-09', homeGoals: 3, awayGoals: 1 }),
      Object.freeze({ home: 'liverpool', away: 'atleti', matchday: 1, date: '2026-09-09', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'psg', away: 'slovanbratislava', matchday: 1, date: '2026-09-09', homeGoals: 6, awayGoals: 1 }),
      Object.freeze({ home: 'sporting', away: 'galatasaray', matchday: 1, date: '2026-09-09', homeGoals: 3, awayGoals: 1 }),
      Object.freeze({ home: 'napoli', away: 'arsenal', matchday: 1, date: '2026-09-09', homeGoals: 0, awayGoals: 1 }),
      Object.freeze({ home: 'fenerbahce', away: 'roma', matchday: 1, date: '2026-09-10', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'psv', away: 'shakhtar', matchday: 1, date: '2026-09-10', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'como', away: 'leipzig', matchday: 1, date: '2026-09-10', homeGoals: 4, awayGoals: 1 }),
      Object.freeze({ home: 'bayern', away: 'bodo', matchday: 1, date: '2026-09-10', homeGoals: 5, awayGoals: 0 }),
      Object.freeze({ home: 'manu', away: 'sabah', matchday: 1, date: '2026-09-10', homeGoals: 4, awayGoals: 0 }),
      Object.freeze({ home: 'slavia', away: 'lens', matchday: 1, date: '2026-09-10', homeGoals: 2, awayGoals: 3 }),
      Object.freeze({ home: 'lens', away: 'sporting', matchday: 2, date: '2026-10-13', homeGoals: 0, awayGoals: 2 }),
      Object.freeze({ home: 'sabah', away: 'slavia', matchday: 2, date: '2026-10-13', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'arsenal', away: 'lille', matchday: 2, date: '2026-10-13', homeGoals: 3, awayGoals: 0 }),
      Object.freeze({ home: 'atleti', away: 'manu', matchday: 2, date: '2026-10-13', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'inter', away: 'brugge', matchday: 2, date: '2026-10-13', homeGoals: 3, awayGoals: 4 }),
      Object.freeze({ home: 'galatasaray', away: 'barcelona', matchday: 2, date: '2026-10-13', homeGoals: 1, awayGoals: 4 }),
      Object.freeze({ home: 'leipzig', away: 'psv', matchday: 2, date: '2026-10-13', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'viking', away: 'bayern', matchday: 2, date: '2026-10-13', homeGoals: 3, awayGoals: 3 }),
      Object.freeze({ home: 'villareal', away: 'napoli', matchday: 2, date: '2026-10-13', homeGoals: 3, awayGoals: 1 }),
      Object.freeze({ home: 'feyenoord', away: 'como', matchday: 2, date: '2026-10-14', homeGoals: 3, awayGoals: 2 }),
      Object.freeze({ home: 'lask', away: 'liverpool', matchday: 2, date: '2026-10-14', homeGoals: 3, awayGoals: 6 }),
      Object.freeze({ home: 'roma', away: 'real', matchday: 2, date: '2026-10-14', homeGoals: 3, awayGoals: 4 }),
      Object.freeze({ home: 'astonvilla', away: 'fenerbahce', matchday: 2, date: '2026-10-14', homeGoals: 6, awayGoals: 0 }),
      Object.freeze({ home: 'shakhtar', away: 'aek', matchday: 2, date: '2026-10-14', homeGoals: 3, awayGoals: 1 }),
      Object.freeze({ home: 'bodo', away: 'bvb', matchday: 2, date: '2026-10-14', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'city', away: 'psg', matchday: 2, date: '2026-10-14', homeGoals: 2, awayGoals: 4 }),
      Object.freeze({ home: 'realbetis', away: 'porto', matchday: 2, date: '2026-10-14', homeGoals: 3, awayGoals: 2 }),
      Object.freeze({ home: 'slovanbratislava', away: 'stuttgart', matchday: 2, date: '2026-10-14', homeGoals: 0, awayGoals: 3 }),
      Object.freeze({ home: 'fenerbahce', away: 'slavia', matchday: 3, date: '2026-10-20', homeGoals: 2, awayGoals: 2 }),
      Object.freeze({ home: 'sabah', away: 'bvb', matchday: 3, date: '2026-10-20', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'roma', away: 'slovanbratislava', matchday: 3, date: '2026-10-20', homeGoals: 4, awayGoals: 0 }),
      Object.freeze({ home: 'porto', away: 'psv', matchday: 3, date: '2026-10-20', homeGoals: 0, awayGoals: 1 }),
      Object.freeze({ home: 'liverpool', away: 'villareal', matchday: 3, date: '2026-10-20', homeGoals: 4, awayGoals: 3 }),
      Object.freeze({ home: 'city', away: 'aek', matchday: 3, date: '2026-10-20', homeGoals: 5, awayGoals: 1 }),
      Object.freeze({ home: 'psg', away: 'barcelona', matchday: 3, date: '2026-10-20', homeGoals: 4, awayGoals: 2 }),
      Object.freeze({ home: 'napoli', away: 'bodo', matchday: 3, date: '2026-10-20', homeGoals: 4, awayGoals: 3 }),
      Object.freeze({ home: 'stuttgart', away: 'atleti', matchday: 3, date: '2026-10-20', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'como', away: 'manu', matchday: 3, date: '2026-10-21', homeGoals: 4, awayGoals: 1 }),
      Object.freeze({ home: 'lille', away: 'galatasaray', matchday: 3, date: '2026-10-21', homeGoals: 2, awayGoals: 4 }),
      Object.freeze({ home: 'astonvilla', away: 'viking', matchday: 3, date: '2026-10-21', homeGoals: 3, awayGoals: 1 }),
      Object.freeze({ home: 'brugge', away: 'lens', matchday: 3, date: '2026-10-21', homeGoals: 3, awayGoals: 0 }),
      Object.freeze({ home: 'bayern', away: 'arsenal', matchday: 3, date: '2026-10-21', homeGoals: 2, awayGoals: 2 }),
      Object.freeze({ home: 'inter', away: 'shakhtar', matchday: 3, date: '2026-10-21', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'real', away: 'leipzig', matchday: 3, date: '2026-10-21', homeGoals: 4, awayGoals: 1 }),
      Object.freeze({ home: 'realbetis', away: 'feyenoord', matchday: 3, date: '2026-10-21', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'sporting', away: 'lask', matchday: 3, date: '2026-10-21', homeGoals: 2, awayGoals: 3 })
    ]),
    uel: Object.freeze([
      Object.freeze({ home: 'ararat', away: 'spartapraha', matchday: 1, date: '2026-09-16', homeGoals: 1, awayGoals: 4 }),
      Object.freeze({ home: 'omonia', away: 'celtavigo', matchday: 1, date: '2026-09-16', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'milan', away: 'benfica', matchday: 1, date: '2026-09-16', homeGoals: 0, awayGoals: 2 }),
      Object.freeze({ home: 'bayerleverkusen', away: 'celje', matchday: 1, date: '2026-09-16', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'hapoelbeersheva', away: 'dinamo', matchday: 1, date: '2026-09-16', homeGoals: 0, awayGoals: 0 }),
      Object.freeze({ home: 'olympiacos', away: 'jagiellonia', matchday: 1, date: '2026-09-16', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'anderlecht', away: 'lyon', matchday: 1, date: '2026-09-16', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'strumgraz', away: 'rennais', matchday: 1, date: '2026-09-16', homeGoals: 0, awayGoals: 0 }),
      Object.freeze({ home: 'sunderland', away: 'azalkmaar', matchday: 1, date: '2026-09-16', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'crete', away: 'hoffenheim', matchday: 1, date: '2026-09-17', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'levskisofia', away: 'salzburg', matchday: 1, date: '2026-09-17', homeGoals: 0, awayGoals: 1 }),
      Object.freeze({ home: 'besiktas', away: 'marseille', matchday: 1, date: '2026-09-17', homeGoals: 4, awayGoals: 1 }),
      Object.freeze({ home: 'celtic', away: 'ferencvarosi', matchday: 1, date: '2026-09-17', homeGoals: 1, awayGoals: 3 }),
      Object.freeze({ home: 'crystalpalace', away: 'poznan', matchday: 1, date: '2026-09-17', homeGoals: 4, awayGoals: 0 }),
      Object.freeze({ home: 'viktoriaplzen', away: 'union', matchday: 1, date: '2026-09-17', homeGoals: 0, awayGoals: 3 }),
      Object.freeze({ home: 'juventus', away: 'nec', matchday: 1, date: '2026-09-17', homeGoals: 5, awayGoals: 0 }),
      Object.freeze({ home: 'lillestrom', away: 'torreense', matchday: 1, date: '2026-09-17', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'realsociedad', away: 'bournemouth', matchday: 1, date: '2026-09-17', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'spartapraha', away: 'lillestrom', matchday: 2, date: '2026-10-15', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'azalkmaar', away: 'hapoelbeersheva', matchday: 2, date: '2026-10-15', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'salzburg', away: 'milan', matchday: 2, date: '2026-10-15', homeGoals: 0, awayGoals: 4 }),
      Object.freeze({ home: 'poznan', away: 'bayerleverkusen', matchday: 2, date: '2026-10-15', homeGoals: 0, awayGoals: 4 }),
      Object.freeze({ home: 'celje', away: 'omonia', matchday: 2, date: '2026-10-15', homeGoals: 0, awayGoals: 3 }),
      Object.freeze({ home: 'lyon', away: 'crystalpalace', matchday: 2, date: '2026-10-15', homeGoals: 3, awayGoals: 2 }),
      Object.freeze({ home: 'union', away: 'realsociedad', matchday: 2, date: '2026-10-15', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'torreense', away: 'sunderland', matchday: 2, date: '2026-10-15', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'bournemouth', away: 'strumgraz', matchday: 2, date: '2026-10-15', homeGoals: 3, awayGoals: 0 }),
      Object.freeze({ home: 'ferencvarosi', away: 'viktoriaplzen', matchday: 2, date: '2026-10-15', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'dinamo', away: 'anderlecht', matchday: 2, date: '2026-10-15', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'jagiellonia', away: 'ararat', matchday: 2, date: '2026-10-15', homeGoals: 3, awayGoals: 1 }),
      Object.freeze({ home: 'nec', away: 'levskisofia', matchday: 2, date: '2026-10-15', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'marseille', away: 'olympiacos', matchday: 2, date: '2026-10-15', homeGoals: 0, awayGoals: 1 }),
      Object.freeze({ home: 'celtavigo', away: 'juventus', matchday: 2, date: '2026-10-15', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'benfica', away: 'celtic', matchday: 2, date: '2026-10-15', homeGoals: 4, awayGoals: 1 }),
      Object.freeze({ home: 'rennais', away: 'crete', matchday: 2, date: '2026-10-15', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'hoffenheim', away: 'besiktas', matchday: 2, date: '2026-10-15', homeGoals: 2, awayGoals: 3 }),
      Object.freeze({ home: 'ararat', away: 'azalkmaar', matchday: 3, date: '2026-10-22', homeGoals: 0, awayGoals: 4 }),
      Object.freeze({ home: 'ferencvarosi', away: 'torreense', matchday: 3, date: '2026-10-22', homeGoals: 4, awayGoals: 1 }),
      Object.freeze({ home: 'dinamo', away: 'nec', matchday: 3, date: '2026-10-22', homeGoals: 2, awayGoals: 4 }),
      Object.freeze({ home: 'juventus', away: 'rennais', matchday: 3, date: '2026-10-22', homeGoals: 2, awayGoals: 2 }),
      Object.freeze({ home: 'poznan', away: 'sunderland', matchday: 3, date: '2026-10-22', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'crete', away: 'bayerleverkusen', matchday: 3, date: '2026-10-22', homeGoals: 0, awayGoals: 2 }),
      Object.freeze({ home: 'union', away: 'hapoelbeersheva', matchday: 3, date: '2026-10-22', homeGoals: 4, awayGoals: 0 }),
      Object.freeze({ home: 'strumgraz', away: 'marseille', matchday: 3, date: '2026-10-22', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'bournemouth', away: 'milan', matchday: 3, date: '2026-10-22', homeGoals: 3, awayGoals: 0 }),
      Object.freeze({ home: 'besiktas', away: 'crystalpalace', matchday: 3, date: '2026-10-22', homeGoals: 2, awayGoals: 2 }),
      Object.freeze({ home: 'celtic', away: 'celtavigo', matchday: 3, date: '2026-10-22', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'viktoriaplzen', away: 'levskisofia', matchday: 3, date: '2026-10-22', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'jagiellonia', away: 'anderlecht', matchday: 3, date: '2026-10-22', homeGoals: 0, awayGoals: 3 }),
      Object.freeze({ home: 'lillestrom', away: 'realsociedad', matchday: 3, date: '2026-10-22', homeGoals: 0, awayGoals: 6 }),
      Object.freeze({ home: 'celje', away: 'salzburg', matchday: 3, date: '2026-10-22', homeGoals: 2, awayGoals: 2 }),
      Object.freeze({ home: 'olympiacos', away: 'spartapraha', matchday: 3, date: '2026-10-22', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'omonia', away: 'benfica', matchday: 3, date: '2026-10-22', homeGoals: 1, awayGoals: 4 }),
      Object.freeze({ home: 'hoffenheim', away: 'lyon', matchday: 3, date: '2026-10-22', homeGoals: 3, awayGoals: 0 })
    ]),
    uecl: Object.freeze([
      Object.freeze({ home: 'lugano', away: 'crvenazvezda', matchday: 1, date: '2026-10-15', homeGoals: 3, awayGoals: 2 }),
      Object.freeze({ home: 'hajduksplit', away: 'ajax', matchday: 1, date: '2026-10-15', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'gent', away: 'aarhus', matchday: 1, date: '2026-10-15', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'egnatia', away: 'midtjylland', matchday: 1, date: '2026-10-15', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'kuopio', away: 'trabzonspor', matchday: 1, date: '2026-10-15', homeGoals: 2, awayGoals: 4 }),
      Object.freeze({ home: 'mjallby', away: 'interclubdescaldes', matchday: 1, date: '2026-10-15', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'panathinaikos', away: 'borac', matchday: 1, date: '2026-10-15', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'cskasofia', away: 'monaco', matchday: 1, date: '2026-10-15', homeGoals: 1, awayGoals: 2 }),
      Object.freeze({ home: 'riga', away: 'kairat', matchday: 1, date: '2026-10-15', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'craiova', away: 'getafe', matchday: 1, date: '2026-10-15', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'atalanta', away: 'pafos', matchday: 1, date: '2026-10-15', homeGoals: 3, awayGoals: 1 }),
      Object.freeze({ home: 'brighton', away: 'kaunozalgiris', matchday: 1, date: '2026-10-15', homeGoals: 4, awayGoals: 0 }),
      Object.freeze({ home: 'copenhagen', away: 'braga', matchday: 1, date: '2026-10-15', homeGoals: 3, awayGoals: 0 }),
      Object.freeze({ home: 'twente', away: 'thun', matchday: 1, date: '2026-10-15', homeGoals: 1, awayGoals: 0 }),
      Object.freeze({ home: 'hearts', away: 'nordsjaelland', matchday: 1, date: '2026-10-15', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'truidense', away: 'iberia1999', matchday: 1, date: '2026-10-15', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'freiburg', away: 'jablonec', matchday: 1, date: '2026-10-15', homeGoals: 3, awayGoals: 2 }),
      Object.freeze({ home: 'brann', away: 'lincoln', matchday: 1, date: '2026-10-15', homeGoals: 2, awayGoals: 1 }),
      Object.freeze({ home: 'kairat', away: 'panathinaikos', matchday: 2, date: '2026-10-22', homeGoals: 1, awayGoals: 5 }),
      Object.freeze({ home: 'iberia1999', away: 'mjallby', matchday: 2, date: '2026-10-22', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'nordsjaelland', away: 'cskasofia', matchday: 2, date: '2026-10-22', homeGoals: 2, awayGoals: 2 }),
      Object.freeze({ home: 'crvenazvezda', away: 'copenhagen', matchday: 2, date: '2026-10-22', homeGoals: 2, awayGoals: 2 }),
      Object.freeze({ home: 'jablonec', away: 'brighton', matchday: 2, date: '2026-10-22', homeGoals: 0, awayGoals: 0 }),
      Object.freeze({ home: 'kaunozalgiris', away: 'brann', matchday: 2, date: '2026-10-22', homeGoals: 1, awayGoals: 4 }),
      Object.freeze({ home: 'getafe', away: 'lugano', matchday: 2, date: '2026-10-22', homeGoals: 2, awayGoals: 5 }),
      Object.freeze({ home: 'interclubdescaldes', away: 'craiova', matchday: 2, date: '2026-10-22', homeGoals: 1, awayGoals: 3 }),
      Object.freeze({ home: 'pafos', away: 'riga', matchday: 2, date: '2026-10-22', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'trabzonspor', away: 'hearts', matchday: 2, date: '2026-10-22', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'ajax', away: 'atalanta', matchday: 2, date: '2026-10-22', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'aarhus', away: 'egnatia', matchday: 2, date: '2026-10-22', homeGoals: 1, awayGoals: 1 }),
      Object.freeze({ home: 'monaco', away: 'freiburg', matchday: 2, date: '2026-10-22', homeGoals: 3, awayGoals: 0 }),
      Object.freeze({ home: 'midtjylland', away: 'truidense', matchday: 2, date: '2026-10-22', homeGoals: 0, awayGoals: 1 }),
      Object.freeze({ home: 'thun', away: 'hajduksplit', matchday: 2, date: '2026-10-22', homeGoals: 0, awayGoals: 1 }),
      Object.freeze({ home: 'borac', away: 'kuopio', matchday: 2, date: '2026-10-22', homeGoals: 2, awayGoals: 0 }),
      Object.freeze({ home: 'lincoln', away: 'twente', matchday: 2, date: '2026-10-22', homeGoals: 1, awayGoals: 4 }),
      Object.freeze({ home: 'braga', away: 'gent', matchday: 2, date: '2026-10-22', homeGoals: 2, awayGoals: 0 })
    ])
  });

  function teamSlug(team) {
    return String(team?.poolSlug || team?.qualificationId || '').trim();
  }

  function resultKey(homeSlug, awaySlug) {
    return `${homeSlug}--${awaySlug}`;
  }

  const LOOKUP = Object.freeze(Object.fromEntries(
    Object.entries(RESULTS).map(([leagueId, rows]) => [
      leagueId,
      Object.freeze(Object.fromEntries(rows.map((row) => [resultKey(row.home, row.away), row])))
    ])
  ));

  function isOfficialCurrentTable(table) {
    return Object.values(table || {}).some((fixtures) => (
      Array.isArray(fixtures) && fixtures.some((fixture) => fixture?.officialFixture === true)
    ));
  }

  function officialResultForMatch(leagueId, match) {
    const row = LOOKUP[leagueId]?.[resultKey(teamSlug(match?.home), teamSlug(match?.away))] || null;
    if (!row) return null;
    if (Number(row.matchday) !== Number(match?.matchday)) return null;
    if (row.date && match?.date && row.date !== match.date) return null;
    return row;
  }

  function applyOfficialResults(state, table = state?.table) {
    if (!state?.matches?.length || !isOfficialCurrentTable(table)) return 0;

    let applied = 0;
    for (const match of state.matches) {
      const result = officialResultForMatch(state.leagueId, match);
      if (!result) continue;

      state.scores[match.id] = {
        homeGoals: Number(result.homeGoals),
        awayGoals: Number(result.awayGoals),
        source: 'official-result',
        official: true,
        final: true,
        playedDate: result.date,
        resultSnapshotDate: SNAPSHOT_DATE
      };
      state.matchLocks[match.id] = true;
      state.activeMatchdays[match.matchday] = true;
      applied += 1;
    }

    state.officialResultsSnapshotDate = SNAPSHOT_DATE;
    state.officialResultsApplied = applied;

    if (applied && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ucldraw:official-results-applied', {
        detail: { state, leagueId: state.leagueId, applied, snapshotDate: SNAPSHOT_DATE }
      }));
    }
    return applied;
  }

  const engine = window.UCLDRAW_PREDICTION_ENGINE;
  if (engine?.createState) {
    const originalCreateState = engine.createState.bind(engine);
    window.UCLDRAW_PREDICTION_ENGINE = Object.freeze({
      ...engine,
      createState(...args) {
        const state = originalCreateState(...args);
        applyOfficialResults(state, args[1]);
        return state;
      },
      __officialCurrentResults: true
    });
  }

  function predictionState() {
    return window.UCLDRAW_PREDICTION_AI?.getState?.() || null;
  }

  function matchesForActiveTeam(state, activeName) {
    if (!state || !activeName) return [];
    return state.matches
      .filter((match) => match.home.name === activeName || match.away.name === activeName)
      .sort((first, second) => first.matchday - second.matchday);
  }

  function decorateOfficialPrediction() {
    if (typeof document === 'undefined') return;
    const state = predictionState();
    const section = document.getElementById('predictionSection');
    const activeName = section?.querySelector('.prediction-header h2')?.textContent?.trim();
    if (!state || !section || !activeName) return;

    const cards = [...section.querySelectorAll('.prediction-fixture-card')];
    const matches = matchesForActiveTeam(state, activeName);
    let selectedTeamOfficialResults = 0;

    cards.forEach((card, index) => {
      const match = matches[index];
      const score = match ? state.scores?.[match.id] : null;
      const official = score?.source === 'official-result' && score?.final === true;
      card.classList.toggle('is-official-result', official);
      if (!official || !match) return;

      selectedTeamOfficialResults += 1;
      const locked = Boolean(state.matchLocks?.[match.id]);
      const stateLabel = card.querySelector('.prediction-fixture-top small');
      if (stateLabel) stateLabel.textContent = locked ? 'Oynandı · Resmî skor' : 'Oynandı · Kilit açık';

      if (locked) {
        card.querySelectorAll('.prediction-outcome-team, .prediction-draw-choice').forEach((choice) => {
          choice.disabled = true;
          choice.setAttribute('aria-disabled', 'true');
        });
        card.querySelectorAll('.prediction-score-editor input').forEach((input) => { input.disabled = true; });
      }

      const lockButton = card.querySelector('.prediction-score-apply');
      if (lockButton && locked) {
        lockButton.disabled = false;
        lockButton.classList.add('is-match-locked', 'is-official-result-lock');
        lockButton.textContent = '🔒';
        lockButton.title = 'Resmî skor kilidini aç';
        lockButton.setAttribute('aria-label', 'Resmî skor kilidini aç');
      }
    });

    if (window.UCLDRAW_LAST_DRAW?.source === 'uefa-current') {
      const description = section.querySelector('.prediction-header-copy p');
      if (description && state.officialResultsApplied > 0) {
        description.textContent = selectedTeamOfficialResults
          ? 'Tamamlanan maçlar resmî skorla kilitli geldi. İstersen skor kilidini açıp değiştirebilirsin.'
          : `UEFA güncel fikstürü ve ${state.officialResultsApplied} tamamlanmış resmî maç skoru yüklendi.`;
      }
    }
  }

  function queueDecoration() {
    if (typeof window.requestAnimationFrame !== 'function') return;
    window.requestAnimationFrame(() => window.requestAnimationFrame(decorateOfficialPrediction));
  }

  function installStyles() {
    if (typeof document === 'undefined' || document.getElementById('ucldraw-current-results-style')) return;
    const style = document.createElement('style');
    style.id = 'ucldraw-current-results-style';
    style.textContent = `
      #predictionSection .prediction-fixture-card.is-official-result {
        border-color: rgba(var(--accent-rgb), .34);
        box-shadow: inset 0 0 0 1px rgba(var(--accent-rgb), .07);
      }
      #predictionSection .prediction-fixture-card.is-official-result .prediction-fixture-top small {
        color: rgba(255,255,255,.82);
        font-weight: 800;
      }
      #predictionSection .prediction-fixture-card.is-official-result .prediction-outcome-team:disabled,
      #predictionSection .prediction-fixture-card.is-official-result .prediction-draw-choice:disabled,
      #predictionSection .prediction-fixture-card.is-official-result .prediction-score-editor input:disabled {
        cursor: default;
        opacity: .72;
      }
      #predictionSection .prediction-fixture-card.is-official-result .is-official-result-lock {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  function installCurrentModeDefault() {
    if (typeof document === 'undefined') return;
    const choice = document.getElementById('initialModeChoice');
    const backdrop = document.getElementById('confirmBackdrop');
    const currentButton = choice?.querySelector('[data-initial-mode="current"]');
    if (!choice || !backdrop || !currentButton) return;

    choice.prepend(currentButton);

    const selectCurrentWhenAvailable = () => {
      if (backdrop.hidden || currentButton.disabled || currentButton.classList.contains('is-selected')) return;
      window.setTimeout(() => {
        if (!backdrop.hidden && !currentButton.disabled) currentButton.click();
      }, 0);
    };

    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(selectCurrentWhenAvailable).observe(backdrop, {
        attributes: true,
        attributeFilter: ['hidden']
      });
    }
  }

  function installSingleLinkNativeShare() {
    if (typeof window.addEventListener !== 'function') return;
    window.addEventListener('click', async (event) => {
      const button = event.target?.closest?.('.prediction-export-v9-button');
      const api = window.UCLDRAW_PREDICTION_SHARE_V9;
      if (!button || !api?.prepareExport || typeof navigator?.share !== 'function' || typeof File === 'undefined') return;

      event.preventDefault();
      event.stopImmediatePropagation();
      button.disabled = true;
      const idleText = button.textContent;
      button.textContent = 'Hazırlanıyor...';

      try {
        const output = await api.prepareExport();
        const file = new File([output.blob], output.filename, { type: 'image/png' });
        if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
          await api.downloadCurrent?.();
          return;
        }
        const leagueId = output.snapshot.competition?.id || document.body.dataset.league || 'ucl';
        const titles = {
          ucl: 'Şampiyonlar Ligi Yolculuğu',
          uel: 'Avrupa Ligi Yolculuğu',
          uecl: 'Konferans Ligi Yolculuğu'
        };
        const title = `${output.snapshot.activeName} · ${titles[leagueId] || 'UEFA Tahmini'}`;
        const url = api.predictionLink(output.snapshot);
        const text = `Sen de ${output.snapshot.activeName} için tahminini yap:`;
        await navigator.share({ title, text, url, files: [file] });
      } catch (error) {
        if (error?.name !== 'AbortError') console.error(error);
      } finally {
        button.disabled = false;
        button.textContent = idleText;
      }
    }, true);
  }

  installStyles();
  installCurrentModeDefault();
  installSingleLinkNativeShare();
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('ucldraw:prediction-rendered', queueDecoration);
    window.addEventListener('ucldraw:ai-predictions-applied', queueDecoration);
    window.addEventListener('ucldraw:ai-predictions-restored-locks', queueDecoration);
    window.addEventListener('click', (event) => {
      if (event.target?.closest?.('.prediction-score-apply.is-official-result-lock')) {
        window.setTimeout(queueDecoration, 0);
      }
    }, true);
  }

  window.UCLDRAW_CURRENT_RESULTS = Object.freeze({
    snapshotDate: SNAPSHOT_DATE,
    source: SOURCE_LABEL,
    results: RESULTS,
    applyOfficialResults,
    officialResultForMatch,
    decorateOfficialPrediction
  });
})();