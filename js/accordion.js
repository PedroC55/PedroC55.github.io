export function initAccordion({ root, reduced }) {
  const rows = Array.from(root.querySelectorAll('[data-acc-row]'));
  const buttons = rows.map(r => r.querySelector('[data-acc-btn]'));
  const panels = rows.map(r => r.querySelector('[data-acc-panel]'));
  const inners = panels.map(p => p.querySelector('[data-acc-inner]'));

  if (reduced) {
    panels.forEach(p => { p.style.transition = 'none'; });
    inners.forEach(i => { if (i) i.style.transition = 'none'; });
  }

  let openIdx = buttons.findIndex(b => b.getAttribute('aria-expanded') === 'true');

  function setRow(i, open) {
    const btn = buttons[i];
    const panel = panels[i];
    const inner = inners[i];
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    const sign = btn.querySelector('[data-acc-sign]');
    if (sign) sign.textContent = open ? '\u2212' : '+';
    panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
    if (inner) {
      inner.style.transitionDelay = open && !reduced ? '.06s' : '0s';
      inner.style.opacity = open ? '1' : '0';
      inner.style.transform = open ? 'translateY(0)' : 'translateY(8px)';
    }
  }

  function toggle(i) {
    const wasOpen = i === openIdx;
    const prev = openIdx;
    openIdx = wasOpen ? -1 : i;
    if (prev >= 0 && prev !== i) setRow(prev, false);
    setRow(i, !wasOpen);
  }

  function syncPanels() {
    panels.forEach((p, i) => {
      p.style.maxHeight = i === openIdx ? p.scrollHeight + 'px' : '0px';
    });
  }

  const handlers = buttons.map((btn, i) => {
    const fn = () => toggle(i);
    btn.addEventListener('click', fn);
    return fn;
  });

  syncPanels();

  return {
    syncPanels,
    teardown() {
      buttons.forEach((btn, i) => btn.removeEventListener('click', handlers[i]));
    }
  };
}
