(() => {
  'use strict';

  const profiles = Object.freeze({
    besiktas: Object.freeze({
      name: 'Beşiktaş',
      country: 'TUR',
      attack: Object.freeze({
        overall: 1.1205,
        domestic: 1.1458,
        europe: 1,
        vsStronger: 1.0545,
        vsSimilar: 1.131,
        vsWeaker: 1
      }),
      defense: Object.freeze({
        overall: 1.1102,
        domestic: 1.1334,
        europe: 1,
        vsStronger: 0.9169,
        vsSimilar: 1.16,
        vsWeaker: 1
      }),
      confidence: Object.freeze({
        overall: 0.4783,
        domestic: 0.579,
        europe: 0,
        vsStronger: 0.1339,
        vsSimilar: 0.5497,
        vsWeaker: 0
      }),
      defenseConfidence: Object.freeze({
        overall: 0.4783,
        domestic: 0.579,
        europe: 0,
        vsStronger: 0.1339,
        vsSimilar: 0.5497,
        vsWeaker: 0
      }),
      samples: Object.freeze({
        overall: Object.freeze({ raw: 18, effective: 16.5 }),
        domestic: Object.freeze({ raw: 18, effective: 16.5 }),
        europe: Object.freeze({ raw: 0, effective: 0 }),
        vsStronger: Object.freeze({ raw: 2, effective: 1.85 }),
        vsSimilar: Object.freeze({ raw: 16, effective: 14.65 }),
        vsWeaker: Object.freeze({ raw: 0, effective: 0 })
      }),
      associationMatchups: Object.freeze({
        TUR: Object.freeze({
          attack: 1.1458,
          defense: 1.1334,
          confidence: 0.579,
          samples: 18,
          effectiveSample: 16.5
        })
      })
    })
  });

  const overrides = Object.freeze({ version: 1, profiles });
  window.UCLDRAW_HOME_ADVANTAGE_PROFILE_OVERRIDES = overrides;

  function merged(payload) {
    if (!payload) return payload;
    return Object.freeze({
      ...payload,
      version: Number(payload.version || 0) + overrides.version,
      profiles: Object.freeze({ ...(payload.profiles || {}), ...profiles })
    });
  }

  let current = merged(window.UCLDRAW_HOME_ADVANTAGE_PROFILES || null);
  Object.defineProperty(window, 'UCLDRAW_HOME_ADVANTAGE_PROFILES', {
    configurable: true,
    enumerable: true,
    get() { return current; },
    set(payload) { current = merged(payload); }
  });
})();
