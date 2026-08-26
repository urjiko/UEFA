(() => {
  'use strict';

  const STORAGE_KEY = 'ucldraw:qualification-slot-assignments:v1';
  const RESET_MARKER = 'ucldraw:qualification-slot-reset:20260826a';
  const currentVersion = window.UCLDRAW_QUALIFICATION_RESULT?.diagnostics?.bracketVersion
    || window.UCLDRAW_QUALIFICATION_BRACKET?.currentStateVersion
    || null;

  try {
    // Qualification results can lock previously swappable playoff slots.
    // Force one reset for this runtime revision so a session saved while
    // those ties were unresolved cannot keep a now-impossible assignment.
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
