import { PROJECTS } from './projects-data.js';
import { initGallery } from './gallery.js';

export function initCarousel({ rail, track, featured, reduced }) {
  let active = PROJECTS[0].id;

  const gallery = initGallery({
    root: featured.querySelector('[data-f-gallery]'),
    box: featured.querySelector('[data-f-media]'),
    caption: featured.querySelector('[data-f-medialabel]'),
    dots: featured.querySelector('[data-f-dots]'),
    prev: featured.querySelector('[data-prev]'),
    next: featured.querySelector('[data-next]'),
    reduced
  });

  /* ---- rail motion ----
   * The track holds each project twice. `period` is the distance from a card to
   * its own duplicate, so wrapping scrollLeft by exactly that amount is
   * invisible. Measured from the DOM rather than assumed, so it survives changes
   * to card width, gap or project count.
   */
  const REAL_CARDS = PROJECTS.length;
  const SPEED = 38;               // px per second, matching the old 46s marquee
  let period = 0;
  let drift = true;               // false while hovered, focused or dragging
  let raf = null;
  let last = 0;
  /* The drift advances ~0.6px per frame, and scrollLeft rounds to whole pixels,
   * so writing the increment straight back to it threw the fraction away every
   * frame and the rail crawled at a fraction of the intended speed. `pos` keeps
   * the real sub-pixel position; scrollLeft is only ever the rounded output of
   * it. `applied` lets us notice when something else (a drag, a touch pan, a
   * keyboard focus scroll) moved the rail, so we can resync instead of fighting. */
  let pos = 0;
  let applied = 0;

  function measureRail() {
    const cards = track.children;
    period = cards.length > REAL_CARDS
      ? cards[REAL_CARDS].offsetLeft - cards[0].offsetLeft
      : 0;
  }

  function norm(v) {
    if (period <= 0) return v;
    return ((v % period) + period) % period;
  }

  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (period <= 0) return;
    // Someone else moved the rail since our last write; adopt their position.
    if (Math.abs(rail.scrollLeft - applied) > 1.5) pos = rail.scrollLeft;
    if (!drift || reduced) return;
    pos = norm(pos + SPEED * dt);
    applied = Math.round(pos);
    rail.scrollLeft = applied;
  }

  function setRail(paused) {
    drift = !paused;
  }

  function markActive() {
    track.querySelectorAll('[data-card]').forEach(btn => {
      const on = btn.getAttribute('data-card') === active;
      btn.style.borderColor = on ? '#E8593F' : 'rgba(242,236,246,0.28)';
      // The duplicated half of the track is hidden from assistive tech, so only
      // the real cards carry aria-current.
      if (btn.getAttribute('aria-hidden') !== 'true') {
        btn.setAttribute('aria-current', on ? 'true' : 'false');
      }
    });
  }

  /** Write a project's copy into `root`, which is either the live panel or an
   *  offscreen clone used for measuring. */
  function fill(root, p) {
    const set = (sel, text) => {
      const el = root.querySelector(sel);
      if (el) el.textContent = text;
    };
    set('[data-f-title]', p.title);
    set('[data-f-year]', p.year);
    set('[data-f-blurb]', p.blurb);
    set('[data-f-problem]', p.problem);
    set('[data-f-decisions]', p.decisions);
    const tags = root.querySelector('[data-f-tags]');
    if (tags) {
      tags.replaceChildren(...p.tags.map(t => {
        const span = document.createElement('span');
        span.className = 'work__tag';
        span.textContent = t;
        return span;
      }));
    }
  }

  /* Hold the panel at the height of the tallest project so selecting a different
   * one never shifts the rail below it.
   *
   * This used to be a set of hand-tuned min-heights per breakpoint. That needed
   * re-measuring every time the copy, the media size or the column rules
   * changed, and it silently stopped being right at any width, zoom level or
   * font fallback that was not one of the ones measured. Here the browser
   * measures instead: every project's copy is laid out in a hidden clone at the
   * live panel's width, and the largest result becomes the floor. No magic
   * numbers, correct at any viewport.
   *
   * Without JS there is no way to change project, so the height cannot change
   * either, which is why no CSS fallback floor is needed. */
  function equalise() {
    if (!featured.parentElement || !featured.offsetWidth) return;
    const clone = featured.cloneNode(true);
    clone.querySelectorAll('.work__slide').forEach(n => n.remove());
    Object.assign(clone.style, {
      position: 'absolute', left: '0', top: '0', visibility: 'hidden',
      pointerEvents: 'none', minHeight: '0', opacity: '0',
      width: featured.offsetWidth + 'px'
    });
    clone.removeAttribute('data-featured');
    const host = featured.parentElement;
    const hostPos = getComputedStyle(host).position;
    if (hostPos === 'static') host.style.position = 'relative';
    host.appendChild(clone);

    let max = 0;
    const cap = clone.querySelector('[data-f-medialabel]');
    PROJECTS.forEach(p => {
      fill(clone, p);
      // The caption belongs to whichever slide is showing, so measure against
      // the longest one this project can display.
      if (cap && p.gallery) {
        cap.textContent = p.gallery
          .map(s => s.caption || '')
          .reduce((a, b) => (b.length > a.length ? b : a), '');
      }
      max = Math.max(max, clone.offsetHeight);
    });

    clone.remove();
    if (hostPos === 'static') host.style.position = '';
    featured.style.minHeight = max ? max + 'px' : '';
  }

  function swap(p) {
    fill(featured, p);
    gallery.load(p);
    markActive();
    featured.style.opacity = '1';
  }

  function pick(id) {
    if (id === active) return;
    const p = PROJECTS.find(x => x.id === id);
    if (!p) return;
    active = id;
    if (reduced) {
      swap(p);
      return;
    }
    featured.style.opacity = '0';
    setTimeout(() => swap(p), 200);
  }

  /* ---- grab and drag ----
   * Mouse and pen are handled here; touch is left to the browser, which already
   * pans this container natively and adds momentum we cannot match. A drag of
   * more than a few pixels swallows the click that follows it, otherwise
   * releasing over a card would also select that project.
   */
  const DRAG_SLOP = 5;
  let pending = false;      // pointer is down but has not passed the slop yet
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let moved = 0;
  let suppressClick = false;

  const onEnter = () => setRail(true);
  // A drag that wanders outside the rail must keep it paused until release.
  const onLeave = () => { if (!dragging) setRail(false); };
  rail.addEventListener('mouseenter', onEnter);
  rail.addEventListener('mouseleave', onLeave);
  rail.addEventListener('focusin', onEnter);
  rail.addEventListener('focusout', onLeave);

  const onPointerDown = e => {
    if (e.pointerType === 'touch') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Armed, but not yet dragging. Capture is deliberately NOT taken here:
    // capturing retargets the pointerup to the rail, so the browser resolves the
    // click to the common ancestor of down and up, which is the rail rather than
    // the card, and selecting a project by clicking it stops working entirely.
    pending = true;
    dragging = false;
    moved = 0;
    // A drag that ends without producing a click (released off a card, or over
    // the rail's own padding) would otherwise leave this armed and eat the next
    // genuine click on a project.
    suppressClick = false;
    startX = e.clientX;
    startScroll = rail.scrollLeft;
    setRail(true);
  };

  const onPointerMove = e => {
    if (!pending && !dragging) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (pending) {
      if (moved <= DRAG_SLOP) return;      // still could be a click, leave it alone
      pending = false;
      dragging = true;
      rail.classList.add('is-dragging');
      try { rail.setPointerCapture(e.pointerId); } catch (_) { /* best-effort */ }
    }
    // Fold the target into [0, period) before assigning. Letting it go negative
    // is not an option: the browser clamps scrollLeft at 0, so dragging to the
    // right would stick at the start instead of wrapping into the duplicate set.
    pos = norm(startScroll - dx);
    applied = Math.round(pos);
    rail.scrollLeft = applied;
  };

  const onPointerUp = e => {
    if (!pending && !dragging) return;
    const wasDragging = dragging;
    pending = false;
    dragging = false;
    if (wasDragging) {
      rail.classList.remove('is-dragging');
      try { rail.releasePointerCapture(e.pointerId); } catch (_) { /* already gone */ }
    }
    suppressClick = wasDragging && moved > DRAG_SLOP;
    // Resume drifting unless the pointer is still resting on the rail.
    if (!rail.matches(':hover')) setRail(false);
  };

  rail.addEventListener('pointerdown', onPointerDown);
  rail.addEventListener('pointermove', onPointerMove);
  rail.addEventListener('pointerup', onPointerUp);
  rail.addEventListener('pointercancel', onPointerUp);
  // Native image dragging would otherwise hijack the gesture over a card thumb.
  const onDragStart = e => e.preventDefault();
  rail.addEventListener('dragstart', onDragStart);

  const onClickCapture = e => {
    if (!suppressClick) return;
    suppressClick = false;
    e.stopPropagation();
    e.preventDefault();
  };
  rail.addEventListener('click', onClickCapture, true);

  const onClick = e => {
    const btn = e.target.closest('[data-card]');
    if (!btn) return;
    // The duplicated cards stay aria-hidden and untabbable so screen readers
    // and keyboard users only meet each project once, but they are on screen
    // as much as the originals are, so a mouse click on one has to work.
    pick(btn.getAttribute('data-card'));
  };
  track.addEventListener('click', onClick);

  const onResize = () => { measureRail(); equalise(); };
  window.addEventListener('resize', onResize);

  gallery.load(PROJECTS[0]);
  markActive();
  measureRail();
  equalise();
  // Fallback metrics are narrower than Archivo, so the first measurement can be
  // short by a line; redo it once the real face is in.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measureRail(); equalise(); });
  }
  raf = requestAnimationFrame(tick);

  return {
    teardown() {
      gallery.teardown();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      rail.removeEventListener('mouseenter', onEnter);
      rail.removeEventListener('mouseleave', onLeave);
      rail.removeEventListener('focusin', onEnter);
      rail.removeEventListener('focusout', onLeave);
      rail.removeEventListener('pointerdown', onPointerDown);
      rail.removeEventListener('pointermove', onPointerMove);
      rail.removeEventListener('pointerup', onPointerUp);
      rail.removeEventListener('pointercancel', onPointerUp);
      rail.removeEventListener('dragstart', onDragStart);
      rail.removeEventListener('click', onClickCapture, true);
      track.removeEventListener('click', onClick);
    }
  };
}
