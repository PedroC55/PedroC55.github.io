# Portfolio Redesign — Design Spec
**Date:** 2026-05-14
**Project:** PedroC55.github.io
**Status:** Approved

---

## Overview

A complete rebuild of Pedro Coelho's portfolio as a single-page static site on GitHub Pages. The goal is a memorable, warmly editorial portfolio that signals craft and personality — something a hiring manager at a game studio opens and immediately understands "this person pays attention to detail." No frameworks, no build step: pure HTML/CSS/JS in a single `index.html`.

---

## Aesthetic Direction: Warmly Editorial ("Crafted with Care")

Warm cream and sand tones. The feel of a designer's sketchbook or artisan product catalogue — generous whitespace, serif display type, subtle grain and texture, terracotta accents. Explicitly NOT a dark developer portfolio. Comparable reference: a thoughtful editorial magazine or a small creative studio's site.

**Guiding principle:** every visual detail serves the content; nothing is decorative for its own sake.

---

## Design System

### Color Palette (CSS variables)
```css
--bg-primary:       #FAF7F2;              /* cream, almost white */
--bg-secondary:     #F2EDE4;              /* soft sand */
--bg-card:          #FFFFFF;
--accent-primary:   #C8956C;              /* terracotta / caramel */
--accent-secondary: #8B6F5E;             /* warm brown */
--text-primary:     #2C2416;              /* near-black, warm */
--text-secondary:   #6B5744;             /* mid brown */
--text-muted:       #A08878;
--border:           #E8DDD3;
--shadow:           rgba(44, 36, 22, 0.08);
```

### Typography
- **Display / headings:** Playfair Display — weights 700, 900, italic 700
- **Body / interface:** DM Sans — weights 300, 400, 500
- Imported via Google Fonts `<link>` in `<head>`
- No Inter, Roboto, Arial, or system sans-serif fallbacks beyond the named fonts

### Special Effects
- **Grain overlay:** `body::before` pseudo-element covering 100vw/100vh, SVG noise filter or tiled data-URI noise, `opacity: 0.03`, `pointer-events: none`, `z-index: 0`; all content sections at `position: relative; z-index: 1`
- **Gradient mesh hero background:** two to three overlapping `radial-gradient` calls in `--bg-secondary`/`--bg-primary` tones creating a soft, non-uniform warmth

---

## Site Architecture

Single-page scroll. Four visible sections + footer. No hamburger menu on mobile (hero CTA and natural scroll handle navigation).

```
[nav]
[Hero]
[Skills]
[Projects]
[Contact / Footer]
```

### Navigation
- Fixed/sticky at top; starts transparent, gains `--bg-primary` + subtle `box-shadow` on scroll past 40px
- Left: name or monogram in Playfair Display, `--accent-primary`
- Right: SKILLS · WORK · CONTACT links in DM Sans, small-caps, `--text-secondary`; hover → `--accent-primary`
- Smooth scroll to anchors on click

---

## Section: Hero

Full-viewport-height section (`min-height: 100vh`). Two asymmetric columns:

**Left column (wider, ~60%)**
- Eyebrow line: `<span class="hero-eyebrow-line">` (thin 32px terracotta rule) + small-caps label — "Game Developer & XR Developer · Universidade de Aveiro"
- Name: "Pedro Coelho" in Playfair Display, `font-size: clamp(3.5rem, 7vw, 6rem)`, `line-height: 1.0`, `--text-primary`
- Subtitle: "Crafting immersive interactive experiences — VR, AR & Digital Games" in DM Sans 300
- Three pill/outlined contact buttons: Email · GitHub · LinkedIn
  - Default: border `--border`, background transparent, text `--text-secondary`
  - Hover: border fills to `--accent-primary`, text `--accent-primary`, `transition: 0.2s`

**Right column (~40%)**
- Profile photo `assets/img/CV.jpg`; `border-radius: 1rem`; `object-fit: cover`
- Decorative offset border: `::after` pseudo-element, `border: 2px solid --accent-primary`, `opacity: 0.5`, offset `+12px +12px`, same `border-radius`, behind the photo

**Load animations (CSS keyframes)**
```
eyebrow:  opacity 0→1, translateY(16px)→0, delay 0s,    0.6s ease
name:     opacity 0→1, translateY(24px)→0, delay 0.15s, 0.8s ease
subtitle: opacity 0→1, translateY(12px)→0, delay 0.35s, 0.6s ease
buttons:  opacity 0→1, translateY(8px)→0,  delay 0.55s, 0.6s ease
photo:    opacity 0→1, scale(0.97)→scale(1), delay 0.2s, 0.8s ease
```

---

## Section: Skills (`id="skills"`)

**Section header pattern (shared across all sections):**
- Small-caps category label (DM Sans, `--accent-primary`, letter-spacing 3px)
- Section title in Playfair Display
- Thin decorative rule via `::after` pseudo-element on the title, `background: --accent-primary`, ~40px wide

No tables. Skill groups in a responsive flex-wrap grid. Each group:
- Category name: DM Sans, `text-transform: uppercase`, `font-size: 0.7rem`, `letter-spacing: 3px`, `--text-muted`
- Skills as **tag pills**: `border: 1px solid --border`, `background: --bg-secondary`, `padding: 4px 12px`, `border-radius: 2rem`, `font-size: 0.75rem`, `--text-secondary`
- Pill hover: `border-color: --accent-primary`, `color: --accent-primary`, `transition: 0.2s`

**Skill categories and content:**
| Category | Skills |
|----------|--------|
| Game Dev | Unity, Godot, Unreal Engine, Pygame, Blender, Inform 7 |
| XR / VR / AR | Meta Quest SDK, XR Interaction Toolkit, MRUK, MindAR.js, 3DVista |
| Frontend | HTML, CSS, React.js, Vite |
| Backend | Java, Python, JavaScript, C#, Node.js |
| Databases | SQL, MongoDB, Apache Cassandra, Neo4j |
| Mobile | Android Native, Flutter, Dart |
| Tools | Git, GitHub, Bash, LaTeX, Assembly, Docker |

---

## Section: Projects (`id="projects"`)

Same section header pattern. 2-column CSS grid on desktop, 1-column on mobile (< 768px).

**Card anatomy:**
- `position: relative; overflow: hidden`
- Background `--bg-card`; `border: 1px solid --border`; `border-radius: 0.75rem`
- `box-shadow: 0 2px 12px --shadow`
- Hover: `transform: translateY(-4px)`, `box-shadow: 0 8px 28px --shadow` (doubled), `transition: all 0.3s ease`
- **Editorial number:** absolute top-right, `font-size: 5rem`, Playfair Display, `color: --accent-primary`, `opacity: 0.10`, `line-height: 1`, non-interactive
- Category + year row: small-caps category left, year right, both `--text-muted`, DM Sans 0.7rem
- Project title: Playfair Display 700, ~1.2rem, `--text-primary`
- Description: DM Sans 0.85rem, `--text-secondary`, `line-height: 1.75`, max 3 lines displayed (`overflow: hidden`; no JS truncation needed — CSS is sufficient)
- Tech tags row: pill tags same style as skills, smaller padding
- "View Project →" link: `--accent-primary`, DM Sans 0.8rem, underline animates in on hover (`width: 0→100%` transition on `::after`)
- All project links open in `target="_blank"` — **no video modal**

**Project list (ordered as specified):**

| # | Title | Category | Tags | Link |
|---|-------|----------|------|------|
| 01 | Bake 'Em Up! | VR · Survival · Game Design | Unity, VR, C#, Game Design | https://rafinha-uwu.itch.io/bake-em-up |
| 02 | Underground Rebellion | 2D Platformer · Pixel Art | Unity, 2D, Pixel Art, C# | https://plbc.itch.io/underground-rebellion |
| 03 | Spy Room | AR · Mixed Reality | Unity, AR, Meta Quest, C# | https://github.com/PedroC55/Spy_Room |
| 04 | Calculus | Educational · Puzzle | Unity, C#, Educational, Mobile | https://plbc.itch.io/calculus |
| 05 | SmartKeeper | IoT · Smart Home | IoT, Web, Monitoring | https://bernardoleandro1.github.io/PI/ |
| 06 | Pick Up Points System | Full Stack · Web | React, Java, Spring Boot, Docker | https://github.com/PedroC55/TQS_Project |
| 07 | MovingCampus | Mobile · Android | Android, Mobile, Location | https://github.com/PedroC55/ICM_Project1 |

---

## Contact + Footer

Simple and elegant, combined at the bottom.

**Contact block:**
- "Let's talk." in Playfair Display italic, large (~3rem)
- Email as `mailto:` link, `--accent-primary`, DM Sans
- GitHub + LinkedIn as small outlined social buttons (same pill style)
- `background: --bg-secondary`; top `border-top: 1px solid --border`

**Footer:**
- "Pedro Coelho © 2025" centred, DM Sans 0.75rem, `--text-muted`
- `background: --bg-secondary`

---

## Scroll Reveal Animations

Implemented with `IntersectionObserver` (threshold 0.12).

- All `.reveal` elements start: `opacity: 0; transform: translateY(24px)`
- On intersection: add class `.visible` → `opacity: 1; transform: translateY(0); transition: opacity 0.6s ease, transform 0.6s ease`
- Project cards staggered: `transition-delay: calc(index * 80ms)` via inline style
- Skill groups staggered: `transition-delay: calc(index * 50ms)` via inline style

---

## Responsive Breakpoints

| Breakpoint | Hero | Skills | Projects |
|-----------|------|--------|---------|
| ≥ 1024px | Two columns | Multi-column flex groups | 2-column grid |
| 640–1023px | Two columns (tighter) | Multi-column flex groups | 1-column grid |
| < 640px | Single column (photo first, then text) | Single-column flex groups | 1-column grid |

Nav links hidden on mobile (< 640px); monogram stays. No hamburger.

---

## File Deliverable

Single `index.html` containing:
- All CSS in `<style>` within `<head>`
- All JS in `<script>` before `</body>`
- External dependency: Google Fonts `<link>` only
- `assets/img/CV.jpg` referenced as-is

`assets/css/style.css` will be emptied/removed from active use (kept in repo but overridden by inline styles).

`_layouts/default.html` and `_includes/` untouched (Jekyll artifacts, not used by `index.html`).

---

## Accessibility

- `alt="Pedro Coelho"` on profile photo
- `aria-label` on GitHub and LinkedIn icon/text links
- All colour pairs meet WCAG AA contrast (warm dark on cream backgrounds)
- `prefers-reduced-motion` media query wraps all animation styles — if set, animations are instant (no translate, no opacity fade)
