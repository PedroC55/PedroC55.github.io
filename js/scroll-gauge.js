export function initScrollGauge({ nav, name, ghost, links, linkEls, sections, fallback, nameFill, reduced }) {
  const state = { scale: 8, dx: 0, dy: 0, span: 240, depth: 1, paintedY: -1 };

  const scroller = nav.parentElement;
  function syncGutter() {
    const sb = Math.max(0, scroller.offsetWidth - scroller.clientWidth);
    nav.style.right = sb + 'px';
  }

  function measure() {
    const prevTransform = name.style.transform;
    name.style.transform = 'none';
    const nr = name.getBoundingClientRect();
    const gr = ghost.getBoundingClientRect();
    name.style.transform = prevTransform;
    state.scale = nr.width > 0 ? gr.width / nr.width : 8;
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
      const s = 1 + (state.scale - 1) * inv;
      name.style.transform =
        'translate3d(' + (state.dx * inv).toFixed(2) + 'px,' + (state.dy * inv).toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')';
    } else {
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
