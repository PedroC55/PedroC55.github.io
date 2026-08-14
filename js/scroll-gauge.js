export function initScrollGauge({ nav, name, ghost, links, linkEls, sections, fallback, nameFill, reduced }) {
  const state = { scale: 8, dx: 0, dy: 0, span: 240, depth: 1, paintedY: -1 };

  const scroller = nav.parentElement;
  function syncGutter() {
    const sb = Math.max(0, scroller.offsetWidth - scroller.clientWidth);
    nav.style.right = sb + 'px';
  }

  /* The name is laid out at the hero size and shrinks into the nav, so `scale`
   * here is a shrink factor below 1 rather than a magnification. Scaling text up
   * from 16px left the rasterised layer stretched and blurry on the way back to
   * the top; scaling down cannot lose detail. */
  function measure() {
    /* The stylesheet leaves the name at nav size so that the pre-JS paint is
     * already correct at any scroll position. Raising it to the hero size is
     * this module's job, and it has to happen before anything is measured. */
    name.style.fontSize = 'var(--name-hero)';
    const prevTransform = name.style.transform;
    name.style.transform = 'none';
    const nr = name.getBoundingClientRect();
    const gr = ghost.getBoundingClientRect();
    const heroPx = parseFloat(getComputedStyle(name).fontSize) || 148;
    const navPx = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--name-nav')
    ) || 16;
    name.style.transform = prevTransform;
    state.scale = Math.min(1, navPx / heroPx);

    /* A correct measurement is around 0.1 (16px of nav over ~148px of hero).
     * Anything near 1 means the hero font size never applied, which would leave
     * the name at full size across the whole page instead of shrinking into the
     * corner. Report it rather than rendering the broken state silently. */
    if (state.scale > 0.5) {
      console.warn(
        '[portfolio] nav name scale looks wrong: ' + state.scale.toFixed(3) +
        ' (nav ' + navPx + 'px / hero ' + heroPx + 'px). ' +
        'Computed font-size: ' + getComputedStyle(name).fontSize +
        ', --name-hero: "' + getComputedStyle(document.documentElement).getPropertyValue('--name-hero') + '"' +
        ', --name-nav: "' + getComputedStyle(document.documentElement).getPropertyValue('--name-nav') + '"'
      );
    }
    state.dx = gr.left - nr.left;
    state.dy = (gr.top + window.scrollY) - nr.top;
    state.span = Math.max(240, window.innerHeight * 0.52);
  }

  function apply(compress) {
    const y = window.scrollY;
    const p = Math.min(1, Math.max(0, y / state.span));
    const e = p * p * (3 - 2 * p);
    if (compress) {
      const inv = 1 - e;
      // inv 1 at the top: sitting on the ghost at full size. inv 0 in the nav:
      // translated back to its own box and shrunk to the nav size.
      const s = state.scale + (1 - state.scale) * inv;
      name.style.transform =
        'translate3d(' + (state.dx * inv).toFixed(2) + 'px,' + (state.dy * inv).toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')';
    } else {
      // Reduced motion shows the real ghost, so the name just holds nav size.
      name.style.transform = 'scale(' + state.scale.toFixed(4) + ')';
      name.style.opacity = e > 0.6 ? '1' : '0';
    }
    const navVis = Math.max(0, (e - 0.5) / 0.5);
    if (links) links.style.opacity = String(navVis);
  }

  function progress() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function paintDepth(p) {
    state.depth = 1 - 0.55 * p;
    if (fallback && fallback.style.display !== 'none') {
      fallback.style.opacity = (1 - 0.45 * p).toFixed(3);
    }
    if (nameFill) {
      if (!reduced && !nameFill.style.transition) nameFill.style.transition = 'clip-path .14s linear';
      nameFill.style.clipPath = 'inset(0 ' + (100 - p * 100).toFixed(2) + '% 0 0)';
    }
  }

  function paintNav(idx) {
    linkEls.forEach((el, i) => { el.style.opacity = i === idx ? '1' : '0.45'; });
  }

  function currentIndex() {
    const focus = window.scrollY + window.innerHeight * 0.42;
    let idx = -1;
    sections.forEach((s, i) => {
      if (!s) return;
      const top = s.getBoundingClientRect().top + window.scrollY;
      if (focus >= top) idx = i;
    });
    return idx;
  }

  function frame(compress) {
    const y = window.scrollY;
    if (y !== state.paintedY) {
      state.paintedY = y;
      apply(compress);
      const p = progress();
      paintDepth(p);
      paintNav(currentIndex());
    }
  }

  let dead = false;
  let timer = null;

  function start(compress) {
    let rafSeen = false;
    const rafLoop = () => {
      if (dead) return;
      rafSeen = true;
      frame(compress);
      requestAnimationFrame(rafLoop);
    };
    requestAnimationFrame(rafLoop);
    timer = setInterval(() => {
      if (dead) { clearInterval(timer); return; }
      if (!rafSeen) frame(compress);
      rafSeen = false;
    }, 16);
  }

  syncGutter();
  window.addEventListener('resize', syncGutter);

  return {
    measure,
    apply,
    syncGutter,
    start,
    getDepth: () => state.depth,
    getScale: () => state.scale,
    teardown() {
      dead = true;
      if (timer) clearInterval(timer);
      window.removeEventListener('resize', syncGutter);
    }
  };
}
