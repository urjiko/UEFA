(() => {
  'use strict';

  // Public browser credentials only. Never put a privileged secret key here.
  // Share/export renderers stay available, but their legacy DOM observers/UI are disabled.
  window.UCLDRAW_DISABLE_LEGACY_SHARE_UI = true;

  // Disable the old toBlob fidelity repaint synchronously, before ui-refinement-v5
  // gets a chance to load a cached copy of prediction-share-fidelity-patch.js.
  window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH = Object.freeze({
    version: 3,
    disabled: true,
    outputWidth: 2400,
    outputHeight: 3200
  });

  const SUPABASE_URL = 'https://xjgdkqtksgbzcpdcuoah.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_t43dfpIGdfCdf3fEVCjnhQ_18472TTu';
  const FINISH_TIMEOUT_MS = 12000;
  const AVERAGE_FALLBACK_MS = 1800;

  window.UCLDRAW_COMMUNITY_CONFIG = Object.freeze({
    supabaseUrl: SUPABASE_URL,
    supabasePublishableKey: SUPABASE_PUBLISHABLE_KEY,
    // Temporary compatibility alias for the existing community modules.
    // This is a publishable browser key, not a legacy JWT anon key.
    supabaseAnonKey: SUPABASE_PUBLISHABLE_KEY,
    submitRpc: 'submit_prediction',
    averagesRpc: 'get_prediction_averages'
  });

  // Supabase's sb_publishable_* keys are API keys, not JWTs. Existing community
  // modules still add the old `Authorization: Bearer <key>` header. Strip only
  // that obsolete header for this project's RPC calls while keeping `apikey`.
  const nativeFetch = window.fetch.bind(window);
  window.fetch = function ucldrawSupabasePublishableFetch(input, init = {}) {
    const requestUrl = typeof input === 'string' ? input : input?.url;
    const rpcPrefix = `${SUPABASE_URL}/rest/v1/rpc/`;
    if (!requestUrl?.startsWith(rpcPrefix)) return nativeFetch(input, init);

    const sourceHeaders = init.headers
      || ((typeof Request !== 'undefined' && input instanceof Request) ? input.headers : undefined);
    const headers = new Headers(sourceHeaders || {});
    headers.set('apikey', SUPABASE_PUBLISHABLE_KEY);
    if (headers.get('Authorization') === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`) {
      headers.delete('Authorization');
    }

    if (typeof Request !== 'undefined' && input instanceof Request) {
      return nativeFetch(new Request(input, { ...init, headers }));
    }
    return nativeFetch(input, { ...init, headers });
  };

  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
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
      // Finish is not a share action. The old selector made V5/V6/refinement handlers
      // eligible to hijack exactly the same click.
      button.classList.remove('prediction-share-v4-button', 'prediction-share-v9-legacy');
      button.removeAttribute('aria-hidden');
      button.hidden = false;
    });
  }

  function averageFallbackUrl(community, payload) {
    try {
      const direct = community?.averageUrl?.(payload.leagueId, payload.teamSlug);
      if (direct) return direct;
    } catch {}

    const dirs = { ucl: 'champions-league', uel: 'europa-league', uecl: 'conference-league' };
    const root = new URL(window.UCLDRAW_APP_ROOT || './', document.baseURI);
    return new URL(`${dirs[payload.leagueId] || dirs.ucl}/tahmin/${payload.teamSlug}/ortalama/`, root).href;
  }

  function startAveragePage(community, payload, result) {
    const fallbackUrl = averageFallbackUrl(community, payload);
    let request;

    // Hide the prediction shell immediately after the vote is saved. This is deliberate:
    // from this point on, neither statistics hydration nor image generation is allowed to
    // keep the user staring at a busy Finish button.
    document.body.classList.add('community-average-active');

    try {
      request = community.openAveragePage(payload.leagueId, payload.teamSlug, {
        personal: true,
        submissionResult: result
      });
    } catch (error) {
      console.error(error);
      window.location.assign(fallbackUrl);
      return false;
    }

    const fallbackTimer = window.setTimeout(() => {
      const section = document.getElementById('predictionCommunityAverage');
      if (!section || section.hidden) window.location.assign(fallbackUrl);
    }, AVERAGE_FALLBACK_MS);

    Promise.resolve(request)
      .catch((error) => {
        console.error(error);
        showToast(error?.message || 'İstatistikler yüklenemedi.');
        window.location.assign(fallbackUrl);
      })
      .finally(() => window.clearTimeout(fallbackTimer));

    return true;
  }

  async function finishCurrentPrediction() {
    const community = window.UCLDRAW_COMMUNITY_V2 || window.UCLDRAW_COMMUNITY;
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
      FINISH_TIMEOUT_MS,
      'Tahmin kaydı zaman aşımına uğradı. Lütfen tekrar dene.'
    );

    startAveragePage(community, payload, result);
    return { payload, result };
  }

  // Register this capture listener synchronously, before Community V2, V4, V5 and V6
  // are loaded. It is the single owner of Finish and stops all legacy share listeners.
  window.addEventListener('click', (event) => {
    const button = event.target.closest?.('.prediction-community-finish-button');
    const predictionSection = document.getElementById('predictionSection');
    if (!button || !predictionSection?.contains(button)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (button.dataset.finishControllerBusy === 'true') return;
    button.dataset.finishControllerBusy = 'true';
    button.disabled = true;
    const idleText = button.textContent || 'Bitir';
    button.textContent = 'Bitiriliyor...';

    Promise.resolve(finishCurrentPrediction())
      .catch((error) => {
        console.error(error);
        showToast(error?.message || 'Tahmin tamamlanamadı.');
      })
      .finally(() => {
        delete button.dataset.finishControllerBusy;
        button.disabled = false;
        button.textContent = idleText;
      });
  }, true);

  window.addEventListener('ucldraw:prediction-rendered', normalizeFinishButtons);
  window.addEventListener('ucldraw:ai-predictions-applied', normalizeFinishButtons);

  window.UCLDRAW_FINISH_CONTROLLER = Object.freeze({
    finishCurrentPrediction,
    startAveragePage,
    normalizeFinishButtons,
    finishTimeoutMs: FINISH_TIMEOUT_MS
  });

  const source = document.currentScript?.src || document.baseURI;
  const assetRoot = new URL('./', source);

  function ensureStylesheet(file, marker) {
    if (document.querySelector(`link[${marker}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(file, assetRoot).href;
    link.setAttribute(marker, 'true');
    document.head.appendChild(link);
  }

  function ensureScript(file, marker) {
    if (document.querySelector(`script[${marker}]`)) return;
    const script = document.createElement('script');
    script.src = new URL(file, assetRoot).href;
    script.async = false;
    script.setAttribute(marker, 'true');
    document.head.appendChild(script);
  }

  ensureStylesheet('prediction-community-v2.css?v=20260905d', 'data-prediction-community-v2');
  ensureStylesheet('prediction-community-v3.css?v=20260905d', 'data-prediction-community-v3');
  ensureScript('prediction-community-v2.js?v=20260905d', 'data-prediction-community-v2');
  ensureScript('prediction-community-v3.js?v=20260905d', 'data-prediction-community-v3');
  ensureScript('prediction-share-export-safety.js?v=20260905b', 'data-prediction-export-safety');
})();
