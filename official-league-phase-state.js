(() => {
  'use strict';

  const data = window.UCLDRAW_DATA;
  const manifest = window.UCLDRAW_POOL_MANIFEST;
  const bracket = window.UCLDRAW_QUALIFICATION_BRACKET;
  const coefficientData = window.UCLDRAW_CLUB_COEFFICIENTS || { clubs: {} };
  if (!data?.competitions || !manifest || !bracket?.teams) return;

  const SNAPSHOT_DATE = '2026-08-28';
  const COEFFICIENT_SLUG_OVERRIDES = Object.freeze({
    kaunozalgiris: 'kaunozalgiris',
    iberia1999: 'iberia1999'
  });
  const FINAL_POTS = Object.freeze({
    ucl: Object.freeze([
      Object.freeze(['psg', 'bayern', 'real', 'liverpool', 'inter', 'city', 'arsenal', 'barcelona', 'atleti']),
      Object.freeze(['bvb', 'roma', 'sporting', 'astonvilla', 'porto', 'manu', 'brugge', 'realbetis', 'psv']),
      Object.freeze(['feyenoord', 'lille', 'bodo', 'napoli', 'leipzig', 'villareal', 'fenerbahce', 'shakhtar', 'galatasaray']),
      Object.freeze(['slavia', 'slovanbratislava', 'stuttgart', 'aek', 'lask', 'como', 'lens', 'viking', 'sabah'])
    ]),
    uel: Object.freeze([
      Object.freeze(['bayerleverkusen', 'benfica', 'juventus', 'milan', 'lyon', 'azalkmaar', 'olympiacos', 'realsociedad', 'marseille']),
      Object.freeze(['ferencvarosi', 'viktoriaplzen', 'union', 'dinamo', 'salzburg', 'celtic', 'spartapraha', 'rennais', 'anderlecht']),
      Object.freeze(['strumgraz', 'poznan', 'crystalpalace', 'bournemouth', 'sunderland', 'celje', 'jagiellonia', 'omonia', 'celtavigo']),
      Object.freeze(['hoffenheim', 'besiktas', 'torreense', 'hapoelbeersheva', 'nec', 'crete', 'lillestrom', 'levskisofia', 'ararat'])
    ]),
    uecl: Object.freeze([
      Object.freeze(['atalanta', 'braga', 'ajax', 'freiburg', 'monaco', 'copenhagen']),
      Object.freeze(['midtjylland', 'crvenazvezda', 'gent', 'panathinaikos', 'pafos', 'brighton']),
      Object.freeze(['lugano', 'getafe', 'kuopio', 'twente', 'lincoln', 'borac']),
      Object.freeze(['truidense', 'brann', 'hearts', 'kairat', 'trabzonspor', 'craiova']),
      Object.freeze(['riga', 'hajduksplit', 'jablonec', 'nordsjaelland', 'aarhus', 'interclubdescaldes']),
      Object.freeze(['thun', 'cskasofia', 'kaunozalgiris', 'mjallby', 'iberia1999', 'egnatia'])
    ])
  });

  function stem(entry) {
    const file = typeof entry === 'string' ? entry : entry?.file;
    return String(file || '').replace(/\.png$/i, '').toLocaleLowerCase('en-US');
  }

  const existingBySlug = new Map();
  Object.values(data.competitions).forEach((competition) => {
    (competition.teams || []).forEach((team) => {
      if (team?.poolSlug) existingBySlug.set(team.poolSlug, team);
      if (team?.qualificationId) existingBySlug.set(team.qualificationId, team);
    });
  });

  function descriptorFor(slug) {
    return bracket.teams[slug] || Object.values(bracket.teams).find((team) => team.poolSlug === slug) || null;
  }

  function manifestCrest(slug, descriptor) {
    const aliases = new Set([
      slug,
      descriptor?.source?.fileSlug,
      descriptor?.coefficientSlug
    ].filter(Boolean).map((value) => String(value).toLocaleLowerCase('en-US')));

    for (const [competitionKey, stages] of Object.entries(manifest)) {
      for (const [stage, entries] of Object.entries(stages || {})) {
        for (const entry of entries || []) {
          const fileStem = stem(entry);
          if (aliases.has(fileStem)) return `pools/${competitionKey}/${stage}/${fileStem}`;
        }
      }
    }
    return null;
  }

  function finalTeam(slug, pot) {
    const existing = existingBySlug.get(slug) || null;
    const descriptor = descriptorFor(slug);
    const coefficientSlug = COEFFICIENT_SLUG_OVERRIDES[slug]
      || descriptor?.coefficientSlug
      || existing?.coefficientSlug
      || slug;
    const coefficientRecord = coefficientData.clubs?.[coefficientSlug] || coefficientData.clubs?.[slug] || null;
    const crest = manifestCrest(slug, descriptor) || existing?.crest || null;
    const name = descriptor?.name || existing?.name || slug;
    const country = descriptor?.country || existing?.country || '---';

    return Object.freeze({
      ...(existing || {}),
      name,
      country,
      pot,
      crest,
      poolSlug: slug,
      coefficientSlug,
      qualificationId: slug,
      qualificationStage: 'guaranteed',
      qualificationRoute: 'official-league-phase-2026-27',
      coefficient: Number.isFinite(Number(coefficientRecord?.coefficient))
        ? Number(coefficientRecord.coefficient)
        : Number(existing?.coefficient) || 0,
      coefficientRank: Number.isFinite(Number(coefficientRecord?.rank))
        ? Number(coefficientRecord.rank)
        : existing?.coefficientRank ?? Number.POSITIVE_INFINITY,
      coefficientOfficialName: coefficientRecord?.officialName || existing?.coefficientOfficialName || null,
      coefficientMissing: !Number.isFinite(Number(coefficientRecord?.coefficient))
    });
  }

  for (const [competitionId, pots] of Object.entries(FINAL_POTS)) {
    const competition = data.competitions[competitionId];
    if (!competition) continue;
    const teams = pots.flatMap((slugs, potIndex) => slugs.map((slug) => finalTeam(slug, potIndex + 1)));
    if (teams.length !== 36 || new Set(teams.map((team) => team.poolSlug)).size !== 36) {
      throw new Error(`${competitionId} resmi lig aşaması kadrosu 36 benzersiz takım içermiyor.`);
    }
    competition.teams = teams;
  }

  const allIds = Object.values(data.competitions)
    .flatMap((competition) => competition.teams || [])
    .map((team) => team.poolSlug);
  if (allIds.length !== 108 || new Set(allIds).size !== 108) {
    throw new Error('Resmi UEFA lig aşaması kadrolarında takım çakışması var.');
  }

  function wrapManager(manager) {
    if (!manager || manager.officialLeaguePhaseVersion === SNAPSHOT_DATE) return manager;
    return Object.freeze({
      ...manager,
      officialLeaguePhaseVersion: SNAPSHOT_DATE,
      currentStateVersion: SNAPSHOT_DATE,
      latestStateVersion: SNAPSHOT_DATE,
      allTeams(competitionId) {
        return [...(data.competitions[competitionId]?.teams || [])];
      },
      reserveTeams() {
        return [];
      },
      candidateTeam(competitionId, slug) {
        return data.competitions[competitionId]?.teams.find((team) => team.poolSlug === slug) || null;
      },
      selectedTeam(competitionId, slug) {
        return data.competitions[competitionId]?.teams.find((team) => team.poolSlug === slug) || null;
      },
      isGuaranteed(team) {
        return Boolean(team && Object.values(data.competitions)
          .some((competition) => competition.teams.includes(team)));
      },
      isRemovable() {
        return false;
      },
      replacementScenarios() {
        return [];
      },
      incomingScenarios() {
        return [];
      },
      replaceTeam() {
        throw new Error('2026/27 lig aşaması kadroları kesinleşti.');
      },
      simulateReplacement() {
        throw new Error('2026/27 lig aşaması kadroları kesinleşti.');
      }
    });
  }

  const previousDescriptor = Object.getOwnPropertyDescriptor(window, 'UCLDRAW_ROSTER_MANAGER');
  let currentManager = previousDescriptor?.get
    ? previousDescriptor.get.call(window)
    : window.UCLDRAW_ROSTER_MANAGER || null;
  currentManager = wrapManager(currentManager);

  Object.defineProperty(window, 'UCLDRAW_ROSTER_MANAGER', {
    configurable: true,
    enumerable: true,
    get() { return currentManager; },
    set(manager) {
      if (previousDescriptor?.set) previousDescriptor.set.call(window, manager);
      const chained = previousDescriptor?.get ? previousDescriptor.get.call(window) : manager;
      currentManager = wrapManager(chained);
    }
  });

  window.UCLDRAW_OFFICIAL_LEAGUE_PHASE = Object.freeze({
    snapshotDate: SNAPSHOT_DATE,
    pots: FINAL_POTS,
    competitions: Object.freeze(Object.fromEntries(Object.entries(FINAL_POTS).map(([competitionId]) => [
      competitionId,
      Object.freeze(data.competitions[competitionId].teams.map((team) => team.poolSlug))
    ])))
  });
})();