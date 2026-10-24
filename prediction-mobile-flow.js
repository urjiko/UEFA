(() => {
  'use strict';

  const MOBILE_QUERY = '(max-width: 700px)';
  const motionQuery = '(prefers-reduced-motion: reduce)';
  let floatingBar = null;
  let averageShareFloating = null;
  let observedPredictionActions = null;
  let observedAverageShare = null;
  let cachedAverageShare = null;
  let predictionObserver = null;
  let averageObserver = null;
  let refreshQueued = false;
  let completionState = null;
  let completionTeam = null;
  let previouslyComplete = false;

  function isMobile() {
    return window.matchMedia?.(MOBILE_QUERY)?.matches ?? window.innerWidth <= 700;
  }

  function isBeforeNativeButton(element) {
    // Do not revive the floating button after the real action has scrolled above us.
    return !element || element.getBoundingClientRect().top > window.innerHeight + 2;
  }

  function nativeAiButton() {
    return document.querySelector('#predictionSection .prediction-ai-v4-button');
  }

  function nativeFinishButton() {
    return document.querySelector('#predictionSection .prediction-community-finish-button');
  }

  function nativeActionsRow() {
    return document.querySelector('#predictionSection .prediction-share-actions-v4');
  }

  function findAverageShare() {
    const actions = document.querySelector('#predictionCommunityAverage .community-average-actions');
    if (cachedAverageShare?.isConnected && actions?.contains(cachedAverageShare)) return cachedAverageShare;
    cachedAverageShare = [...(actions?.querySelectorAll('button') || [])]
      .find((button) => button.textContent.trim() === 'Paylaş') || null;
    return cachedAverageShare;
  }

  function createPredictionBar() {
    const bar = document.createElement('div');
    bar.className = 'prediction-mobile-flow-bar';
    bar.hidden = true;

    const ai = document.createElement('button');
    ai.type = 'button';
    ai.className = 'action-button prediction-mobile-ai-button';
    ai.textContent = 'Yapay Zeka Tahmini';
    ai.addEventListener('click', () => {
      const original = nativeAiButton();
      if (original && !original.disabled) original.click();
    });

    const finish = document.createElement('button');
    finish.type = 'button';
    finish.className = 'action-button primary prediction-mobile-finish-button';
    finish.textContent = 'Bitir';
    finish.hidden = true;
    finish.addEventListener('click', () => {
      const original = nativeFinishButton();
      if (original && !original.disabled) original.click();
    });

    bar.append(ai, finish);
    document.body.appendChild(bar);
    return bar;
  }

  function createAverageShareBar() {
    const bar = document.createElement('div');
    bar.className = 'community-average-floating-share';
    bar.hidden = true;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'action-button primary';
    button.textContent = 'Paylaş';
    button.addEventListener('click', () => {
      const original = findAverageShare();
      if (original && !original.disabled) original.click();
    });
    bar.appendChild(button);
    document.body.appendChild(bar);
    return bar;
  }

  function watchActions(row) {
    if (observedPredictionActions === row) return;
    predictionObserver?.disconnect();
    predictionObserver = null;
    observedPredictionActions = row;
    if (row && 'IntersectionObserver' in window) {
      predictionObserver = new IntersectionObserver(scheduleRefresh, { threshold: [0, 1] });
      predictionObserver.observe(row);
    }
  }

  function watchAverageShare(button) {
    if (observedAverageShare === button) return;
    averageObserver?.disconnect();
    averageObserver = null;
    observedAverageShare = button;
    if (button && 'IntersectionObserver' in window) {
      averageObserver = new IntersectionObserver(scheduleRefresh, { threshold: [0, 1] });
      averageObserver.observe(button);
    }
  }

  function refreshPrediction(mobile) {
    const section = document.getElementById('predictionSection');
    const active = mobile && Boolean(section && !section.hidden
      && document.body.classList.contains('prediction-active')
      && !document.body.classList.contains('community-average-active'));

    if (!active) {
      if (floatingBar) floatingBar.hidden = true;
      document.body.classList.remove('prediction-mobile-flow-active');
      watchActions(null);
      completionState = null;
      completionTeam = null;
      previouslyComplete = false;
      return;
    }

    if (!floatingBar?.isConnected) floatingBar = createPredictionBar();

    const session = window.UCLDRAW_PREDICTION_SESSION;
    const state = session?.state?.() || null;
    const team = session?.activeTeamName?.() || '';
    const cards = section.querySelectorAll('.prediction-fixture-card');
    const complete = cards.length > 0 && [...cards].every((card) => card.classList.contains('is-resolved'));

    if (state !== completionState || team !== completionTeam) {
      completionState = state;
      completionTeam = team;
      previouslyComplete = false;
    }

    const ai = floatingBar.querySelector('.prediction-mobile-ai-button');
    const finish = floatingBar.querySelector('.prediction-mobile-finish-button');
    finish.hidden = !complete;
    floatingBar.classList.toggle('is-complete', complete);
    ai.disabled = !nativeAiButton() || Boolean(nativeAiButton().disabled);
    finish.disabled = !nativeFinishButton() || Boolean(nativeFinishButton().disabled);

    const actions = nativeActionsRow();
    watchActions(actions);
    const visible = isBeforeNativeButton(actions);
    floatingBar.hidden = !visible;
    document.body.classList.toggle('prediction-mobile-flow-active', visible);

    if (complete && !previouslyComplete) {
      window.requestAnimationFrame(() => {
        if (!document.body.classList.contains('prediction-active') || section.hidden) return;
        const panel = section.querySelector('.prediction-standings-panel');
        panel?.scrollIntoView({
          behavior: window.matchMedia?.(motionQuery)?.matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    }
    previouslyComplete = complete;
  }

  function refreshAverage(mobile) {
    const active = mobile && document.body.classList.contains('community-average-active');
    if (!active) {
      if (averageShareFloating) averageShareFloating.hidden = true;
      document.body.classList.remove('community-average-floating-active');
      watchAverageShare(null);
      return;
    }

    const nativeShare = findAverageShare();
    watchAverageShare(nativeShare);
    if (!nativeShare) {
      if (averageShareFloating) averageShareFloating.hidden = true;
      document.body.classList.remove('community-average-floating-active');
      return;
    }

    if (!averageShareFloating?.isConnected) averageShareFloating = createAverageShareBar();
    const visible = isBeforeNativeButton(nativeShare);
    averageShareFloating.hidden = !visible;
    averageShareFloating.querySelector('button').disabled = Boolean(nativeShare.disabled);
    document.body.classList.toggle('community-average-floating-active', visible);
  }

  function refreshAll() {
    const mobile = isMobile();
    refreshPrediction(mobile);
    refreshAverage(mobile);
  }

  function scheduleRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    window.requestAnimationFrame(() => {
      refreshQueued = false;
      refreshAll();
    });
  }

  // Explicit screen events replace a subtree-wide mutation observer.
  window.addEventListener('ucldraw:prediction-rendered', scheduleRefresh);
  window.addEventListener('ucldraw:ai-predictions-applied', scheduleRefresh);
  window.addEventListener('ucldraw:ai-predictions-restored-locks', scheduleRefresh);
  window.addEventListener('ucldraw:community-average-rendered', scheduleRefresh);
  window.addEventListener('resize', scheduleRefresh, { passive: true });
  window.addEventListener('popstate', scheduleRefresh);

  // Fallback for older browsers without IntersectionObserver.
  if (!('IntersectionObserver' in window)) {
    window.addEventListener('scroll', scheduleRefresh, { passive: true });
  }

  // Only observe the two state-bearing elements, never the whole page subtree.
  new MutationObserver(scheduleRefresh).observe(document.body, {
    attributes: true, attributeFilter: ['class']
  });
  const predictionSection = document.getElementById('predictionSection');
  if (predictionSection) {
    new MutationObserver(scheduleRefresh).observe(predictionSection, {
      attributes: true, attributeFilter: ['hidden']
    });
  }

  scheduleRefresh();
})();
