(() => {
  'use strict';

  const bracket = window.UCLDRAW_QUALIFICATION_BRACKET;
  const sourceManifest = window.UCLDRAW_POOL_MANIFEST;
  if (!bracket?.rounds || !bracket?.simulate || !bracket?.teams || !sourceManifest?.champions || !sourceManifest?.europa || !sourceManifest?.conference) {
    return;
  }

  const SNAPSHOT_DATE = '2026-08-15';
  const originalSimulate = bracket.simulate;
  const originalRounds = bracket.rounds;
  const originalUclQ3 = originalRounds.find((round) => round.id === 'ucl-q3');
  const originalUelQ3 = originalRounds.find((round) => round.id === 'uel-q3');
  const originalUeclQ3 = originalRounds.find((round) => round.id === 'uecl-q3');
  if (!originalUclQ3 || !originalUelQ3 || !originalUeclQ3) return;

  const FILE_SLUG_OVERRIDES = Object.freeze({
    lincoln: 'lincoln',
    kuopio: 'kups',
    shamrockrovers: 'shamrock',
    egnatia: 'egnatia',
    thun: 'thun',
    hearts: 'hearts'
  });

  function entryFile(entry) {
    return typeof entry === 'string' ? entry : entry?.file;
  }

  function fileSlugFor(team) {
    if (!team?.id) return null;
    return FILE_SLUG_OVERRIDES[team.id] || team.source?.fileSlug || team.poolSlug || team.id;
  }

  function stageHas(competitionKey, stage, fileSlug) {
    if (!fileSlug) return false;
    const expected = `${fileSlug}.png`.toLocaleLowerCase('en-US');
    return (sourceManifest[competitionKey]?.[stage] || [])
      .some((entry) => String(entryFile(entry) || '').toLocaleLowerCase('en-US') === expected);
  }

  function competitionHas(competitionKey, fileSlug) {
    return Object.keys(sourceManifest[competitionKey] || {})
      .some((stage) => stageHas(competitionKey, stage, fileSlug));
  }

  function resolveUclQ3() {
    const resolved = {};
    originalUclQ3.ties.forEach((entry) => {
      const first = entry.first;
      const second = entry.second;
      if (!first?.id || !second?.id) return;

      const firstInChampions = competitionHas('champions', fileSlugFor(first));
      const secondInChampions = competitionHas('champions', fileSlugFor(second));
      if (firstInChampions === secondInChampions) return;

      const winner = firstInChampions ? first : second;
      const loser = firstInChampions ? second : first;
      const europaStage = entry.route === 'league' ? 'guaranteed' : 'playoffs';
      if (!stageHas('europa', europaStage, fileSlugFor(loser))) return;

      resolved[entry.id] = Object.freeze({
        tieId: entry.id,
        route: entry.route,
        winnerId: winner.id,
        loserId: loser.id,
        winnerCompetition: 'champions',
        loserCompetition: 'europa',
        loserStage: europaStage
      });
    });
    return Object.freeze(resolved);
  }

  function resolveUelQ3() {
    const resolved = {};
    originalUelQ3.ties.forEach((entry) => {
      const first = entry.first;
      const second = entry.second;
      if (!first?.id || !second?.id) return;

      const firstInEuropaPlayoffs = stageHas('europa', 'playoffs', fileSlugFor(first));
      const secondInEuropaPlayoffs = stageHas('europa', 'playoffs', fileSlugFor(second));
      if (firstInEuropaPlayoffs === secondInEuropaPlayoffs) return;

      const winner = firstInEuropaPlayoffs ? first : second;
      const loser = firstInEuropaPlayoffs ? second : first;
      resolved[entry.id] = Object.freeze({
        tieId: entry.id,
        route: entry.route,
        winnerId: winner.id,
        loserId: loser.id,
        winnerCompetition: 'europa',
        winnerStage: 'playoffs',
        loserCompetition: 'conference',
        loserStage: 'playoffs'
      });
    });
    return Object.freeze(resolved);
  }

  function resolveUeclQ3() {
    const resolved = {};
    originalUeclQ3.ties.forEach((entry) => {
      const first = entry.first;
      const second = entry.second;
      if (!first?.id || !second?.id) return;

      const firstInConferencePlayoffs = stageHas('conference', 'playoffs', fileSlugFor(first));
      const secondInConferencePlayoffs = stageHas('conference', 'playoffs', fileSlugFor(second));
      if (firstInConferencePlayoffs === secondInConferencePlayoffs) return;

      const winner = firstInConferencePlayoffs ? first : second;
      const loser = firstInConferencePlayoffs ? second : first;
      resolved[entry.id] = Object.freeze({
        tieId: entry.id,
        route: entry.route,
        winnerId: winner.id,
        loserId: loser.id,
        winnerCompetition: 'conference',
        winnerStage: 'playoffs',
        loserCompetition: null,
        loserStage: null
      });
    });
    return Object.freeze(resolved);
  }

  const resolvedUclQ3 = resolveUclQ3();
  const resolvedUelQ3 = resolveUelQ3();
  const resolvedUeclQ3 = resolveUeclQ3();
  const resolvedStates = Object.freeze({
    ...resolvedUclQ3,
    ...resolvedUelQ3,
    ...resolvedUeclQ3
  });

  const eliminatedFromUclIds = Object.freeze(Object.values(resolvedUclQ3).map((state) => state.loserId));
  const eliminatedFromUelIds = Object.freeze(Object.values(resolvedUelQ3).map((state) => state.loserId));
  const eliminatedFromEuropeIds = Object.freeze(Object.values(resolvedUeclQ3).map((state) => state.loserId));
  const fixedUelLeaguePhaseIds = Object.freeze(Object.values(resolvedUclQ3)
    .filter((state) => state.route === 'league')
    .map((state) => state.loserId));
  const fixedUelLeaguePhaseFiles = new Set(fixedUelLeaguePhaseIds
    .map((teamId) => fileSlugFor(bracket.teams[teamId]))
    .filter(Boolean)
    .map((fileSlug) => `${fileSlug}.png`.toLocaleLowerCase('en-US')));

  const runtimeEuropa = {
    ...sourceManifest.europa,
    guaranteed: Object.freeze((sourceManifest.europa.guaranteed || []).filter((entry) => (
      !fixedUelLeaguePhaseFiles.has(String(entryFile(entry) || '').toLocaleLowerCase('en-US'))
    )))
  };
  window.UCLDRAW_POOL_MANIFEST = Object.freeze({
    ...sourceManifest,
    europa: Object.freeze(runtimeEuropa)
  });

  const sourceOverrides = new Map();
  function overrideSource(teamId, competitionKey, stage) {
    const descriptor = bracket.teams[teamId];
    const fileSlug = fileSlugFor(descriptor);
    if (!descriptor || !fileSlug) return;
    sourceOverrides.set(teamId, Object.freeze({ competitionKey, stage, fileSlug }));
  }

  Object.values(resolvedUclQ3).forEach((state) => {
    overrideSource(state.loserId, 'europa', state.loserStage);
  });
  Object.values(resolvedUelQ3).forEach((state) => {
    overrideSource(state.winnerId, 'europa', 'playoffs');
    overrideSource(state.loserId, 'conference', 'playoffs');
  });
  Object.values(resolvedUeclQ3).forEach((state) => {
    overrideSource(state.winnerId, 'conference', 'playoffs');
  });

  const teams = Object.freeze(Object.fromEntries(Object.entries(bracket.teams).map(([teamId, descriptor]) => [
    teamId,
    sourceOverrides.has(teamId)
      ? Object.freeze({ ...descriptor, source: sourceOverrides.get(teamId) })
      : descriptor
  ])));

  function settledParticipant(participant) {
    if (participant?.id) return teams[participant.id] || participant;
    const state = resolvedStates[participant?.tieId];
    if (!state) return participant;
    const teamId = participant.result === 'loser' ? state.loserId : state.winnerId;
    return teams[teamId];
  }

  const rounds = Object.freeze(originalRounds.map((round) => {
    if (round.id === 'ucl-q3') {
      return Object.freeze({
        ...round,
        ties: Object.freeze(round.ties.map((entry) => {
          const state = resolvedUclQ3[entry.id];
          if (!state) return entry;
          const activeTeamId = entry.route === 'league' ? state.loserId : state.winnerId;
          const activeTeam = teams[activeTeamId];
          return Object.freeze({
            ...entry,
            first: activeTeam,
            second: activeTeam,
            resolved: true,
            resolvedWinnerId: state.winnerId,
            resolvedLoserId: state.loserId
          });
        }))
      });
    }

    const roundResolved = round.id === 'uel-q3'
      ? resolvedUelQ3
      : round.id === 'uecl-q3'
        ? resolvedUeclQ3
        : null;

    return Object.freeze({
      ...round,
      ties: Object.freeze(round.ties.map((entry) => {
        const state = roundResolved?.[entry.id];
        return Object.freeze({
          ...entry,
          first: settledParticipant(entry.first),
          second: settledParticipant(entry.second),
          ...(state ? {
            resolved: true,
            resolvedWinnerId: state.winnerId,
            resolvedLoserId: state.loserId
          } : {})
        });
      }))
    });
  }));

  function mapTeam(team) {
    return teams[team?.id] || team;
  }

  function mapOutcome(outcome) {
    return Object.freeze({
      ...outcome,
      first: mapTeam(outcome.first),
      second: mapTeam(outcome.second),
      winner: mapTeam(outcome.winner),
      loser: mapTeam(outcome.loser)
    });
  }

  const simulationTies = Object.freeze(originalRounds.flatMap((round) => round.ties));

  function simulate(random = Math.random) {
    if (typeof random !== 'function') throw new TypeError('Eleme simülasyonu için random fonksiyonu gerekir.');
    let tieIndex = 0;
    const forcedRandom = () => {
      const entry = simulationTies[tieIndex];
      tieIndex += 1;
      const state = resolvedStates[entry?.id];
      if (state && entry?.first?.id && entry?.second?.id) {
        return entry.first.id === state.winnerId ? 0 : 0.999999;
      }
      return random();
    };

    const result = originalSimulate(forcedRandom);
    const mappedRounds = Object.freeze(Object.fromEntries(Object.entries(result.rounds).map(([roundId, outcomes]) => [
      roundId,
      Object.freeze(outcomes.map(mapOutcome))
    ])));
    const qualifiers = Object.freeze(Object.fromEntries(Object.entries(result.qualifiers).map(([competitionId, entries]) => [
      competitionId,
      Object.freeze(entries.map(mapTeam))
    ])));

    return Object.freeze({
      ...result,
      rounds: mappedRounds,
      qualifiers,
      diagnostics: Object.freeze({
        ...result.diagnostics,
        bracketVersion: SNAPSHOT_DATE,
        resolvedUclQ3Count: Object.keys(resolvedUclQ3).length,
        resolvedUelQ3Count: Object.keys(resolvedUelQ3).length,
        resolvedUeclQ3Count: Object.keys(resolvedUeclQ3).length,
        resolvedUclQ3,
        resolvedUelQ3,
        resolvedUeclQ3
      })
    });
  }

  window.UCLDRAW_QUALIFICATION_BRACKET = Object.freeze({
    ...bracket,
    rounds,
    simulate,
    teams,
    currentStateVersion: SNAPSHOT_DATE,
    resolvedUclQ3,
    resolvedUelQ3,
    resolvedUeclQ3
  });

  const excludedSets = Object.freeze({
    ucl: new Set(eliminatedFromUclIds),
    uel: new Set(eliminatedFromUelIds),
    uecl: new Set(eliminatedFromEuropeIds)
  });
  const fixedUelSet = new Set(fixedUelLeaguePhaseIds);
  const lockedSlotIds = new Set(Object.values(resolvedUclQ3)
    .filter((state) => state.route === 'league')
    .map((state) => `uel:${state.tieId}:loser`));

  function teamId(team) {
    return team?.qualificationId || team?.poolSlug || null;
  }

  function isExcluded(competitionId, teamOrId) {
    const id = typeof teamOrId === 'string' ? teamOrId : teamId(teamOrId);
    return Boolean(id && excludedSets[competitionId]?.has(id));
  }

  function installRosterManagerHook() {
    let currentManager = window.UCLDRAW_ROSTER_MANAGER || null;

    function wrap(manager) {
      if (!manager || manager.currentStateVersion === SNAPSHOT_DATE) return manager;

      function outgoingTeam(competitionId, outgoingOrSlug) {
        if (typeof outgoingOrSlug === 'string') return manager.selectedTeam(competitionId, outgoingOrSlug);
        return outgoingOrSlug || null;
      }

      function assertNotSettledUel(competitionId, outgoingOrSlug) {
        const outgoing = outgoingTeam(competitionId, outgoingOrSlug);
        if (competitionId === 'uel' && fixedUelSet.has(teamId(outgoing))) {
          throw new Error('Bu takımın Avrupa Ligi lig aşaması yeri UCL 3. eleme turu sonucuyla kesinleşti.');
        }
      }

      const wrapped = {
        ...manager,
        currentStateVersion: SNAPSHOT_DATE,
        allTeams(competitionId) {
          return manager.allTeams(competitionId).filter((team) => !isExcluded(competitionId, team));
        },
        reserveTeams(competitionId) {
          return manager.reserveTeams(competitionId).filter((team) => !isExcluded(competitionId, team));
        },
        candidateTeam(competitionId, slug) {
          if (isExcluded(competitionId, slug)) return null;
          return manager.candidateTeam(competitionId, slug);
        },
        isGuaranteed(team) {
          return manager.isGuaranteed(team) || fixedUelSet.has(teamId(team));
        },
        isRemovable(competitionId, team) {
          if (isExcluded(competitionId, team)) return false;
          if (competitionId === 'uel' && fixedUelSet.has(teamId(team))) return false;
          return manager.isRemovable(competitionId, team);
        },
        incomingScenarios(competitionId, outgoingOrSlug) {
          const outgoing = outgoingTeam(competitionId, outgoingOrSlug);
          if (competitionId === 'uel' && fixedUelSet.has(teamId(outgoing))) return [];
          return manager.incomingScenarios(competitionId, outgoingOrSlug);
        },
        simulateReplacement(competitionId, incomingOrSlug, outgoingOrSlug) {
          assertNotSettledUel(competitionId, outgoingOrSlug);
          return manager.simulateReplacement(competitionId, incomingOrSlug, outgoingOrSlug);
        },
        replaceTeam(competitionId, incomingSlug, outgoingSlug) {
          assertNotSettledUel(competitionId, outgoingSlug);
          return manager.replaceTeam(competitionId, incomingSlug, outgoingSlug);
        },
        solveSlotReplacement(targetSlotId, incomingId) {
          if (lockedSlotIds.has(targetSlotId)) {
            throw new Error('Bu eleme kontenjanı oynanmış UCL 3. eleme turu sonucuyla kilitli.');
          }
          return manager.solveSlotReplacement(targetSlotId, incomingId);
        }
      };
      return Object.freeze(wrapped);
    }

    if (currentManager) currentManager = wrap(currentManager);
    Object.defineProperty(window, 'UCLDRAW_ROSTER_MANAGER', {
      configurable: true,
      enumerable: true,
      get() { return currentManager; },
      set(manager) { currentManager = wrap(manager); }
    });
  }

  installRosterManagerHook();

  window.UCLDRAW_QUALIFICATION_STATE = Object.freeze({
    snapshotDate: SNAPSHOT_DATE,
    resolvedUclQ3,
    resolvedUelQ3,
    resolvedUeclQ3,
    eliminatedFromUclIds,
    eliminatedFromUelIds,
    eliminatedFromEuropeIds,
    fixedUelLeaguePhaseIds,
    runtimeDirectEuropaCount: window.UCLDRAW_POOL_MANIFEST.europa.guaranteed.length
  });
})();
