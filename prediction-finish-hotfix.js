(() => {
  'use strict';

  if (window.UCLDRAW_FINISH_FLOW_HOTFIX) return;

  const PREWARM_WARN_MS = 3500;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  function prewarmExportInBackground() {
    const renderer = window.UCLDRAW_PREDICTION_SHARE_V9;
    if (!renderer?.prepareExport) return false;

    let settled = false;
    const warningTimer = window.setTimeout(() => {
      if (!settled) console.warn('Tahmin görseli ön hazırlığı uzadı; sonuç sayfası bekletilmiyor.');
    }, PREWARM_WARN_MS);

    Promise.resolve()
      .then(() => renderer.prepareExport())
      .catch((error) => console.warn('Tahmin görseli ön hazırlığı başarısız:', error))
      .finally(() => {
        settled = true;
        window.clearTimeout(warningTimer);
      });
    return true;
  }

  async function finishCurrentPrediction() {
    const community = window.UCLDRAW_COMMUNITY;
    const session = window.UCLDRAW_PREDICTION_SESSION;
    const state = session?.state?.();
    const selectedName = session?.selectedTeamName?.();

    if (!community?.buildSubmission || !community?.submitPrediction || !community?.openAveragePage || !community?.finishProgress) {
      throw new Error('Tahmin tamamlama servisi hazır değil.');
    }
    if (!state || !selectedName) throw new Error('Tahmin oturumu bulunamadı.');

    const progress = community.finishProgress();
    if (!progress.done) {
      const ai = window.UCLDRAW_PREDICTION_AI;
      if (!ai?.predictMissing) throw new Error('Eksik maçlar için yapay zeka tahmini hazır değil.');
      ai.predictMissing(state);
      session.refresh?.();
    }

    const payload = community.buildSubmission();
    const result = await community.submitPrediction(payload);

    // Export preparation is useful, but it must never gate navigation. Some crest/image
    // requests can keep the 2400x3200 renderer pending for a long time. Start it after
    // the vote is safely written and let the statistics page open immediately.
    prewarmExportInBackground();

    await community.openAveragePage(payload.leagueId, payload.teamSlug, {
      personal: true,
      submissionResult: result
    });
    return { payload, result };
  }

  window.addEventListener('click', (event) => {
    const button = event.target.closest?.('.prediction-community-finish-button');
    const predictionSection = document.getElementById('predictionSection');
    if (!button || !predictionSection?.contains(button)) return;

    // This listener is intentionally registered before Community V2. It owns Finish
    // so the older handler cannot await its blocking export prewarm path.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (button.dataset.finishHotfixBusy === 'true') return;
    button.dataset.finishHotfixBusy = 'true';
    button.disabled = true;
    const idleText = button.textContent || 'Bitir';
    button.textContent = 'Bitiriliyor...';

    Promise.resolve(finishCurrentPrediction())
      .catch((error) => {
        console.error(error);
        showToast(error?.message || 'Tahmin tamamlanamadı.');
      })
      .finally(() => {
        delete button.dataset.finishHotfixBusy;
        button.disabled = false;
        button.textContent = idleText;
      });
  }, true);

  window.UCLDRAW_FINISH_FLOW_HOTFIX = Object.freeze({
    finishCurrentPrediction,
    prewarmExportInBackground,
    prewarmWarnMs: PREWARM_WARN_MS
  });
})();
