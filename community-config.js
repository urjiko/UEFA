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
})();