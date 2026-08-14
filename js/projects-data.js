export const PROJECTS = [
  {
    id: 'condeixa', title: 'Condeixa XR', year: '2025',
    blurb: "A geolocated augmented-reality PWA for the Município de Condeixa-a-Nova: a map of points of interest, an AR mode with image tracking over real facades, an embedded 360º tour, and every piece of content editable by the town's own staff.",
    problem: "Visitors arrive on foot with one hand free and no appetite for installing an app. The heritage story lives on plaques nobody reads, and the municipality had no way to update it without a developer.",
    decisions: "A PWA instead of native, so a QR code on site is the whole install step. Image tracking against the buildings themselves rather than GPS-anchored overlays, because GPS drifts by metres and a facade doesn't. MapLibre over a proprietary SDK for styling control and no per-view billing. Sanity as the CMS, so POIs and 360º scenes ship without a deploy.",
    tags: ['MindAR.js', 'MapLibre', 'Sanity CMS', 'PWA'],
    media: '360º tour, heritage overlay on the square',
    hero: 'Assets/projects/condeixa/hero.webp',
    alt: "Condeixa XR 360º tour: a black-and-white historical photograph of the square blended into the live view of the street as it looks today."
  },
  {
    id: 'pacheca', title: 'Quinta da Pacheca', year: '2025',
    blurb: "A rebuilt interactive 360º tour of a Douro wine estate, with cellar, vineyard and rooms walkable in sequence and VR playback for on-site headsets.",
    problem: "The existing virtual tour was a dead end: disconnected panoramas, no sense of the route through the estate, and nothing that worked in a headset. Bookings depend on people believing the place before they drive three hours to it.",
    decisions: "Rebuilt the tour as a connected graph of scenes so movement follows how a guide actually walks a visitor through. Designed the hotspot and caption layer in Figma first, then built it in 3DVista rather than a custom viewer, so the estate's own team can re-shoot and replace scenes. Kept the UI light enough to hold framerate in VR.",
    tags: ['3DVista', 'Figma', 'VR'],
    media: 'Wine barrel guest rooms',
    hero: 'Assets/projects/pacheca/hero.webp',
    alt: "Quinta da Pacheca 360º tour: the estate's wine barrel guest rooms seen from the garden path, with the Douro hills behind them."
  },
  {
    id: 'nb', title: 'Grupo NB Tour', year: '2025',
    blurb: "A 360º walkthrough of a residential complex in Aveiro, built for sales while the buildings were still unfinished.",
    problem: "Apartments had to be sold off-plan. Renders convince nobody about scale, light or how far the balcony really is from the street.",
    decisions: "Anchored the tour on real captured space rather than renders wherever construction allowed it, and kept a consistent eye height between scenes so rooms read at true scale. Structured navigation by unit type, so a buyer only walks the apartment they are considering.",
    tags: ['3DVista', '360º capture'],
    media: 'Apartment interior, unit walkthrough',
    hero: 'Assets/projects/nb/hero.webp',
    alt: "Grupo NB 360º tour: the living room of a finished apartment, with full-height balcony doors open to the street."
  },
  {
    id: 'spy', title: 'Spy Room', year: '2024',
    blurb: "Mixed reality for Meta Quest: room scanning turns the player's own space into the level.",
    problem: "A mixed-reality level cannot be authored in advance. Every player's room has different walls, furniture and free floor, and the design has to survive geometry it has never seen.",
    decisions: "Built the level generation on scene-understanding data: walls become surfaces for objectives, furniture becomes cover, and free floor sets the play area. Every placement rule has a fallback for cramped rooms, and the game refuses to start rather than spawning something inside a sofa.",
    tags: ['Unity', 'C#', 'Meta Quest SDK'],
    media: 'Laser grid over a scanned room',
    hero: 'Assets/projects/spy/hero.webp',
    alt: "Spy Room on Meta Quest: a grid of red laser beams generated across a real living room, passed through to the headset camera."
  },
  {
    id: 'bake', title: "Bake 'Em Up!", year: '2024',
    blurb: "A VR survival game about baking under pressure, with hand-driven interaction and a strict performance budget on standalone hardware.",
    problem: "Standalone headsets give you no headroom: drop frames and players feel it in their stomach. The game still had to keep several physics-driven objects in the air at once.",
    decisions: "Budgeted the frame first and designed within it, pooling objects, simplifying colliders and baking lighting. Made every interaction physical rather than menu-driven, so the difficulty comes from handling things, not from reading UI.",
    tags: ['Unity', 'C#', 'VR'],
    media: 'Hand-driven interaction at the oven',
    hero: 'Assets/projects/bake/hero.webp',
    alt: "Bake 'Em Up! in VR: the player's cartoon paws reaching for a timer on an orange oven in a stylised kitchen."
  },
  {
    id: 'creative-learning', title: 'Creative Learning', year: '2026',
    blurb: "Multi-tenant e-learning platform for corporate training across companies and roles, with a React frontend over a custom WordPress REST API.",
    problem: "A training company managing courses across multiple client companies needed a platform where the training company, the participating companies, the trainers and the trainees could each see only what's relevant to them. The existing WordPress setup wasn't built for this: no clean way to scope courses, enrollments and progress by company, no secure quiz-taking flow, and no protection against a user seeing another company's data.",
    decisions: "I kept WordPress as the backend, Tutor LMS for course structure and ACF for custom fields, and built a React frontend on top of a custom REST API layer rather than stitching together native endpoints. Server-side identity checks became the backbone of every endpoint, never trusting a company or user ID sent from the client, since that's the only real boundary between companies. For quizzes I moved all answer state into memory and submitted it in one shot at the end, with a stricter session running only during an active attempt. A known conflict between ACF and the LMS plugin silently dropped certain fields, so a few reads fall back to the database directly instead of trusting the higher-level API.",
    tags: ['React.js', 'WordPress', 'ACF', 'REST API'],
    media: 'Company dashboard',
    hero: 'Assets/projects/creative-learning/hero.webp',
    alt: "Creative Learning dashboard: summary counters for courses and collaborators above course and collaborator tables, in a client company's view."
  }
];
