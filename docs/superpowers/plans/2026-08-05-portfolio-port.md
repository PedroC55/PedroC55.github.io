# Portfolio Static Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Claude-Design export (`Pedro Coelho - Portfolio.dc.html` + `support.js`) into a dependency-free, modular static site (native HTML/CSS/ES modules, no build step) deployable on GitHub Pages, preserving the visual behavior and animations exactly, swapping the "Pick Up Points" project for "Creative Learning", self-hosting fonts, and meeting the performance/accessibility/deploy requirements the user specified.

**Architecture:** One `index.html` with semantic landmarks and a skip link. `css/styles.css` holds every visual rule (CSS custom properties for the site's palette, self-hosted `@font-face`). Six independent native ES modules — `projects-data.js`, `color-field.js`, `carousel.js`, `accordion.js`, `scroll-gauge.js`, `main.js` — replace the current `support.js` "DC" component runtime. `main.js` is the only script tag in the page and wires everything together on `DOMContentLoaded`. There is no test framework for this static/visual codebase, so verification steps in this plan are code-level checks, computed contrast/behavior audits, and Lighthouse/console runs rather than unit tests.

**Tech stack:** HTML5, CSS3 (custom properties, `clamp()`, `IntersectionObserver`), vanilla ES modules, raw WebGL1 (no library) for the animated field, self-hosted WOFF2 fonts, Lighthouse via `npx` for the performance check.

**Source of truth:** `Pedro Coelho - Portfolio.dc.html` (751 lines, read in full) is the exact visual/behavioral reference. Every value below is transcribed from it. Do not consult `support.js` for markup/behavior — it is only the DC template-engine runtime being replaced, not a source of truth for this site's content.

**Decisions already confirmed with the user (do not re-litigate):**
- Creative Learning replaces "Pick Up Points" **in the same list position** (last item), not reordered to the front despite being the newest project. This preserves the "substituir" instruction literally; flagged to the user as a possible follow-up, not to be silently "fixed."
- Media caption for Creative Learning: *"A multi-tenant Learning Management System connecting companies, trainers, and trainees on a single platform"*.
- "The problem" / "Decisions I made" copy for Creative Learning was supplied verbatim by the user (see Task 3).
- OG/Twitter preview image: reuse the existing `.thumbnail` (WebP, 632×367) at repo root, copied to `Assets/og-image.webp`.
- The `Pedro Coelho - Portfolio.dc.html` and `support.js` source files are **not deleted** — they're gitignored (Task 14) so they stay available locally as the porting reference without shipping to Pages.

**Explicitly flagged, not silently changed (per user's "don't fix design on your own initiative" instruction):**
1. `this.zones = document.querySelectorAll('[data-tone]')` in the source is assigned but never read anywhere in the Component class — genuinely dead code. It is **not** ported (see Task 7 note). This has zero visual effect either way; flagging only because the plan omits something that exists in the source.
2. The carousel renders each project **twice** (`for (let pass = 0; pass < 2; pass++)`) to make the CSS `translateX(-50%)` marquee loop seamlessly — this is required for the animation to loop without a visible jump, so both copies are kept. The second copy gets `aria-hidden="true" tabindex="-1"` so keyboard/screen-reader users don't tab through every project twice — this is an accessibility-only change (zero visual/animation difference) directly serving the user's own explicit "full keyboard navigation" requirement (section 4), not a design opinion.
3. The rail's pause-on-focus behavior is implemented with `focusin`/`focusout` (bubbling) rather than a literal `onFocus`/`onBlur` on the wrapper div, because non-bubbling focus/blur on a non-focusable wrapper would not fire when a card inside it receives focus. This preserves the *intended* behavior (auto-scroll pauses while any card is focused) faithfully; it does not change anything visible.
4. **FOUC fix added after Task 6's code-quality review.** `accordion.js`'s `initAccordion()` — an exact, verbatim port of the source's `setupAccordion()`/`syncPanels()` — never touches `.acc-inner` opacity/transform at init (only `setRow()`, triggered by clicks, does). The *original* DC export relied on the initially-open "Frontend" row's `data-acc-inner` markup simply omitting the closed-state `opacity:0;transform:translateY(8px)` inline styles that every other (closed) row has, so it rendered visible from first paint with no JS needed. My Task 11 CSS instead centralized that closed-state look into one shared `.acc-inner` class applied uniformly — which would have made the Frontend row's content invisible *permanently* (not just a flash) until manually toggled, since nothing at init ever sets its opacity back to 1. Fixed by restoring the original technique: Task 9's Frontend row now carries `style="opacity:1;transform:none"` on its `.acc-inner` and `style="max-height:1000px"` on its `.acc-panel` (this second one closes a related, milder FOUC gap the same reviewer found: `.acc-panel` had no default `max-height`, so on a slow load all 8 panels would render at full height before JS collapses 7 of them — Task 11's `.acc-panel` rule now defaults to `max-height: 0`). Both fixes are in HTML/CSS only; `accordion.js` itself (already reviewed and committed) is untouched.

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `index.html` | Create (replaces deleted tracked file) | Semantic markup, meta/OG/Twitter tags, favicon links, skip link, loads `js/main.js` as a module |
| `css/styles.css` | Create | Every visual rule for the site, CSS custom properties, self-hosted `@font-face`, keyframes, focus-visible, skip-link, reduced-motion overrides |
| `fonts/*.woff2` | Create | Self-hosted Archivo (variable, wdth+wght) and JetBrains Mono (400/500) subset to latin + latin-ext |
| `js/projects-data.js` | Create | The `PROJECTS` array — single source of truth; adding a project means editing only this file |
| `js/color-field.js` | Create | WebGL shader init/draw/resize/teardown + the `<768px`/no-WebGL fallback |
| `js/carousel.js` | Create | Rail pause-on-hover/focus, card click → featured panel swap, active-card highlight |
| `js/accordion.js` | Create | Single-open skills accordion, `aria-expanded`, reduced-motion instant toggle |
| `js/scroll-gauge.js` | Create | Hero name compression, scroll-driven depth/gauge painting, active nav-link tracking, the rAF+interval ticker |
| `js/main.js` | Create | Boot orchestration, hero letter entrance, keyword hover underline, `IntersectionObserver` reveals, `pagehide` teardown wiring |
| `Assets/favicon.svg` | Create | Favicon (site's "P" monogram, brand colors) |
| `Assets/apple-touch-icon.png` | Create | 180×180 raster fallback for iOS home-screen icon |
| `Assets/og-image.webp` | Create (copy of `.thumbnail`) | Open Graph / Twitter Card preview image |
| `.gitignore` | Modify | Add `Pedro Coelho - Portfolio.dc.html` and `support.js` so the DC export source stays local-only |

---

## Task 1: Self-host the webfonts

**Files:**
- Create: `fonts/archivo-variable-latin.woff2`, `fonts/archivo-variable-latin-ext.woff2`
- Create: `fonts/jetbrains-mono-400-latin.woff2`, `fonts/jetbrains-mono-400-latin-ext.woff2`, `fonts/jetbrains-mono-500-latin.woff2`, `fonts/jetbrains-mono-500-latin-ext.woff2`
- Reference for the `@font-face` rules: Task 2

The source loads `Archivo:wdth,wght@100..125,300..700` (variable font, used for headings and body via `font-variation-settings: 'wdth' 100|112|118|125`) and `JetBrains+Mono:wght@400;500` (two static weights) from Google Fonts at runtime. The spec requires **zero runtime Google Fonts requests**, so both families must be downloaded and self-hosted, subset to latin + latin-ext only.

- [ ] **Step 1: Fetch Google's generated CSS with a modern-browser UA (so it returns woff2, not woff/ttf)**

```bash
curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,300..700&family=JetBrains+Mono:wght@400;500&display=swap" \
  -o "$TEMP/gf.css"
cat "$TEMP/gf.css"
```

Expected: a CSS file containing multiple `@font-face` blocks, each with a `unicode-range` (`U+0000-00FF...` = latin, `U+0100-024F...` = latin-ext, plus other scripts to discard) and a `src: url(https://fonts.gstatic.com/...) format('woff2')`.

- [ ] **Step 2: Identify the latin and latin-ext blocks for each family**

For `Archivo`, keep the two `@font-face` blocks whose `unicode-range` starts with `U+0000-00FF` (latin) and `U+0100-024F` (latin-ext) — there will be one block per subset since it's a single variable font covering the whole `wdth`/`wght` range in each. Note the exact `font-weight` (e.g. `300 700`) and `font-stretch` (e.g. `75% 125%` or similar — Google expresses the `wdth` axis as `font-stretch`) values from those blocks; they must be copied verbatim into the local `@font-face` rule.

For `JetBrains Mono`, keep 4 blocks: weight 400 × {latin, latin-ext} and weight 500 × {latin, latin-ext}.

- [ ] **Step 3: Download each kept woff2 file**

```bash
curl -s "<url from the Archivo latin block>" -o fonts/archivo-variable-latin.woff2
curl -s "<url from the Archivo latin-ext block>" -o fonts/archivo-variable-latin-ext.woff2
curl -s "<url from the JetBrains Mono 400 latin block>" -o fonts/jetbrains-mono-400-latin.woff2
curl -s "<url from the JetBrains Mono 400 latin-ext block>" -o fonts/jetbrains-mono-400-latin-ext.woff2
curl -s "<url from the JetBrains Mono 500 latin block>" -o fonts/jetbrains-mono-500-latin.woff2
curl -s "<url from the JetBrains Mono 500 latin-ext block>" -o fonts/jetbrains-mono-500-latin-ext.woff2
```

- [ ] **Step 4: Verify each file is a real woff2, not an HTML error page**

```bash
for f in fonts/*.woff2; do echo "$f: $(head -c4 "$f" | xxd -p)"; done
```

Expected: every file's first 4 bytes are `774f4632` (`wOF2` magic number). If any file shows `3c68746d` (`<htm`) or similar, the URL was wrong — re-check Step 2.

- [ ] **Step 5: Commit**

```bash
git add fonts/
git commit -m "chore: self-host Archivo and JetBrains Mono, subset to latin + latin-ext"
```

---

## Task 2: `css/styles.css` — variables, base, fonts

**Files:**
- Create: `css/styles.css` (this task writes the top of the file; Tasks 6–11 append the rest of the same file)

- [ ] **Step 1: Write the custom-property palette, reset, base rules, and self-hosted `@font-face`**

```css
/* ---- font faces (self-hosted, see Task 1) ----
 * weight/stretch/unicode-range values below are the ACTUAL values Google's
 * CSS2 endpoint returned when Task 1 fetched them (verified independently by
 * the Task 1 code-quality reviewer against a fresh pull) — not placeholders.
 */
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 300 700;
  font-stretch: 100% 125%;
  font-display: swap;
  src: url('../fonts/archivo-variable-latin.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 300 700;
  font-stretch: 100% 125%;
  font-display: swap;
  src: url('../fonts/archivo-variable-latin-ext.woff2') format('woff2-variations');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/jetbrains-mono-400-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/jetbrains-mono-400-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('../fonts/jetbrains-mono-500-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('../fonts/jetbrains-mono-500-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* Note: jetbrains-mono-400-* and jetbrains-mono-500-* are byte-identical files
 * (Google currently serves the same physical asset for both weight
 * declarations of this family). This is expected upstream behavior, not a
 * bug — weight 500 will render visually the same as 400 for JetBrains Mono
 * on this site; no fix needed, just don't spend time debugging it later. */

/* ---- palette & tokens (values transcribed 1:1 from the DC export) ---- */
:root {
  --c-void: #120A1C;
  --c-deep: #1E1230;
  --c-mid: #331C4D;
  --c-lift: #4E2C75;
  --c-accent: #E8593F;
  --ink-rgb: 242, 236, 246;
  --c-ink: rgb(var(--ink-rgb));
  --c-ink-muted: #C6B6DC;
  --font-sans: Archivo, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --pad-inline: clamp(20px, 5.5vw, 104px);
}

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }

body {
  margin: 0;
  background: var(--c-void);
  color: var(--c-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

.page { position: relative; color: var(--c-ink); overflow-x: hidden; }

::selection { background: var(--c-ink); color: var(--c-deep); }

a { color: var(--c-ink); text-decoration: none; }
a:hover { color: var(--c-ink-muted); }

button { font: inherit; color: inherit; background: none; border: 0; }

a:focus-visible, button:focus-visible, [tabindex]:focus-visible {
  outline: 2px solid var(--c-ink);
  outline-offset: 4px;
  border-radius: 1px;
}

[data-kw]:hover [data-kwbar],
[data-kw]:focus [data-kwbar],
[data-kw]:focus-visible [data-kwbar] {
  transform: scaleX(1) !important;
}

.skip-link {
  position: absolute;
  top: -48px;
  left: 12px;
  z-index: 100;
  background: var(--c-ink);
  color: var(--c-deep);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 10px 16px;
  transition: top .2s ease;
}
.skip-link:focus { top: 12px; }
@media (prefers-reduced-motion: reduce) { .skip-link { transition: none; } }

@keyframes om-drift {
  from { background-position: 0 0, 0 0, 0 0, 0 0; }
  to { background-position: 7vw -5vh, -6vw 4vh, 5vw 6vh, -8vw -7vh; }
}
@keyframes om-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

- [ ] **Step 2: Sanity-check the file parses**

```bash
npx -y stylelint --no-config-basedir --config '{"rules":{}}' css/styles.css
```

Expected: no "Unexpected syntax" / parse errors (stylelint with an empty ruleset only fails on genuinely broken CSS, not style opinions).

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: add base stylesheet with self-hosted font-face and design tokens"
```

---

## Task 3: `js/projects-data.js`

**Files:**
- Create: `js/projects-data.js`

This is the single file to edit when adding a project — it must export exactly the shape the other modules expect: `{ id, title, year, blurb, problem, decisions, tags, media }`.

- [ ] **Step 1: Write the file**

```js
export const PROJECTS = [
  {
    id: 'condeixa', title: 'Condeixa XR', year: '2025',
    blurb: "A geolocated augmented-reality PWA for the Município de Condeixa-a-Nova: a map of points of interest, an AR mode with image tracking over real facades, an embedded 360º tour, and every piece of content editable by the town's own staff.",
    problem: "Visitors arrive on foot with one hand free and no appetite for installing an app. The heritage story lives on plaques nobody reads, and the municipality had no way to update it without a developer.",
    decisions: "A PWA instead of native, so a QR code on site is the whole install step. Image tracking against the buildings themselves rather than GPS-anchored overlays, because GPS drifts by metres and a facade doesn't. MapLibre over a proprietary SDK for styling control and no per-view billing. Sanity as the CMS, so POIs and 360º scenes ship without a deploy.",
    tags: ['MindAR.js', 'MapLibre', 'Sanity CMS', 'PWA'],
    media: 'AR mode — tracking a facade'
  },
  {
    id: 'pacheca', title: 'Quinta da Pacheca', year: '2025',
    blurb: "A rebuilt interactive 360º tour of a Douro wine estate — cellar, vineyard and rooms walkable in sequence, with VR playback for on-site headsets.",
    problem: "The existing virtual tour was a dead end: disconnected panoramas, no sense of the route through the estate, and nothing that worked in a headset. Bookings depend on people believing the place before they drive three hours to it.",
    decisions: "Rebuilt the tour as a connected graph of scenes so movement follows how a guide actually walks a visitor through. Designed the hotspot and caption layer in Figma first, then built it in 3DVista rather than a custom viewer, so the estate's own team can re-shoot and replace scenes. Kept the UI light enough to hold framerate in VR.",
    tags: ['3DVista', 'Figma', 'VR'],
    media: 'Cellar panorama'
  },
  {
    id: 'nb', title: 'Grupo NB Tour', year: '2025',
    blurb: "A 360º walkthrough of a residential complex in Aveiro, built for sales while the buildings were still unfinished.",
    problem: "Apartments had to be sold off-plan. Renders convince nobody about scale, light or how far the balcony really is from the street.",
    decisions: "Anchored the tour on real captured space rather than renders wherever construction allowed it, and kept a consistent eye height between scenes so rooms read at true scale. Structured navigation by unit type, so a buyer only walks the apartment they are considering.",
    tags: ['3DVista', '360º capture'],
    media: 'Unit walkthrough'
  },
  {
    id: 'spy', title: 'Spy Room', year: '2024',
    blurb: "Mixed reality for Meta Quest: room scanning turns the player's own space into the level.",
    problem: "A mixed-reality level cannot be authored in advance — every player's room has different walls, furniture and free floor. The design has to survive geometry it has never seen.",
    decisions: "Built the level generation on scene-understanding data: walls become surfaces for objectives, furniture becomes cover, and free floor sets the play area. Every placement rule has a fallback for cramped rooms, and the game refuses to start rather than spawning something inside a sofa.",
    tags: ['Unity', 'C#', 'Meta Quest SDK'],
    media: 'Room scan pass'
  },
  {
    id: 'bake', title: "Bake 'Em Up!", year: '2024',
    blurb: "A VR survival game about baking under pressure — hand-driven interaction and a strict performance budget on standalone hardware.",
    problem: "Standalone headsets give you no headroom: drop frames and players feel it in their stomach. The game still had to keep several physics-driven objects in the air at once.",
    decisions: "Budgeted the frame first and designed within it — pooled objects, simplified colliders, baked lighting. Made every interaction physical rather than menu-driven, so the difficulty comes from handling things, not from reading UI.",
    tags: ['Unity', 'C#', 'VR'],
    media: 'Kitchen scene'
  },
  {
    id: 'creative-learning', title: 'Creative Learning', year: '2026',
    blurb: "Multi-tenant e-learning platform for corporate training across companies and roles.",
    problem: "A training company managing courses across multiple client companies needed a platform where four very different users — the training company, participating companies, trainers, and trainees — could each see only what's relevant to them. The existing WordPress setup wasn't built for this: no clean way to scope courses, enrollments and progress by company, no secure quiz-taking flow, and no protection against a user seeing another company's data. The brief was to turn a CMS into a role-aware, multi-tenant LMS without starting from scratch.",
    decisions: "I kept WordPress as the backend (Tutor LMS for course structure, ACF for custom fields) and built a React frontend on top, talking to a custom REST API layer rather than stitching together native endpoints. Server-side identity checks — never trusting a company or user ID sent from the client — became the backbone of every endpoint, since that's the only real boundary between companies. For quizzes, I moved all answer state into memory and submitted everything in one shot at the end, with a stricter, harder-to-interrupt session running only during an active attempt. A recurring platform quirk — a known conflict between ACF and the LMS plugin silently dropping certain fields — meant falling back to direct database reads in a few places instead of trusting the higher-level API, a reminder that 'supported' integrations don't always hold up under compound requirements.",
    tags: ['React.js', 'WordPress', 'ACF', 'REST API'],
    media: 'A multi-tenant Learning Management System connecting companies, trainers, and trainees on a single platform'
  }
];
```

- [ ] **Step 2: Verify it's syntactically valid ESM**

```bash
node --input-type=module -e "import('./js/projects-data.js').then(m => console.log(m.PROJECTS.length, m.PROJECTS.map(p => p.id)))"
```

Expected: `7 [ 'condeixa', 'pacheca', 'nb', 'spy', 'bake', 'creative-learning' ]` — wait, that's 6 ids printed for length 7; recount: condeixa, pacheca, nb, spy, bake, creative-learning = 6 total entries (pickup was removed, creative-learning added — net count stays at 6, not 7). Expected output is actually `6 [ 'condeixa', 'pacheca', 'nb', 'spy', 'bake', 'creative-learning' ]`.

- [ ] **Step 3: Commit**

```bash
git add js/projects-data.js
git commit -m "feat: add projects data module with Creative Learning replacing Pick Up Points"
```

---

## Task 4: `js/color-field.js`

**Files:**
- Create: `js/color-field.js`

Ports `initField`/`sizeField`/`drawField` from the Component class verbatim (shader source unchanged), adds explicit WebGL context release on teardown (`WEBGL_lose_context`), and keeps the exact same fallback rule (`window.innerWidth < 768` or context-creation failure ⇒ hide canvas, show `.field-fallback`). The 33ms redraw interval (~30.3fps) is preserved unchanged — this **is** the 30fps cap the user asked to confirm.

- [ ] **Step 1: Write the file**

```js
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const FS = [
  'precision mediump float;',
  'uniform vec2 uRes;uniform float uT;uniform float uD;',
  'vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}',
  'vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}',
  'vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}',
  'float snoise(vec2 v){const vec4 C=vec4(0.211324865,0.366025403,-0.577350269,0.024390243);',
  'vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);',
  'vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);',
  'vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);',
  'vec3 pp=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));',
  'vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;',
  'vec3 x=2.*fract(pp*C.www)-1.;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;',
  'm*=1.79284291-0.85373472*(a0*a0+h*h);',
  'vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;',
  'return 130.*dot(m,g);}',
  'float fbm(vec2 p){float s=0.,a=0.55;for(int i=0;i<4;i++){s+=a*snoise(p);p*=2.03;a*=0.5;}return s;}',
  'void main(){',
  'vec2 uv=gl_FragCoord.xy/uRes;float ar=uRes.x/uRes.y;',
  'vec2 p=vec2(uv.x*ar,uv.y);float t=uT;',
  'float f1=fbm(p*1.05+vec2(t*0.019,-t*0.012));',
  'float f2=fbm(p*0.78+vec2(-t*0.014,t*0.010)+4.7);',
  'vec3 VOID=vec3(0.071,0.039,0.110),DEEP=vec3(0.118,0.071,0.188),MID=vec3(0.200,0.110,0.302),LIFT=vec3(0.306,0.173,0.459),EMB=vec3(0.910,0.349,0.247);',
  'vec3 c=mix(VOID,DEEP,smoothstep(-0.6,0.55,f1));',
  'c=mix(c,MID,smoothstep(0.05,0.85,f2));',
  'c=mix(c,LIFT,smoothstep(0.45,1.05,f1*0.6+f2*0.6));',
  'vec2 ec=vec2((0.30+0.34*snoise(vec2(t*0.013,1.7)))*ar,0.34+0.32*snoise(vec2(2.3,t*0.010)));',
  'float r=0.145+0.025*snoise(vec2(t*0.026,5.1));',
  'c=mix(c,EMB,smoothstep(r,0.0,distance(p,ec))*0.5);',
  'c*=uD;',
  'vec3 lin=pow(c,vec3(2.2));float L=dot(lin,vec3(0.2126,0.7152,0.0722));',
  'if(L>0.115)c*=pow(0.115/L,1.0/2.2);',
  'gl_FragColor=vec4(c,1.);}'
].join('\n');

export function initColorField({ canvas, fallback, reduced, getDepth }) {
  const narrow = window.innerWidth < 768;
  let gl = null;
  if (!narrow) {
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    } catch (e) {
      gl = null;
    }
  }

  if (!gl) {
    canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
    return { resize() {}, teardown() {} };
  }

  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
    return { resize() {}, teardown() {} };
  }

  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uT = gl.getUniformLocation(prog, 'uT');
  const uD = gl.getUniformLocation(prog, 'uD');

  function sizeField() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  function drawField(t) {
    gl.uniform1f(uT, t);
    gl.uniform1f(uD, getDepth ? getDepth() : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  sizeField();
  drawField(reduced ? 8.4 : 0);

  let dead = false;
  let fieldTimer = null;
  let onVis = null;

  if (!reduced) {
    const t0 = Date.now();
    // 33ms interval ≈ 30.3fps — this is the fps cap. Do not lower the interval.
    fieldTimer = setInterval(() => {
      if (dead || document.hidden) return;
      drawField((Date.now() - t0) / 1000);
    }, 33);
    onVis = () => {
      if (!document.hidden) drawField((Date.now() - t0) / 1000);
    };
    document.addEventListener('visibilitychange', onVis);
  }

  return {
    resize: sizeField,
    teardown() {
      if (dead) return;
      dead = true;
      if (fieldTimer) clearInterval(fieldTimer);
      if (onVis) document.removeEventListener('visibilitychange', onVis);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  };
}
```

- [ ] **Step 2: Verify it parses as valid ESM**

```bash
node --input-type=module -e "import('./js/color-field.js').then(m => console.log(typeof m.initColorField))"
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add js/color-field.js
git commit -m "feat: add WebGL color-field module with explicit context teardown"
```

---

## Task 5: `js/carousel.js`

**Files:**
- Create: `js/carousel.js`

Ports `setupRail`/`setRail`/`pick`/`markActive` verbatim. Replaces the DC `sc-for` + inline `onClick`/`onMouseEnter`/etc. bindings with a single delegated click listener plus `focusin`/`focusout`/`mouseenter`/`mouseleave` on the rail wrapper (see the flagged note at the top of this plan about why `focusin`/`focusout` is used).

- [ ] **Step 1: Write the file**

```js
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

  return {
    teardown() {
      rail.removeEventListener('mouseenter', onEnter);
      rail.removeEventListener('mouseleave', onLeave);
      rail.removeEventListener('focusin', onEnter);
      rail.removeEventListener('focusout', onLeave);
      track.removeEventListener('click', onClick);
    }
  };
}
```

- [ ] **Step 2: Verify it parses as valid ESM**

```bash
node --input-type=module -e "import('./js/carousel.js').then(m => console.log(typeof m.initCarousel))"
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add js/carousel.js
git commit -m "feat: add carousel module for the work-rail and featured-project swap"
```

---

## Task 6: `js/accordion.js`

**Files:**
- Create: `js/accordion.js`

Ports `setupAccordion`/`syncPanels`/`setRow`/`toggle` verbatim; single-open behavior, `aria-expanded` kept in sync, reduced-motion disables the `max-height`/opacity transitions entirely (no animated open/close).

- [ ] **Step 1: Write the file**

```js
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
```

- [ ] **Step 2: Verify it parses as valid ESM**

```bash
node --input-type=module -e "import('./js/accordion.js').then(m => console.log(typeof m.initAccordion))"
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add js/accordion.js
git commit -m "feat: add accordion module for the skills section"
```

---

## Task 7: `js/scroll-gauge.js`

**Files:**
- Create: `js/scroll-gauge.js`

Ports `measure`/`apply`/`progress`/`paintDepth`/`paintNav`/`currentIndex`/`startTicker`/`frame`/the nav-gutter sync verbatim. This is the module that: shrinks the hero "PEDRO COELHO" into the nav bar as you scroll, dims the background and fills the nav logo with orange as a reading-progress gauge, and highlights the active nav link.

**Note:** the source's `this.zones = document.querySelectorAll('[data-tone]')` is not ported — it's assigned in the original but never read anywhere else in the Component class (verified by reading the full 751-line source). It has no visual effect. Omitting it is not a design change.

- [ ] **Step 1: Write the file**

```js
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
```

- [ ] **Step 2: Verify it parses as valid ESM**

```bash
node --input-type=module -e "import('./js/scroll-gauge.js').then(m => console.log(typeof m.initScrollGauge))"
```

Expected: `function`

- [ ] **Step 3: Commit**

```bash
git add js/scroll-gauge.js
git commit -m "feat: add scroll-gauge module for hero compression and reading-progress fill"
```

---

## Task 8: `js/main.js`

**Files:**
- Create: `js/main.js`

The only `<script>` the page loads. Boots once on `DOMContentLoaded` (there is no SPA remount to guard against, so the source's `gen`/`dead` re-mount-guard plumbing from `componentDidMount`/`componentWillUnmount` is intentionally dropped as DC-runtime-specific dead weight — not a behavior change). Adds a `pagehide` listener that explicitly tears down the WebGL context, timers and listeners, directly answering the "confirm the context is released correctly" requirement.

- [ ] **Step 1: Write the file**

```js
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
```

- [ ] **Step 2: Verify it parses as valid ESM**

```bash
node --input-type=module -e "import('./js/main.js').then(() => console.log('parsed ok')).catch(e => { console.error(e); process.exit(1); })"
```

Expected: this will throw at runtime because `document` doesn't exist in Node — that's fine, a `ReferenceError: document is not defined` proves the module parsed and started executing (a syntax error would instead show `SyntaxError`). If you see `SyntaxError`, fix it before proceeding.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add main.js boot orchestrator with pagehide teardown"
```

---

## Task 9: `index.html`

**Files:**
- Create: `index.html`
- Delete: none (the previously tracked `index.html` is already removed from the working tree)

Semantic structure: skip link → fixed `<nav>` → `<header>` (hero) → `<main>` (about/work/skills) → `<footer>` (contact). This differs from the source's flat DOM (header/section/section/section/footer with no `<main>` wrapper) by adding the `<main>` landmark and skip-link target — required by the accessibility spec (section 4: "HTML semântico, landmarks... Skip link"), not a visual change (the wrapper adds no styling).

- [ ] **Step 1: Write the file**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pedro Coelho — Full-Stack &amp; Machine Learning Engineer</title>
<meta name="description" content="Portfolio of Pedro Coelho, a software engineer based in Porto, Portugal building end-to-end web products — interfaces, services and data — for real clients, with machine learning as the next step.">
<link rel="canonical" href="https://pedroc55.github.io/">

<meta property="og:type" content="website">
<meta property="og:title" content="Pedro Coelho — Full-Stack &amp; Machine Learning Engineer">
<meta property="og:description" content="Full-stack products end to end for real clients — AR web apps, 360º tours, React/Spring Boot systems — with machine learning as the next step.">
<meta property="og:url" content="https://pedroc55.github.io/">
<meta property="og:image" content="https://pedroc55.github.io/Assets/og-image.webp">
<meta property="og:image:width" content="632">
<meta property="og:image:height" content="367">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Pedro Coelho — Full-Stack &amp; Machine Learning Engineer">
<meta name="twitter:description" content="Full-stack products end to end for real clients — AR web apps, 360º tours, React/Spring Boot systems — with machine learning as the next step.">
<meta name="twitter:image" content="https://pedroc55.github.io/Assets/og-image.webp">

<link rel="icon" type="image/svg+xml" href="Assets/favicon.svg">
<link rel="apple-touch-icon" href="Assets/apple-touch-icon.png">

<link rel="preload" href="fonts/archivo-variable-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<div class="page">
  <canvas data-field="1" class="field-canvas" aria-hidden="true"></canvas>
  <div data-fallback="1" class="field-fallback" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>

  <nav data-nav="1" class="nav">
    <a href="#top" data-nav-name="1" aria-label="Pedro Coelho — back to top" class="nav__name">
      <span data-letter="0" class="nav__letter">P</span><span data-letter="1" class="nav__letter">E</span><span data-letter="2" class="nav__letter">D</span><span data-letter="3" class="nav__letter">R</span><span data-letter="4" class="nav__letter">O</span><span class="nav__space"></span><span data-letter="5" class="nav__letter">C</span><span data-letter="6" class="nav__letter">O</span><span data-letter="7" class="nav__letter">E</span><span data-letter="8" class="nav__letter">L</span><span data-letter="9" class="nav__letter">H</span><span data-letter="10" class="nav__letter">O</span>
      <span data-name-fill="1" aria-hidden="true" class="nav__fill">
        <span data-letter="0" class="nav__letter">P</span><span data-letter="1" class="nav__letter">E</span><span data-letter="2" class="nav__letter">D</span><span data-letter="3" class="nav__letter">R</span><span data-letter="4" class="nav__letter">O</span><span class="nav__space"></span><span data-letter="5" class="nav__letter">C</span><span data-letter="6" class="nav__letter">O</span><span data-letter="7" class="nav__letter">E</span><span data-letter="8" class="nav__letter">L</span><span data-letter="9" class="nav__letter">H</span><span data-letter="10" class="nav__letter">O</span>
      </span>
    </a>
    <div data-nav-links="1" class="nav__links">
      <a href="#about" data-link="about" class="nav__link">About</a>
      <a href="#work" data-link="work" class="nav__link">Work</a>
      <a href="#skills" data-link="skills" class="nav__link">Skills</a>
      <a href="#contact" data-link="contact" class="nav__link">Contact</a>
    </div>
  </nav>

  <header id="top" data-tone="field" class="hero">
    <div>
      <div class="hero__tags">
        <span>Full-stack &amp; machine learning</span>
        <span>Porto, Portugal</span>
      </div>
      <div data-hero-ghost="1" aria-hidden="true" class="hero__ghost">PEDRO COELHO</div>
    </div>
    <p data-thesis="1" class="hero__thesis">I build web products <span data-kw="1" tabindex="0" class="kw"><span class="kw__text">end to end</span><span data-kwbar="1" aria-hidden="true" class="kw__bar"></span></span> — the interface, the services, and the data underneath — shipped for <span data-kw="1" tabindex="0" class="kw"><span class="kw__text">real clients</span><span data-kwbar="1" aria-hidden="true" class="kw__bar"></span></span>, on deadline. <span data-kw="1" tabindex="0" class="kw"><span class="kw__text">Machine learning</span><span data-kwbar="1" aria-hidden="true" class="kw__bar"></span></span> is where I'm taking that next.</p>
  </header>

  <main id="main-content">
    <section id="about" data-tone="recessed" data-reveal="1" class="about">
      <div class="about__inner">
        <div class="about__col">
          <p>I'm a software engineer based in Aveiro, Portugal. I build interactive products end to end — a georeferenced AR web app for a municipality, 360º tours for a Douro wine estate and a residential development, a React and Spring Boot logistics tool with full test coverage — and I'm increasingly pulled toward machine learning as the next layer of that work. My master's in Digital Game Development at the University of Aveiro is where I learned realtime rendering, spatial interaction and how to finish something under constraint; I spend that training on products, not games.</p>
          <p>What interests me is the decision trail — why this stack, which tradeoff, what breaks first. I like problems where the interface has to survive the physical world: a phone held up to a stone facade in full sunlight, a headset on someone who has never worn one.</p>
        </div>
      </div>
    </section>

    <section id="work" data-tone="elevated" class="work">
      <div data-reveal="1" class="work__top">
        <div data-featured="1" class="work__featured">
          <div class="work__info">
            <div class="work__heading">
              <h2 data-f-title="1" class="work__title">Condeixa XR</h2>
              <span data-f-year="1" class="work__year">2025</span>
            </div>
            <p data-f-blurb="1" class="work__blurb">A geolocated augmented-reality PWA for the Município de Condeixa-a-Nova: a map of points of interest, an AR mode with image tracking over real facades, an embedded 360º tour, and every piece of content editable by the town's own staff.</p>
            <div class="work__specs">
              <div>
                <div class="work__spec-label">The problem</div>
                <p data-f-problem="1" class="work__spec-text">Visitors arrive on foot with one hand free and no appetite for installing an app. The heritage story lives on plaques nobody reads, and the municipality had no way to update it without a developer.</p>
              </div>
              <div>
                <div class="work__spec-label">Decisions I made</div>
                <p data-f-decisions="1" class="work__spec-text">A PWA instead of native, so a QR code on site is the whole install step. Image tracking against the buildings themselves rather than GPS-anchored overlays, because GPS drifts by metres and a facade doesn't. MapLibre over a proprietary SDK for styling control and no per-view billing. Sanity as the CMS, so POIs and 360º scenes ship without a deploy.</p>
              </div>
            </div>
            <div data-f-tags="1" class="work__tags">
              <span class="work__tag">MindAR.js</span>
              <span class="work__tag">MapLibre</span>
              <span class="work__tag">Sanity CMS</span>
              <span class="work__tag">PWA</span>
            </div>
          </div>
          <figure class="work__media">
            <div data-f-media="1" class="work__media-box">
              <span data-f-medialabel="1" class="work__media-label">AR mode — tracking a facade</span>
            </div>
            <figcaption class="work__media-caption">Drop image or video here</figcaption>
          </figure>
        </div>
      </div>

      <div data-reveal="1" class="work__rail-wrap">
        <div data-rail="1" class="work__rail">
          <div data-track="1" class="work__track">
            <button type="button" data-card="condeixa" class="card" aria-label="Show Condeixa XR, 2025"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Condeixa XR</span><span class="card__year">2025</span></span></button>
            <button type="button" data-card="pacheca" class="card" aria-label="Show Quinta da Pacheca, 2025"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Quinta da Pacheca</span><span class="card__year">2025</span></span></button>
            <button type="button" data-card="nb" class="card" aria-label="Show Grupo NB Tour, 2025"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Grupo NB Tour</span><span class="card__year">2025</span></span></button>
            <button type="button" data-card="spy" class="card" aria-label="Show Spy Room, 2024"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Spy Room</span><span class="card__year">2024</span></span></button>
            <button type="button" data-card="bake" class="card" aria-label="Show Bake 'Em Up!, 2024"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Bake 'Em Up!</span><span class="card__year">2024</span></span></button>
            <button type="button" data-card="creative-learning" class="card" aria-label="Show Creative Learning, 2026"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Creative Learning</span><span class="card__year">2026</span></span></button>
            <button type="button" data-card="condeixa" class="card" aria-hidden="true" tabindex="-1"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Condeixa XR</span><span class="card__year">2025</span></span></button>
            <button type="button" data-card="pacheca" class="card" aria-hidden="true" tabindex="-1"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Quinta da Pacheca</span><span class="card__year">2025</span></span></button>
            <button type="button" data-card="nb" class="card" aria-hidden="true" tabindex="-1"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Grupo NB Tour</span><span class="card__year">2025</span></span></button>
            <button type="button" data-card="spy" class="card" aria-hidden="true" tabindex="-1"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Spy Room</span><span class="card__year">2024</span></span></button>
            <button type="button" data-card="bake" class="card" aria-hidden="true" tabindex="-1"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Bake 'Em Up!</span><span class="card__year">2024</span></span></button>
            <button type="button" data-card="creative-learning" class="card" aria-hidden="true" tabindex="-1"><span class="card__thumb"></span><span class="card__meta"><span class="card__title">Creative Learning</span><span class="card__year">2026</span></span></button>
          </div>
        </div>
      </div>
    </section>

    <section id="skills" data-tone="recessed" data-reveal="1" class="skills">
      <div class="skills__inner">
        <div data-acc-row="1">
          <button type="button" data-acc-btn="1" aria-expanded="true" class="acc-btn"><span>Frontend</span><span data-acc-sign="1" aria-hidden="true" class="acc-sign">−</span></button>
          <div data-acc-panel="1" class="acc-panel" style="max-height:1000px">
            <div data-acc-inner="1" class="acc-inner" style="opacity:1;transform:none">
              <p>Client-facing products that shipped and got handed over to non-technical owners.</p>
              <div class="mono-list">React.js · TypeScript · JavaScript · HTML · CSS · Vite · WordPress · Sanity CMS</div>
            </div>
          </div>
        </div>
        <div data-acc-row="1">
          <button type="button" data-acc-btn="1" aria-expanded="false" class="acc-btn"><span>Machine learning &amp; data</span><span data-acc-sign="1" aria-hidden="true" class="acc-sign">+</span></button>
          <div data-acc-panel="1" class="acc-panel">
            <div data-acc-inner="1" class="acc-inner">
              <p>Working through classical ML fundamentals — the direction I'm taking this work next.</p>
              <div class="mono-list">Python · pandas · NumPy · scikit-learn · PyTorch · Jupyter Notebook · LLM integration</div>
            </div>
          </div>
        </div>
        <div data-acc-row="1">
          <button type="button" data-acc-btn="1" aria-expanded="false" class="acc-btn"><span>Backend &amp; APIs</span><span data-acc-sign="1" aria-hidden="true" class="acc-sign">+</span></button>
          <div data-acc-panel="1" class="acc-panel">
            <div data-acc-inner="1" class="acc-inner">
              <p>Services behind real products, including a Spring Boot system with full test coverage across API and UI.</p>
              <div class="mono-list">Node.js · Java · Spring Boot · Python · C#</div>
            </div>
          </div>
        </div>
        <div data-acc-row="1">
          <button type="button" data-acc-btn="1" aria-expanded="false" class="acc-btn"><span>Databases</span><span data-acc-sign="1" aria-hidden="true" class="acc-sign">+</span></button>
          <div data-acc-panel="1" class="acc-panel">
            <div data-acc-inner="1" class="acc-inner">
              <p>Relational, document and graph models for connected data.</p>
              <div class="mono-list">SQL · MongoDB · Neo4j · Apache Cassandra</div>
            </div>
          </div>
        </div>
        <div data-acc-row="1">
          <button type="button" data-acc-btn="1" aria-expanded="false" class="acc-btn"><span>Immersive &amp; realtime</span><span data-acc-sign="1" aria-hidden="true" class="acc-sign">+</span></button>
          <div data-acc-panel="1" class="acc-panel">
            <div data-acc-inner="1" class="acc-inner">
              <p>AR that tracks real facades on mid-range phones, mixed reality on standalone headsets, 360º tours with VR playback.</p>
              <div class="mono-list">Unity · Meta Quest SDK · OpenXR · MindAR.js · MapLibre · 3DVista</div>
            </div>
          </div>
        </div>
        <div data-acc-row="1">
          <button type="button" data-acc-btn="1" aria-expanded="false" class="acc-btn"><span>Mobile</span><span data-acc-sign="1" aria-hidden="true" class="acc-sign">+</span></button>
          <div data-acc-panel="1" class="acc-panel">
            <div data-acc-inner="1" class="acc-inner">
              <p>Native and cross-platform application development.</p>
              <div class="mono-list">Android Native · Flutter · Dart</div>
            </div>
          </div>
        </div>
        <div data-acc-row="1">
          <button type="button" data-acc-btn="1" aria-expanded="false" class="acc-btn"><span>Tooling &amp; delivery</span><span data-acc-sign="1" aria-hidden="true" class="acc-sign">+</span></button>
          <div data-acc-panel="1" class="acc-panel">
            <div data-acc-inner="1" class="acc-inner">
              <p>Reproducible deploys, reviewable history, and design files a client can actually sign off on.</p>
              <div class="mono-list">Git · GitHub · Vercel · Bash · Figma · LaTeX</div>
            </div>
          </div>
        </div>
        <div data-acc-row="1">
          <button type="button" data-acc-btn="1" aria-expanded="false" class="acc-btn acc-btn--minor"><span>Also worked with</span><span data-acc-sign="1" aria-hidden="true" class="acc-sign">+</span></button>
          <div data-acc-panel="1" class="acc-panel">
            <div data-acc-inner="1" class="acc-inner acc-inner--list">
              <div class="mono-list">Godot · Unreal Engine · Blender · Pygame · Inform 7 · Assembly</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer id="contact" data-tone="elevated" data-reveal="1" class="footer">
    <p class="footer__cta">Hiring, or have something that needs building? <a href="mailto:pedro.coelho.web@gmail.com">Write to me</a></p>
    <div class="footer__meta">
      <a href="mailto:pedro.coelho.web@gmail.com">pedro.coelho.web@gmail.com</a>
      <a href="https://github.com/PedroC55" target="_blank" rel="noopener noreferrer">github.com/PedroC55</a>
      <a href="https://linkedin.com/in/pedrocoelho485" target="_blank" rel="noopener noreferrer">linkedin.com/in/pedrocoelho485</a>
      <span class="footer__spacer"></span>
      <span class="footer__loc">Porto, PT - open to remote</span>
    </div>
  </footer>
</div>
<script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify the HTML is well-formed**

```bash
npx -y html-validate index.html
```

Expected: no fatal parse errors. (Attribute-ordering / doctype-style warnings from a default ruleset are fine to ignore; only fix genuine errors like unclosed tags or duplicate ids.)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: rebuild index.html as semantic static markup with Creative Learning project"
```

---

## Task 10: Favicon and OG image

**Files:**
- Create: `Assets/favicon.svg`
- Create: `Assets/apple-touch-icon.png`
- Create: `Assets/og-image.webp` (copy of `.thumbnail`)

- [ ] **Step 1: Write the favicon SVG (site's "P" monogram, brand colors)**

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#120A1C"/>
  <text x="32" y="44" font-family="Archivo, Arial, sans-serif" font-weight="700" font-size="36" text-anchor="middle" fill="#E8593F">P</text>
</svg>
```

Save as `Assets/favicon.svg`.

- [ ] **Step 2: Rasterize a 180×180 PNG for `apple-touch-icon` using headless Chrome (no image tooling is installed in this environment)**

```bash
mkdir -p "$TEMP/favicon-render"
cat > "$TEMP/favicon-render/icon.html" <<'EOF'
<!doctype html><html><body style="margin:0">
<img src="favicon.svg" width="180" height="180">
</body></html>
EOF
cp Assets/favicon.svg "$TEMP/favicon-render/favicon.svg"
"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu \
  --screenshot="$(pwd)/Assets/apple-touch-icon.png" --window-size=180,180 \
  "file:///$TEMP/favicon-render/icon.html"
```

- [ ] **Step 3: Verify the PNG was produced and is 180×180**

```bash
node -e "
const fs = require('fs');
const buf = fs.readFileSync('Assets/apple-touch-icon.png');
console.log('width', buf.readUInt32BE(16), 'height', buf.readUInt32BE(20));
"
```

Expected: `width 180 height 180`

- [ ] **Step 4: Copy the existing thumbnail as the OG image**

```bash
cp ".thumbnail" "Assets/og-image.webp"
node -e "
const fs = require('fs');
const buf = fs.readFileSync('Assets/og-image.webp');
console.log(buf.slice(0,4).toString(), buf.slice(8,12).toString());
"
```

Expected: `RIFF WEBP` (confirms the copy is a valid WebP file, matches the `og:image:width`/`height` values of 632×367 already written into `index.html` in Task 9).

- [ ] **Step 5: Commit**

```bash
git add Assets/favicon.svg Assets/apple-touch-icon.png Assets/og-image.webp
git commit -m "feat: add favicon and Open Graph preview image"
```

---

## Task 11: Finish `css/styles.css` — layout, components

**Files:**
- Modify: `css/styles.css` (append after Task 2's content)

Every rule below is transcribed 1:1 from the corresponding `style="..."` attribute in `Pedro Coelho - Portfolio.dc.html` (line numbers cited), converted to a class selector matching the class names used in Task 9's `index.html`, with repeated literal colors replaced by the custom properties defined in Task 2 (same resolved values — this is a DRY refactor, not a visual change).

- [ ] **Step 1: Append the layer, nav, and hero rules**

Source: lines 29–53.

```css
/* ---- fixed background layers ---- */
.field-canvas {
  position: fixed; inset: 0; width: 100%; height: 100%;
  z-index: 0; pointer-events: none; display: block;
}
.field-fallback {
  position: fixed; inset: 0; z-index: 0; pointer-events: none; display: none;
  background-color: var(--c-void);
  background-image:
    radial-gradient(40vw 36vw at 18% 24%, var(--c-mid) 0%, rgba(51,28,77,0) 70%),
    radial-gradient(48vw 42vw at 78% 32%, var(--c-lift) 0%, rgba(78,44,117,0) 72%),
    radial-gradient(54vw 46vw at 58% 84%, var(--c-deep) 0%, rgba(30,18,48,0) 75%),
    radial-gradient(13vw 13vw at 32% 66%, rgba(232,89,63,0.45) 0%, rgba(232,89,63,0) 70%);
  background-repeat: no-repeat;
  animation: om-drift 64s ease-in-out infinite alternate;
}
@media (max-width: 767px) { .field-fallback { animation: none; } }
@media (prefers-reduced-motion: reduce) { .field-fallback { animation: none; } }

.grain {
  position: fixed; inset: 0; z-index: 90; pointer-events: none; opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27260%27%20height%3D%27260%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.8%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27260%27%20height%3D%27260%27%20filter%3D%27url%28%23n%29%27%2F%3E%3C%2Fsvg%3E");
  background-repeat: repeat;
}

/* ---- nav ---- */
.nav {
  position: fixed; top: 0; left: 0; right: 0; height: 64px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 0 var(--pad-inline); z-index: 60;
}
.nav__name {
  position: relative; z-index: 1; font-family: var(--font-sans); font-weight: 700;
  font-variation-settings: 'wdth' 125; font-size: 16px; line-height: 1; letter-spacing: 0.005em;
  color: var(--c-ink); white-space: nowrap; transform-origin: left top; display: inline-flex; will-change: transform;
}
.nav__letter { display: inline-block; }
.nav__space { display: inline-block; width: 0.26em; }
.nav__fill {
  position: absolute; left: 0; top: 0; display: inline-flex; white-space: nowrap;
  clip-path: inset(0 100% 0 0);
}
.nav__fill .nav__letter { color: var(--c-accent); }
.nav__links {
  position: relative; z-index: 1; display: flex; gap: clamp(14px,2.4vw,34px); align-items: center;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  opacity: 0; padding-bottom: 9px;
}
.nav__link { color: var(--c-ink); opacity: 0.45; transition: opacity .25s ease; }
@media (prefers-reduced-motion: reduce) { .nav__link { transition: none; } }

/* ---- hero ---- */
.hero {
  position: relative; min-height: 100svh; box-sizing: border-box;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: calc(64px + clamp(56px,13vh,150px)) var(--pad-inline) clamp(40px,8vh,88px);
}
.hero__tags {
  display: flex; flex-wrap: wrap; gap: 8px 26px;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--c-ink-muted); margin-bottom: clamp(26px,7vh,72px);
}
.hero__ghost {
  font-family: var(--font-sans); font-weight: 700; font-variation-settings: 'wdth' 125;
  font-size: min(9.5vw,148px); line-height: 0.88; letter-spacing: -0.02em; white-space: nowrap;
  visibility: hidden; margin-left: -0.03em;
}
.hero__thesis {
  max-width: 44ch; margin: 0; margin-left: auto; margin-right: clamp(0px,4vw,80px);
  font-family: var(--font-sans); font-weight: 400; font-size: clamp(21px,2.3vw,33px); line-height: 1.34;
  text-wrap: pretty; color: var(--c-ink);
}
.kw { position: relative; display: inline-block; }
.kw__text { box-shadow: inset 0 -1px 0 rgba(232,89,63,0.55); }
.kw__bar {
  position: absolute; left: 0; bottom: -2px; width: 100%; height: 2px; background-color: var(--c-accent);
  transform: scaleX(0); transform-origin: left center; transition: transform .2s ease-out;
}
@media (prefers-reduced-motion: reduce) { .kw__bar { transition: none; } }
```

- [ ] **Step 2: Append the about, work/featured, and rail/card rules**

Source: lines 55–115.

```css
/* ---- about ---- */
.about { position: relative; padding: clamp(110px,22vh,260px) var(--pad-inline); }
.about__inner { max-width: 1500px; }
.about__col { width: min(100%,58ch); display: flex; flex-direction: column; gap: 1.15em; }
.about__col p { margin: 0; font-size: clamp(18px,1.45vw,23px); line-height: 1.62; font-weight: 400; text-wrap: pretty; color: var(--c-ink); }

/* ---- work: featured panel ---- */
.work { position: relative; }
.work__top { padding: clamp(80px,16vh,180px) var(--pad-inline) clamp(56px,9vh,110px); }
.work__featured {
  display: flex; flex-wrap: wrap; gap: clamp(26px,4vw,64px); align-items: flex-start;
  max-width: 1500px; transition: opacity .2s ease;
}
@media (prefers-reduced-motion: reduce) { .work__featured { transition: none; } }
.work__info { flex: 1 1 min(100%,460px); display: flex; flex-direction: column; gap: clamp(18px,2.6vh,30px); min-width: 0; }
.work__heading { display: flex; align-items: baseline; gap: 16px; }
.work__title {
  margin: 0; font-family: var(--font-sans); font-weight: 700; font-variation-settings: 'wdth' 125;
  font-size: clamp(32px,4.6vw,74px); line-height: 0.94; letter-spacing: -0.018em; text-transform: uppercase; margin-left: -0.02em;
}
.work__year { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em; color: var(--c-ink); flex: 0 0 auto; }
.work__blurb { margin: 0; max-width: 56ch; font-size: clamp(17px,1.3vw,21px); line-height: 1.58; font-weight: 400; text-wrap: pretty; }
.work__specs { display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,290px),1fr)); gap: clamp(18px,2.5vw,44px); }
.work__spec-label {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--c-ink-muted); margin-bottom: 8px;
}
.work__spec-text { margin: 0; max-width: 52ch; font-size: 16px; line-height: 1.6; font-weight: 400; text-wrap: pretty; }
.work__tags { display: flex; flex-wrap: wrap; gap: 8px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: var(--c-ink); }
.work__tag { border: 1px solid rgba(var(--ink-rgb),0.34); padding: 5px 10px; }
.work__media { margin: 0; flex: 0 1 clamp(240px,34%,420px); display: flex; flex-direction: column; gap: 9px; min-width: 0; }
.work__media-box {
  aspect-ratio: 4/5; width: 100%; background-color: rgba(var(--ink-rgb),0.07);
  background-image: repeating-linear-gradient(135deg, rgba(var(--ink-rgb),0.16) 0 1px, rgba(var(--ink-rgb),0) 1px 10px);
  display: flex; align-items: flex-end; padding: 14px; box-sizing: border-box;
}
.work__media-label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--c-ink); }
.work__media-caption { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--c-ink); }

/* ---- work: carousel rail ---- */
.work__rail-wrap { padding: 0 0 clamp(90px,16vh,180px); }
.work__rail { overflow: hidden; width: 100%; }
.work__track {
  display: flex; gap: 20px; width: max-content; padding: 4px var(--pad-inline);
  animation: om-marquee 46s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .work__track { animation: none; } }
.card {
  flex: 0 0 auto; width: min(74vw,268px); background-color: rgba(var(--ink-rgb),0.05);
  border: 1px solid rgba(var(--ink-rgb),0.28); padding: 0; cursor: pointer; text-align: left;
  display: flex; flex-direction: column;
  transition: border-color .18s ease, transform .18s ease, background-color .18s ease;
}
.card:hover { border-color: var(--c-accent); transform: translateY(-4px); background-color: rgba(var(--ink-rgb),0.1); }
@media (prefers-reduced-motion: reduce) { .card { transition: none; } .card:hover { transform: none; } }
.card__thumb {
  display: block; aspect-ratio: 16/10; width: 100%;
  background-image: repeating-linear-gradient(135deg, rgba(var(--ink-rgb),0.16) 0 1px, rgba(var(--ink-rgb),0) 1px 10px);
}
.card__meta { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 11px 13px 13px; }
.card__title {
  font-family: var(--font-sans); font-weight: 700; font-variation-settings: 'wdth' 118; font-size: 15px;
  line-height: 1.1; letter-spacing: 0.005em; text-transform: uppercase; color: var(--c-ink);
}
.card__year { font-family: var(--font-mono); font-size: 11px; color: var(--c-ink); }
```

- [ ] **Step 3: Append the skills/accordion, footer, and image-pattern-note rules**

Source: lines 117–237.

```css
/* ---- skills accordion ---- */
.skills { position: relative; padding: clamp(110px,20vh,240px) var(--pad-inline); }
.skills__inner { max-width: 900px; margin-inline: auto; width: 100%; }
.acc-btn {
  width: 100%; padding: clamp(10px,1.4vh,16px) 0;
  display: flex; align-items: baseline; justify-content: space-between; gap: 24px; cursor: pointer;
  font-family: var(--font-sans); font-weight: 700; font-variation-settings: 'wdth' 125;
  font-size: clamp(21px,3.3vw,40px); line-height: 1.05; letter-spacing: -0.012em; text-transform: uppercase;
  color: var(--c-ink); text-align: left; transition: color .2s ease;
}
.acc-btn:hover { color: var(--c-ink-muted); }
.acc-btn--minor {
  font-weight: 500; font-variation-settings: 'wdth' 112; font-size: clamp(15px,1.6vw,22px);
  line-height: 1.05; letter-spacing: 0.01em; text-transform: uppercase; color: var(--c-ink-muted);
}
@media (prefers-reduced-motion: reduce) { .acc-btn { transition: none; } }
.acc-sign { font-family: var(--font-mono); font-size: 15px; color: var(--c-ink-muted); }
.acc-panel { overflow: hidden; max-height: 0; transition: max-height .32s cubic-bezier(0.22,1,0.36,1); }
.acc-inner {
  display: flex; flex-direction: column; gap: 10px; padding: 2px 0 clamp(26px,4vh,40px); max-width: 58ch;
  opacity: 0; transform: translateY(8px);
  transition: opacity .32s cubic-bezier(0.22,1,0.36,1), transform .32s cubic-bezier(0.22,1,0.36,1);
}
.acc-inner p { margin: 0; font-size: 17px; line-height: 1.56; font-weight: 400; text-wrap: pretty; color: var(--c-ink); }
.mono-list { font-family: var(--font-mono); font-size: 12px; line-height: 1.95; color: var(--c-ink-muted); }
.acc-inner--list { display: block; }

/* ---- footer ---- */
.footer {
  position: relative; padding: clamp(110px,22vh,260px) var(--pad-inline) clamp(48px,8vh,90px);
  display: flex; flex-direction: column; gap: clamp(40px,9vh,110px);
}
.footer__cta {
  margin: 0; max-width: 21ch; font-family: var(--font-sans); font-weight: 700; font-variation-settings: 'wdth' 125;
  font-size: clamp(28px,4.2vw,68px); line-height: 1; letter-spacing: -0.018em; text-transform: uppercase;
  text-wrap: pretty; margin-left: -0.02em;
}
.footer__cta a {
  color: var(--c-ink); box-shadow: inset 0 -3px 0 rgba(var(--ink-rgb),0.45);
  transition: box-shadow .18s ease, color .18s ease;
}
.footer__cta a:hover { color: var(--c-ink); box-shadow: inset 0 -3px 0 var(--c-ink); }
@media (prefers-reduced-motion: reduce) { .footer__cta a { transition: none; } }
.footer__meta {
  display: flex; flex-wrap: wrap; gap: 14px clamp(18px,3vw,44px); align-items: baseline;
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
}
.footer__meta a { color: var(--c-ink); }
.footer__spacer { flex: 1; }
.footer__loc { color: var(--c-ink); }

/*
 * No project currently has a real photo/video — every .work__media-box and
 * .card__thumb is a CSS placeholder. When a real asset is added later:
 *   <picture>
 *     <source srcset="Assets/<project>/cover.webp" type="image/webp">
 *     <img src="Assets/<project>/cover.jpg" alt="…" width="W" height="H" loading="lazy">
 *   </picture>
 * inside .work__media-box / .card__thumb, keeping explicit width/height to avoid
 * layout shift. Not applied now because there is no image to attach it to.
 */
```

- [ ] **Step 4: Full-file lint pass**

```bash
npx -y stylelint --no-config-basedir --config '{"rules":{}}' css/styles.css
```

Expected: no parse errors. Also manually diff every numeric value in the new rules against the corresponding source line to catch transcription typos — this is the step most likely to introduce an unintended visual change, so treat it as the highest-risk step in the whole plan.

- [ ] **Step 5: Commit**

```bash
git add css/styles.css
git commit -m "feat: complete styles.css with layout, carousel, accordion and footer rules"
```

---

## Task 12: Accessibility verification

**Files:** none created; this task reviews Tasks 1–11's output.

- [ ] **Step 1: Tab-order walk-through (manual, in a real browser)**

Serve the site locally and tab from the top of the page to the bottom:

```bash
npx -y serve -l 4173 .
```

Open `http://localhost:4173/` and press Tab repeatedly. Expected order: skip link → nav logo link → About/Work/Skills/Contact nav links (once visible past scroll threshold, but focusable even before, since `opacity:0` doesn't remove them from the tab order — note this for step 2) → the 3 keyword spans in the hero thesis (`tabindex="0"`) → each of the 6 visible carousel cards (the 6 `aria-hidden` duplicates must be **skipped** — verify they are) → each of the 8 accordion buttons → footer links. If the duplicate carousel cards receive focus, `tabindex="-1"` was dropped somewhere in Task 9 — fix it there.

- [ ] **Step 2: Confirm the nav links are reachable before their fade-in**

`.nav__links` starts at `opacity: 0` and is revealed by `scroll-gauge.js` as the user scrolls. Because `opacity: 0` (unlike `visibility: hidden` or `display: none`) does not remove an element from the accessibility tree or tab order, keyboard users can already reach and activate these links before they're visually revealed — this matches the source's behavior exactly (same CSS property was already used), so no change is needed; just confirm it during the walk-through in Step 1 (tab to a nav link before scrolling and confirm it's focused, even though invisible).

- [ ] **Step 3: Compute the worst-case contrast ratio of the animated field against `--c-ink` text**

The fragment shader clamps its own output: `if (L > 0.115) c *= pow(0.115/L, 1.0/2.2);` — so the shader's own linear luminance never exceeds 0.115, and `paintDepth()` only ever *darkens* further while scrolling (`depth = 1 - 0.55*p`, always ≤ 1). So the worst case (lightest possible background) is exactly `L = 0.115` at `depth = 1` (page top, `p = 0`). Verify the resulting contrast ratio against `--c-ink` (`#F2ECF6`) meets 4.5:1:

```bash
node -e "
function relLum(hex) {
  const [r,g,b] = [0,2,4].map(i => parseInt(hex.slice(i,i+2),16)/255);
  const lin = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}
const textL = relLum('F2ECF6');
const bgL = 0.115; // shader's own hard luminance cap, worst case (depth=1, top of page)
const ratio = (Math.max(textL,bgL)+0.05) / (Math.min(textL,bgL)+0.05);
console.log('contrast ratio ≈', ratio.toFixed(2));
"
```

Expected: a ratio ≥ 4.5. If it prints lower, the shader's `0.115` clamp is not tight enough for `--c-ink` and must be flagged to the user (a shader value change is a visual change, out of scope to fix silently).

- [ ] **Step 4: Reduced-motion audit — confirm every animation source is gated**

Grep every module for `reduced` and confirm each of these is behind the flag: hero letter stagger (`main.js`/`enterHero`), keyword underline transition (CSS `.kw__bar` — this one is a hover-triggered `:hover`/`:focus` transition, not an autoplay animation, so it's fine to leave un-gated per WCAG 2.3.3 which only requires gating motion triggered by page load/scroll, not direct user interaction), carousel auto-scroll (`carousel.js`, disabled via `track.style.animation='none'`), accordion open/close (`accordion.js`, transitions removed), scroll reveals (`main.js`/`setupReveals`, skipped entirely), color-field noise animation (`color-field.js`, static frame drawn once), field-fallback drift (CSS media query added in Task 11 Step 1), nav-fill gauge transition (`scroll-gauge.js`/`paintDepth`, `!reduced` check before setting the transition), skip-link slide-in (CSS media query added in Task 2).

```bash
grep -rn "reduced" js/*.js
grep -n "prefers-reduced-motion" css/styles.css
```

Expected: every animation/transition listed above appears in at least one of these two greps.

- [ ] **Step 5: Confirm `aria-expanded` correctness**

In the browser, open each accordion row and confirm only one panel is open at a time and `aria-expanded` flips correctly (DevTools → Elements, watch the attribute as you click). This exercises `accordion.js`'s `toggle()`.

- [ ] **Step 6: Note in the final summary (no commit needed for this task)**

This task produces no file changes — record the contrast ratio number and tab-order confirmation in your final report to the user.

---

## Task 13: Performance verification

**Files:** none created; this task measures Tasks 1–11's output.

- [ ] **Step 1: Serve the site and run Lighthouse with mobile CPU 4x throttling**

```bash
npx -y serve -l 4173 . &
npx -y lighthouse http://localhost:4173/ \
  --preset=perf \
  --emulated-form-factor=mobile \
  --throttling-method=devtools \
  --throttling.cpuSlowdownMultiplier=4 \
  --chrome-flags="--headless=new" \
  --output=json --output-path="$TEMP/lh-report.json" \
  --quiet
node -e "
const r = require('$TEMP/lh-report.json'.replace(/\\\\\\\\/g,'/'));
console.log('Performance score:', Math.round(r.categories.performance.score*100));
console.log('LCP:', r.audits['largest-contentful-paint'].displayValue);
console.log('TBT:', r.audits['total-blocking-time'].displayValue);
console.log('CLS:', r.audits['cumulative-layout-shift'].displayValue);
"
```

Expected: a numeric performance score plus LCP/TBT/CLS values. Report these to the user — if the score is low or TBT is high, that's the "does the animated field hold up" signal they explicitly asked for; report the number rather than assuming it's fine.

- [ ] **Step 2: Check for console errors and failed requests (the "no 404s" requirement)**

```bash
node -e "
const { execSync } = require('child_process');
" 
npx -y lighthouse http://localhost:4173/ \
  --only-audits=errors-in-console,network-requests \
  --chrome-flags=\"--headless=new\" \
  --output=json --output-path="$TEMP/lh-console.json" --quiet
node -e "
const r = require('$TEMP/lh-console.json'.replace(/\\\\\\\\/g,'/'));
const errs = r.audits['errors-in-console'].details.items;
const reqs = r.audits['network-requests'].details.items;
console.log('console errors:', errs.length, JSON.stringify(errs));
console.log('failed requests:', reqs.filter(x => x.statusCode >= 400).map(x => x.url + ' -> ' + x.statusCode));
"
```

Expected: `console errors: 0 []` and `failed requests: []`. If any font/asset 404s, it's almost certainly a path mismatch between `index.html`/`css/styles.css` and the actual `fonts/`/`Assets/` filenames from Tasks 1 and 10 — fix the path, don't rename the working asset.

- [ ] **Step 3: Code-review the WebGL lifecycle for leaks (documented, not a live heap-profiling session)**

This is a single-page static site with no client-side routing, so `color-field.js`'s `initColorField()` only ever runs once per page load — there is no repeated mount/unmount cycle that could accumulate contexts or listeners. Confirm by inspection:
- The 33ms `setInterval` and the `visibilitychange` listener are created exactly once in `initColorField` and cleared exactly once in `teardown()` (Task 4).
- `teardown()` is wired to `pagehide` in `main.js` (Task 8), so on navigation away, the interval is cleared, the `visibilitychange` listener is removed, and `WEBGL_lose_context.loseContext()` is called before the browser discards the page.
- No closures inside `drawField`/`sizeField` capture growing arrays or accumulate state across calls — each call only reads current `window.innerWidth`/`devicePixelRatio` and re-uses the same buffer/program.

Confirm this by reading `js/color-field.js` and `js/main.js` side by side and checking off each bullet — no growth path exists for "prolonged navigation" (an open tab left running for hours), since nothing under 33ms/16ms tick accumulates unbounded state.

- [ ] **Step 4: Confirm the `<768px` and no-WebGL fallback path**

In Chrome DevTools, toggle device toolbar to a narrow viewport (e.g. 375px) and reload — confirm `.field-canvas` is `display:none` and `.field-fallback` is `display:block` with the static (non-animated, since Task 11 Step 1's `@media (max-width: 767px)` rule applies) gradient background showing.

- [ ] **Step 5: Note in the final summary (no commit needed for this task)**

Record the Lighthouse performance score, LCP/TBT/CLS, and the console/network-error results in your final report to the user.

---

## Task 14: Cleanup

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add the DC export source files to `.gitignore`**

```
CLAUDE.md
Pedro Coelho - Portfolio.dc.html
support.js
```

These files are not deleted — they remain on disk as the porting reference — they're just excluded from the tracked/deployed set.

- [ ] **Step 2: Confirm nothing unintended is left untracked**

```bash
git status
```

Expected: `.thumbnail` still shows as untracked (it was copied, not moved, into `Assets/og-image.webp` — decide with the user whether to also remove/gitignore the root copy, since keeping a dotfile WebP at the repo root serves no purpose once `Assets/og-image.webp` exists); the DC source files now show as ignored, not untracked; everything else from Tasks 1–13 shows as tracked/staged.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore the DC export source files"
```

---

## Self-Review

**Spec coverage against the user's 5 sections:**
1. **Troca de projeto** — Task 3 (data), Task 9 (markup, both carousel copies + featured-panel initial state stays `condeixa` per source default). Covered.
2. **Estrutura de ficheiros** — File Structure table + Tasks 1–11 split exactly into estilos / campo de cor WebGL / carrossel / acordeão / medidor de scroll / dados dos projetos, no build step, native ESM. Covered.
3. **Performance** — Task 4 (30fps cap, visibilitychange pause, context release), Task 11 Step 1 (`<768px` fallback CSS), Task 1+2 (font self-hosting, subset, `font-display:swap`), Task 11 Step 3 (image pattern documented — no images exist yet to lazy-load, flagged explicitly rather than silently skipped), Task 13 (Lighthouse mobile 4x throttle + console/404 check). Covered.
4. **Acessibilidade** — Task 9 (skip link, landmarks, `aria-hidden` on duplicate marquee cards), Task 2/11 (focus-visible, reduced-motion gating throughout), Task 12 (tab order, contrast computation, `aria-expanded` check). Covered.
5. **Deploy** — Task 9 (meta/canonical/OG/Twitter), Task 10 (favicon, OG image), Task 13 Step 2 (no console errors/404s). Covered.

**Placeholder scan:** the only steps with non-literal values are Task 1 Steps 1–3 (font URLs, unknown until Google's CSS response is fetched — the procedure itself is exact, not vague) and Task 12/13's "record the number in your report" steps (verification output, not implementation code). No other `TBD`/`similar to Task N`/vague instructions remain.

**Type/name consistency check:** `data-f-*`, `data-acc-*`, `data-card`, `data-rail`, `data-track` attribute names match verbatim between Task 9's HTML and Tasks 5/6's JS selectors. `PROJECTS` shape (`id/title/year/blurb/problem/decisions/tags/media`) matches between Task 3 and Task 5's `swap()`. Module function names (`initColorField`, `initCarousel`, `initAccordion`, `initScrollGauge`) match their imports in Task 8 exactly, including the `getDepth`/`getScale` accessors Task 8 relies on.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-05-portfolio-port.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
