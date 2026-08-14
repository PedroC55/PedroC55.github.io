import { initColorField } from './color-field.js';
import { initCarousel } from './carousel.js';
import { initAccordion } from './accordion.js';
import { initScrollGauge } from './scroll-gauge.js';

/* Bumped by hand when debugging a reported rendering problem, so the console
 * says straight away whether the browser is running current code or a cached
 * copy. Cheap, and it removes a whole round of guesswork. */
const BUILD = '2026-08-14-c';

function boot() {
  console.info('[portfolio] build ' + BUILD);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = document.querySelector('[data-nav]');
  const name = document.querySelector('[data-nav-name]');
  const ghost = document.querySelector('[data-hero-ghost]');
  const rail = document.querySelector('[data-rail]');
  const track = document.querySelector('[data-track]');
  const canvas = document.querySelector('[data-field]');
  const fallback = document.querySelector('[data-fallback]');
  const nameFill = document.querySelector('[data-name-fill]');
  const links = document.querySelector('[data-nav-links]');
  const linkEls = Array.from(document.querySelectorAll('[data-link]'));
  const sections = ['about', 'work', 'skills', 'contact'].map(id => document.getElementById(id));
  const featured = document.querySelector('[data-featured]');
  const skillsRoot = document.getElementById('skills');

  const compress = !reduced;

  if (!compress) {
    ghost.style.visibility = 'visible';
    name.style.opacity = '0';
    name.style.transition = 'opacity .2s ease';
  }

  const gauge = initScrollGauge({ nav, name, ghost, links, linkEls, sections, fallback, nameFill, reduced });
  gauge.measure();
  gauge.apply(compress);
  /* Started before anything else can fail. The gauge owns the name's transform,
   * and that transform is only correct while its loop is running: if the loop
   * never starts, the name stays frozen in the full-size hero pose and hangs
   * over the page as you scroll. It used to start last, after four other init
   * calls, so any one of them throwing took the nav down with it. */
  gauge.start(compress);

  /* Each remaining module is independent; one failing must not silently take
   * the others, or the gauge, with it. */
  const safe = (label, fn) => {
    try {
      return fn();
    } catch (err) {
      console.error('[portfolio] ' + label + ' failed to start:', err);
      return null;
    }
  };

  const field = safe('colour field', () => initColorField({ canvas, fallback, reduced, getDepth: gauge.getDepth }));
  const carousel = safe('work carousel', () => initCarousel({ rail, track, featured, reduced }));
  const accordion = safe('skills accordion', () => initAccordion({ root: skillsRoot, reduced }));

  function onResize() {
    gauge.measure();
    gauge.apply(compress);
    gauge.syncGutter();
    if (accordion) accordion.syncPanels();
    if (field) field.resize();
  }
  window.addEventListener('resize', onResize);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      gauge.measure();
      gauge.apply(compress);
      if (accordion) accordion.syncPanels();
    });
  }

  safe('hero entrance', () => enterHero(reduced));
  safe('keywords', () => setupKeywords());
  safe('scroll reveals', () => setupReveals(reduced));

  window.addEventListener('pagehide', () => {
    if (field) field.teardown();
    gauge.teardown();
    if (carousel) carousel.teardown();
    if (accordion) accordion.teardown();
    window.removeEventListener('resize', onResize);
  }, { once: true });
}

function enterHero(reduced) {
  // Letters are laid out at the hero size now, so the rise is already in the
  // units they are seen at and needs no scale compensation.
  const rise = 24;
  const letters = Array.from(document.querySelectorAll('[data-letter]'));
  letters.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(' + rise.toFixed(2) + 'px)';
    if (!reduced) el.style.transition = 'opacity .5s cubic-bezier(.2,.7,.2,1),transform .5s cubic-bezier(.2,.7,.2,1)';
  });
  const show = () => letters.forEach(el => {
    el.style.transitionDelay = reduced ? '0s' : (parseInt(el.getAttribute('data-letter'), 10) * 40) + 'ms';
    el.style.opacity = '1';
    el.style.transform = 'none';
  });

  const thesis = document.querySelector('[data-thesis]');
  if (thesis) {
    thesis.style.opacity = '0';
    thesis.style.transform = 'translateY(12px)';
    if (!reduced) thesis.style.transition = 'opacity .5s ease-out,transform .5s ease-out';
  }
  const reveal = () => {
    if (thesis) {
      thesis.style.opacity = '1';
      thesis.style.transform = 'none';
    }
  };

  if (reduced) {
    show();
    reveal();
    return;
  }
  setTimeout(show, 40);
  setTimeout(reveal, 1280);
}

function setupKeywords() {
  const set = (el, on) => {
    const kw = el && el.closest ? el.closest('[data-kw]') : null;
    if (!kw) return;
    const bar = kw.querySelector('[data-kwbar]');
    if (bar) bar.style.transform = on ? 'scaleX(1)' : 'scaleX(0)';
  };
  document.addEventListener('pointerover', e => set(e.target, true));
  document.addEventListener('pointerout', e => set(e.target, false));
  document.addEventListener('focusin', e => set(e.target, true));
  document.addEventListener('focusout', e => set(e.target, false));
}

/* Reveal-on-scroll for whole sections and, where a group is marked up for it,
 * for each child in turn.
 *
 * The observer arms elements only after they are collected, so no-JS and
 * failed-JS both leave the page fully visible. The root margin is positive at
 * the bottom on purpose: the previous -12% fired only once an element was well
 * inside the viewport, which meant the tall work panel pushed the project rail
 * far enough down that it sat blank in view and then popped in a moment later.
 * Starting the transition slightly before an element scrolls in means it has
 * finished arriving by the time it is properly on screen. */
function setupReveals(reduced) {
  if (reduced) return;

  const targets = [];
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const group = el.hasAttribute('data-reveal-group')
      ? Array.from(el.children).filter(c => !c.hasAttribute('aria-hidden'))
      : null;
    if (group && group.length) {
      group.forEach((child, i) => {
        child.style.setProperty('--step', String(i));
        targets.push(child);
      });
      // The group itself only schedules its children, so it must not fade too.
      el.removeAttribute('data-reveal');
    } else {
      targets.push(el);
    }
  });

  targets.forEach(el => el.classList.add('is-armed'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px 80px 0px', threshold: 0 });

  targets.forEach(el => io.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
