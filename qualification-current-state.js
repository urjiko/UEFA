(() => {
  'use strict';

  const bracket = window.UCLDRAW_QUALIFICATION_BRACKET;
  const sourceManifest = window.UCLDRAW_POOL_MANIFEST;
  if (!bracket?.rounds || !bracket?.simulate || !bracket?.teams || !sourceManifest?.champions || !sourceManifest?.europa) {
    return;
  }

  const SNAPSHOT_DATE = '2026-08-26';
  const originalSimulate = bracket.simulate;
  const originalRounds = bracket.rounds;
  const originalUclQ3 = originalRounds.find((round) => round.id === 'ucl-q3');
  const originalUclPlayoffs = originalRounds.find((round) => round.id === 'ucl-playoffs');
  if (!originalUclQ3 || !originalUclPlayoffs) return;

  const KNOWN_UCL_Q3_WINNERS = Object.freeze({
    'ucl-q3-dinamo-kauno': 'dinamo',
    'ucl-q3-mjallby-slovan': 'slovanbratislava',
    'ucl-q3-levski-kairat': 'levskisofia',
    'ucl-q3-aarhus-sabah': 'sabah',
    'ucl-q3-ararat-celje': 'celje',
    'ucl-q3-hapoel-crvena': 'hapoelbeersheva',
    'ucl-q3-olympiacos-nec': 'nec',
    'ucl-q3-union-bodo': 'bodo',
    'ucl-q3-fener-sturm': 'fenerbahce',
    'ucl-q3-sparta-lyon': 'lyon'
  });

  function entryFile(entry) {
    return typeof entry === 'string' ? entry : entry?.file;
  }

  function stageHas(competitionKey, stage, fileSlug) {
    if (!fileSlug) return false;
    const expected = `${fileSlug}.png`.toLocaleLowerCase('en-US');
    return (sourceManifest[competitionKey]?.[stage] || [])
      .some((entry) => String(entryFile(entry) || '').toLocaleLowerCase('en-US') === expected);
  }

  function fileForTeam(teamId) {
    return bracket.teams[teamId]?.source?.fileSlug || null;
  }

  function q3State(entry) {
    const winnerId = KNOWN_UCL_Q3_WINNERS[entry.id];
    if (!winnerId || !entry.first?.id || !entry.second?.id) return null;
    if (![entry.first.id, entry.second.id].includes(winnerId)) {
      throw new Error(`UCL Q3 sonucu eşleşmeyle uyuşmuyor: ${entry.id}`);
    }
    const loserId = entry.first.id === winnerId ? entry.second.id : entry.first.id;
    return Object.freeze({
      tieId: entry.id,
      route: entry.route,
      winnerId,
      loserId,
      europaStage: entry.route === 'league' ? 'guaranteed' : 'playoffs'
    });
  }

  const resolvedUclQ3 = Object.freeze(Object.fromEntries(originalUclQ3.ties
    .map((entry) => [entry.id, q3State(entry)])
    .filter(([, state]) => state)));

  function settledQ3Participant(participant) {
    if (participant?.id) return bracket.teams[participant.id] || participant;
    const state = resolvedUclQ3[participant?.tieId];
    if (!state) return participant;
    const teamId = participant.result === 'loser' ? state.loserId : state.winnerId;
    return bracket.teams[teamId];
  }

  function resolveUclPlayoff(entry) {
    const first = settledQ3Participant(entry.first);
    const second = settledQ3Participant(entry.second);
    if (!first?.id || !second?.id) return null;

    const firstWon = stageHas('champions', 'guaranteed', first.source?.fileSlug);
    const secondWon = stageHas('champions', 'guaranteed', second.source?.fileSlug);
    const firstLost = stageHas('europa', 'guaranteed', first.source?.fileSlug);
    const secondLost = stageHas('europa', 'guaranteed', second.source?.fileSlug);

    if (firstWon && secondLost && !secondWon) {
      return Object.freeze({
        tieId: entry.id,
        route: entry.route,
        winnerId: first.id,
        loserId: second.id
      });
    }
    if (secondWon && firstLost && !firstWon) {
      return Object.freeze({
        tieId: entry.id,
        route: entry.route,
        winnerId: second.id,
        loserId: first.id
      });
    }
    return null;
  }

  const resolvedUclPlayoffs = Object.freeze(Object.fromEntries(originalUclPlayoffs.ties
    .map((entry) => [entry.id, resolveUclPlayoff(entry)])
    .filter(([, state]) => state)));

  const fixedUelLeaguePhaseIds = Object.freeze(Object.values(resolvedUclQ3)
    .filter((state) => state.route === 'league')
    .map((state) => state.loserId));
  const fixedUclLeaguePhaseIds = Object.freeze(Object.values(resolvedUclPlayoffs)
    .map((state) => state.winnerId));
  const fixedUclPlayoffLoserIds = Object.freeze(Object.values(resolvedUclPlayoffs)
    .map((state) => state.loserId));

  const fixedUelLeaguePhaseFiles = new Set(fixedUelLeaguePhaseIds
    .map(fileForTeam)
    .filter(Boolean)
    .map((fileSlug) => `${fileSlug}.png`.toLocaleLowerCase('en-US')));
  const fixedUclLeaguePhaseFiles = new Set(fixedUclLeaguePhaseIds
    .map(fileForTeam)
    .filter(Boolean)
    .map((fileSlug) => `${fileSlug}.png`.toLocaleLowerCase('en-US')));
  const fixedUclPlayoffLoserFiles = new Set(fixedUclPlayoffLoserIds
    .map(fileForTeam)
    .filter(Boolean)
    .map((fileSlug) => `${fileSlug}.png`.toLocaleLowerCase('en-US')));

  const runtimeChampions = {
    ...sourceManifest.champions,
    guaranteed: Object.freeze((sourceManifest.champions.guaranteed || []).filter((entry) => (
      !fixedUclLeaguePhaseFiles.has(String(entryFile(entry) || '').toLocaleLowerCase('en-US'))
    )))
  };
  const runtimeEuropa = {
    ...sourceManifest.europa,
    guaranteed: Object.freeze((sourceManifest.europa.guaranteed || []).filter((entry) => {
      const filename = String(entryFile(entry) || '').toLocaleLowerCase('en-US');
      return !fixedUelLeaguePhaseFiles.has(filename) && !fixedUclPlayoffLoserFiles.has(filename);
    }))
  };
  window.UCLDRAW_POOL_MANIFEST = Object.freeze({
    ...sourceManifest,
    champions: Object.freeze(runtimeChampions),
    europa: Object.freeze(runtimeEuropa)
  });

  const sourceOverrides = new Map();
  Object.values(resolvedUclQ3).forEach((state) => {
    const descriptor = bracket.teams[state.loserId];
    if (!descriptor?.source?.fileSlug) return;
    sourceOverrides.set(state.loserId, Object.freeze({
      competitionKey: 'europa',
      stage: state.europaStage,
      fileSlug: descriptor.source.fileSlug
    }));
  });
  Object.values(resolvedUclPlayoffs).forEach((state) => {
    const winner = bracket.teams[state.winnerId];
    const loser = bracket.teams[state.loserId];
    if (winner?.source?.fileSlug) {
      sourceOverrides.set(state.winnerId, Object.freeze({
        competitionKey: 'champions',
        stage: 'guaranteed',
        fileSlug: winner.source.fileSlug
      }));
    }
    if (loser?.source?.fileSlug) {
      sourceOverrides.set(state.loserId, Object.freeze({
        competitionKey: 'europa',
        stage: 'guaranteed',
        fileSlug: loser.source.fileSlug
      }));
    }
  });

  const teams = Object.freeze(Object.fromEntries(Object.entries(bracket.teams).map(([teamId, descriptor]) => [
    teamId,
    sourceOverrides.has(teamId)
      ? Object.freeze({ ...descriptor, source: sourceOverrides.get(teamId) })
      : descriptor
  ])));

  function settledParticipant(participant) {
    if (participant?.id) return teams[participant.id] || participant;
    const state = resolvedUclQ3[participant?.tieId];
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

    return Object.freeze({
      ...round,
      ties: Object.freeze(round.ties.map((entry) => {
        const first = settledParticipant(entry.first);
        const second = settledParticipant(entry.second);
        const playoffState = round.id === 'ucl-playoffs' ? resolvedUclPlayoffs[entry.id] : null;
        return Object.freeze({
          ...entry,
          first,
          second,
          ...(playoffState ? {
            resolved: true,
            resolvedWinnerId: playoffState.winnerId,
            resolvedLoserId: playoffState.loserId
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

  function playoffFirstId(entry) {
    return settledParticipant(entry.first)?.id || null;
  }

  function simulate(random = Math.random) {
    if (typeof random !== 'function') throw new TypeError('Eleme simülasyonu için random fonksiyonu gerekir.');
    let callIndex = 0;
    const q3Count = originalUclQ3.ties.length;
    const playoffCount = originalUclPlayoffs.ties.length;

    const forcedRandom = () => {
      const index = callIndex;
      callIndex += 1;

      if (index < q3Count) {
        const entry = originalUclQ3.ties[index];
        const state = resolvedUclQ3[entry.id];
        if (state) return entry.first.id === state.winnerId ? 0 : 0.999999;
        return random();
      }

      if (index < q3Count + playoffCount) {
        const entry = originalUclPlayoffs.ties[index - q3Count];
        const passthrough = random();
        const state = resolvedUclPlayoffs[entry.id];
        if (!state) return passthrough;
        return playoffFirstId(entry) === state.winnerId ? 0 : 0.999999;
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
        resolvedUclQ3,
        resolvedUclPlayoffCount: Object.keys(resolvedUclPlayoffs).length,
        resolvedUclPlayoffs
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
    resolvedUclPlayoffs
  });

  const eliminatedFromUclIds = Object.freeze([...new Set([
    ...Object.values(resolvedUclQ3).map((state) => state.loserId),
    ...fixedUclPlayoffLoserIds
  ])]);

  const eliminatedSet = new Set(eliminatedFromUclIds);
  const fixedUclSet = new Set(fixedUclLeaguePhaseIds);
  const fixedUelSet = new Set([...fixedUelLeaguePhaseIds, ...fixedUclPlayoffLoserIds]);
  const lockedSlotIds = new Set([
    ...Object.values(resolvedUclQ3)
      .filter((state) => state.route === 'league')
      .map((state) => `uel:${state.tieId}:loser`),
    ...Object.values(resolvedUclPlayoffs)
      .flatMap((state) => [
        `ucl:${state.tieId}:winner`,
        `uel:${state.tieId}:loser`
      ])
  ]);

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

      function assertNotSettled(competitionId, outgoingOrSlug) {
        const outgoing = outgoingTeam(competitionId, outgoingOrSlug);
        const id = teamId(outgoing);
        if (competitionId === 'ucl' && fixedUclSet.has(id)) {
          throw new Error('Bu takımın Şampiyonlar Ligi lig aşaması yeri play-off sonucuyla kesinleşti.');
        }
        if (competitionId === 'uel' && fixedUelSet.has(id)) {
          throw new Error('Bu takımın Avrupa Ligi lig aşaması yeri oynanmış eleme sonucuyla kesinleşti.');
        }
      }

      const wrapped = {
        ...manager,
        currentStateVersion: SNAPSHOT_DATE,
        allTeams(competitionId) {
          const entries = manager.allTeams(competitionId);
          if (competitionId === 'ucl') return entries.filter((team) => !eliminatedSet.has(teamId(team)));
          if (competitionId === 'uel') return entries.filter((team) => !fixedUclSet.has(teamId(team)));
          return entries;
        },
        reserveTeams(competitionId) {
          const entries = manager.reserveTeams(competitionId);
          if (competitionId === 'ucl') return entries.filter((team) => !eliminatedSet.has(teamId(team)));
          if (competitionId === 'uel') return entries.filter((team) => !fixedUclSet.has(teamId(team)));
          return entries;
        },
        candidateTeam(competitionId, slug) {
          if (competitionId === 'ucl' && eliminatedSet.has(slug)) return null;
          if (competitionId === 'uel' && fixedUclSet.has(slug)) return null;
          return manager.candidateTeam(competitionId, slug);
        },
        isGuaranteed(team) {
          const id = teamId(team);
          return manager.isGuaranteed(team) || fixedUclSet.has(id) || fixedUelSet.has(id);
        },
        isRemovable(competitionId, team) {
          const id = teamId(team);
          if (competitionId === 'ucl' && (eliminatedSet.has(id) || fixedUclSet.has(id))) return false;
          if (competitionId === 'uel' && fixedUelSet.has(id)) return false;
          return manager.isRemovable(competitionId, team);
        },
        incomingScenarios(competitionId, outgoingOrSlug) {
          const outgoing = outgoingTeam(competitionId, outgoingOrSlug);
          const id = teamId(outgoing);
          if (competitionId === 'ucl' && fixedUclSet.has(id)) return [];
          if (competitionId === 'uel' && fixedUelSet.has(id)) return [];
          return manager.incomingScenarios(competitionId, outgoingOrSlug);
        },
        simulateReplacement(competitionId, incomingOrSlug, outgoingOrSlug) {
          assertNotSettled(competitionId, outgoingOrSlug);
          return manager.simulateReplacement(competitionId, incomingOrSlug, outgoingOrSlug);
        },
        replaceTeam(competitionId, incomingSlug, outgoingSlug) {
          assertNotSettled(competitionId, outgoingSlug);
          return manager.replaceTeam(competitionId, incomingSlug, outgoingSlug);
        },
        solveSlotReplacement(targetSlotId, incomingId) {
          if (lockedSlotIds.has(targetSlotId)) {
            throw new Error('Bu eleme kontenjanı oynanmış sonuçla kilitli.');
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
    resolvedUclPlayoffs,
    eliminatedFromUclIds,
    fixedUelLeaguePhaseIds,
    fixedUclLeaguePhaseIds,
    fixedUclPlayoffLoserIds,
    runtimeDirectChampionsCount: window.UCLDRAW_POOL_MANIFEST.champions.guaranteed.length,
    runtimeDirectEuropaCount: window.UCLDRAW_POOL_MANIFEST.europa.guaranteed.length
  });
})();