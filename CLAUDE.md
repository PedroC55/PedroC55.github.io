# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A static personal portfolio site for Pedro Coelho (game developer). It is a **single-page HTML site** hosted on GitHub Pages — no build step, no framework, no package manager. Changes go live after a `git push` to `master`.

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | The entire site — all five sections live here |
| `assets/css/style.css` | All styles, using CSS custom properties (design tokens at the top) |
| `assets/img/CV.jpg` | Profile photo |
| `images/` | Project screenshots and demo assets |
| `pdf/` | Downloadable PDFs |
| `_layouts/default.html` | Jekyll fallback layout (not used by index.html) |
| `_includes/head-custom.html` | Jekyll head partial (not actively used) |

## How to Preview

Open `index.html` directly in a browser — no server required. For a local server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Key Design Decisions

- **Dark editorial aesthetic**: deep near-black (`#0a0a0f`) background, warm cream text (`#f5f0e8`), gold accent (`#c8b89a`). All palette values are CSS variables in `:root` at the top of `style.css`.
- **Fonts**: `Playfair Display` (display/headings) + `DM Sans` (body) loaded from Google Fonts.
- **Sections** are numbered 01–05: Hero → About → Skills → Work → Contact.
- **Project cards** support two interaction modes via `data-*` attributes: `data-video="<youtubeId>"` opens a YouTube embed modal; `data-link="<url>"` opens an external link.
- **Scroll reveal**: elements with class `reveal` animate in via `IntersectionObserver`. Add the class to new elements that should animate on scroll.
- The `_layouts/` and `_includes/` files are Jekyll artifacts — they are not used by the current standalone `index.html`.

## Adding a Project

Add an `<article class="project-card reveal">` inside `.projects-list` in `index.html`. Follow the existing card structure:

```html
<article class="project-card reveal" data-video="YOUTUBE_ID">
  <div class="project-card-header">
    <span class="project-cat">Category · Tags</span>
    <span class="project-year">YYYY</span>
  </div>
  <h3 class="project-title">Title</h3>
  <p class="project-desc">Description.</p>
  <div class="project-footer">
    <ul class="project-tags"><li>Tag</li></ul>
    <a href="URL" class="project-link" target="_blank" onclick="event.stopPropagation()">View ↗</a>
  </div>
</article>
```

Use `data-link="URL"` instead of `data-video` for projects without a YouTube demo.

## Deployment

Push to `master` — GitHub Pages auto-deploys. No CI, no build pipeline.
