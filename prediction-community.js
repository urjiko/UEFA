(() => {
  'use strict';

  const CONFIG = window.UCLDRAW_COMMUNITY_CONFIG || {};
  const ROUTE_DIRS = Object.freeze({
    ucl: 'champions-league',
    uel: 'europa-league',
    uecl: 'conference-league'
  });
  const appRoot = () => new URL(window.UCLDRAW_APP_ROOT || './', document.baseURI);

  function backendConfigured() {
    return Boolean(/^https:\/\//.test(CONFIG.supabaseUrl || '') && (CONFIG.supabaseAnonKey || '').length > 20);
  }

  function routeUrl(leagueId, teamSlug, average = false) {
    const directory = ROUTE_DIRS[leagueId] || ROUTE_DIRS.ucl;
    const suffix = average ? `tahmin/${teamSlug}/ortalama/` : `tahmin/${teamSlug}/`;
    return new URL(`${directory}/${suffix}`, appRoot()).href;
  }

  async function rpc(name, body) {
    if (!backendConfigured()) return null;
    const base = String(CONFIG.supabaseUrl).replace(/\/$/, '');
    const response = await fetch(`${base}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        apikey: CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Topluluk servisi ${response.status}: ${text.slice(0, 160)}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function teamSlug(team) {
    return team?.poolSlug || team?.qualificationId || '';
  }

  function pairKey(match) {
    return `${teamSlug(match.home)}--${teamSlug(match.away)}`;
  }

  function fnv1a(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function submissionId(payload) {
    const fingerprint = fnv1a(JSON.stringify(payload.predictions));
    const storageKey = `ucldraw:community-submission:${payload.leagueId}:${payload.teamSlug}:${payload.fixtureVersion}:${fingerprint}`;
    try {
      const existing = localStorage.getItem(storageKey);
      if (existing) return existing;
      const id = crypto.randomUUID();
      localStorage.setItem(storageKey, id);
      return id;
    } catch {
      return crypto.randomUUID();
    }
  }

  function buildSubmission() {
    const session = window.UCLDRAW_PREDICTION_SESSION;
    const state = session?.state?.();
    const selectedName = session?.selectedTeamName?.();
    const draw = window.UCLDRAW_LAST_DRAW;
    if (!state || !selectedName || !draw) throw new Error('Tahmin oturumu bulunamadı.');
    const team = state.comp.teams.find((candidate) => candidate.name === selectedName);
    const matches = session.matchesForSelectedTeam?.() || [];
    if (!team || !matches.length) throw new Error('Takım tahminleri bulunamadı.');
    if (!matches.every((match) => state.matchLocks?.[match.id] && state.scores?.[match.id])) {
      throw new Error('Bitirmeden önce takımın bütün maçlarını kendin tahmin et.');
    }

    const predictions = matches.map((match) => {
      const score = state.scores[match.id];
      const selectedHome = match.home.name === selectedName;
      const selectedGoals = selectedHome ? score.homeGoals : score.awayGoals;
      const opponentGoals = selectedHome ? score.awayGoals : score.homeGoals;
      const outcome = selectedGoals > opponentGoals ? 'win' : selectedGoals < opponentGoals ? 'loss' : 'draw';
      const opponent = selectedHome ? match.away : match.home;
      const manualScore = score.source === 'user-score';
      return {
        match_key: pairKey(match),
        opponent_slug: teamSlug(opponent),
        venue: selectedHome ? 'home' : 'away',
        outcome,
        manual_score: manualScore,
        selected_goals: manualScore ? selectedGoals : null,
        opponent_goals: manualScore ? opponentGoals : null
      };
    });

    return {
      leagueId: state.leagueId,
      teamSlug: teamSlug(team),
      fixtureVersion: String(draw.sourceDate || window.UCLDRAW_CURRENT_FIXTURES?.snapshotDate || '2026-27'),
      predictions,
      officialCurrent: draw.source === 'uefa-current'
    };
  }

  async function submitPrediction(payload) {
    if (!payload.officialCurrent) return { configured: backendConfigured(), accepted: false, skipped: 'not-current' };
    if (!backendConfigured()) return { configured: false, accepted: false, skipped: 'backend-missing' };
    const id = submissionId(payload);
    const result = await rpc(CONFIG.submitRpc || 'submit_prediction', {
      p_submission_id: id,
      p_league_id: payload.leagueId,
      p_team_slug: payload.teamSlug,
      p_fixture_version: payload.fixtureVersion,
      p_predictions: payload.predictions
    });
    return { configured: true, accepted: Boolean(result?.accepted ?? true), result, id };
  }

  async function fetchAverages(leagueId, slug, fixtureVersion) {
    if (!backendConfigured()) return [];
    const rows = await rpc(CONFIG.averagesRpc || 'get_prediction_averages', {
      p_league_id: leagueId,
      p_team_slug: slug,
      p_fixture_version: fixtureVersion
    });
    return Array.isArray(rows) ? rows : [];
  }

  function createCrest(team) {
    const shell = document.createElement('span');
    shell.className = 'community-team-crest';
    if (team?.crest) {
      const image = document.createElement('img');
      image.src = new URL(`crests/${team.crest}.png`, appRoot()).href;
      image.alt = '';
      shell.appendChild(image);
    }
    return shell;
  }

  function percentage(value, total) {
    if (!total) return '—';
    return `%${Math.round((Number(value || 0) / Number(total)) * 100)}`;
  }

  function fixtureForTeam(competition, team) {
    const table = window.UCLDRAW_CURRENT_FIXTURES?.buildTable?.(competition);
    return table?.[team.name] || [];
  }

  function averageRowForFixture(rows, team, fixture) {
    const selectedHome = fixture.home;
    const home = selectedHome ? team : fixture.opponent;
    const away = selectedHome ? fixture.opponent : team;
    const key = `${teamSlug(home)}--${teamSlug(away)}`;
    return rows.find((row) => row.match_key === key) || null;
  }

  async function downloadPredictionImage() {
    const v9 = window.UCLDRAW_PREDICTION_SHARE_V9;
    if (v9?.downloadCurrent) return v9.downloadCurrent();

    const renderer = window.UCLDRAW_PREDICTION_SHARE_V8
      || window.UCLDRAW_PREDICTION_SHARE_V7
      || window.UCLDRAW_PREDICTION_SHARE_V6
      || window.UCLDRAW_PREDICTION_SHARE;
    const share = window.UCLDRAW_PREDICTION_SHARE;
    if (!renderer?.renderShareCard || !share?.collectSnapshot) throw new Error('Tahmin görseli oluşturucu hazır değil.');
    const snapshot = share.collectSnapshot();
    const canvas = await renderer.renderShareCard(snapshot);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('PNG oluşturulamadı.')), 'image/png', 1);
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `2026-27-${teamSlug(snapshot.activeRow?.team || { poolSlug: snapshot.activeName })}-tahmin.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  }

  function averageSection() {
    let section = document.getElementById('predictionCommunityAverage');
    if (!section) {
      section = document.createElement('main');
      section.id = 'predictionCommunityAverage';
      section.className = 'prediction-community-average';
      document.body.appendChild(section);
    }
    return section;
  }

  function clearAverageMode() {
    document.body.classList.remove('community-average-active');
    const section = document.getElementById('predictionCommunityAverage');
    if (section) section.hidden = true;
  }

  async function openAveragePage(leagueId, slug, options = {}) {
    const competition = window.UCLDRAW_DATA?.competitions?.[leagueId];
    const team = window.UCLDRAW_APP?.teamBySlug?.(leagueId, slug)
      || competition?.teams?.find((candidate) => teamSlug(candidate) === slug);
    if (!competition || !team) throw new Error('Ortalama tahmin takımı bulunamadı.');

    if (options.updateHistory !== false) history.pushState({ communityAverage: true }, '', routeUrl(leagueId, slug, true));

    document.body.classList.add('community-average-active');
    document.body.dataset.league = leagueId;
    const section = averageSection();
    section.hidden = false;
    section.replaceChildren();

    const header = document.createElement('header');
    header.className = 'community-average-header glass';
    header.appendChild(createCrest(team));
    const copy = document.createElement('div');
    const kicker = document.createElement('span');
    kicker.textContent = `${competition.shortName} · Topluluk`;
    const title = document.createElement('h1');
    title.textContent = `${team.name} Ortalama Tahminleri`;
    const description = document.createElement('p');
    description.textContent = 'Bitirilen anonim tahminlerin topluluk dağılımı.';
    copy.append(kicker, title, description);
    header.appendChild(copy);
    section.appendChild(header);

    const status = document.createElement('div');
    status.className = 'community-average-status glass';
    section.appendChild(status);

    const fixtureVersion = String(window.UCLDRAW_CURRENT_FIXTURES?.metadata?.[leagueId]?.sourceDate
      || window.UCLDRAW_CURRENT_FIXTURES?.snapshotDate
      || '2026-27');

    let rows = [];
    if (backendConfigured()) {
      status.textContent = 'Topluluk tahminleri yükleniyor...';
      try {
        rows = await fetchAverages(leagueId, slug, fixtureVersion);
        const count = Number(rows[0]?.submission_count || 0);
        status.textContent = count ? `${count.toLocaleString('tr-TR')} tamamlanmış tahmin` : 'Henüz tamamlanmış topluluk tahmini yok.';
      } catch (error) {
        status.textContent = 'Ortalama tahminler şu anda yüklenemedi.';
        console.error(error);
      }
    } else {
      status.textContent = 'Topluluk veritabanı henüz bağlanmadı. Bu aşamada hiçbir tahmin sunucuya gönderilmiyor.';
    }

    const fixtures = fixtureForTeam(competition, team);
    const grid = document.createElement('section');
    grid.className = 'community-average-grid';
    fixtures.forEach((fixture) => {
      const row = averageRowForFixture(rows, team, fixture);
      const total = Number(row?.total_votes || 0);
      const card = document.createElement('article');
      card.className = 'community-average-match glass';

      const opponent = document.createElement('div');
      opponent.className = 'community-average-opponent';
      opponent.appendChild(createCrest(fixture.opponent));
      const opponentName = document.createElement('strong');
      opponentName.textContent = fixture.opponent.name;
      const venue = document.createElement('span');
      venue.textContent = fixture.home ? 'İç saha' : 'Deplasman';
      opponent.append(opponentName, venue);

      const bars = document.createElement('div');
      bars.className = 'community-average-bars';
      for (const [label, value, kind] of [
        [`${team.name} kazanır`, row?.win_votes, 'win'],
        ['Berabere', row?.draw_votes, 'draw'],
        [`${fixture.opponent.name} kazanır`, row?.loss_votes, 'loss']
      ]) {
        const item = document.createElement('div');
        item.className = `community-average-bar ${kind}`;
        const top = document.createElement('div');
        top.innerHTML = `<span></span><strong></strong>`;
        top.querySelector('span').textContent = label;
        top.querySelector('strong').textContent = percentage(value, total);
        const track = document.createElement('div');
        track.className = 'community-average-track';
        const fill = document.createElement('i');
        fill.style.width = total ? `${Math.round((Number(value || 0) / total) * 100)}%` : '0%';
        track.appendChild(fill);
        item.append(top, track);
        bars.appendChild(item);
      }

      const meta = document.createElement('small');
      meta.textContent = total ? `${total.toLocaleString('tr-TR')} oy` : 'Henüz veri yok';
      card.append(opponent, bars, meta);
      grid.appendChild(card);
    });
    section.appendChild(grid);

    const actions = document.createElement('div');
    actions.className = 'community-average-actions glass';
    if (options.personal && window.UCLDRAW_PREDICTION_SESSION?.state?.()) {
      const download = document.createElement('button');
      download.type = 'button';
      download.className = 'action-button primary';
      download.textContent = 'Tahmin Görselini İndir';
      download.addEventListener('click', async () => {
        download.disabled = true;
        download.textContent = 'Hazırlanıyor...';
        try { await downloadPredictionImage(); }
        catch (error) { status.textContent = error.message; }
        finally {
          download.disabled = false;
          download.textContent = 'Tahmin Görselini İndir';
        }
      });
      actions.appendChild(download);
    }

    const retry = document.createElement('a');
    retry.className = 'action-button';
    retry.href = routeUrl(leagueId, slug, false);
    retry.textContent = 'Takımı Yeniden Tahmin Et';
    actions.appendChild(retry);
    section.appendChild(actions);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { rows, team, competition };
  }

  function finishProgress() {
    const session = window.UCLDRAW_PREDICTION_SESSION;
    const state = session?.state?.();
    const matches = session?.matchesForSelectedTeam?.() || [];
    const completed = matches.filter((match) => state?.matchLocks?.[match.id]).length;
    return { completed, total: matches.length, done: Boolean(matches.length && completed === matches.length) };
  }

  function ensureFinishControl() {
    if (document.body.classList.contains('community-average-active')) return;
    const section = document.getElementById('predictionSection');
    if (!section || section.hidden) return;
    const layout = section.querySelector('.prediction-layout');
    if (!layout) return;

    let control = section.querySelector('.prediction-community-finish');
    if (!control) {
      control = document.createElement('div');
      control.className = 'prediction-community-finish glass';
      const note = document.createElement('p');
      note.className = 'prediction-community-finish-note';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'action-button primary prediction-community-finish-button';
      control.append(note, button);
      section.appendChild(control);

      button.addEventListener('click', async () => {
        if (button.dataset.busy === 'true') return;
        const progress = finishProgress();
        if (!progress.done) return;
        button.dataset.busy = 'true';
        button.disabled = true;
        button.textContent = 'Bitiriliyor...';
        try {
          const payload = buildSubmission();
          const result = await submitPrediction(payload);
          await openAveragePage(payload.leagueId, payload.teamSlug, {
            personal: true,
            submissionResult: result
          });
        } catch (error) {
          note.textContent = error.message;
          button.disabled = false;
          button.textContent = 'Bitir';
          delete button.dataset.busy;
        }
      });
    }

    const progress = finishProgress();
    const note = control.querySelector('.prediction-community-finish-note');
    const button = control.querySelector('.prediction-community-finish-button');
    const current = window.UCLDRAW_LAST_DRAW?.source === 'uefa-current';
    note.textContent = current
      ? `Bitirdiğinde yalnızca bu takım için anonim maç tahminlerin topluluk ortalamasına eklenir. İsim, e-posta veya hesap bilgisi gönderilmez. · ${progress.completed}/${progress.total || 0}`
      : `Bu simülasyon resmi güncel fikstür değil; Bitir yalnızca sonuç ekranını ve görsel indirmeyi açar. · ${progress.completed}/${progress.total || 0}`;
    button.disabled = !progress.done;
    button.textContent = progress.done ? 'Bitir' : `Bitir · ${progress.completed}/${progress.total || 0}`;
  }

  const observer = new MutationObserver(() => window.requestAnimationFrame(ensureFinishControl));
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
  window.addEventListener('popstate', () => {
    if (!/\/ortalama\/?$/.test(window.location.pathname)) clearAverageMode();
  });

  window.UCLDRAW_COMMUNITY = Object.freeze({
    backendConfigured,
    predictionUrl: (leagueId, slug) => routeUrl(leagueId, slug, false),
    averageUrl: (leagueId, slug) => routeUrl(leagueId, slug, true),
    buildSubmission,
    submitPrediction,
    fetchAverages,
    openAveragePage,
    downloadPredictionImage,
    ensureFinishControl
  });

  ensureFinishControl();
})();