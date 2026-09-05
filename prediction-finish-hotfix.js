(() => {
  'use strict';

  if (window.UCLDRAW_FINISH_FLOW_HOTFIX) return;

  const PREWARM_WARN_MS = 3500;
  const SUBMIT_TIMEOUT_MS = 12000;

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  function withTimeout(promise, milliseconds, message) {
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(message)), milliseconds);
    });
    return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
      if (timer) window.clearTimeout(timer);
    });
  }

  function normalizeFinishButtons() {
    document.querySelectorAll('.prediction-community-finish-button').forEach((button) => {
      // Bitir is not a share button. Keeping this legacy class lets V5/V6/document
      // capture listeners hijack the click before the community flow can finish.
      button.classList.remove('prediction-share-v4-button', 'prediction-share-v9-legacy');
      button.removeAttribute('aria-hidden');
      button.hidden = false;
    });
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

  function openAveragePageInBackground(community, payload, result) {
    let request;
    try {
      // openAveragePage renders its shell synchronously before its first network await.
      // Do not await the returned promise here: a slow averages RPC must never keep
      // the Finish button in a permanent busy state.
      request = community.openAveragePage(payload.leagueId, payload.teamSlug, {
        personal: true,
        submissionResult: result
      });
    } catch (error) {
      console.error(error);
      showToast(error?.message || 'İstatistik sayfası açılamadı.');
      return false;
    }

    Promise.resolve(request).catch((error) => {
      console.error(error);
      showToast(error?.message || 'İstatistikler yüklenemedi.');
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
    const result = await withTimeout(
      community.submitPrediction(payload),
      SUBMIT_TIMEOUT_MS,
      'Tahmin kaydı zaman aşımına uğradı. Lütfen tekrar dene.'
    );

    // Both expensive follow-up jobs are deliberately outside the critical path.
    prewarmExportInBackground();
    openAveragePageInBackground(community, payload, result);
    return { payload, result };
  }

  window.addEventListener('click', (event) => {
    const button = event.target.closest?.('.prediction-community-finish-button');
    const predictionSection = document.getElementById('predictionSection');
    if (!button || !predictionSection?.contains(button)) return;

    // Own Finish at the earliest capture phase. Legacy share handlers live lower in
    // the tree and must never see this event.
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

  window.addEventListener('ucldraw:prediction-rendered', normalizeFinishButtons);
  window.addEventListener('ucldraw:ai-predictions-applied', normalizeFinishButtons);
  normalizeFinishButtons();

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => normalizeFinishButtons());
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.UCLDRAW_FINISH_FLOW_HOTFIX = Object.freeze({
    finishCurrentPrediction,
    prewarmExportInBackground,
    openAveragePageInBackground,
    normalizeFinishButtons,
    prewarmWarnMs: PREWARM_WARN_MS,
    submitTimeoutMs: SUBMIT_TIMEOUT_MS
  });
})();
