(() => {
  'use strict';

  const MOBILE_QUERY = '(max-width: 700px)';
  let completedOnce = false;
  let floatingBar = null;
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

  function nativeAiButton() {
    return document.querySelector('#predictionSection .prediction-ai-v4-button');
  }

  function nativeFinishButton() {
    return document.querySelector('#predictionSection .prediction-community-finish-button');
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

  function syncPredictionBar() {
    const bar = ensureFloatingBar();
    const section = predictionSection();
    const active = isMobile()
      && document.body.classList.contains('prediction-active')
      && section
      && !section.hidden
      && !document.body.classList.contains('community-average-active');

    bar.hidden = !active;
    document.body.classList.toggle('prediction-mobile-flow-active', Boolean(active));
    if (!active) return;

    const complete = predictionsComplete();
    const finish = bar.querySelector('.prediction-mobile-finish-button');
    const ai = bar.querySelector('.prediction-mobile-ai-button');
    finish.hidden = !complete;
    bar.classList.toggle('is-complete', complete);
    ai.disabled = Boolean(nativeAiButton()?.disabled);
    finish.disabled = Boolean(nativeFinishButton()?.disabled);

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

    floating.hidden = false;
    document.body.classList.add('community-average-floating-active');
    if (!('IntersectionObserver' in window)) return;

    averageObserver = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      floating.hidden = visible;
      document.body.classList.toggle('community-average-floating-active', !visible);
    }, { threshold: 0.15 });
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
  window.addEventListener('popstate', () => window.requestAnimationFrame(refreshAll));

  const rootObserver = new MutationObserver(() => window.requestAnimationFrame(refreshAll));
  rootObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });

  refreshAll();
})();
