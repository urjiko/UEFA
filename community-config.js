(() => {
  'use strict';

  // Public browser credentials only. Never put a privileged secret key here.
  window.UCLDRAW_COMMUNITY_CONFIG = Object.freeze({
    supabaseUrl: '',
    supabaseAnonKey: '',
    submitRpc: 'submit_prediction',
    averagesRpc: 'get_prediction_averages'
  });
})();