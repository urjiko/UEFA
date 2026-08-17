(() => {
  'use strict';

  const fixtureList = document.getElementById('fixtureList');
  if (!fixtureList || typeof MutationObserver === 'undefined') return;

  let activeTarget = null;

  function clearTarget() {
    activeTarget?.classList.remove('is-flight-target');
    activeTarget = null;
  }

  function markCurrentTarget() {
    clearTarget();
    activeTarget = fixtureList.querySelector('.fixture-slot:not(.is-filled)');
    activeTarget?.classList.add('is-flight-target');
  }

  function touchesFlyingCard(node) {
    return node instanceof Element
      && (node.matches('.flying-card') || Boolean(node.querySelector('.flying-card')));
  }

  function syncFlightTarget() {
    if (document.querySelector('.flying-card')) markCurrentTarget();
    else clearTarget();
  }

  const observer = new MutationObserver((records) => {
    const flightChanged = records.some((record) => [...record.addedNodes, ...record.removedNodes].some(touchesFlyingCard));
    if (flightChanged) syncFlightTarget();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('pagehide', clearTarget, { once: true });
})();
