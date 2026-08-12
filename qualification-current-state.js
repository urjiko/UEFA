(() => {
  'use strict';

  const bracket = window.UCLDRAW_QUALIFICATION_BRACKET;
  const sourceManifest = window.UCLDRAW_POOL_MANIFEST;
  if (!bracket?.rounds || !bracket?.simulate || !bracket?.teams || !sourceManifest?.champions || !sourceManifest?.europa) {
    return;
  }

  const SNAPSHOT_DATE = '2026-08-12';
  const originalSimulate = bracket.simulate;
  const originalRounds = bracket.rounds;
  const originalUclQ3 = originalRounds.find((round) => round.id === 'ucl-q3');
  if (!originalUclQ3) return;

  function entryFile(entry) {
    return typeof entry === 'string' ? entry : entry?.file;
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

  const resolvedUclQ3 = {};
  originalUclQ3.ties.forEach((entry) => {
    const first = entry.first;
    const second = entry.second;
    if (!first?.id || !second?.id) return;

    const firstInChampions = competitionHas('champions', first.source?.fileSlug);
    const secondInChampions = competitionHas('champions', second.source?.fileSlug);
    if (firstInChampions === secondInChampions) return;

    const winner = firstInChampions ? first : second;
    const loser = firstInChampions ? second : first;
    const europaStage = entry.route === 'league' ? 'guaranteed' : 'playoffs';
    if (!stageHas('europa', europaStage, loser.source?.fileSlug)) return;

    resolvedUclQ3[entry.id] = Object.freeze({
      tieId: entry.id,
      route: entry.route,
      winnerId: winner.id,
      loserId: loser.id,
      europaStage
    });
  });

  const resolvedStates = Object.freeze(resolvedUclQ3);
  const eliminatedFromUclIds = Object.freeze(Object.values(resolvedStates).map((state) => state.loserId));
  const fixedUelLeaguePhaseIds = Object.freeze(Object.values(resolvedStates)
    .filter((state) => state.route === 'league')
    .map((state) => state.loserId));
  const fixedUelLeaguePhaseFiles = new Set(fixedUelLeaguePhaseIds
    .map((teamId) => bracket.teams[teamId]?.source?.fileSlug)
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
  Object.values(resolvedStates).forEach((state) => {
    const descriptor = bracket.teams[state.loserId];
    if (!descriptor?.source?.fileSlug) return;
    sourceOverrides.set(state.loserId, Object.freeze({
      competitionKey: 'europa',
      stage: state.europaStage,
      fileSlug: descriptor.source.fileSlug
    }));
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
          const state = resolvedStates[entry.id];
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

    return Object.freeze({
      ...round,
      ties: Object.freeze(round.ties.map((entry) => Object.freeze({
        ...entry,
        first: settledParticipant(entry.first),
        second: settledParticipant(entry.second)
      })))
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

  function simulate(random = Math.random) {
    if (typeof random !== 'function') throw new TypeError('Eleme simülasyonu için random fonksiyonu gerekir.');
    let q3Index = 0;
    const forcedRandom = () => {
      if (q3Index < originalUclQ3.ties.length) {
        const entry = originalUclQ3.ties[q3Index];
        q3Index += 1;
        const state = resolvedStates[entry.id];
        if (state) return entry.first.id === state.winnerId ? 0 : 0.999999;
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
        resolvedUclQ3Count: Object.keys(resolvedStates).length,
        resolvedUclQ3: resolvedStates
      })
    });
  }

  window.UCLDRAW_QUALIFICATION_BRACKET = Object.freeze({
    ...bracket,
    rounds,
    simulate,
    teams,
    currentStateVersion: SNAPSHOT_DATE,
    resolvedUclQ3: resolvedStates
  });

  const eliminatedSet = new Set(eliminatedFromUclIds);
  const fixedUelSet = new Set(fixedUelLeaguePhaseIds);
  const lockedSlotIds = new Set(Object.values(resolvedStates)
    .filter((state) => state.route === 'league')
    .map((state) => `uel:${state.tieId}:loser`));

  function teamId(team) {
    return team?.qualificationId || team?.poolSlug || null;
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
          const entries = manager.allTeams(competitionId);
          return competitionId === 'ucl' ? entries.filter((team) => !eliminatedSet.has(teamId(team))) : entries;
        },
        reserveTeams(competitionId) {
          const entries = manager.reserveTeams(competitionId);
          return competitionId === 'ucl' ? entries.filter((team) => !eliminatedSet.has(teamId(team))) : entries;
        },
        candidateTeam(competitionId, slug) {
          if (competitionId === 'ucl' && eliminatedSet.has(slug)) return null;
          return manager.candidateTeam(competitionId, slug);
        },
        isGuaranteed(team) {
          return manager.isGuaranteed(team) || fixedUelSet.has(teamId(team));
        },
        isRemovable(competitionId, team) {
          if (competitionId === 'ucl' && eliminatedSet.has(teamId(team))) return false;
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
    resolvedUclQ3: resolvedStates,
    eliminatedFromUclIds,
    fixedUelLeaguePhaseIds,
    runtimeDirectEuropaCount: window.UCLDRAW_POOL_MANIFEST.europa.guaranteed.length
  });
})();