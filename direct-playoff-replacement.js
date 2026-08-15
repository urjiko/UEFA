(() => {
  'use strict';

  const manager = window.UCLDRAW_ROSTER_MANAGER;
  if (!manager?.qualificationSlots || !manager?.slotForTeam || !manager?.allTeams) return;

  function teamId(team) {
    return team?.qualificationId || team?.poolSlug || null;
  }

  function resolveOutgoing(competitionId, outgoingOrSlug) {
    if (typeof outgoingOrSlug === 'string') return manager.selectedTeam(competitionId, outgoingOrSlug);
    return outgoingOrSlug || null;
  }

  function directOpponent(competitionId, outgoingOrSlug) {
    const outgoing = resolveOutgoing(competitionId, outgoingOrSlug);
    if (!outgoing || !manager.isRemovable(competitionId, outgoing)) return null;

    const slot = manager.slotForTeam(outgoing);
    if (!slot || slot.competitionId !== competitionId || slot.candidateIds.length !== 2) return null;

    const outgoingId = teamId(outgoing);
    const opponentId = slot.candidateIds.find((candidateId) => candidateId !== outgoingId);
    if (!opponentId) return null;

    const opponent = manager.allTeams(competitionId)
      .find((team) => teamId(team) === opponentId) || null;
    if (!opponent) return null;

    return Object.freeze({ outgoing, opponent, slot });
  }

  function directOpponentScenario(competitionId, outgoingOrSlug) {
    const pair = directOpponent(competitionId, outgoingOrSlug);
    if (!pair) return null;
    try {
      return manager.simulateReplacement(competitionId, pair.opponent, pair.outgoing);
    } catch {
      return null;
    }
  }

  function replaceWithDirectOpponent(competitionId, outgoingOrSlug) {
    const pair = directOpponent(competitionId, outgoingOrSlug);
    if (!pair) throw new Error('Bu takım için tek bir play-off rakibi bulunamadı.');
    return manager.replaceTeam(competitionId, pair.opponent.poolSlug, pair.outgoing.poolSlug);
  }

  window.UCLDRAW_DIRECT_PLAYOFF_REPLACEMENT = Object.freeze({
    directOpponent,
    directOpponentScenario,
    replaceWithDirectOpponent
  });
})();
