(() => {
  'use strict';

  const fixtureList = document.getElementById('fixtureList');
  const allFixturesGrid = document.getElementById('allFixturesGrid');

  const ICONS = Object.freeze({
    home: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M2.8 11.1 12 3.7l9.2 7.4v9.1a1 1 0 0 1-1 1h-5.5v-6.1H9.3v6.1H3.8a1 1 0 0 1-1-1v-9.1Z"/>
      </svg>`,
    away: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M2.3 13.3v-2.6l6.8-1.2 4.2-6h2.5l-2.2 5.6 6.4-1.1c1.2-.2 2.2.7 2.2 1.9v4.2c0 1.2-1 2.1-2.2 1.9l-6.4-1.1 2.2 5.6h-2.5l-4.2-6-6.8-1.2Z"/>
      </svg>`
  });

  function createIcon(home, compact = false) {
    const label = home ? 'İç saha' : 'Deplasman';
    const icon = document.createElement('span');
    icon.className = `venue-icon ${home ? 'home' : 'away'}${compact ? ' compact' : ''}`;
    icon.setAttribute('role', 'img');
    icon.setAttribute('aria-label', label);
    icon.title = label;
    icon.innerHTML = home ? ICONS.home : ICONS.away;
    return icon;
  }

  function decorateVenueBadge(badge) {
    if (badge.dataset.venueIconDecorated === 'true') return;
    const home = badge.classList.contains('home');
    badge.replaceChildren(createIcon(home));
    badge.dataset.venueIconDecorated = 'true';
    badge.setAttribute('aria-label', home ? 'İç saha' : 'Deplasman');
    badge.title = home ? 'İç saha' : 'Deplasman';
  }

  function decorateOverviewMeta(meta) {
    if (meta.dataset.venueIconDecorated === 'true') return;
    const original = meta.textContent.replace(/\s+/g, ' ').trim();
    const match = original.match(/^(.*?)(?:\s*·\s*)(H|A)$/i);
    if (!match) return;

    const home = match[2].toUpperCase() === 'H';
    const prefix = match[1].trim();
    meta.replaceChildren(
      document.createTextNode(prefix ? `${prefix} · ` : ''),
      createIcon(home, true)
    );
    meta.dataset.venueIconDecorated = 'true';
    meta.setAttribute('aria-label', `${prefix ? `${prefix}, ` : ''}${home ? 'İç saha' : 'Deplasman'}`);
  }

  function decorate(root = document) {
    root.querySelectorAll?.('.venue-badge').forEach(decorateVenueBadge);
    root.querySelectorAll?.('.overview-meta').forEach(decorateOverviewMeta);
  }

  decorate();

  [fixtureList, allFixturesGrid].filter(Boolean).forEach((root) => {
    new MutationObserver(() => decorate(root)).observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    });
  });
})();
