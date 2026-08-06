import { initColorField } from './color-field.js';
import { initCarousel } from './carousel.js';
import { initAccordion } from './accordion.js';
import { initScrollGauge } from './scroll-gauge.js';

function boot() {
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

  const field = initColorField({ canvas, fallback, reduced, getDepth: gauge.getDepth });
  const carousel = initCarousel({ rail, track, featured, reduced });
  const accordion = initAccordion({ root: skillsRoot, reduced });

  function onResize() {
    gauge.measure();
    gauge.apply(compress);
    gauge.syncGutter();
    accordion.syncPanels();
    field.resize();
  }
  window.addEventListener('resize', onResize);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      gauge.measure();
      gauge.apply(compress);
      accordion.syncPanels();
    });
  }

  enterHero(reduced, gauge.getScale());
  setupKeywords();
  setupReveals(reduced);

  gauge.start(compress);

  window.addEventListener('pagehide', () => {
    field.teardown();
    gauge.teardown();
    carousel.teardown();
    accordion.teardown();
    window.removeEventListener('resize', onResize);
  }, { once: true });
}

function enterHero(reduced, scale) {
  const rise = Math.max(3, 24 / (scale || 5));
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

function setupReveals(reduced) {
  if (reduced) return;
  const els = Array.from(document.querySelectorAll('[data-reveal]'));
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .26s ease, transform .26s ease';
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.style.opacity = '1';
        en.target.style.transform = 'none';
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.04 });
  els.forEach(el => io.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
