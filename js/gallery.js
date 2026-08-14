/* In-project image carousel for the featured work panel.
 *
 * Slides crossfade in place inside the aspect-locked media box, so the panel
 * height never changes as they cycle. Follows the same interaction contract as
 * the project rail: pauses on hover and focus-within, and never auto-advances
 * under prefers-reduced-motion (the dots still work, so the images stay
 * reachable without motion).
 *
 * Slides load progressively. Only the first slide of a project is created up
 * front; each later one is created just before it is first shown, with the
 * next one warmed one step ahead. Bake's three animated WebP are ~600KB each,
 * and building all of them eagerly would spend that on every visitor who never
 * opens the project.
 */

const INTERVAL = 4200;

/* `root` is the whole figure, `box` only the image well. Pause listeners go on
 * root because the dots sit in the footer outside the box, so focusing a dot
 * would otherwise leave the carousel advancing under the user's fingers. */
export function initGallery({ root, box, caption, dots, prev, next, reduced }) {
  let slides = [];        // slide descriptors for the active project
  let els = [];           // created <img> per index, sparse until first shown
  let index = 0;
  let timer = null;
  let paused = false;

  function build(i) {
    if (els[i]) return els[i];
    const s = slides[i];
    const img = document.createElement('img');
    img.src = s.src;
    img.alt = s.alt || '';
    img.decoding = 'async';
    img.className = 'work__slide';
    // Only the very first slide is on screen at creation time; the rest are
    // built ahead of being shown, so they must start transparent.
    img.style.opacity = i === index ? '1' : '0';
    box.appendChild(img);
    els[i] = img;
    return img;
  }

  function show(i) {
    const prev = els[index];
    index = i;
    const next = build(i);
    if (caption) caption.textContent = slides[i].caption || '';
    if (prev && prev !== next) prev.style.opacity = '0';
    next.style.opacity = '1';
    markDots();
    if (slides.length > 1) build((i + 1) % slides.length);   // warm the next one
  }

  function markDots() {
    if (!dots) return;
    Array.from(dots.children).forEach((d, i) => {
      const on = i === index;
      d.setAttribute('aria-current', on ? 'true' : 'false');
      d.classList.toggle('is-on', on);
    });
  }

  /** Step by ±1 and restart the clock, so a manual move gets a full dwell. */
  function step(delta) {
    if (slides.length < 2) return;
    show((index + delta + slides.length) % slides.length);
    start();
  }

  function renderDots() {
    const single = slides.length < 2;
    if (prev) prev.hidden = single;
    if (next) next.hidden = single;
    if (!dots) return;
    dots.hidden = single;
    dots.replaceChildren(...slides.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'work__dot';
      b.setAttribute('data-dot', String(i));
      b.setAttribute('aria-label', `Show image ${i + 1} of ${slides.length}`);
      return b;
    }));
    markDots();
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function start() {
    stop();
    if (reduced || paused || slides.length < 2) return;
    timer = setInterval(() => show((index + 1) % slides.length), INTERVAL);
  }

  /** Point the gallery at a different project and reset to its first slide. */
  function load(project) {
    stop();
    box.querySelectorAll('.work__slide').forEach(n => n.remove());
    slides = project.gallery || [];
    els = [];
    index = 0;
    if (!slides.length) {
      if (caption) caption.textContent = '';
      if (dots) { dots.replaceChildren(); dots.hidden = true; }
      return;
    }
    renderDots();
    show(0);
    start();
  }

  /* Hover and keyboard focus are tracked separately and OR'd together. Reading
   * both from one flag meant a mouse click on an arrow (which focuses it) left
   * the gallery paused until you clicked somewhere else entirely, and left the
   * arrows pinned visible with it. Only a real keyboard focus should hold it. */
  let hovered = false;
  let keyFocused = false;
  const sync = () => {
    paused = hovered || keyFocused;
    if (paused) stop(); else start();
  };
  const onEnter = () => { hovered = true; sync(); };
  const onLeave = () => { hovered = false; sync(); };
  const onFocusIn = e => {
    // :focus-visible is false for a plain mouse click, true for tab/arrow keys.
    keyFocused = e.target.matches && e.target.matches(':focus-visible');
    sync();
  };
  const onFocusOut = () => { keyFocused = false; sync(); };
  root.addEventListener('mouseenter', onEnter);
  root.addEventListener('mouseleave', onLeave);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);

  const onDot = e => {
    const b = e.target.closest('[data-dot]');
    if (!b) return;
    show(Number(b.getAttribute('data-dot')));
    start();                       // restart the clock from this slide
  };
  if (dots) dots.addEventListener('click', onDot);

  const onPrev = () => step(-1);
  const onNext = () => step(1);
  if (prev) prev.addEventListener('click', onPrev);
  if (next) next.addEventListener('click', onNext);

  // Cycling offscreen burns bandwidth and decode time for nothing.
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => (en.isIntersecting ? start() : stop()));
  }, { threshold: 0.1 });
  io.observe(box);

  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);

  return {
    load,
    teardown() {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      root.removeEventListener('mouseenter', onEnter);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      if (dots) dots.removeEventListener('click', onDot);
      if (prev) prev.removeEventListener('click', onPrev);
      if (next) next.removeEventListener('click', onNext);
    }
  };
}
