(() => {
  'use strict';

  if (window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH) return;

  // Legacy fidelity repainting used to mutate the final 2400x3200 canvas during
  // toBlob(). That painted a second fixture/text layout on top of the already
  // rendered V7/V8 card. Conference League exports exposed it most clearly
  // because V7 uses a different six-fixture geometry.
  //
  // Keep the public marker for compatibility, but do not monkey-patch
  // HTMLCanvasElement.prototype.toBlob and do not repaint any export pixels.
  window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH = Object.freeze({
    version: 3,
    disabled: true,
    outputWidth: 2400,
    outputHeight: 3200
  });
})();
