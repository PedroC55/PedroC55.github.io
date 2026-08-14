import { PROJECTS } from './projects-data.js';

export function initCarousel({ rail, track, featured, reduced }) {
  let active = PROJECTS[0].id;

  function setRail(paused) {
    if (!track || track.style.animation === 'none') return;
    track.style.animationPlayState = paused ? 'paused' : 'running';
  }

  function markActive() {
    track.querySelectorAll('[data-card]').forEach(btn => {
      const on = btn.getAttribute('data-card') === active;
      btn.style.borderColor = on ? '#E8593F' : 'rgba(242,236,246,0.28)';
      btn.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  function swap(p) {
    const set = (sel, text) => {
      const el = featured.querySelector(sel);
      if (el) el.textContent = text;
    };
    set('[data-f-title]', p.title);
    set('[data-f-year]', p.year);
    set('[data-f-blurb]', p.blurb);
    set('[data-f-problem]', p.problem);
    set('[data-f-decisions]', p.decisions);
    set('[data-f-medialabel]', p.media);
    const img = featured.querySelector('[data-f-img]');
    if (img && img.getAttribute('src') !== p.hero) {
      img.src = p.hero;
      img.alt = p.alt;
    }
    const tags = featured.querySelector('[data-f-tags]');
    if (tags) {
      tags.innerHTML = '';
      p.tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'work__tag';
        span.textContent = t;
        tags.appendChild(span);
      });
    }
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

  if (reduced) {
    track.style.animation = 'none';
    track.style.width = 'auto';
    rail.style.overflowX = 'auto';
  }

  const onEnter = () => setRail(true);
  const onLeave = () => setRail(false);
  rail.addEventListener('mouseenter', onEnter);
  rail.addEventListener('mouseleave', onLeave);
  rail.addEventListener('focusin', onEnter);
  rail.addEventListener('focusout', onLeave);

  const onClick = e => {
    const btn = e.target.closest('[data-card]');
    if (!btn || btn.getAttribute('aria-hidden') === 'true') return;
    pick(btn.getAttribute('data-card'));
  };
  track.addEventListener('click', onClick);

  markActive();

  // Warm the other heroes while the page is idle, so selecting a card swaps to
  // a decoded image instead of flashing the empty box mid-fade.
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1200));
  const cancelIdle = window.cancelIdleCallback || clearTimeout;
  const idleId = idle(() => {
    PROJECTS.forEach(p => {
      if (p.id === active) return;
      const pre = new Image();
      pre.decoding = 'async';
      pre.src = p.hero;
    });
  });

  return {
    teardown() {
      cancelIdle(idleId);
      rail.removeEventListener('mouseenter', onEnter);
      rail.removeEventListener('mouseleave', onLeave);
      rail.removeEventListener('focusin', onEnter);
      rail.removeEventListener('focusout', onLeave);
      track.removeEventListener('click', onClick);
    }
  };
}
