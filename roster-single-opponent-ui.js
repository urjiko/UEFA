(() => {
  'use strict';

  const REVISION = '20260815f';

  function ensureStylesheet() {
    if (document.querySelector('link[data-direct-playoff-style]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `roster-direct-playoff.css?v=${REVISION}`;
    link.dataset.directPlayoffStyle = 'true';
    document.head.appendChild(link);
  }

  function boot() {
    const data = window.UCLDRAW_DATA;
    const manager = window.UCLDRAW_ROSTER_MANAGER;
    const direct = window.UCLDRAW_DIRECT_PLAYOFF_REPLACEMENT;
    if (!data?.competitions || !manager || !direct) return;

    function leagueId() {
      return document.body.dataset.league || 'ucl';
    }

    function initials(name) {
      return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    }

    function createCrest(team) {
      const shell = document.createElement('span');
      shell.className = 'direct-playoff-crest';
      const fallback = document.createElement('span');
      fallback.textContent = initials(team.name);
      shell.appendChild(fallback);

      if (team.crest) {
        const image = document.createElement('img');
        image.src = `crests/${team.crest}.png`;
        image.alt = '';
        image.addEventListener('load', () => { fallback.hidden = true; });
        image.addEventListener('error', () => { image.remove(); fallback.hidden = false; });
        shell.appendChild(image);
      }
      return shell;
    }

    function teamCard(team, label, active = false) {
      const card = document.createElement('div');
      card.className = `direct-playoff-team${active ? ' is-current' : ' is-alternative'}`;
      card.appendChild(createCrest(team));

      const copy = document.createElement('div');
      const kicker = document.createElement('span');
      kicker.className = 'direct-playoff-team-label';
      kicker.textContent = label;
      const name = document.createElement('strong');
      name.textContent = team.name;
      const meta = document.createElement('span');
      meta.className = 'direct-playoff-team-meta';
      meta.textContent = `${team.country}${team.pot ? ` · Pot ${team.pot}` : ''}`;
      copy.append(kicker, name, meta);
      card.appendChild(copy);
      return card;
    }

    function currentTeamFromModal(modal) {
      const name = modal?.querySelector('.roster-incoming-team h2')?.textContent?.trim();
      if (!name) return null;
      return data.competitions[leagueId()]?.teams.find((team) => team.name === name) || null;
    }

    function candidateFromReplacementModal(modal) {
      const name = modal?.querySelector('#rosterReplacementTitle')?.textContent?.trim();
      if (!name) return null;
      return manager.allTeams(leagueId()).find((team) => (
        team.name === name && !manager.selectedTeam(leagueId(), team.poolSlug)
      )) || null;
    }

    function closeBackdrop(backdrop) {
      backdrop?.remove();
      document.body.style.overflow = '';
    }

    function closeSearchResults() {
      const results = document.getElementById('searchResults');
      const input = document.getElementById('teamSearch');
      if (results) results.hidden = true;
      input?.setAttribute('aria-expanded', 'false');
    }

    function openDirectSwitch(outgoing, pair, sourceBackdrop) {
      closeBackdrop(sourceBackdrop);
      closeSearchResults();

      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop roster-replacement-backdrop direct-playoff-backdrop';
      const modal = document.createElement('section');
      modal.className = 'confirm-modal glass roster-replacement-modal direct-playoff-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'directPlayoffTitle');

      const header = document.createElement('header');
      header.className = 'direct-playoff-header';
      const kicker = document.createElement('span');
      kicker.textContent = 'PLAY-OFF EŞLEŞMESİ';
      const title = document.createElement('h2');
      title.id = 'directPlayoffTitle';
      title.textContent = 'Kadro takımını değiştir';
      const description = document.createElement('p');
      description.textContent = `${outgoing.name} için değişebilecek tek takım play-off rakibi ${pair.opponent.name}.`;
      header.append(kicker, title, description);

      const matchup = document.createElement('div');
      matchup.className = 'direct-playoff-matchup';
      matchup.appendChild(teamCard(outgoing, 'Şu an kadroda', true));
      const swap = document.createElement('div');
      swap.className = 'direct-playoff-swap';
      swap.textContent = '↔';
      matchup.appendChild(swap);
      matchup.appendChild(teamCard(pair.opponent, 'Tek alternatif'));

      const note = document.createElement('p');
      note.className = 'direct-playoff-note';
      note.textContent = 'Bu seçim aynı play-off kontenjanını tersine çevirir. Tekrar değiştirmek istersen yeni takımın kartından veya arama alanından aynı işlemi geri alabilirsin.';

      const status = document.createElement('p');
      status.className = 'direct-playoff-status';
      status.hidden = true;

      const actions = document.createElement('div');
      actions.className = 'modal-actions direct-playoff-actions';
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'action-button';
      back.textContent = 'Geri dön';
      back.addEventListener('click', () => closeBackdrop(backdrop));

      const confirm = document.createElement('button');
      confirm.type = 'button';
      confirm.className = 'action-button primary';
      confirm.textContent = `${pair.opponent.name} kadroya gelsin`;
      confirm.addEventListener('click', () => {
        confirm.disabled = true;
        back.disabled = true;
        status.hidden = true;
        try {
          direct.replaceWithDirectOpponent(leagueId(), outgoing);
          window.location.reload();
        } catch (error) {
          confirm.disabled = false;
          back.disabled = false;
          status.textContent = error?.message || 'Takım değiştirilemedi.';
          status.hidden = false;
        }
      });

      actions.append(back, confirm);
      modal.append(header, matchup, note, status, actions);
      backdrop.appendChild(modal);
      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) closeBackdrop(backdrop);
      });
      document.body.appendChild(backdrop);
      document.body.style.overflow = 'hidden';
      confirm.focus();
    }

    function wireTeamActionModal(backdrop) {
      if (!(backdrop instanceof Element) || !backdrop.classList.contains('roster-team-action-backdrop')) return;
      const modal = backdrop.querySelector('.roster-replacement-modal');
      if (!modal || modal.dataset.directPlayoffWired === 'true') return;

      const outgoing = currentTeamFromModal(modal);
      const pair = outgoing ? direct.directOpponent(leagueId(), outgoing) : null;
      if (!pair) return;

      const replaceButton = [...modal.querySelectorAll('.roster-team-actions button')]
        .find((button) => button.textContent.trim() === 'Kadrodan değiştir');
      if (!replaceButton) return;

      const directButton = replaceButton.cloneNode(true);
      directButton.textContent = `Kadrodan değiştir · ${pair.opponent.name}`;
      directButton.addEventListener('click', () => openDirectSwitch(outgoing, pair, backdrop));
      replaceButton.replaceWith(directButton);
      modal.dataset.directPlayoffWired = 'true';
    }

    function wireReserveReplacementModal(backdrop) {
      if (!(backdrop instanceof Element) || !backdrop.classList.contains('roster-replacement-backdrop')) return;
      if (backdrop.classList.contains('roster-team-action-backdrop')
        || backdrop.classList.contains('roster-incoming-picker-backdrop')
        || backdrop.classList.contains('direct-playoff-backdrop')) return;

      const modal = backdrop.querySelector('.roster-replacement-modal');
      if (!modal || modal.dataset.directReserveWired === 'true') return;
      modal.dataset.directReserveWired = 'true';

      const incoming = candidateFromReplacementModal(modal);
      const pair = incoming ? direct.directCandidate(leagueId(), incoming) : null;
      if (!pair) return;

      openDirectSwitch(pair.outgoing, pair, backdrop);
    }

    document.addEventListener('click', (event) => {
      const button = event.target.closest?.('.roster-search-result.is-reserve-roster[data-pool-slug]');
      if (!button) return;

      const incoming = manager.candidateTeam(leagueId(), button.dataset.poolSlug);
      const pair = incoming ? direct.directCandidate(leagueId(), incoming) : null;
      if (!pair) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      openDirectSwitch(pair.outgoing, pair, null);
    }, true);

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          wireTeamActionModal(node);
          wireReserveReplacementModal(node);
          node.querySelectorAll?.('.roster-team-action-backdrop').forEach(wireTeamActionModal);
          node.querySelectorAll?.('.roster-replacement-backdrop').forEach(wireReserveReplacementModal);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  ensureStylesheet();
  if (window.UCLDRAW_DIRECT_PLAYOFF_REPLACEMENT) {
    boot();
    return;
  }

  const script = document.createElement('script');
  script.src = `direct-playoff-replacement.js?v=${REVISION}`;
  script.addEventListener('load', boot, { once: true });
  document.head.appendChild(script);
})();
