# Portfolio Redesign — Design Spec
**Date:** 2026-05-13  
**Project:** PedroC55.github.io  
**Status:** Approved

---

## Overview

A complete rebuild of Pedro Coelho's portfolio website. The goal is to create a memorable, professional site that signals craft — something a hiring manager at a game studio opens and immediately understands "this person knows what they're doing."

The rebuild touches every file: HTML structure, CSS system, JavaScript behavior. The tech stack stays vanilla HTML/CSS/JS (GitHub Pages compatible, no build tools, no frameworks).

---

## Aesthetic Direction: Editorial Dark

**Chosen direction:** Magazine-editorial meets premium game studio. Dark, typographic, restrained. The kind of portfolio someone at IO Interactive or Riot Games would have — confident without being loud.

**Justification:** Pedro is a game developer doing a Master's in Digital Games. His work spans VR, AR, Unity, mobile, and web. The Editorial Dark direction conveys:
- Seriousness and craft (editorial typography)
- Comfort in dark/immersive environments (game dev native)
- Range without clutter (clean sections, no visual noise)

**What makes it unforgettable:** The name IS the hero. Giant Playfair Display at ~120px dominates the viewport — there are no images, no gradients competing for attention. The typography does all the work.

---

## Design System

### Color Palette (CSS variables)
```css
--bg:           #0a0a0f   /* near-black with a blue undertone */
--surface:      #0d0d14   /* elevated surfaces (cards, cells) */
--border:       #1a1a1a   /* subtle dividers */
--border-light: #111111   /* even subtler dividers */
--text-primary: #f5f0e8   /* warm off-white — not pure white */
--text-secondary: #7a6d60 /* muted body text */
--text-dim:     #3a3028   /* very dim labels, ghost numbers */
--accent:       #c8b89a   /* warm gold/tan — the only color */
--accent-dim:   #2a2218   /* dimmed accent for borders/hover states */
```

### Typography
- **Display font:** Playfair Display — weights 700, 900, italic 700
  - Used for: hero name, section titles, contact heading, pull quote
- **Body font:** DM Sans — weights 300, 400, 500
  - Used for: nav links, body text, labels, tags, metadata, CTA buttons
- **Scale:**
  - Hero name: clamp(72px, 10vw, 128px)
  - Section titles: 36px
  - Body: 13–14px
  - Labels/tags: 8–10px, letter-spacing: 3–4px, text-transform: uppercase

### Spacing Scale
- Base unit: 8px
- Section padding: 96px top/bottom, 48px sides (desktop)
- Card padding: 28px top/bottom, 32px sides
- Gap between cards: 8px

### Border Radius
None — all elements use sharp corners. Consistent with editorial aesthetic.

---

## Site Architecture

Single-page scroll. Fixed minimal nav at top. Five content sections + footer.

```
[nav]
[01 Hero]
[02 About]
[03 Skills]
[04 Work]
[05 Contact]
[footer]
```

### Navigation
- Fixed/sticky, `backdrop-filter: blur(12px)` for readability over content
- Left: monogram "P·C" in Playfair Display, accent color
- Right: WORK · ABOUT · SKILLS · CONTACT in DM Sans, 9px, 3px letter-spacing
- Transparent initially, gains background on scroll
- Smooth scroll to anchor on click

### 01 — Hero
- Full viewport height (`min-height: 100vh`)
- Layout: left-aligned, vertically centered
- Elements (top to bottom):
  1. Eyebrow: small-caps label with a leading horizontal rule — "Game Developer — University of Aveiro"
  2. Name: "Pedro / Coelho" in Playfair Display at max size, line-height 0.88
  3. Subtitle row: 40px horizontal rule + small-caps one-liner — "Crafting immersive interactive experiences — VR, AR & Digital Games"
  4. CTA button: outlined, "See My Work" — smooth scrolls to #work
- Ghost page number "01" in Playfair Display, ~80px, color `#0f0f0f` — bottom-right decorative element
- Vertical "scroll" label with a descending line — right edge, centered vertically
- Load animation: name translateY(24px)→0 + opacity 0→1 (0.8s ease), subtitle staggered 0.2s after, CTA staggered 0.4s after

### 02 — About
- Two-column grid: `1fr 340px`
- Left column:
  - Pull quote in Playfair italic — excerpt from bio: *"A passion for creating immersive interactive experiences."*
  - Left border accent (2px, `--accent` at 20% opacity)
  - Full bio paragraph in DM Sans
  - Metadata rows (key/value pairs with bottom border): Degree, Focus, Location, Available for
- Right column:
  - Profile photo (`assets/img/CV.jpg`) — full column width, `object-fit: cover`
  - Aspect ratio ~3:4
  - Border: 1px solid `--border`

### 03 — Skills
- Replaces the existing HTML table entirely
- 3×2 CSS grid, separated by 1px `--border` lines
- Each cell has:
  - Category label (DM Sans, 8px, letter-spacing 3px, `--accent`)
  - Tag list: inline bordered chips (border: 1px solid `--border`, padding 3px 10px)
- Categories: Game Dev · Languages · Frontend · Database · Mobile · Tools
- Skills content is exactly the same as current site — only presentation changes

### 04 — Work
- Section label + Playfair "Work" heading + horizontal rule
- All 7 projects as feature cards, stacked vertically, 8px gap
- Each card:
  - Left accent bar: 3px, `--accent` at 20% opacity → 100% on hover
  - Header row: category label (left) + year (right)
  - Title in Playfair Display 700, 20px
  - Description: full original text preserved, DM Sans 13px, `--text-secondary`, line-height 1.75
  - Footer row: tech tag chips (left) + "View ↗" link (right, `--accent`)
- Cards with `data-video` open the existing YouTube modal on click
- Cards with `data-link` open the URL in a new tab
- "View ↗" link has `event.stopPropagation()` to avoid double-triggering
- Hover state: `translateY(-2px)`, accent bar brightens, very subtle box-shadow

**Project list with tech tags:**
1. Bake 'Em Up! — VR · Survival — Unity, VR, C#, AI — itch.io link + video
2. Underground Rebellion — 2D Platformer · Pixel Art — Unity, C#, Pixel Art — itch.io link + video
3. SmartKeeper — IoT · Smart Home — Web, UX, IoT — external link + video
4. Calculus — Educational · Puzzle — Pygame, Python, Game Design — itch.io link + video
5. Spy Room Concept — AR · Mixed Reality — Unity, AR, Meta Quest, C# — GitHub link + video
6. Pick Up Points System — Full Stack · Web — React, Java, Spring Boot, Docker — GitHub link
7. MovingCampus — Mobile · Android — Android, QR Code, GPS, OCR — GitHub link

### 05 — Contact
- Left-aligned, max-width 560px
- "Let's / talk." in Playfair Display italic, ~52px — line break after "Let's"
- Email address: `pedrocoelho485@gmail.com` — DM Sans, 15px, `--accent`, `mailto:` link
- Social links row: GitHub + LinkedIn as small outlined buttons (DM Sans, 9px, letter-spacing 3px)

### Footer
- Single line, `border-top: 1px solid --border`
- Left: "© 2026 Pedro Coelho"
- Right: "Game Developer — Aveiro, PT"
- Both in DM Sans 9px, `--text-dim`, letter-spacing 2px

---

## Video Modal

Keep existing modal behavior and JavaScript exactly as-is. Restyle only:
- Background: `rgba(0,0,0,0.92)` + `backdrop-filter: blur(12px)`
- Modal content: `border: 1px solid --border`, `box-shadow: 0 0 60px rgba(200,184,154,0.08)`
- Close button: Playfair Display, `--accent` color

---

## Motion & Animation

### Page Load (Hero)
```
hero eyebrow:  opacity 0→1, translateY(16px)→0, delay 0s,    duration 0.7s
hero name:     opacity 0→1, translateY(24px)→0, delay 0.15s, duration 0.9s
hero subtitle: opacity 0→1, translateY(12px)→0, delay 0.5s,  duration 0.7s
hero CTA:      opacity 0→1, translateY(8px)→0,  delay 0.7s,  duration 0.6s
```

### Scroll Reveals (IntersectionObserver)
- All `.reveal` elements start at `opacity: 0; transform: translateY(20px)`
- On intersection (threshold 0.15): class `visible` added → `opacity: 1; transform: translateY(0); transition: 0.6s ease`
- Project cards stagger: each card gets `transition-delay: calc(index * 80ms)`
- Skills cells stagger similarly

### Hover States
- Project cards: `transform: translateY(-2px)`, accent bar `opacity: 1`, `transition: 0.25s ease`
- Nav links: `color: --accent`, `transition: 0.2s`
- CTA button: `background: --accent-dim`, `transition: 0.2s`
- Social links: `border-color: --accent`, `color: --accent`, `transition: 0.2s`

---

## File Structure

```
PedroC55.github.io/
├── index.html          ← complete rebuild
├── assets/
│   ├── css/
│   │   └── style.css   ← complete rebuild
│   └── img/
│       └── CV.jpg      ← unchanged
└── _layouts/
    └── default.html    ← unchanged (Jekyll layout, not used by index.html)
```

No new dependencies. Fonts via Google Fonts CDN. particles.js removed (replaced by pure CSS atmosphere: radial gradient on hero background).

---

## Content Preservation Rules

- All project descriptions preserved exactly (may tighten to 2 sentences for card view, full text kept in modal/expanded state)
- All links preserved: itch.io, GitHub, external project pages
- All video IDs preserved for modal
- Email address preserved (with corrected `mailto:` prefix)
- GitHub and LinkedIn URLs preserved
- Bio text preserved (pull quote extracted from it, original kept in full)

---

## Responsive Behavior

- **Desktop (≥1024px):** Full two-column About, 3×2 Skills grid, all sections at 96px padding
- **Tablet (640px–1023px):** About becomes single column (photo above bio), Skills becomes 2×3, section padding 64px
- **Mobile (<640px):** Hero name scales down via `clamp()`, single column everywhere, section padding 32px. Nav collapses: monogram "P·C" stays visible on left; nav links are hidden and replaced with no hamburger (the hero CTA and natural scroll handle navigation adequately on mobile).
