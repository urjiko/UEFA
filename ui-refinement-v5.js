(() => {
  'use strict';

  const body = document.body;
  const drawKicker = document.getElementById('drawKicker');
  const predictionSection = document.getElementById('predictionSection');
  const legacyShareUiEnabled = !window.UCLDRAW_DISABLE_LEGACY_SHARE_UI;
  let floatingShare = null;
  let floatingObserver = null;
  let observedShareRow = null;

  function setText(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function competitionDrawLabel() {
    const leagueId = body.dataset.league || 'ucl';
    const competition = window.UCLDRAW_DATA?.competitions?.[leagueId];
    const name = String(competition?.name || competition?.shortName || 'UEFA')
      .replace(/^UEFA\s+/i, '')
      .trim()
      .toLocaleUpperCase('en-US');
    return `${name} - KURA`;
  }

  function refineDrawKicker() {
    if (drawKicker && body.classList.contains('draw-active')) {
      setText(drawKicker, competitionDrawLabel());
      drawKicker.hidden = false;
    }
  }

  function refineTeamActionButtons() {
    document.querySelectorAll('.roster-team-action-simple').forEach((modal) => {
      const actions = modal.querySelector('.roster-team-actions');
      modal.classList.toggle('is-simple-action-modal', Boolean(actions && actions.children.length === 1));
    });
  }

  function refineStandingsPanel() {
    document.querySelectorAll('#predictionSection .prediction-standings-panel').forEach((panel) => {
      panel.classList.remove('glass');
      if (panel.querySelector(':scope > .prediction-standings-card')) return;
      const legend = panel.querySelector(':scope > .prediction-zone-legend');
      const table = panel.querySelector(':scope > .prediction-standings-table');
      if (!table) return;
      const card = document.createElement('div');
      card.className = 'prediction-standings-card glass';
      if (legend) card.appendChild(legend);
      card.appendChild(table);
      const actions = panel.querySelector(':scope > .prediction-share-actions-v4');
      panel.insertBefore(card, actions || null);
    });
  }

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

  function unlockCard(card, button) {
    const state = predictionState();
    const match = matchForCard(card);
    if (!state || !match) return false;
    delete state.matchLocks[match.id];
    card.classList.remove('is-locked');
    card.querySelectorAll('.prediction-outcome-team, .prediction-draw-choice').forEach((choice) => {
      choice.disabled = false;
      choice.setAttribute('aria-disabled', 'false');
    });
    card.querySelectorAll('.prediction-score-editor input').forEach((input) => { input.disabled = false; });
    button.classList.remove('is-match-locked');
    button.disabled = false;
    button.title = 'Bu skoru kilitle';
    button.setAttribute('aria-label', 'Bu skoru kilitle');
    setText(button, 'Kilitle');
    return true;
  }

  function refinePredictionLocks() {
    const state = predictionState();

    document.querySelectorAll('#predictionSection .prediction-team-lock').forEach((button) => {
      const locked = button.classList.contains('is-locked') || button.getAttribute('aria-pressed') === 'true';
      setText(button, locked ? '🔒' : 'Takımı Kilitle');
      button.title = locked ? 'Takım kilidini aç' : 'Takımı kilitle';
      button.setAttribute('aria-label', button.title);
    });

    document.querySelectorAll('#predictionSection .prediction-fixture-card').forEach((card) => {
      const match = matchForCard(card);
      const matchLocked = Boolean(match && state?.matchLocks?.[match.id]);
      const teamLocked = Boolean(match && (state?.teamLocks?.[match.home.name] || state?.teamLocks?.[match.away.name]));
      const button = card.querySelector('.prediction-score-apply');
      if (button) {
        button.disabled = false;
        button.classList.toggle('is-match-locked', matchLocked);
        button.title = matchLocked ? 'Skor kilidini aç' : 'Bu skoru kilitle';
        button.setAttribute('aria-label', button.title);
        setText(button, matchLocked ? '🔒' : 'Kilitle');
      }
      const stateLabel = card.querySelector('.prediction-fixture-top small');
      if (stateLabel && (matchLocked || (teamLocked && state?.scores?.[match?.id]))) setText(stateLabel, '🔒');
    });

    document.querySelectorAll('#predictionSection .prediction-panel-heading > span').forEach((note) => {
      if (/kilitli/i.test(note.textContent || '')) setText(note, '🔒');
    });
  }

  function cloneScore(score) {
    if (!score || typeof score !== 'object') return score;
    return {
      ...score,
      model: score.model && typeof score.model === 'object' ? { ...score.model } : score.model
    };
  }

  function snapshotProtectedPredictions(state) {
    const matchLocks = { ...(state?.matchLocks || {}) };
    const teamLocks = { ...(state?.teamLocks || {}) };
    const scores = {};
    for (const match of state?.matches || []) {
      const score = state.scores?.[match.id];
      const protectedResult = Boolean(score && (
        matchLocks[match.id]
        || teamLocks[match.home.name]
        || teamLocks[match.away.name]
      ));
      if (protectedResult) scores[match.id] = cloneScore(score);
    }
    return { matchLocks, teamLocks, scores };
  }

  function restoreProtectedPredictions(state, protectedState) {
    if (!state || !protectedState) return;
    state.matchLocks = { ...protectedState.matchLocks };
    state.teamLocks = { ...protectedState.teamLocks };
    for (const [matchId, score] of Object.entries(protectedState.scores)) state.scores[matchId] = cloneScore(score);
  }

  function refreshPredictionView() {
    const selectedRow = document.querySelector('#predictionSection .prediction-standing-row.is-selected-team');
    if (selectedRow) selectedRow.click();
    else window.dispatchEvent(new CustomEvent('ucldraw:prediction-refresh-requested'));
  }

  function runAiPredictionPreservingLocks(button) {
    const AI = window.UCLDRAW_PREDICTION_AI;
    const state = predictionState();
    if (!AI?.predictAll || !state) return false;
    if (button.dataset.busy === 'true') return true;

    const protectedState = snapshotProtectedPredictions(state);
    button.dataset.busy = 'true';
    button.disabled = true;
    setText(button, 'Hazırlanıyor...');
    try {
      AI.predictAll(state);
      restoreProtectedPredictions(state, protectedState);
      refreshPredictionView();
      window.dispatchEvent(new CustomEvent('ucldraw:ai-predictions-restored-locks', {
        detail: { protectedMatches: Object.keys(protectedState.scores).length }
      }));
    } catch (error) {
      console.error(error);
    } finally {
      delete button.dataset.busy;
      button.disabled = false;
      setText(button, 'Yapay Zeka Tahmini');
      window.requestAnimationFrame(refresh);
    }
    return true;
  }

  function createFloatingShare() {
    if (!legacyShareUiEnabled) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'prediction-share-floating';
    wrapper.hidden = true;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action-button primary prediction-share-floating-button';
    button.textContent = 'Paylaş';
    button.addEventListener('click', () => {
      const original = document.querySelector('#predictionSection .prediction-share-v4-button');
      if (original && !original.hidden && !original.disabled) original.click();
    });
    wrapper.appendChild(button);
    document.body.appendChild(wrapper);
    return wrapper;
  }

  function shareRowIsVisible(row) {
    if (!row) return false;
    const rect = row.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  function observeShareRow(row) {
    if (observedShareRow === row) return;
    floatingObserver?.disconnect();
    observedShareRow = row;
    if (!row || !('IntersectionObserver' in window)) return;
    floatingObserver = new IntersectionObserver(() => syncFloatingShare(), {
      root: null,
      threshold: [0, 0.05, 0.5, 1]
    });
    floatingObserver.observe(row);
  }

  function syncFloatingShare() {
    if (!legacyShareUiEnabled) {
      if (floatingShare) floatingShare.hidden = true;
      return;
    }
    const original = document.querySelector('#predictionSection .prediction-share-v4-button');
    const row = original?.closest('.prediction-share-actions-v4') || null;
    const active = body.classList.contains('prediction-active') && original && !original.hidden;
    if (!floatingShare) floatingShare = createFloatingShare();
    observeShareRow(row);
    if (!active) {
      floatingShare.hidden = true;
      return;
    }
    const proxy = floatingShare.querySelector('.prediction-share-floating-button');
    proxy.disabled = Boolean(original.disabled);
    setText(proxy, original.textContent || 'Paylaş');
    floatingShare.hidden = shareRowIsVisible(row);
  }

  function installShareRendererV7() {
    if (document.querySelector('script[data-prediction-share-v7]')) return true;
    if (!window.UCLDRAW_PREDICTION_SHARE_V6) return false;
    const script = document.createElement('script');
    script.src = 'prediction-share-v7.js?v=20260901a';
    script.async = false;
    script.dataset.predictionShareV7 = 'true';
    document.body.appendChild(script);
    return true;
  }

  function installShareRendererV8() {
    if (window.UCLDRAW_PREDICTION_SHARE_V8) return true;
    if (document.querySelector('script[data-prediction-share-v8]')) return true;
    if (!window.UCLDRAW_PREDICTION_SHARE_V7) return false;
    const script = document.createElement('script');
    script.src = 'prediction-share-v8.js?v=20260901hq1';
    script.async = false;
    script.dataset.predictionShareV8 = 'true';
    document.body.appendChild(script);
    return true;
  }

  function installShareFidelityPatch() {
    if (window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH) return true;
    if (document.querySelector('script[data-prediction-share-fidelity]')) return true;
    const script = document.createElement('script');
    script.src = 'prediction-share-fidelity-patch.js?v=20260902hq2';
    script.async = false;
    script.dataset.predictionShareFidelity = 'true';
    document.body.appendChild(script);
    return true;
  }

  document.addEventListener('click', (event) => {
    const aiButton = event.target.closest?.('.prediction-ai-button');
    if (aiButton && runAiPredictionPreservingLocks(aiButton)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const lockedButton = event.target.closest?.('.prediction-score-apply.is-match-locked');
    if (lockedButton) {
      const card = lockedButton.closest('.prediction-fixture-card');
      if (card && unlockCard(card, lockedButton)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    }

    const shareButton = event.target.closest?.('.prediction-share-v4-button');
    const renderer = window.UCLDRAW_PREDICTION_SHARE_V8 || window.UCLDRAW_PREDICTION_SHARE_V7;
    if (!shareButton || shareButton.hidden || !renderer?.shareCurrent) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (shareButton.dataset.busy === 'true') return;
    shareButton.dataset.busy = 'true';
    shareButton.disabled = true;
    setText(shareButton, 'Hazırlanıyor...');
    Promise.resolve(renderer.shareCurrent())
      .catch((error) => {
        if (error?.name !== 'AbortError') console.error(error);
      })
      .finally(() => {
        delete shareButton.dataset.busy;
        shareButton.disabled = false;
        setText(shareButton, 'Paylaş');
        syncFloatingShare();
      });
  }, true);

  function refresh() {
    refineDrawKicker();
    refineTeamActionButtons();
    refineStandingsPanel();
    refinePredictionLocks();
    if (legacyShareUiEnabled) syncFloatingShare();
  }

  let queued = false;
  function queueRefresh() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      refresh();
    });
  }

  refresh();
  installShareFidelityPatch();
  const rendererTimer = window.setInterval(() => {
    installShareRendererV7();
    if (installShareRendererV8()) window.clearInterval(rendererTimer);
  }, 120);
  window.setTimeout(() => window.clearInterval(rendererTimer), 4000);

  new MutationObserver((mutations) => {
    const onlyPredictionMutations = predictionSection && mutations.every((mutation) => (
      mutation.target === predictionSection || predictionSection.contains(mutation.target)
    ));
    if (!onlyPredictionMutations) queueRefresh();
  }).observe(body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['hidden', 'class', 'style']
  });

  window.addEventListener('ucldraw:prediction-rendered', queueRefresh);
  window.addEventListener('ucldraw:ai-predictions-applied', queueRefresh);
  window.addEventListener('ucldraw:ai-predictions-restored-locks', queueRefresh);
  if (legacyShareUiEnabled) {
    window.addEventListener('resize', queueRefresh, { passive: true });
    window.addEventListener('scroll', syncFloatingShare, { passive: true });
  }
})();