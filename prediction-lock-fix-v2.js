(() => {
  'use strict';

  if (window.UCLDRAW_PREDICTION_LOCK_FIX_V2) return;

  const engine = window.UCLDRAW_PREDICTION_ENGINE;
  const ai = window.UCLDRAW_PREDICTION_AI;
  const model = window.UCLDRAW_HOME_ADVANTAGE_MODEL;
  if (!engine || !ai) return;

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function cloneScore(score) {
    if (!score || typeof score !== 'object') return score;
    return {
      ...score,
      model: score.model && typeof score.model === 'object' ? { ...score.model } : score.model
    };
  }

  function matchHasLockedTeam(state, match) {
    return Boolean(state?.teamLocks?.[match.home.name] || state?.teamLocks?.[match.away.name]);
  }

  function isProtectedResult(state, match) {
    return Boolean(state?.scores?.[match.id] && (
      state?.matchLocks?.[match.id]
      || matchHasLockedTeam(state, match)
    ));
  }

  function setManualScoreWithoutReroll(state, matchId, homeGoals, awayGoals) {
    const match = state?.matches?.find((candidate) => candidate.id === matchId);
    if (!match) throw new Error('Skoru değiştirilecek maç bulunamadı.');

    const home = clamp(Number.parseInt(homeGoals, 10) || 0, 0, 15);
    const away = clamp(Number.parseInt(awayGoals, 10) || 0, 0, 15);
    state.scores[matchId] = {
      homeGoals: home,
      awayGoals: away,
      source: 'user-score'
    };
    state.matchLocks[matchId] = true;
    return state.scores[matchId];
  }

  const patchedEngine = Object.freeze({
    ...engine,
    setManualScore: setManualScoreWithoutReroll,
    __stableMatchLock: true
  });
  window.UCLDRAW_PREDICTION_ENGINE = patchedEngine;

  function predictAllPreservingLocks(state = ai.getState?.()) {
    if (!state?.matches?.length) throw new Error('Yapay zeka tahmini için aktif bir turnuva bulunamadı.');

    const protectedScores = {};
    for (const match of state.matches) {
      if (isProtectedResult(state, match)) protectedScores[match.id] = cloneScore(state.scores[match.id]);
    }

    state.aiPredictionVersion = Number(state.aiPredictionVersion || 0) + 1;
    const predictionRun = state.aiPredictionVersion;
    const lastMatchday = state.matches.reduce(
      (maximum, match) => Math.max(maximum, Number(match.matchday) || 0),
      0
    );

    for (const match of state.matches) {
      if (!protectedScores[match.id]) delete state.scores[match.id];
    }
    for (const [matchId, score] of Object.entries(protectedScores)) {
      state.scores[matchId] = cloneScore(score);
    }

    state.activeMatchdays = {};
    state.rerollVersion = {};
    for (let matchday = 1; matchday <= lastMatchday; matchday += 1) {
      state.rerollVersion[matchday] = 0;
    }

    if (model?.simulateMatchday) {
      for (let matchday = 1; matchday <= lastMatchday; matchday += 1) {
        model.simulateMatchday(state, matchday);
      }
    } else {
      const lockedMatchIds = { ...(state.matchLocks || {}) };
      const lockedTeams = { ...(state.teamLocks || {}) };
      ai.predictAll(state);
      state.matchLocks = lockedMatchIds;
      state.teamLocks = lockedTeams;
      for (const [matchId, score] of Object.entries(protectedScores)) {
        state.scores[matchId] = cloneScore(score);
      }
      return state;
    }

    window.dispatchEvent(new CustomEvent('ucldraw:ai-predictions-applied', {
      detail: {
        state,
        matchdays: lastMatchday,
        predictionRun,
        mode: 'all-preserve-locks',
        lockFixVersion: 2
      }
    }));
    return state;
  }

  window.UCLDRAW_PREDICTION_AI = Object.freeze({
    ...ai,
    predictAll: predictAllPreservingLocks,
    __stableLockPrediction: true
  });

  function predictionState() {
    return window.UCLDRAW_PREDICTION_AI?.getState?.() || null;
  }

  function matchForCard(card) {
    const state = predictionState();
    const activeName = document.querySelector('#predictionSection .prediction-header h2')?.textContent?.trim();
    if (!state || !activeName || !card) return null;
    const cards = [...document.querySelectorAll('#predictionSection .prediction-fixture-card')];
    const index = cards.indexOf(card);
    if (index < 0) return null;
    const matches = state.matches
      .filter((match) => match.home.name === activeName || match.away.name === activeName)
      .sort((first, second) => first.matchday - second.matchday);
    return matches[index] || null;
  }

  function cleanLockCopy() {
    document.querySelectorAll('#predictionSection .prediction-team-lock').forEach((button) => {
      const locked = button.classList.contains('is-locked') || button.getAttribute('aria-pressed') === 'true';
      const nextText = locked ? '🔒' : 'Takımı Kilitle';
      if (button.textContent !== nextText) button.textContent = nextText;
      button.title = locked ? 'Takım kilidini aç' : 'Takımı kilitle';
      button.setAttribute('aria-label', button.title);
    });

    document.querySelectorAll('#predictionSection .prediction-fixture-card').forEach((card) => {
      const state = predictionState();
      const match = matchForCard(card);
      const locked = Boolean(match && state?.matchLocks?.[match.id]);
      const button = card.querySelector('.prediction-score-apply');
      if (button) {
        button.classList.toggle('is-match-locked', locked);
        button.textContent = locked ? '🔒' : 'Kilitle';
        button.title = locked ? 'Skor kilidini aç' : 'Bu skoru kilitle';
        button.setAttribute('aria-label', button.title);
      }

      const stateLabel = card.querySelector('.prediction-fixture-top small');
      if (stateLabel && /^(Kilitli|Takım kilidi|🔒)$/i.test(stateLabel.textContent.trim())) {
        stateLabel.textContent = 'Tahmin edildi';
      }
    });

    document.querySelectorAll('#predictionSection .prediction-panel-heading > span').forEach((note) => {
      if (/kilitli/i.test(note.textContent || '') || note.textContent.trim() === '🔒') {
        note.textContent = 'Sonuç seçmek için logoya bas';
      }
    });
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('.prediction-score-apply');
    if (!button) return;
    const card = button.closest('.prediction-fixture-card');
    const state = predictionState();
    const match = matchForCard(card);
    if (!state || !match || !state.matchLocks?.[match.id]) return;

    delete state.matchLocks[match.id];
    event.preventDefault();
    event.stopImmediatePropagation();
    card?.classList.remove('is-locked');
    button.classList.remove('is-match-locked');
    button.textContent = 'Kilitle';
    button.title = 'Bu skoru kilitle';
    button.setAttribute('aria-label', button.title);
    window.requestAnimationFrame(cleanLockCopy);
  }, true);

  function queueCleanup() {
    window.requestAnimationFrame(() => window.requestAnimationFrame(cleanLockCopy));
  }

  document.addEventListener('DOMContentLoaded', queueCleanup, { once: true });
  window.addEventListener('ucldraw:prediction-rendered', queueCleanup);
  window.addEventListener('ucldraw:ai-predictions-applied', queueCleanup);
  window.addEventListener('ucldraw:ai-predictions-restored-locks', queueCleanup);

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => (
      mutation.target?.closest?.('#predictionSection')
      || mutation.addedNodes?.length
    ))) queueCleanup();
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  else document.addEventListener('DOMContentLoaded', () => observer.observe(document.body, { childList: true, subtree: true, characterData: true }), { once: true });

  window.UCLDRAW_PREDICTION_LOCK_FIX_V2 = Object.freeze({
    version: 2,
    cleanLockCopy,
    predictAllPreservingLocks,
    setManualScoreWithoutReroll
  });
})();
