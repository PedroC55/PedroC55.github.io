# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely rebuild Pedro Coelho's portfolio as a single-page Editorial Dark site with Playfair Display + DM Sans, five sections (Hero, About, Skills, Work, Contact), and polished scroll-reveal animations.

**Architecture:** Two files are rebuilt from scratch — `index.html` and `assets/css/style.css`. JavaScript stays inline in `index.html`. No build tools, no frameworks, GitHub Pages compatible. particles.js removed; atmosphere comes from CSS radial gradient.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties, grid, IntersectionObserver via JS), Google Fonts CDN (Playfair Display + DM Sans).

**Spec:** `docs/superpowers/specs/2026-05-13-portfolio-redesign-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `index.html` | Full rewrite | All HTML: nav, 5 sections, footer, modal, inline JS |
| `assets/css/style.css` | Full rewrite | Design tokens, layout, components, animations, responsive |
| `assets/img/CV.jpg` | Unchanged | Profile photo |
| `_layouts/default.html` | Unchanged | Jekyll layout (not used by index.html) |

---

## Task 1: CSS Foundation — Design Tokens, Reset, Base

**Files:**
- Rewrite: `assets/css/style.css`

- [ ] **Step 1.1: Write the complete CSS foundation**

Replace the entire contents of `assets/css/style.css` with:

```css
/* ============================================================
   DESIGN TOKENS
============================================================ */
:root {
  --bg:             #0a0a0f;
  --surface:        #0d0d14;
  --border:         #1a1a1a;
  --border-light:   #111111;
  --text-primary:   #f5f0e8;
  --text-secondary: #7a6d60;
  --text-dim:       #3a3028;
  --accent:         #c8b89a;
  --accent-dim:     #2a2218;

  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;

  --section-pad-v: 96px;
  --section-pad-h: 48px;
  --nav-h: 60px;
}

/* ============================================================
   RESET
============================================================ */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

img { display: block; max-width: 100%; }
a   { color: inherit; text-decoration: none; }
ul  { list-style: none; }
button { cursor: pointer; background: none; border: none; font: inherit; }

/* ============================================================
   BASE
============================================================ */
body {
  background-color: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.6;
  min-height: 100vh;
}

/* ============================================================
   SCROLL REVEAL
============================================================ */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 1.2: Verify**

Open `index.html` in browser (or run `python3 -m http.server 8080` and visit `localhost:8080`). The page should be unstyled but load without errors.

- [ ] **Step 1.3: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: css design tokens, reset, base styles"
```

---

## Task 2: HTML Shell + Navigation

**Files:**
- Rewrite: `index.html`
- Append: `assets/css/style.css`

- [ ] **Step 2.1: Write the complete HTML shell with nav**

Replace the entire contents of `index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pedro Coelho — Game Developer</title>
  <meta name="description" content="Portfolio of Pedro Coelho, game developer specialising in VR, AR, and interactive experiences. Master's in Digital Games, University of Aveiro." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>

  <!-- ── NAVIGATION ── -->
  <nav class="nav" id="nav">
    <a class="nav-logo" href="#hero">P·C</a>
    <ul class="nav-links">
      <li><a href="#work">Work</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#skills">Skills</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>

  <main>
    <!-- sections go here in subsequent tasks -->
  </main>

  <footer class="footer">
    <span>© 2026 Pedro Coelho</span>
    <span>Game Developer — Aveiro, PT</span>
  </footer>

  <!-- ── VIDEO MODAL ── -->
  <div id="video-modal" class="modal hidden">
    <div class="modal-content">
      <button class="modal-close" id="modal-close">&times;</button>
      <iframe id="yt-frame"
              title="Project video"
              frameborder="0"
              allow="autoplay; encrypted-media"
              allowfullscreen></iframe>
    </div>
  </div>

  <script>
    /* JS added in Task 8 */
  </script>

</body>
</html>
```

- [ ] **Step 2.2: Add nav CSS to style.css**

Append to `assets/css/style.css`:

```css
/* ============================================================
   NAVIGATION
============================================================ */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-h);
  padding: 0 var(--section-pad-h);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.4s ease, border-color 0.4s ease;
  border-bottom: 1px solid transparent;
}

.nav.scrolled {
  background: rgba(10, 10, 15, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: var(--border-light);
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--accent);
  letter-spacing: 2px;
}

.nav-links {
  display: flex;
  gap: 28px;
}

.nav-links a {
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-dim);
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--accent);
}

/* ============================================================
   FOOTER
============================================================ */
.footer {
  padding: 20px var(--section-pad-h);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-dim);
}

/* ============================================================
   VIDEO MODAL
============================================================ */
.modal.hidden { display: none; }

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  position: relative;
  width: 90vw;
  max-width: 1280px;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--border);
  box-shadow: 0 0 60px rgba(200, 184, 154, 0.08);
  overflow: hidden;
}

.modal-content iframe {
  width: 100%;
  height: 100%;
  display: block;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  font-family: var(--font-display);
  font-size: 28px;
  line-height: 1;
  color: var(--accent);
  z-index: 10;
  transition: color 0.2s;
}
.modal-close:hover { color: var(--text-primary); }
```

- [ ] **Step 2.3: Verify**

Reload browser. Nav should be invisible (transparent) at top. Scrolling (once sections exist) should show the frosted glass background. Check fonts loaded in DevTools → Network tab.

- [ ] **Step 2.4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: html shell, nav, footer, modal structure"
```

---

## Task 3: Hero Section

**Files:**
- Modify: `index.html` — replace `<!-- sections go here -->` comment
- Append: `assets/css/style.css`

- [ ] **Step 3.1: Add hero HTML inside `<main>`**

Replace the comment `<!-- sections go here in subsequent tasks -->` in `index.html` with:

```html
    <!-- ── HERO ── -->
    <section class="hero" id="hero">
      <div class="hero-inner">
        <p class="hero-eyebrow">
          <span class="hero-eyebrow-line"></span>
          Game Developer — University of Aveiro
        </p>
        <h1 class="hero-name">Pedro<br>Coelho</h1>
        <div class="hero-subtitle">
          <span class="hero-subtitle-rule"></span>
          <span class="hero-subtitle-text">Crafting immersive interactive experiences — VR, AR &amp; Digital Games</span>
        </div>
        <a href="#work" class="btn-hero">See My Work</a>
      </div>
      <span class="hero-pg" aria-hidden="true">01</span>
      <div class="hero-scroll-indicator" aria-hidden="true">
        <span class="hero-scroll-label">scroll</span>
        <span class="hero-scroll-line"></span>
      </div>
    </section>

    <!-- other sections added in subsequent tasks -->
```

- [ ] **Step 3.2: Add hero CSS**

Append to `assets/css/style.css`:

```css
/* ============================================================
   HERO
============================================================ */
.hero {
  position: relative;
  min-height: 100vh;
  padding: 0 var(--section-pad-h);
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  /* Atmospheric radial glow — replaces particles.js */
  background-image: radial-gradient(
    ellipse 60% 50% at 30% 60%,
    rgba(200, 184, 154, 0.04) 0%,
    transparent 70%
  );
  overflow: hidden;
}

.hero-inner {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 900px;
}

/* Eyebrow */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 20px;
  /* load animation */
  opacity: 0;
  animation: heroFadeUp 0.7s ease 0s forwards;
}

.hero-eyebrow-line {
  display: block;
  width: 32px;
  height: 1px;
  background: var(--accent);
  flex-shrink: 0;
}

/* Name */
.hero-name {
  font-family: var(--font-display);
  font-size: clamp(72px, 10vw, 128px);
  font-weight: 900;
  line-height: 0.88;
  letter-spacing: -3px;
  color: var(--text-primary);
  margin-bottom: 28px;
  /* load animation */
  opacity: 0;
  animation: heroFadeUp 0.9s ease 0.15s forwards;
}

/* Subtitle */
.hero-subtitle {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  /* load animation */
  opacity: 0;
  animation: heroFadeUp 0.7s ease 0.5s forwards;
}

.hero-subtitle-rule {
  display: block;
  width: 40px;
  height: 1px;
  background: var(--accent);
  flex-shrink: 0;
}

.hero-subtitle-text {
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-secondary);
}

/* CTA */
.btn-hero {
  display: inline-block;
  padding: 12px 28px;
  border: 1px solid var(--accent-dim);
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--accent);
  align-self: flex-start;
  transition: background 0.2s, border-color 0.2s;
  /* load animation */
  opacity: 0;
  animation: heroFadeUp 0.6s ease 0.7s forwards;
}

.btn-hero:hover {
  background: var(--accent-dim);
  border-color: var(--accent);
}

/* Ghost page number */
.hero-pg {
  position: absolute;
  right: var(--section-pad-h);
  bottom: 40px;
  font-family: var(--font-display);
  font-size: 100px;
  font-weight: 900;
  line-height: 1;
  color: #0f0f0f;
  user-select: none;
  pointer-events: none;
}

/* Scroll indicator */
.hero-scroll-indicator {
  position: absolute;
  right: var(--section-pad-h);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.hero-scroll-label {
  font-size: 8px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-dim);
  writing-mode: vertical-rl;
}

.hero-scroll-line {
  display: block;
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, var(--text-dim), transparent);
}

/* ── Hero load keyframes ── */
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3.3: Verify**

Reload. You should see:
- Large "Pedro Coelho" in Playfair Display dominating the viewport
- Eyebrow text with leading gold rule
- Small-caps subtitle
- Outlined "See My Work" button
- Ghost "01" bottom-right
- Staggered load animations fire on page load

- [ ] **Step 3.4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: hero section — typographic cover layout with load animations"
```

---

## Task 4: About Section

**Files:**
- Modify: `index.html` — add about section after hero
- Append: `assets/css/style.css`

- [ ] **Step 4.1: Add about HTML**

In `index.html`, replace the comment `<!-- other sections added in subsequent tasks -->` with:

```html
    <!-- ── ABOUT ── -->
    <section class="about section" id="about">
      <div class="section-header reveal">
        <span class="section-num">02</span>
        <h2 class="section-title">About</h2>
        <span class="section-rule"></span>
      </div>
      <div class="about-grid">
        <div class="about-left reveal">
          <blockquote class="about-pull">
            "A passion for creating immersive interactive experiences."
          </blockquote>
          <p class="about-body">
            Hi, my name is Pedro and I'm a game developer with a passion for creating immersive interactive experiences. I'm currently deepening my knowledge through a Master's Degree in Digital Games at the University of Aveiro. This is my space to share the projects I've been working on and show a little of my journey in the world of game development.
          </p>
          <dl class="about-meta">
            <div class="about-meta-row">
              <dt>Degree</dt>
              <dd>M.Sc. Digital Games — University of Aveiro</dd>
            </div>
            <div class="about-meta-row">
              <dt>Focus</dt>
              <dd>VR · AR · Game Design · Interactive Experiences</dd>
            </div>
            <div class="about-meta-row">
              <dt>Location</dt>
              <dd>Aveiro, Portugal</dd>
            </div>
            <div class="about-meta-row">
              <dt>Status</dt>
              <dd>Open to opportunities</dd>
            </div>
          </dl>
        </div>
        <div class="about-right reveal">
          <img src="assets/img/CV.jpg" alt="Pedro Coelho" class="about-photo">
        </div>
      </div>
    </section>

    <!-- other sections added in subsequent tasks -->
```

- [ ] **Step 4.2: Add about CSS**

Append to `assets/css/style.css`:

```css
/* ============================================================
   SECTION SHARED
============================================================ */
.section {
  padding: var(--section-pad-v) var(--section-pad-h);
  border-bottom: 1px solid var(--border-light);
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 56px;
}

.section-num {
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--text-dim);
}

.section-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -1px;
  color: var(--text-primary);
}

.section-rule {
  flex: 1;
  height: 1px;
  background: var(--border);
  display: block;
}

/* ============================================================
   ABOUT
============================================================ */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 64px;
  align-items: start;
}

.about-pull {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 21px;
  line-height: 1.5;
  color: var(--accent);
  padding-left: 20px;
  border-left: 2px solid rgba(200, 184, 154, 0.25);
  margin-bottom: 28px;
}

.about-body {
  font-size: 14px;
  line-height: 1.9;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.about-meta {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.about-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
  gap: 16px;
}

.about-meta-row dt {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-dim);
  flex-shrink: 0;
}

.about-meta-row dd {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
}

.about-photo {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center top;
  border: 1px solid var(--border);
}
```

- [ ] **Step 4.3: Verify**

Reload. Scroll down past hero. You should see:
- "02 About ────" header with section rule
- Two-column layout: pull quote + bio + metadata on left, profile photo on right
- Photo fills the right column at 3:4 ratio

- [ ] **Step 4.4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: about section — two-column bio with pull quote and metadata"
```

---

## Task 5: Skills Section

**Files:**
- Modify: `index.html`
- Append: `assets/css/style.css`

- [ ] **Step 5.1: Add skills HTML**

In `index.html`, replace `<!-- other sections added in subsequent tasks -->` with:

```html
    <!-- ── SKILLS ── -->
    <section class="skills-section section" id="skills">
      <div class="section-header reveal">
        <span class="section-num">03</span>
        <h2 class="section-title">Skills</h2>
        <span class="section-rule"></span>
      </div>
      <div class="skills-grid">
        <div class="skill-cell reveal">
          <span class="skill-cat">Game Dev</span>
          <ul class="skill-tags">
            <li>Unity</li><li>Unreal Engine</li><li>Godot</li>
            <li>Pygame</li><li>Blender</li><li>Inform 7</li>
          </ul>
        </div>
        <div class="skill-cell reveal">
          <span class="skill-cat">Languages</span>
          <ul class="skill-tags">
            <li>C#</li><li>Python</li><li>Java</li>
            <li>JavaScript</li><li>Dart</li><li>Assembly</li>
          </ul>
        </div>
        <div class="skill-cell reveal">
          <span class="skill-cat">Frontend</span>
          <ul class="skill-tags">
            <li>HTML</li><li>CSS</li><li>React.js</li>
          </ul>
        </div>
        <div class="skill-cell reveal">
          <span class="skill-cat">Database</span>
          <ul class="skill-tags">
            <li>SQL</li><li>MongoDB</li><li>Apache Cassandra</li><li>Neo4j</li>
          </ul>
        </div>
        <div class="skill-cell reveal">
          <span class="skill-cat">Mobile</span>
          <ul class="skill-tags">
            <li>Android Native</li><li>Flutter</li><li>Dart</li>
          </ul>
        </div>
        <div class="skill-cell reveal">
          <span class="skill-cat">Tools</span>
          <ul class="skill-tags">
            <li>Git</li><li>GitHub</li><li>Bash</li><li>LaTeX</li><li>Docker</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- other sections added in subsequent tasks -->
```

- [ ] **Step 5.2: Add skills CSS**

Append to `assets/css/style.css`:

```css
/* ============================================================
   SKILLS
============================================================ */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
}

.skill-cell {
  background: var(--bg);
  padding: 28px 32px;
  transition: background 0.2s;
}

.skill-cell:hover {
  background: var(--surface);
}

.skill-cat {
  display: block;
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tags li {
  font-size: 11px;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 4px 10px;
  transition: border-color 0.2s, color 0.2s;
}

.skill-cell:hover .skill-tags li {
  border-color: var(--accent-dim);
}
```

- [ ] **Step 5.3: Verify**

Reload. Scroll to skills. You should see:
- "03 Skills ────" header
- 3×2 grid of cells, each with a gold category label and bordered skill tags
- Cells separated by 1px lines (the `background: var(--border)` on the grid creates the dividers)

- [ ] **Step 5.4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: skills section — 3x2 editorial grid replaces table"
```

---

## Task 6: Work / Projects Section

**Files:**
- Modify: `index.html`
- Append: `assets/css/style.css`

- [ ] **Step 6.1: Add work HTML (all 7 projects)**

In `index.html`, replace `<!-- other sections added in subsequent tasks -->` with:

```html
    <!-- ── WORK ── -->
    <section class="work section" id="work">
      <div class="section-header reveal">
        <span class="section-num">04</span>
        <h2 class="section-title">Work</h2>
        <span class="section-rule"></span>
      </div>
      <div class="projects-list">

        <article class="project-card reveal" data-video="mbHaFuriT2E">
          <div class="project-card-header">
            <span class="project-cat">VR · Survival · Game Design</span>
            <span class="project-year">2024</span>
          </div>
          <h3 class="project-title">Bake 'Em Up!</h3>
          <p class="project-desc">A survival game/cooking simulator, developed for VR, where the player is a cat baker who owns a rulote bakery. The player's goal is to protect his food truck by defeating zombies that will appear, with the breads he bakes simultaneously, where each bread has a unique power. This is a university project that I'm working on with my team. It's not finished yet, but you can see a demo of the Alpha version. In this project I'm working as a programmer where I'm responsible for everything related to the enemies (AI, Ragdoll physics, etc.), sound design and UI/UX.</p>
          <div class="project-footer">
            <ul class="project-tags"><li>Unity</li><li>VR</li><li>C#</li><li>AI</li></ul>
            <a href="https://rafinha-uwu.itch.io/bake-em-up" class="project-link" target="_blank" onclick="event.stopPropagation()">View ↗</a>
          </div>
        </article>

        <article class="project-card reveal" data-video="_AF4ouDuBSw">
          <div class="project-card-header">
            <span class="project-cat">2D Platformer · Pixel Art</span>
            <span class="project-year">2023</span>
          </div>
          <h3 class="project-title">Underground Rebellion</h3>
          <p class="project-desc">A 2D Pixelart action-platformer developed for PC where players have to defeat enemies by stealth or by tiring them out by defending themselves against their attacks through a parry system. In this project I was responsible for developing the player mechanics (from parry, dash, walljump, among others), UI/UX, tutorial and minimap system.</p>
          <div class="project-footer">
            <ul class="project-tags"><li>Unity</li><li>C#</li><li>Pixel Art</li></ul>
            <a href="https://plbc.itch.io/underground-rebellion" class="project-link" target="_blank" onclick="event.stopPropagation()">View ↗</a>
          </div>
        </article>

        <article class="project-card reveal" data-video="CxfQWhZdpqg">
          <div class="project-card-header">
            <span class="project-cat">IoT · Smart Home</span>
            <span class="project-year">2023</span>
          </div>
          <h3 class="project-title">SmartKeeper — Assistant for Active Ageing at Home</h3>
          <p class="project-desc">SmartKeeper is an assistant that serves older people in ways so they can keep their health, independency and autonomy by monitorizing everything that happens inside their home in a non-instrusive way.</p>
          <div class="project-footer">
            <ul class="project-tags"><li>IoT</li><li>Web</li><li>UX</li></ul>
            <a href="https://bernardoleandro1.github.io/PI/" class="project-link" target="_blank" onclick="event.stopPropagation()">View ↗</a>
          </div>
        </article>

        <article class="project-card reveal" data-video="J5liV26ALCs">
          <div class="project-card-header">
            <span class="project-cat">Educational · Puzzle Game</span>
            <span class="project-year">2023</span>
          </div>
          <h3 class="project-title">Calculus</h3>
          <p class="project-desc">Calculus is a casual educational puzzle game where the player finds themselves inside the notebook of a primary school student who is learning basic arithmetic. They are immediately confronted with numbers that come to life and fall from the sky, threatening to escape from the grid world. To prevent this, the player has basic numbers and the four arithmetic operations at their disposal as weapons. As the pages are turned, the basic numbers change. Can the player think faster than the speed at which the numbers fall?</p>
          <div class="project-footer">
            <ul class="project-tags"><li>Pygame</li><li>Python</li><li>Game Design</li></ul>
            <a href="https://plbc.itch.io/calculus" class="project-link" target="_blank" onclick="event.stopPropagation()">View ↗</a>
          </div>
        </article>

        <article class="project-card reveal" data-video="ZIM7osRks9c">
          <div class="project-card-header">
            <span class="project-cat">AR · Mixed Reality</span>
            <span class="project-year">2024</span>
          </div>
          <h3 class="project-title">Spy Room — Concept</h3>
          <p class="project-desc">Spy Room is an AR game concept with VR elements developed for Meta Quest, where the player controls an avatar implemented in their physical space with the goal of collecting diamonds. The game uses room scanning and spatial mapping through Meta's MRUKit to integrate virtual elements into the real environment. The main mechanic is based on a progressive difficulty system where each diamond collected spawns a new horizontal laser in the room, forcing the player to use physical agility to dodge the increasing obstacles. The project includes a collision detection system, first-person motion tracking, a scoring interface, and visual feedback. Developed in Unity with C#, Meta Quest SDK, XR Interaction Toolkit, and AR Foundation.</p>
          <div class="project-footer">
            <ul class="project-tags"><li>Unity</li><li>AR</li><li>Meta Quest</li><li>C#</li></ul>
            <a href="https://github.com/PedroC55/Spy_Room" class="project-link" target="_blank" onclick="event.stopPropagation()">View ↗</a>
          </div>
        </article>

        <article class="project-card reveal" data-link="https://github.com/PedroC55/TQS_Project">
          <div class="project-card-header">
            <span class="project-cat">Full Stack · Web</span>
            <span class="project-year">2023</span>
          </div>
          <h3 class="project-title">Software Testing and Quality — Pick Up Points System</h3>
          <p class="project-desc">The aim of this project is to develop a pick up points system for different delivery companies to use, using React, Java, Spring Boot and Docker. The system also includes unit and integration tests.</p>
          <div class="project-footer">
            <ul class="project-tags"><li>React</li><li>Java</li><li>Spring Boot</li><li>Docker</li></ul>
            <a href="https://github.com/PedroC55/TQS_Project" class="project-link" target="_blank" onclick="event.stopPropagation()">View ↗</a>
          </div>
        </article>

        <article class="project-card reveal" data-link="https://github.com/PedroC55/ICM_Project1">
          <div class="project-card-header">
            <span class="project-cat">Mobile · Android</span>
            <span class="project-year">2022</span>
          </div>
          <h3 class="project-title">Introduction to Mobile Computing — MovingCampus</h3>
          <p class="project-desc">Application that allows Erasmus students to explore the university of Aveiro, which relies on the use of location, QR Code reader and text recognition.</p>
          <div class="project-footer">
            <ul class="project-tags"><li>Android</li><li>QR Code</li><li>GPS</li><li>OCR</li></ul>
            <a href="https://github.com/PedroC55/ICM_Project1" class="project-link" target="_blank" onclick="event.stopPropagation()">View ↗</a>
          </div>
        </article>

      </div>
    </section>

    <!-- other sections added in subsequent tasks -->
```

- [ ] **Step 6.2: Add project card CSS**

Append to `assets/css/style.css`:

```css
/* ============================================================
   WORK / PROJECTS
============================================================ */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid rgba(200, 184, 154, 0.2);
  padding: 28px 32px;
  cursor: pointer;
  transition: transform 0.25s ease, border-left-color 0.25s ease, box-shadow 0.25s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  border-left-color: var(--accent);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.project-cat {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-dim);
}

.project-year {
  font-size: 9px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.project-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.project-desc {
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.project-tags li {
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--text-dim);
  border: 1px solid var(--border);
  padding: 3px 10px;
}

.project-link {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.project-link:hover { opacity: 0.7; }
```

- [ ] **Step 6.3: Verify**

Reload. Scroll to Work section. You should see:
- "04 Work ────" header
- 7 cards stacked vertically, each with a left gold accent bar
- Cards show: category label, year, serif title, full description text, tech tags, "View ↗" link
- Hovering a card lifts it 2px and brightens the accent bar

- [ ] **Step 6.4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: work section — 7 feature cards with tags and links"
```

---

## Task 7: Contact Section

**Files:**
- Modify: `index.html`
- Append: `assets/css/style.css`

- [ ] **Step 7.1: Add contact HTML**

In `index.html`, replace `<!-- other sections added in subsequent tasks -->` with:

```html
    <!-- ── CONTACT ── -->
    <section class="contact section" id="contact">
      <div class="section-header reveal">
        <span class="section-num">05</span>
        <h2 class="section-title">Contact</h2>
        <span class="section-rule"></span>
      </div>
      <div class="contact-inner reveal">
        <p class="contact-heading">Let's<br>talk.</p>
        <a href="mailto:pedrocoelho485@gmail.com" class="contact-email">pedrocoelho485@gmail.com</a>
        <div class="contact-socials">
          <a href="https://github.com/PedroC55" class="social-btn" target="_blank">GitHub</a>
          <a href="https://www.linkedin.com/in/pedrocoelho485/" class="social-btn" target="_blank">LinkedIn</a>
        </div>
      </div>
    </section>
```

- [ ] **Step 7.2: Add contact CSS**

Append to `assets/css/style.css`:

```css
/* ============================================================
   CONTACT
============================================================ */
.contact-inner {
  max-width: 520px;
}

.contact-heading {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(44px, 6vw, 64px);
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -2px;
  color: var(--text-primary);
  margin-bottom: 28px;
}

.contact-email {
  display: block;
  font-size: 15px;
  color: var(--accent);
  letter-spacing: 0.5px;
  margin-bottom: 36px;
  transition: opacity 0.2s;
}

.contact-email:hover { opacity: 0.7; }

.contact-socials {
  display: flex;
  gap: 12px;
}

.social-btn {
  display: inline-block;
  padding: 9px 20px;
  border: 1px solid var(--border);
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--text-dim);
  transition: border-color 0.2s, color 0.2s;
}

.social-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
```

- [ ] **Step 7.3: Verify**

Reload. Scroll to bottom. You should see:
- "05 Contact ────" header
- Large italic "Let's / talk." heading in Playfair
- Gold email address (clicking it opens mail client)
- GitHub + LinkedIn outlined buttons
- Footer line: "© 2026 Pedro Coelho" / "Game Developer — Aveiro, PT"

- [ ] **Step 7.4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: contact section and footer"
```

---

## Task 8: JavaScript — Reveals, Nav, Modal, Smooth Scroll

**Files:**
- Modify: `index.html` — replace `<script>/* JS added in Task 8 */</script>`

- [ ] **Step 8.1: Replace the script block**

In `index.html`, replace `<script>/* JS added in Task 8 */</script>` with:

```html
  <script>
    /* ── Nav background on scroll ── */
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ── Smooth scroll for nav links ── */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    /* ── Scroll reveal (IntersectionObserver) ── */
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    /* Stagger project cards and skill cells */
    document.querySelectorAll('.project-card.reveal').forEach((el, i) => {
      el.style.transitionDelay = (i * 80) + 'ms';
    });
    document.querySelectorAll('.skill-cell.reveal').forEach((el, i) => {
      el.style.transitionDelay = (i * 60) + 'ms';
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ── Video modal ── */
    const modal       = document.getElementById('video-modal');
    const ytFrame     = document.getElementById('yt-frame');
    const modalClose  = document.getElementById('modal-close');

    function openModal(videoId) {
      ytFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&rel=0&playsinline=1`;
      modal.classList.remove('hidden');
    }

    function closeModal() {
      modal.classList.add('hidden');
      ytFrame.src = '';
    }

    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const vid  = card.dataset.video;
        const href = card.dataset.link;
        if (vid)  openModal(vid);
        else if (href) window.open(href, '_blank');
      });
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    /* Close modal on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
  </script>
```

- [ ] **Step 8.2: Verify**

Reload page. Test:
1. Scroll down — nav gains frosted glass background after 40px
2. Click a nav link — smooth scrolls to section
3. Section headers, about content, skill cells, and project cards all fade up as you scroll into them
4. Click a project card with a video (e.g., Bake 'Em Up!) — modal opens with YouTube embed
5. Click the × or press Escape — modal closes, video stops
6. Click a project card without video (Pick Up Points, MovingCampus) — opens GitHub in new tab
7. Click "View ↗" link on a card — navigates without triggering the card click

- [ ] **Step 8.3: Commit**

```bash
git add index.html
git commit -m "feat: scroll reveal, nav scroll, modal, smooth scroll, keyboard close"
```

---

## Task 9: Responsive CSS

**Files:**
- Append: `assets/css/style.css`

- [ ] **Step 9.1: Add responsive media queries**

Append to `assets/css/style.css`:

```css
/* ============================================================
   RESPONSIVE — Tablet (640px–1023px)
============================================================ */
@media (max-width: 1023px) {
  :root {
    --section-pad-v: 64px;
    --section-pad-h: 32px;
  }

  /* About: single column, photo on top */
  .about-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .about-right {
    order: -1;
  }

  .about-photo {
    width: 200px;
    aspect-ratio: 1 / 1;
    object-position: center top;
  }

  /* Skills: 2-column */
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ============================================================
   RESPONSIVE — Mobile (<640px)
============================================================ */
@media (max-width: 639px) {
  :root {
    --section-pad-v: 48px;
    --section-pad-h: 20px;
  }

  /* Nav: hide links on mobile */
  .nav-links { display: none; }

  /* Hero */
  .hero-name {
    letter-spacing: -2px;
  }

  .hero-scroll-indicator { display: none; }

  .hero-pg { font-size: 64px; }

  /* Skills: single column */
  .skills-grid { grid-template-columns: 1fr; }

  /* Project cards */
  .project-card { padding: 20px; }

  .project-footer { flex-direction: column; align-items: flex-start; gap: 12px; }

  /* Section title */
  .section-title { font-size: 28px; }

  /* Contact */
  .contact-heading { font-size: 40px; letter-spacing: -1px; }

  /* Modal */
  .modal-content {
    width: 100vw;
    aspect-ratio: auto;
  }
  .modal-content iframe { height: 56.25vw; }

  /* Footer */
  .footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
```

- [ ] **Step 9.2: Verify responsive**

Use browser DevTools to test at:
- 375px (iPhone SE) — nav shows only monogram, single column layout, readable hero name
- 768px (tablet) — 2-column skills, single-column about with photo at top
- 1280px (desktop) — full two-column about, 3×2 skills grid

- [ ] **Step 9.3: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: responsive layout — tablet and mobile breakpoints"
```

---

## Task 10: Final Verification Checklist

- [ ] **Step 10.1: Content check**

Verify all content is present and correct:
- [ ] Name: "Pedro Coelho"
- [ ] Bio paragraph: full text preserved
- [ ] All 7 projects present with original descriptions
- [ ] All itch.io links work (Bake 'Em Up!, Underground Rebellion, Calculus)
- [ ] All GitHub links work (Spy Room, TQS Project, ICM Project)
- [ ] SmartKeeper external link works
- [ ] Email: `mailto:pedrocoelho485@gmail.com`
- [ ] GitHub profile: `https://github.com/PedroC55`
- [ ] LinkedIn: `https://www.linkedin.com/in/pedrocoelho485/`
- [ ] All 5 video IDs correct: `mbHaFuriT2E`, `_AF4ouDuBSw`, `CxfQWhZdpqg`, `J5liV26ALCs`, `ZIM7osRks9c`

- [ ] **Step 10.2: Visual check**

- [ ] Fonts loaded: Playfair Display (headings) and DM Sans (body) — verify in DevTools
- [ ] Hero name animates in on load
- [ ] Nav is transparent on hero, frosted glass when scrolled
- [ ] Section reveals fire as you scroll
- [ ] Skill cell stagger works (cells appear one by one)
- [ ] Project card stagger works
- [ ] Card hover: lifts + accent bar brightens
- [ ] Social button hover: border turns gold
- [ ] Contact email hover: subtle opacity change
- [ ] No leftover particles.js `<script>` tag anywhere

- [ ] **Step 10.3: Modal check**

- [ ] Clicking Bake 'Em Up! card opens YouTube video
- [ ] Clicking × closes modal and clears iframe src
- [ ] Clicking backdrop closes modal
- [ ] Pressing Escape closes modal
- [ ] Clicking "View ↗" link does NOT trigger the card modal (stopPropagation works)

- [ ] **Step 10.4: Accessibility spot-check**

- [ ] `<img>` has `alt` attribute
- [ ] Modal close button is a `<button>` (keyboard accessible)
- [ ] Nav links have proper `href` anchors
- [ ] Hero ghost elements have `aria-hidden="true"`

- [ ] **Step 10.5: Final commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: complete portfolio rebuild — editorial dark, playfair display, 5-section layout"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Editorial Dark aesthetic with Playfair Display + DM Sans
- ✅ CSS custom properties for entire design system
- ✅ Hero: typographic cover, eyebrow, name, subtitle, CTA, ghost number, scroll indicator
- ✅ Hero load animations: staggered eyebrow → name → subtitle → CTA
- ✅ About: two-column with pull quote, full bio, metadata rows, photo
- ✅ Skills: 3×2 editorial grid replacing table
- ✅ Work: 7 feature cards with left accent bar, category, year, title, description, tags, link
- ✅ Contact: italic "Let's talk." heading, email, social buttons
- ✅ Footer: one-line with copyright + location
- ✅ Modal: restyled, keyboard Escape to close, existing video IDs preserved
- ✅ IntersectionObserver scroll reveals with stagger for cards and cells
- ✅ Nav: transparent → frosted glass on scroll, smooth scroll
- ✅ Responsive: tablet (2-col skills, stacked about) and mobile (single col, no nav links)
- ✅ particles.js removed, replaced with CSS radial-gradient atmosphere
- ✅ All original content preserved verbatim
- ✅ mailto: prefix fixed on email link

**No placeholders found.**  
**Type consistency verified** — all class names used in HTML match CSS definitions.
