(() => {
  'use strict';

  const STORAGE_KEY = 'ucldraw:qualification-slot-assignments:v1';
  const currentVersion = window.UCLDRAW_QUALIFICATION_RESULT?.diagnostics?.bracketVersion
    || window.UCLDRAW_QUALIFICATION_BRACKET?.currentStateVersion
    || null;

  if (!currentVersion) return;

  try {
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
