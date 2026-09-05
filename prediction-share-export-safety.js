(() => {
  'use strict';

  if (window.UCLDRAW_PREDICTION_EXPORT_SAFETY) return;
  let timer = null;

  function install() {
    const fidelity = window.UCLDRAW_PREDICTION_SHARE_FIDELITY_PATCH;
    if (!fidelity?.outputWidth || !fidelity?.outputHeight) return false;

    const currentToBlob = HTMLCanvasElement.prototype.toBlob;
    if (currentToBlob?.ucldrawCloneSafe) {
      window.UCLDRAW_PREDICTION_EXPORT_SAFETY = Object.freeze({ version: 1 });
      return true;
    }

    function cloneSafeToBlob(callback, type, quality) {
      if (this.width !== fidelity.outputWidth || this.height !== fidelity.outputHeight) {
        return currentToBlob.call(this, callback, type, quality);
      }

      const clone = document.createElement('canvas');
      clone.width = this.width;
      clone.height = this.height;
      const context = clone.getContext('2d');
      if (!context) return currentToBlob.call(this, callback, type, quality);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(this, 0, 0);

      // The fidelity patch may repaint text before encoding. Let it mutate only this disposable clone,
      // never the cached export canvas used by subsequent share/download actions.
      return currentToBlob.call(clone, callback, type, quality);
    }

    Object.defineProperty(cloneSafeToBlob, 'ucldrawCloneSafe', {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    });

    HTMLCanvasElement.prototype.toBlob = cloneSafeToBlob;
    window.UCLDRAW_PREDICTION_EXPORT_SAFETY = Object.freeze({
      version: 1,
      outputWidth: fidelity.outputWidth,
      outputHeight: fidelity.outputHeight
    });
    return true;
  }

  if (!install()) {
    timer = window.setInterval(() => {
      if (!install()) return;
      window.clearInterval(timer);
      timer = null;
    }, 25);
    window.setTimeout(() => {
      if (timer) window.clearInterval(timer);
      timer = null;
    }, 5000);
  }
})();
