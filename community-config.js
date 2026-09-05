(() => {
  'use strict';

  // Public browser credentials only. Never put a privileged secret key here.
  // Share/export renderers stay available, but their legacy DOM observers/UI are disabled.
  window.UCLDRAW_DISABLE_LEGACY_SHARE_UI = true;
  window.UCLDRAW_COMMUNITY_CONFIG = Object.freeze({
    supabaseUrl: '',
    supabaseAnonKey: '',
    submitRpc: 'submit_prediction',
    averagesRpc: 'get_prediction_averages'
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

  ensureStylesheet('prediction-community-v2.css?v=20260905a', 'data-prediction-community-v2');
  ensureScript('prediction-community-v2.js?v=20260905a', 'data-prediction-community-v2');
  ensureScript('prediction-share-export-safety.js?v=20260905a', 'data-prediction-export-safety');
})();
