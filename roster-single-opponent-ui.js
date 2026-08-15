(() => {
  'use strict';

  function simplifySingleOpponentPicker(backdrop) {
    if (!(backdrop instanceof Element) || !backdrop.classList.contains('roster-incoming-picker-backdrop')) return;

    const modal = backdrop.querySelector('.roster-replacement-modal');
    const list = modal?.querySelector('.roster-replacement-list');
    const filter = modal?.querySelector('.roster-modal-search');
    if (!modal || !list || !filter) return;

    const options = list.querySelectorAll('.roster-replacement-option');
    if (options.length !== 1) return;

    filter.remove();
    const description = modal.querySelector('.roster-incoming-team p');
    if (description) {
      description.textContent = 'Bu takımın play-off eşleşmesindeki tek alternatifi aşağıda. Takımı eklediğinde 36 takım katsayıya göre yeniden potlara ayrılır.';
    }
    options[0].focus();
  }

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        simplifySingleOpponentPicker(node);
        node.querySelectorAll?.('.roster-incoming-picker-backdrop').forEach(simplifySingleOpponentPicker);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
