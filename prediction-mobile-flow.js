(() => {
  'use strict';

  const MOBILE_QUERY = '(max-width: 700px)';
  let completedOnce = false;
  let floatingBar = null;
  let predictionActionsObserver = null;
  let observedPredictionActions = null;
  let averageShareFloating = null;
  let averageObserver = null;

  function isMobile() {
    return window.matchMedia?.(MOBILE_QUERY)?.matches ?? window.innerWidth <= 700;
  }

  function predictionSection() {
    return document.getElementById('predictionSection');
  }

  function predictionsComplete() {
    const cards = [...document.querySelectorAll('#predictionSection .prediction-fixture-card')];
    return cards.length > 0 && cards.every((card) => card.classList.contains('is-resolved'));
  }

  function standingPanel() {
    return document.querySelector('#predictionSection .prediction-standings-panel');
  }

  function nativeActionsRow() {
    return document.querySelector('#predictionSection .prediction-share-actions-v4');
  }

  function nativeAiButton() {
    return document.querySelector('#predictionSection .prediction-ai-v4-button');
  }

  function nativeFinishButton() {
    return document.querySelector('#predictionSection .prediction-community-finish-button');
  }

  function rowIsVisible(row) {
    if (!row) return false;
    const rect = row.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  function createFloatingBar() {
    const bar = document.createElement('div');
    bar.className = 'prediction-mobile-flow-bar';
    bar.hidden = true;

    const ai = document.createElement('button');
    ai.type = 'button';
    ai.className = 'action-button prediction-mobile-ai-button';
    ai.textContent = 'Yapay Zeka Tahmini';
    ai.addEventListener('click', () => nativeAiButton()?.click());

    const finish = document.createElement('button');
    finish.type = 'button';
    finish.className = 'action-button primary prediction-mobile-finish-button';
    finish.textContent = 'Bitir';
    finish.hidden = true;
    finish.addEventListener('click', () => nativeFinishButton()?.click());

    bar.append(ai, finish);
    document.body.appendChild(bar);
    return bar;
  }

  function ensureFloatingBar() {
    if (!floatingBar?.isConnected) floatingBar = createFloatingBar();
    return floatingBar;
  }

  function observePredictionActions(row) {
    if (observedPredictionActions === row) return;
    predictionActionsObserver?.disconnect();
    predictionActionsObserver = null;
    observedPredictionActions = row;
    if (!row || !('IntersectionObserver' in window)) return;
    predictionActionsObserver = new IntersectionObserver(syncPredictionBar, {
      root: null,
      threshold: [0, 0.05, 0.25, 0.5, 1]
    });
    predictionActionsObserver.observe(row);
  }

  function syncPredictionBar() {
    const bar = ensureFloatingBar();
    const section = predictionSection();
    const actionsRow = nativeActionsRow();
    observePredictionActions(actionsRow);

    const active = isMobile()
      && document.body.classList.contains('prediction-active')
      && section
      && !section.hidden
      && !document.body.classList.contains('community-average-active');

    const complete = predictionsComplete();
    const finish = bar.querySelector('.prediction-mobile-finish-button');
    const ai = bar.querySelector('.prediction-mobile-ai-button');
    finish.hidden = !complete;
    bar.classList.toggle('is-complete', complete);
    ai.disabled = Boolean(nativeAiButton()?.disabled);
    finish.disabled = Boolean(nativeFinishButton()?.disabled);

    const nativeVisible = rowIsVisible(actionsRow);
    const floatingVisible = Boolean(active && !nativeVisible);
    bar.hidden = !floatingVisible;
    document.body.classList.toggle('prediction-mobile-flow-active', floatingVisible);

    if (complete && !completedOnce) {
      completedOnce = true;
      window.requestAnimationFrame(() => {
        standingPanel()?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    if (!complete) completedOnce = false;
  }

  function findAverageShare() {
    const actions = document.querySelector('#predictionCommunityAverage .community-average-actions');
    if (!actions) return null;
    return [...actions.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Paylaş') || null;
  }

  function createAverageFloatingShare() {
    const wrap = document.createElement('div');
    wrap.className = 'community-average-floating-share';
    wrap.hidden = true;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action-button primary';
    button.textContent = 'Paylaş';
    button.addEventListener('click', () => findAverageShare()?.click());
    wrap.appendChild(button);
    document.body.appendChild(wrap);
    return wrap;
  }

  function ensureAverageFloatingShare() {
    if (!averageShareFloating?.isConnected) averageShareFloating = createAverageFloatingShare();
    return averageShareFloating;
  }

  function observeAverageActions() {
    averageObserver?.disconnect();
    averageObserver = null;
    const share = findAverageShare();
    const floating = ensureAverageFloatingShare();
    const averageActive = isMobile() && document.body.classList.contains('community-average-active');
    if (!averageActive || !share) {
      floating.hidden = true;
      document.body.classList.remove('community-average-floating-active');
      return;
    }

    const syncAverageFloating = () => {
      const visible = rowIsVisible(share);
      floating.hidden = visible;
      document.body.classList.toggle('community-average-floating-active', !visible);
    };

    syncAverageFloating();
    if (!('IntersectionObserver' in window)) return;

    averageObserver = new IntersectionObserver(syncAverageFloating, {
      threshold: [0, 0.05, 0.25, 0.5, 1]
    });
    averageObserver.observe(share);
  }

  function refreshAll() {
    syncPredictionBar();
    observeAverageActions();
  }

  window.addEventListener('ucldraw:prediction-rendered', syncPredictionBar);
  window.addEventListener('ucldraw:ai-predictions-applied', syncPredictionBar);
  window.addEventListener('ucldraw:community-average-rendered', () => {
    syncPredictionBar();
    window.requestAnimationFrame(observeAverageActions);
  });
  window.addEventListener('resize', refreshAll, { passive: true });
  window.addEventListener('scroll', () => {
    syncPredictionBar();
    if (document.body.classList.contains('community-average-active')) observeAverageActions();
  }, { passive: true });
  window.addEventListener('popstate', () => window.requestAnimationFrame(refreshAll));

  const rootObserver = new MutationObserver(() => window.requestAnimationFrame(refreshAll));
  rootObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });

  refreshAll();
})();
