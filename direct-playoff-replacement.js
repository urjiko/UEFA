(() => {
  'use strict';

  const data = window.UCLDRAW_DATA;
  const manager = window.UCLDRAW_ROSTER_MANAGER;
  const STORAGE_KEY = 'ucldraw:qualification-slot-assignments:v1';
  if (!data?.competitions || !manager?.qualificationSlots || !manager?.slotForTeam || !manager?.allTeams) return;

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

  function runtimeAssignments() {
    const assignments = {};
    for (const slot of manager.qualificationSlots) {
      let occupant = null;
      for (const competitionId of ['ucl', 'uel', 'uecl']) {
        occupant = data.competitions[competitionId]?.teams.find((team) => manager.slotForTeam(team)?.id === slot.id) || null;
        if (occupant) break;
      }
      const occupantId = teamId(occupant);
      if (!occupantId) throw new Error(`Eleme kontenjanının mevcut takımı bulunamadı: ${slot.id}`);
      assignments[slot.id] = occupantId;
    }
    return assignments;
  }

  function currentStoredAssignments() {
    try {
      const raw = window.sessionStorage?.getItem(STORAGE_KEY);
      if (!raw) return { parsed: null, assignments: runtimeAssignments() };
      const parsed = JSON.parse(raw);
      const assignments = { ...(parsed?.assignments || {}) };
      const complete = manager.qualificationSlots.every((slot) => assignments[slot.id]);
      return complete ? { parsed, assignments } : { parsed, assignments: runtimeAssignments() };
    } catch {
      return { parsed: null, assignments: runtimeAssignments() };
    }
  }

  function validateDirectAssignments(assignments) {
    const slotIds = manager.qualificationSlots.map((slot) => slot.id);
    if (slotIds.some((slotId) => !assignments[slotId])) return false;
    const values = slotIds.map((slotId) => assignments[slotId]);
    if (new Set(values).size !== values.length) return false;
    return manager.qualificationSlots.every((slot) => slot.candidateIds.includes(assignments[slot.id]));
  }

  function persistDirectSwap(pair) {
    const outgoingId = teamId(pair.outgoing);
    const opponentId = teamId(pair.opponent);
    const targetSlotId = pair.slot.id;
    const { parsed, assignments } = currentStoredAssignments();
    const sourceSlotId = Object.keys(assignments)
      .find((slotId) => slotId !== targetSlotId && assignments[slotId] === opponentId) || null;

    assignments[targetSlotId] = opponentId;
    if (sourceSlotId) assignments[sourceSlotId] = outgoingId;

    if (!validateDirectAssignments(assignments)) {
      throw new Error('Play-off eşleşmesi doğrudan tersine çevrilemedi.');
    }

    const bracketVersion = window.UCLDRAW_QUALIFICATION_RESULT?.diagnostics?.bracketVersion
      || window.UCLDRAW_QUALIFICATION_BRACKET?.currentStateVersion
      || parsed?.bracketVersion
      || null;

    window.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      bracketVersion,
      assignments
    }));

    return Object.freeze({
      competitionId: pair.slot.competitionId,
      outgoing: pair.outgoing,
      incoming: pair.opponent,
      targetSlotId,
      sourceSlotId,
      assignments: Object.freeze({ ...assignments }),
      requiresReload: true
    });
  }

  function directOpponentScenario(competitionId, outgoingOrSlug) {
    const pair = directOpponent(competitionId, outgoingOrSlug);
    if (!pair) return null;
    return Object.freeze({
      competitionId,
      outgoing: pair.outgoing,
      incoming: pair.opponent,
      slot: pair.slot
    });
  }

  function replaceWithDirectOpponent(competitionId, outgoingOrSlug) {
    const pair = directOpponent(competitionId, outgoingOrSlug);
    if (!pair) throw new Error('Bu takım için tek bir play-off rakibi bulunamadı.');
    return persistDirectSwap(pair);
  }

  window.UCLDRAW_DIRECT_PLAYOFF_REPLACEMENT = Object.freeze({
    directOpponent,
    directOpponentScenario,
    replaceWithDirectOpponent
  });
})();
