(() => {
  'use strict';

  // Public browser credentials only. Never put a privileged secret key here.
  // Share/export renderers stay available, but their legacy DOM observers/UI are disabled.
  window.UCLDRAW_DISABLE_LEGACY_SHARE_UI = true;

  // Disable the old toBlob fidelity repaint synchronously, before ui-refinement-v5
  // gets a chance to load a cached copy of prediction-share-fidelity-patch.js.
  // V7/V8/V9 already render at native 2400x3200; repainting the same fixtures
  // again during PNG encoding is what caused overlapping dates, scores and names.
  window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH = Object.freeze({
    version: 3,
    disabled: true,
    outputWidth: 2400,
    outputHeight: 3200
  });

  const SUPABASE_URL = 'https://xjgdkqtksgbzcpdcuoah.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_t43dfpIGdfCdf3fEVCjnhQ_18472TTu';

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
  // The wrapper is deliberately narrow so every other fetch on the site is untouched.
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

  ensureStylesheet('prediction-community-v2.css?v=20260905a', 'data-prediction-community-v2');
  ensureStylesheet('prediction-community-v3.css?v=20260905a', 'data-prediction-community-v3');

  // Must be registered before Community V2's window-capture Finish listener.
  // This keeps export prewarming in the background so Bitir can never hang on PNG generation.
  ensureScript('prediction-finish-hotfix.js?v=20260905a', 'data-prediction-finish-hotfix');
  ensureScript('prediction-community-v2.js?v=20260905a', 'data-prediction-community-v2');
  ensureScript('prediction-community-v3.js?v=20260905a', 'data-prediction-community-v3');
  ensureScript('prediction-share-export-safety.js?v=20260905b', 'data-prediction-export-safety');
})();
