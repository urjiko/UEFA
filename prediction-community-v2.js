(() => {
  'use strict';

  if (window.UCLDRAW_COMMUNITY_V2) return;

  const CONFIG = window.UCLDRAW_COMMUNITY_CONFIG || {};
  const MIN_STRONG_SAMPLE = 20;
  let installTimer = null;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  function teamSlug(team) {
    return team?.poolSlug || team?.qualificationId || '';
  }

  function backendConfigured() {
    return Boolean(/^https:\/\//.test(CONFIG.supabaseUrl || '') && (CONFIG.supabaseAnonKey || '').length > 20);
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

  function stableSubmissionId(payload) {
    const stableKey = `ucldraw:community-submission:${payload.leagueId}:${payload.teamSlug}:${payload.fixtureVersion}`;
    try {
      const existing = localStorage.getItem(stableKey);
      if (existing) return existing;

      // Migrate the previous fingerprint-based identity so an existing browser does not create a fresh vote.
      const legacyPrefix = `${stableKey}:`;
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key?.startsWith(legacyPrefix)) continue;
        const legacyId = localStorage.getItem(key);
        if (!legacyId) continue;
        localStorage.setItem(stableKey, legacyId);
        return legacyId;
      }

      const id = crypto.randomUUID();
      localStorage.setItem(stableKey, id);
      return id;
    } catch {
      return crypto.randomUUID();
    }
  }

  async function submitPrediction(payload) {
    if (!payload.officialCurrent) return { configured: backendConfigured(), accepted: false, skipped: 'not-current' };
    if (!backendConfigured()) return { configured: false, accepted: false, skipped: 'backend-missing' };

    const id = stableSubmissionId(payload);
    const result = await rpc(CONFIG.submitRpc || 'submit_prediction', {
      p_submission_id: id,
      p_league_id: payload.leagueId,
      p_team_slug: payload.teamSlug,
      p_fixture_version: payload.fixtureVersion,
      p_predictions: payload.predictions
    });
    return {
      configured: true,
      accepted: Boolean(result?.accepted ?? true),
      updated: Boolean(result?.updated),
      result,
      id
    };
  }

  function fixtureForTeam(competition, team) {
    const table = window.UCLDRAW_CURRENT_FIXTURES?.buildTable?.(competition);
    return table?.[team.name] || [];
  }

  function rowForFixture(rows, team, fixture) {
    const selectedHome = fixture.home;
    const home = selectedHome ? team : fixture.opponent;
    const away = selectedHome ? fixture.opponent : team;
    const key = `${teamSlug(home)}--${teamSlug(away)}`;
    return rows.find((row) => row.match_key === key) || null;
  }

  function probabilities(row) {
    const total = Number(row?.total_votes || 0);
    if (!total) return { total: 0, win: 0, draw: 0, loss: 0, confidence: 0 };
    const win = Number(row?.win_votes || 0) / total;
    const draw = Number(row?.draw_votes || 0) / total;
    const loss = Number(row?.loss_votes || 0) / total;
    return { total, win, draw, loss, confidence: Math.max(win, draw, loss) };
  }

  function formatDecimal(value) {
    return Number.isFinite(value) ? value.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—';
  }

  function formatPercent(value) {
    return `%${Math.round(Number(value || 0) * 100)}`;
  }

  function computeCommunitySummary(rows, fixtures, team) {
    let expectedPoints = 0;
    let expectedWins = 0;
    let expectedDraws = 0;
    let expectedLosses = 0;
    let confidenceTotal = 0;
    let coveredFixtures = 0;
    let averageSelectedGoals = 0;
    let averageOpponentGoals = 0;
    let scoreFixtures = 0;
    let scoreSamples = 0;

    fixtures.forEach((fixture) => {
      const row = rowForFixture(rows, team, fixture);
      const p = probabilities(row);
      if (p.total) {
        coveredFixtures += 1;
        expectedPoints += 3 * p.win + p.draw;
        expectedWins += p.win;
        expectedDraws += p.draw;
        expectedLosses += p.loss;
        confidenceTotal += p.confidence;
      }

      const manualVotes = Number(row?.manual_score_votes || 0);
      const selected = Number(row?.avg_selected_goals);
      const opponent = Number(row?.avg_opponent_goals);
      if (manualVotes > 0 && Number.isFinite(selected) && Number.isFinite(opponent)) {
        averageSelectedGoals += selected;
        averageOpponentGoals += opponent;
        scoreFixtures += 1;
        scoreSamples += manualVotes;
      }
    });

    const submissionCount = rows.reduce((maximum, row) => Math.max(maximum, Number(row?.submission_count || 0)), 0);
    return {
      submissionCount,
      coveredFixtures,
      totalFixtures: fixtures.length,
      expectedPoints,
      expectedWins,
      expectedDraws,
      expectedLosses,
      confidence: coveredFixtures ? confidenceTotal / coveredFixtures : 0,
      averageSelectedGoals: scoreFixtures ? averageSelectedGoals : null,
      averageOpponentGoals: scoreFixtures ? averageOpponentGoals : null,
      scoreFixtures,
      scoreSamples
    };
  }

  function metric(label, value, note) {
    const article = document.createElement('article');
    article.className = 'community-stat-metric glass';
    const small = document.createElement('span');
    small.textContent = label;
    const strong = document.createElement('strong');
    strong.textContent = value;
    const detail = document.createElement('small');
    detail.textContent = note;
    article.append(small, strong, detail);
    return article;
  }

  function insertSummary(section, status, rows, fixtures, team) {
    const summary = computeCommunitySummary(rows, fixtures, team);
    const grid = document.createElement('section');
    grid.className = 'community-stat-summary';
    grid.setAttribute('aria-label', 'Tahmin özeti');

    const coverageNote = summary.coveredFixtures
      ? `${summary.coveredFixtures}/${summary.totalFixtures} maçta kullanıcı oyu`
      : 'Henüz kullanıcı oyu yok';
    const record = `${formatDecimal(summary.expectedWins)} - ${formatDecimal(summary.expectedDraws)} - ${formatDecimal(summary.expectedLosses)}`;
    const score = summary.scoreFixtures
      ? `${formatDecimal(summary.averageSelectedGoals)} - ${formatDecimal(summary.averageOpponentGoals)}`
      : '—';

    grid.append(
      metric('Beklenen Puan', formatDecimal(summary.expectedPoints), coverageNote),
      metric('Beklenen G-B-M', record, coverageNote),
      metric('Ortalama Gol', score, summary.scoreSamples ? `${summary.scoreSamples.toLocaleString('tr-TR')} manuel skor girdisi` : 'Manuel skor verisi yok'),
      metric('Topluluk Güveni', summary.coveredFixtures ? formatPercent(summary.confidence) : '—', 'Maç başına baskın görüş ortalaması')
    );
    status.after(grid);
    return summary;
  }

  function decorateMatchCards(section, rows, fixtures, team) {
    const cards = [...section.querySelectorAll('.community-average-match')];
    cards.forEach((card, index) => {
      const fixture = fixtures[index];
      if (!fixture) return;
      const row = rowForFixture(rows, team, fixture);
      const total = Number(row?.total_votes || 0);
      const manualVotes = Number(row?.manual_score_votes || 0);
      const meta = card.querySelector(':scope > small');
      if (meta) meta.textContent = total ? `${total.toLocaleString('tr-TR')} kullanıcı oyu` : 'Henüz kullanıcı oyu yok';

      if (manualVotes > 0 && row?.avg_selected_goals != null && row?.avg_opponent_goals != null) {
        const score = document.createElement('div');
        score.className = 'community-average-score';
        score.innerHTML = '<span>Ortalama skor</span><strong></strong><small></small>';
        score.querySelector('strong').textContent = `${Number(row.avg_selected_goals).toLocaleString('tr-TR')} - ${Number(row.avg_opponent_goals).toLocaleString('tr-TR')}`;
        score.querySelector('small').textContent = `${manualVotes.toLocaleString('tr-TR')} manuel skor tahmini`;
        if (meta) card.insertBefore(score, meta);
        else card.appendChild(score);
      }

      if (total < MIN_STRONG_SAMPLE) {
        card.classList.add('is-limited-data');
        const notice = document.createElement('span');
        notice.className = 'community-limited-data';
        notice.textContent = 'Veri henüz sınırlı';
        card.querySelector('.community-average-opponent')?.appendChild(notice);
      }
    });
  }

  function fixtureLabel(team, fixture) {
    return fixture.home
      ? `${team.name} - ${fixture.opponent.name}`
      : `${fixture.opponent.name} - ${team.name}`;
  }

  function insightCard(label, record, formatter) {
    const article = document.createElement('article');
    article.className = 'community-insight-card glass';
    const kicker = document.createElement('span');
    kicker.textContent = label;
    const strong = document.createElement('strong');
    strong.textContent = record ? fixtureLabel(record.team, record.fixture) : 'Veri henüz sınırlı';
    const detail = document.createElement('small');
    detail.textContent = record ? formatter(record) : `En az ${MIN_STRONG_SAMPLE} kullanıcı oyu gerekli`;
    article.append(kicker, strong, detail);
    return article;
  }

  function insertInsights(section, rows, fixtures, team) {
    const records = fixtures.map((fixture) => {
      const row = rowForFixture(rows, team, fixture);
      const p = probabilities(row);
      return { fixture, row, team, ...p };
    }).filter((record) => record.total >= MIN_STRONG_SAMPLE);

    let best = null;
    let hardest = null;
    let controversial = null;
    let consensus = null;
    records.forEach((record) => {
      if (!best || record.win > best.win) best = record;
      if (!hardest || record.loss > hardest.loss) hardest = record;
      if (!controversial || record.confidence < controversial.confidence) controversial = record;
      if (!consensus || record.confidence > consensus.confidence) consensus = record;
    });

    const wrapper = document.createElement('section');
    wrapper.className = 'community-insights';
    const heading = document.createElement('header');
    const title = document.createElement('h2');
    title.textContent = 'Topluluk İçgörüleri';
    const note = document.createElement('p');
    note.textContent = `${MIN_STRONG_SAMPLE} ve üzeri kullanıcı oyuna ulaşan maçlar değerlendirilir.`;
    heading.append(title, note);

    const grid = document.createElement('div');
    grid.className = 'community-insight-grid';
    grid.append(
      insightCard('En yüksek galibiyet beklentisi', best, (record) => `${formatPercent(record.win)} galibiyet`),
      insightCard('En zor maç', hardest, (record) => `${formatPercent(record.loss)} mağlubiyet beklentisi`),
      insightCard('En tartışmalı maç', controversial, (record) => `En yüksek seçenek yalnızca ${formatPercent(record.confidence)}`),
      insightCard('En net topluluk görüşü', consensus, (record) => `${formatPercent(record.confidence)} aynı sonuç yönünde`)
    );
    wrapper.append(heading, grid);

    const actions = section.querySelector('.community-average-actions');
    if (actions) section.insertBefore(wrapper, actions);
    else section.appendChild(wrapper);
  }

  function upgradeShareAction(section, status) {
    const actions = section.querySelector('.community-average-actions');
    if (!actions) return;
    const legacy = [...actions.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Paylaş');
    if (!legacy) return;

    const share = legacy.cloneNode(true);
    legacy.replaceWith(share);
    share.addEventListener('click', async () => {
      if (share.dataset.busy === 'true') return;
      share.dataset.busy = 'true';
      share.disabled = true;
      share.textContent = 'Hazırlanıyor...';
      try {
        const renderer = window.UCLDRAW_PREDICTION_SHARE_V9
          || window.UCLDRAW_PREDICTION_SHARE_V8
          || window.UCLDRAW_PREDICTION_SHARE_V7;
        if (!renderer?.shareCurrent) throw new Error('Tahmin paylaşımı hazır değil.');
        await renderer.shareCurrent();
        status.textContent = 'Paylaşım görseli hazır.';
      } catch (error) {
        if (error?.name !== 'AbortError') status.textContent = error?.message || 'Paylaşım görseli oluşturulamadı.';
      } finally {
        delete share.dataset.busy;
        share.disabled = false;
        share.textContent = 'Paylaş';
      }
    });
  }

  async function openStatisticsPage(base, leagueId, slug, options = {}) {
    const result = await base.openAveragePage(leagueId, slug, options);
    const section = document.getElementById('predictionCommunityAverage');
    if (!section) return result;

    const team = result.team;
    const competition = result.competition;
    const rows = result.rows || [];
    const fixtures = fixtureForTeam(competition, team);
    const title = section.querySelector('.community-average-header h1');
    const description = section.querySelector('.community-average-header p');
    const status = section.querySelector('.community-average-status');
    if (title) title.textContent = `${team.name} Tahmin İstatistikleri`;
    if (description) description.textContent = 'Yüzdelerde yalnızca kullanıcıların kendi seçimleri sayılır; yapay zeka ile tamamlanan maçlar topluluk oyuna dahil edilmez.';

    const summary = insertSummary(section, status, rows, fixtures, team);
    if (status && backendConfigured()) {
      status.textContent = summary.submissionCount
        ? `${summary.submissionCount.toLocaleString('tr-TR')} tamamlanmış tahmin · insan oyları ayrı hesaplanıyor`
        : 'Henüz tamamlanmış topluluk tahmini yok.';
    }

    decorateMatchCards(section, rows, fixtures, team);
    insertInsights(section, rows, fixtures, team);
    if (status) upgradeShareAction(section, status);
    return { ...result, summary };
  }

  async function prewarmExport() {
    const renderer = window.UCLDRAW_PREDICTION_SHARE_V9;
    if (!renderer?.prepareExport) return false;
    try {
      await renderer.prepareExport();
      return true;
    } catch (error) {
      console.warn('Tahmin görseli ön hazırlığı başarısız:', error);
      return false;
    }
  }

  function install() {
    const base = window.UCLDRAW_COMMUNITY;
    if (!base?.buildSubmission || !base?.finishProgress || !base?.openAveragePage) return false;
    if (window.UCLDRAW_COMMUNITY_V2) return true;

    async function openAveragePage(leagueId, slug, options = {}) {
      return openStatisticsPage(base, leagueId, slug, options);
    }

    async function finishCurrentPrediction() {
      const session = window.UCLDRAW_PREDICTION_SESSION;
      const state = session?.state?.();
      const selectedName = session?.selectedTeamName?.();
      if (!state || !selectedName) throw new Error('Tahmin oturumu bulunamadı.');

      const progress = base.finishProgress();
      if (!progress.done) {
        const ai = window.UCLDRAW_PREDICTION_AI;
        if (!ai?.predictMissing) throw new Error('Eksik maçlar için yapay zeka tahmini hazır değil.');
        ai.predictMissing(state);
        session.refresh?.();
      }

      const payload = base.buildSubmission();
      const result = await submitPrediction(payload);
      await prewarmExport();
      await openAveragePage(payload.leagueId, payload.teamSlug, {
        personal: true,
        submissionResult: result
      });
      return { payload, result };
    }

    const upgraded = Object.freeze({
      ...base,
      submitPrediction,
      openAveragePage,
      finishCurrentPrediction,
      stableSubmissionId,
      computeCommunitySummary,
      minStrongSample: MIN_STRONG_SAMPLE
    });
    window.UCLDRAW_COMMUNITY = upgraded;
    window.UCLDRAW_COMMUNITY_V2 = upgraded;

    // Capture on window so legacy document/predictionSection share listeners can never steal the Finish click.
    window.addEventListener('click', (event) => {
      const button = event.target.closest?.('.prediction-community-finish-button');
      const predictionSection = document.getElementById('predictionSection');
      if (!button || !predictionSection?.contains(button)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (button.dataset.communityV2Busy === 'true') return;

      button.dataset.communityV2Busy = 'true';
      button.disabled = true;
      const idleText = button.textContent || 'Bitir';
      button.textContent = 'Bitiriliyor...';
      Promise.resolve(finishCurrentPrediction())
        .catch((error) => {
          console.error(error);
          showToast(error?.message || 'Tahmin tamamlanamadı.');
        })
        .finally(() => {
          delete button.dataset.communityV2Busy;
          button.disabled = false;
          button.textContent = idleText;
        });
    }, true);

    return true;
  }

  if (!install()) {
    installTimer = window.setInterval(() => {
      if (!install()) return;
      window.clearInterval(installTimer);
      installTimer = null;
    }, 25);
    window.setTimeout(() => {
      if (installTimer) window.clearInterval(installTimer);
      installTimer = null;
    }, 5000);
  }
})();
