(() => {
  'use strict';

  const STORAGE_KEY = 'ucldraw:qualification-slot-assignments:v1';
  const RESET_MARKER = 'ucldraw:qualification-slot-reset:20260815d';
  const currentVersion = window.UCLDRAW_QUALIFICATION_RESULT?.diagnostics?.bracketVersion
    || window.UCLDRAW_QUALIFICATION_BRACKET?.currentStateVersion
    || null;

  try {
    // PR #79 and the first cache fix both used the same 2026-08-15
    // qualification version. A browser that opened the site between those
    // deployments can therefore hold a structurally valid but behaviorally
    // stale slot assignment whose version still matches. Force exactly one
    // reset for this runtime revision, then allow normal session persistence.
    if (window.sessionStorage?.getItem(RESET_MARKER) !== '1') {
      window.sessionStorage?.removeItem(STORAGE_KEY);
      window.sessionStorage?.setItem(RESET_MARKER, '1');
      return;
    }

    if (!currentVersion) return;
    const raw = window.sessionStorage?.getItem(STORAGE_KEY);
    if (!raw) return;

    const stored = JSON.parse(raw);
    if (stored?.bracketVersion !== currentVersion) {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    try {
      window.sessionStorage?.removeItem(STORAGE_KEY);
    } catch {
      // Storage may be unavailable; roster-manager will continue in memory.
    }
  }
})();
