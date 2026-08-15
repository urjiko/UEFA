(() => {
  'use strict';

  const manifest = window.UCLDRAW_POOL_MANIFEST;
  if (!manifest?.europa?.playoffs) return;

  // Kauno Žalgiris and FK Žalgiris historically shared the physical
  // `zalgiris.png` crest slug. At this point Kauno is in the Europa League
  // play-offs while FK Žalgiris has been eliminated from the Conference
  // League. The current UCL state has already resolved Kauno before this
  // shim runs, so hide the ambiguous Europa manifest entry from the later
  // UEL/UECL Q3 resolver without removing the real crest file.
  const europa = Object.freeze({
    ...manifest.europa,
    playoffs: Object.freeze(manifest.europa.playoffs.filter((entry) => {
      const file = typeof entry === 'string' ? entry : entry?.file;
      return String(file || '').toLocaleLowerCase('en-US') !== 'zalgiris.png';
    }))
  });

  window.UCLDRAW_POOL_MANIFEST = Object.freeze({
    ...manifest,
    europa
  });
})();
