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
