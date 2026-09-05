(() => {
  'use strict';

  if (window.UCLDRAW_COMMUNITY_RESULTS_V3) return;

  const STATE = Object.freeze({
    all: 'all',
    home: 'home',
    away: 'away',
    divided: 'divided'
  });

  function percentFromBar(bar) {
    const width = Number.parseFloat(bar?.querySelector('.community-average-track i')?.style?.width || '0');
    return Number.isFinite(width) ? width : 0;
  }

  function cardMeta(card) {
    const venueText = card.querySelector('.community-average-opponent > span')?.textContent?.trim() || '';
    const bars = [...card.querySelectorAll('.community-average-bar')];
    const values = bars.map(percentFromBar);
    const max = values.length ? Math.max(...values) : 0;
    const min = values.length ? Math.min(...values) : 0;
    return {
      venue: venueText === 'İç saha' ? STATE.home : STATE.away,
      spread: max - min,
      max
    };
  }

  function simplifyActions(section) {
    const actions = section.querySelector('.community-average-actions');
    if (!actions) return;

    [...actions.querySelectorAll('button, a')].forEach((control) => {
      const label = control.textContent.trim();
      if (label === 'Tahmin Görselini İndir' || label === 'Tahmin Linkini Kopyala') control.remove();
    });

    const retry = [...actions.querySelectorAll('a')].find((link) => /Yeniden Tahmin Et|Tekrar Tahmin Et/.test(link.textContent));
    if (retry) {
      if (retry.textContent !== 'Tekrar Tahmin Et') retry.textContent = 'Tekrar Tahmin Et';
      retry.classList.add('community-retry-button');
    }

    const share = [...actions.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Paylaş');
    if (share) share.classList.add('community-share-button');
    actions.classList.add('community-actions-simplified');
  }

  function addVerdict(card) {
    if (card.querySelector('.community-match-verdict')) return;
    const bars = [...card.querySelectorAll('.community-average-bar')];
    if (bars.length !== 3) return;
    const ranked = bars.map((bar) => ({
      label: bar.querySelector('div:first-child span')?.textContent?.trim() || '',
      value: percentFromBar(bar)
    })).sort((a, b) => b.value - a.value);
    if (!ranked[0]?.value) return;

    const verdict = document.createElement('span');
    verdict.className = 'community-match-verdict';
    verdict.textContent = `${ranked[0].label} · %${Math.round(ranked[0].value)}`;
    card.querySelector('.community-average-opponent')?.appendChild(verdict);
  }

  function addFilterBar(section) {
    const grid = section.querySelector('.community-average-grid');
    if (!grid || section.querySelector('.community-match-toolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.className = 'community-match-toolbar';
    toolbar.setAttribute('aria-label', 'Maç filtreleri');

    const title = document.createElement('div');
    title.className = 'community-match-toolbar-copy';
    const strong = document.createElement('strong');
    strong.textContent = 'Maçlara bak';
    const count = document.createElement('span');
    title.append(strong, count);

    const controls = document.createElement('div');
    controls.className = 'community-match-filters';
    const filters = [
      [STATE.all, 'Tümü'],
      [STATE.home, 'İç saha'],
      [STATE.away, 'Deplasman'],
      [STATE.divided, 'En tartışmalı']
    ];

    function applyFilter(filter) {
      const cards = [...grid.querySelectorAll('.community-average-match')];
      cards.forEach((card, index) => {
        const meta = cardMeta(card);
        card.dataset.venue = meta.venue;
        card.dataset.spread = String(meta.spread);
        if (!card.dataset.originalIndex) card.dataset.originalIndex = String(index + 1);
      });

      const originalOrder = [...cards].sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex));
      if (filter !== STATE.divided) originalOrder.forEach((card) => grid.appendChild(card));

      let visible = originalOrder;
      if (filter === STATE.home || filter === STATE.away) {
        visible = originalOrder.filter((card) => card.dataset.venue === filter);
      } else if (filter === STATE.divided) {
        visible = [...originalOrder].sort((a, b) => Number(a.dataset.spread) - Number(b.dataset.spread));
        visible.forEach((card) => grid.appendChild(card));
      }

      originalOrder.forEach((card) => {
        card.hidden = filter === STATE.home || filter === STATE.away
          ? card.dataset.venue !== filter
          : false;
      });

      controls.querySelectorAll('button').forEach((button) => {
        const active = button.dataset.filter === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      count.textContent = `${visible.length} maç`;
    }

    filters.forEach(([filter, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.filter = filter;
      button.textContent = label;
      button.addEventListener('click', () => applyFilter(filter));
      controls.appendChild(button);
    });

    toolbar.append(title, controls);
    grid.before(toolbar);
    applyFilter(STATE.all);
  }

  function tuneCopy(section) {
    const header = section.querySelector('.community-average-header');
    if (header) header.classList.add('community-results-hero');

    const description = header?.querySelector('p');
    const desiredDescription = 'Topluluk bu fikstürü nasıl görüyor? Maç maç dağılım, beklenen puan ve en çok ayrışılan eşleşmeler.';
    if (description && description.textContent !== desiredDescription) description.textContent = desiredDescription;

    const status = section.querySelector('.community-average-status');
    if (status) status.classList.add('community-results-status');

    section.querySelectorAll('.community-stat-metric').forEach((metric, index) => {
      const value = String(index + 1);
      if (metric.dataset.metricIndex !== value) metric.dataset.metricIndex = value;
    });
  }

  function enhance(section) {
    if (!section || section.hidden) return false;
    section.dataset.communityResultsV3 = 'true';
    section.classList.add('community-results-v3');
    tuneCopy(section);
    simplifyActions(section);
    section.querySelectorAll('.community-average-match').forEach((card) => addVerdict(card));
    addFilterBar(section);
    return true;
  }

  function scan() {
    return enhance(document.getElementById('predictionCommunityAverage'));
  }

  // Do not observe the whole document. The previous MutationObserver watched childList
  // changes and then changed textContent inside its own callback, producing another
  // childList mutation. Once the average page appeared that created an endless
  // microtask loop, starving fetch completions, timers, navigation and share rendering.
  // Results are now enhanced only after the community renderer explicitly announces
  // that its DOM is ready.
  window.addEventListener('ucldraw:community-average-rendered', scan);
  window.addEventListener('popstate', () => window.requestAnimationFrame(scan));
  scan();

  window.UCLDRAW_COMMUNITY_RESULTS_V3 = Object.freeze({
    enhance,
    scan,
    simplifyActions,
    addFilterBar,
    cardMeta
  });
})();
