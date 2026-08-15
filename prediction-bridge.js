(() => {
  'use strict';

  const HOME_OVERRIDE_SCRIPT_ID = 'ucldraw-home-advantage-profile-overrides';

  function installHomeAdvantageOverrides() {
    if (typeof document === 'undefined' || document.getElementById(HOME_OVERRIDE_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = HOME_OVERRIDE_SCRIPT_ID;
    script.src = 'home-advantage-profile-overrides.js';
    script.async = true;
    document.head.appendChild(script);
  }

  function installPredictionBridge() {
    const engine = window.UCLDRAW_ENGINE;
    if (!engine?.generateCompetitionDraw || engine.__predictionWrapped) return false;

    const originalGenerate = engine.generateCompetitionDraw.bind(engine);
    engine.generateCompetitionDraw = function generateCompetitionDrawWithPredictionBridge(competition, options) {
      const table = originalGenerate(competition, options);
      window.UCLDRAW_LAST_DRAW = {
        competition,
        table,
        leagueId: competition.id,
        generatedAt: Date.now()
      };
      window.dispatchEvent(new CustomEvent('ucldraw:draw-generated', {
        detail: window.UCLDRAW_LAST_DRAW
      }));
      return table;
    };
    engine.__predictionWrapped = true;
    return true;
  }

  installHomeAdvantageOverrides();
  window.UCLDRAW_INSTALL_PREDICTION_BRIDGE = installPredictionBridge;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installPredictionBridge, { once: true });
  } else {
    installPredictionBridge();
  }
})();