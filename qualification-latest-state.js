(() => {
  'use strict';

  const bracket = window.UCLDRAW_QUALIFICATION_BRACKET;
  const manifest = window.UCLDRAW_POOL_MANIFEST;
  if (!bracket?.rounds || !bracket?.simulate || !bracket?.teams || !manifest?.europa || !manifest?.conference) return;

  const SNAPSHOT_DATE = '2026-08-15';
  const originalSimulate = bracket.simulate;
  const originalRounds = bracket.rounds;
  const competitionKeys = ['champions', 'europa', 'conference'];

  function entryFile(entry) {
    return typeof entry === 'string' ? entry : entry?.file;
  }

  function stem(value) {
    return String(value || '').replace(/\.png$/i, '').toLocaleLowerCase('en-US');
  }

  function aliases(team) {
    return [...new Set([
      team?.source?.fileSlug,
      team?.poolSlug,
      team?.coefficientSlug,
      team?.id
    ].map(stem).filter(Boolean))];
  }

  function locate(team) {
    const candidates = aliases(team);
    for (const competitionKey of competitionKeys) {
      for (const [stage, entries] of Object.entries(manifest[competitionKey] || {})) {
        for (const entry of entries || []) {
          const fileStem = stem(entryFile(entry));
          if (candidates.includes(fileStem)) {
            return Object.freeze({ competitionKey, stage, fileSlug: fileStem });
          }
        }
      }
    }
    return null;
  }

  function resolvedState(entry, winner, loser, winnerLocation, loserLocation) {
    return Object.freeze({
      tieId: entry.id,
      route: entry.route,
      winnerId: winner.id,
      loserId: loser.id,
      winnerLocation,
      loserLocation
    });
  }

  function resolveUelQ3(entry) {
    const first = entry.first;
    const second = entry.second;
    if (!first?.id || !second?.id) return null;
    const firstLocation = locate(first);
    const secondLocation = locate(second);

    if (firstLocation?.competitionKey === 'europa' && firstLocation.stage === 'playoffs'
      && secondLocation?.competitionKey === 'conference' && secondLocation.stage === 'playoffs') {
      return resolvedState(entry, first, second, firstLocation, secondLocation);
    }
    if (secondLocation?.competitionKey === 'europa' && secondLocation.stage === 'playoffs'
      && firstLocation?.competitionKey === 'conference' && firstLocation.stage === 'playoffs') {
      return resolvedState(entry, second, first, secondLocation, firstLocation);
    }
    return null;
  }

  function resolveUeclQ3(entry) {
    const first = entry.first;
    const second = entry.second;
    if (!first?.id || !second?.id) return null;
    const firstLocation = locate(first);
    const secondLocation = locate(second);

    if (firstLocation?.competitionKey === 'conference' && firstLocation.stage === 'playoffs' && !secondLocation) {
      return resolvedState(entry, first, second, firstLocation, null);
    }
    if (secondLocation?.competitionKey === 'conference' && secondLocation.stage === 'playoffs' && !firstLocation) {
      return resolvedState(entry, second, first, secondLocation, null);
    }
    return null;
  }

  const uelQ3 = originalRounds.find((round) => round.id === 'uel-q3');
  const ueclQ3 = originalRounds.find((round) => round.id === 'uecl-q3');
  const resolvedUelQ3 = Object.freeze(Object.fromEntries((uelQ3?.ties || [])
    .map((entry) => [entry.id, resolveUelQ3(entry)])
    .filter(([, state]) => state)));
  const resolvedUeclQ3 = Object.freeze(Object.fromEntries((ueclQ3?.ties || [])
    .map((entry) => [entry.id, resolveUeclQ3(entry)])
    .filter(([, state]) => state)));
  const resolvedStates = Object.freeze({ ...resolvedUelQ3, ...resolvedUeclQ3 });

  const sourceOverrides = new Map();
  Object.values(resolvedStates).forEach((state) => {
    if (state.winnerLocation) sourceOverrides.set(state.winnerId, state.winnerLocation);
    if (state.loserLocation) sourceOverrides.set(state.loserId, state.loserLocation);
  });

  const teams = Object.freeze(Object.fromEntries(Object.entries(bracket.teams).map(([teamId, descriptor]) => {
    const location = sourceOverrides.get(teamId);
    if (!location) return [teamId, descriptor];
    return [teamId, Object.freeze({
      ...descriptor,
      source: Object.freeze({
        competitionKey: location.competitionKey,
        stage: location.stage,
        fileSlug: location.fileSlug
      })
    })];
  })));

  function settledParticipant(participant) {
    if (participant?.id) return teams[participant.id] || participant;
    const state = resolvedStates[participant?.tieId];
    if (!state) return participant;
    const teamId = participant.result === 'loser' ? state.loserId : state.winnerId;
    return teams[teamId];
  }

  const rounds = Object.freeze(originalRounds.map((round) => Object.freeze({
    ...round,
    ties: Object.freeze(round.ties.map((entry) => {
      const state = resolvedStates[entry.id];
      if (state) {
        return Object.freeze({
          ...entry,
          resolved: true,
          resolvedWinnerId: state.winnerId,
          resolvedLoserId: state.loserId
        });
      }
      return Object.freeze({
        ...entry,
        first: settledParticipant(entry.first),
        second: settledParticipant(entry.second)
      });
    }))
  })));

  const outerRandomTies = originalRounds
    .filter((round) => round.id !== 'ucl-q3')
    .flatMap((round) => round.ties);

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
    let callIndex = 0;
    const forcedRandom = () => {
      const entry = outerRandomTies[callIndex];
      callIndex += 1;
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
        resolvedUelQ3Count: Object.keys(resolvedUelQ3).length,
        resolvedUeclQ3Count: Object.keys(resolvedUeclQ3).length,
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
    resolvedUelQ3,
    resolvedUeclQ3
  });

  const eliminatedFromUel = new Set(Object.values(resolvedUelQ3).map((state) => state.loserId));
  const eliminatedFromUecl = new Set(Object.values(resolvedUeclQ3).map((state) => state.loserId));

  function teamId(team) {
    return team?.qualificationId || team?.poolSlug || null;
  }

  function filterCompetitionCandidates(manager, method, competitionId, ...args) {
    const entries = manager[method](competitionId, ...args);
    if (!Array.isArray(entries)) return entries;
    if (competitionId === 'uel') return entries.filter((team) => !eliminatedFromUel.has(teamId(team)));
    if (competitionId === 'uecl') return entries.filter((team) => !eliminatedFromUecl.has(teamId(team)));
    return entries;
  }

  function wrapManager(manager) {
    if (!manager || manager.latestStateVersion === SNAPSHOT_DATE) return manager;
    return Object.freeze({
      ...manager,
      latestStateVersion: SNAPSHOT_DATE,
      allTeams(competitionId) {
        return filterCompetitionCandidates(manager, 'allTeams', competitionId);
      },
      reserveTeams(competitionId) {
        return filterCompetitionCandidates(manager, 'reserveTeams', competitionId);
      },
      candidateTeam(competitionId, slug) {
        if (competitionId === 'uel' && eliminatedFromUel.has(slug)) return null;
        if (competitionId === 'uecl' && eliminatedFromUecl.has(slug)) return null;
        return manager.candidateTeam(competitionId, slug);
      },
      replacementScenarios(competitionId, incomingOrSlug) {
        const incomingId = typeof incomingOrSlug === 'string' ? incomingOrSlug : teamId(incomingOrSlug);
        if (competitionId === 'uel' && eliminatedFromUel.has(incomingId)) return [];
        if (competitionId === 'uecl' && eliminatedFromUecl.has(incomingId)) return [];
        return manager.replacementScenarios(competitionId, incomingOrSlug);
      }
    });
  }

  const previousDescriptor = Object.getOwnPropertyDescriptor(window, 'UCLDRAW_ROSTER_MANAGER');
  let currentManager = previousDescriptor?.get ? previousDescriptor.get.call(window) : window.UCLDRAW_ROSTER_MANAGER || null;
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

  window.UCLDRAW_LATEST_QUALIFICATION_STATE = Object.freeze({
    snapshotDate: SNAPSHOT_DATE,
    resolvedUelQ3,
    resolvedUeclQ3,
    eliminatedFromUelIds: Object.freeze([...eliminatedFromUel]),
    eliminatedFromUeclIds: Object.freeze([...eliminatedFromUecl])
  });
})();
