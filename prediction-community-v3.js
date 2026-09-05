(() => {
  'use strict';

  if (window.UCLDRAW_COMMUNITY_RESULTS_V3) return;

  const STATE = Object.freeze({
    all: 'all',
    home: 'home',
    away: 'away',
    divided: 'divided'
  });

  const OUTCOME_LABELS = Object.freeze({
    win: Object.freeze({ short: 'G', long: 'Galibiyet' }),
    draw: Object.freeze({ short: 'B', long: 'Beraberlik' }),
    loss: Object.freeze({ short: 'M', long: 'Mağlubiyet' })
  });

  function percentFromBar(bar) {
    const width = Number.parseFloat(bar?.querySelector('.community-average-track i')?.style?.width || '0');
    return Number.isFinite(width) ? Math.max(0, Math.min(100, width)) : 0;
  }

  function outcomeKind(bar) {
    if (bar.classList.contains('win')) return 'win';
    if (bar.classList.contains('draw')) return 'draw';
    return 'loss';
  }

  function outcomeData(card) {
    return [...card.querySelectorAll('.community-average-bar')].map((bar) => {
      const kind = outcomeKind(bar);
      return {
        kind,
        value: percentFromBar(bar),
        short: OUTCOME_LABELS[kind].short,
        long: OUTCOME_LABELS[kind].long
      };
    });
  }

  function cardMeta(card) {
    const venueText = card.querySelector('.community-average-opponent > span')?.textContent?.trim() || '';
    const values = outcomeData(card).map((item) => item.value);
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

  function ensureVerticalChart(card) {
    if (card.querySelector('.community-outcome-chart')) return;
    const source = card.querySelector('.community-average-bars');
    const data = outcomeData(card);
    if (!source || data.length !== 3) return;

    const maximum = Math.max(...data.map((item) => item.value));
    const chart = document.createElement('figure');
    chart.className = 'community-outcome-chart';
    chart.setAttribute('aria-label', data.map((item) => `${item.long} yüzde ${Math.round(item.value)}`).join(', '));

    const plot = document.createElement('div');
    plot.className = 'community-outcome-plot';

    data.forEach((item) => {
      const column = document.createElement('div');
      column.className = 'community-outcome-column';
      column.dataset.outcome = item.kind;
      if (item.value === maximum && maximum > 0) column.classList.add('is-dominant');

      const value = document.createElement('strong');
      value.textContent = `%${Math.round(item.value)}`;

      const rail = document.createElement('div');
      rail.className = 'community-outcome-rail';
      const fill = document.createElement('i');
      fill.style.height = `${item.value}%`;
      rail.appendChild(fill);

      const label = document.createElement('span');
      label.textContent = item.short;
      label.title = item.long;

      column.append(value, rail, label);
      plot.appendChild(column);
    });

    const caption = document.createElement('figcaption');
    caption.textContent = 'Topluluk dağılımı';
    chart.append(plot, caption);
    source.classList.add('community-average-bars-source');
    source.setAttribute('aria-hidden', 'true');
    source.before(chart);
    card.classList.add('has-vertical-chart');
  }

  function addVerdict(card) {
    if (card.querySelector('.community-match-verdict')) return;
    const ranked = outcomeData(card).sort((a, b) => b.value - a.value);
    if (!ranked[0]?.value) return;

    const verdict = document.createElement('span');
    verdict.className = 'community-match-verdict';
    verdict.textContent = `${ranked[0].long} önde · %${Math.round(ranked[0].value)}`;
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
    strong.textContent = 'Maç görünümü';
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
    const desiredDescription = 'Lig aşaması için kullanıcı tahminlerinin anonim ve toplu görünümü.';
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
    section.querySelectorAll('.community-average-match').forEach((card) => {
      ensureVerticalChart(card);
      addVerdict(card);
    });
    addFilterBar(section);
    return true;
  }

  function scan() {
    return enhance(document.getElementById('predictionCommunityAverage'));
  }

  // Keep result enhancement event-driven. A document-wide MutationObserver previously
  // retriggered itself while rewriting result copy and could starve navigation/rendering.
  window.addEventListener('ucldraw:community-average-rendered', scan);
  window.addEventListener('popstate', () => window.requestAnimationFrame(scan));
  scan();

  window.UCLDRAW_COMMUNITY_RESULTS_V3 = Object.freeze({
    enhance,
    scan,
    simplifyActions,
    ensureVerticalChart,
    addFilterBar,
    cardMeta
  });
})();
