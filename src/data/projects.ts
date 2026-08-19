export type Media = {
  type: 'image' | 'video' | 'youtube';
  /** A file URL for image/video, and a bare YouTube video id for `youtube`. */
  src: string;
  poster?: string;
};

export type Project = {
  slug: string; // URL segment
  title: string;
  stackSummary: string; // shown inline on the homepage, e.g. "Embedded C · FreeRTOS"
  category: string; // eyebrow on detail page
  dates: string; // e.g. "2025–present"
  tagline: string; // one sentence
  media?: Media;
  /**
   * Shown on the homepage card in place of `media`. Lets a project lead with a
   * still on the index and save a heavier video for its detail page.
   */
  cardMedia?: Media;
  links: { label: string; href: string; icon: 'github' | 'external' }[];
  tags: string[]; // sidebar stack pills
  highlights: { value: string; label: string }[];
  sections: { heading: string; paragraphs: string[] }[];
};

// Single source of truth: the homepage list, detail pages, and prev/next
// navigation all derive from this array and its order.
//
// TODO: replace the placeholder GitHub URLs below with the real per-repo
// links once each repository is public.
export const projects: Project[] = [
  {
    slug: 'coursetrees',
    title: 'CourseTrees',
    stackSummary: 'Next.js · Supabase · Postgres',
    category: 'Full-stack',
    dates: '2026',
    tagline:
      'A course-planning platform mapping prerequisite graphs, grades, and professor ratings across 150+ universities.',
    media: { type: 'youtube', src: 'oRhyapIReWc' },
    cardMedia: { type: 'image', src: '/media/coursetrees.png' },
    links: [
      { label: 'Visit site', href: 'https://coursetrees.com', icon: 'external' },
    ],
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Postgres', 'Cytoscape', 'Python'],
    highlights: [
      { value: '150+', label: 'universities covered' },
      { value: '390K+', label: 'courses indexed' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'CourseTrees turns a university course catalog into an interactive prerequisite graph layered with grade distributions, professor ratings, and degree requirements, covering 150+ schools.',
        ],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'Interactive prerequisite graphs rendered with Cytoscape over roughly 400K courses and 400K+ dependency edges, with per-school theming and department filtering.',
          'Python ingestion pipelines that scrape and normalize catalogs, offerings, and grade distributions from public university sources into a shared Postgres schema keyed by school.',
          'A Next.js 15 App Router front end on Supabase, where every write goes through an atomic Postgres RPC and row-level security is the security boundary rather than the API layer.',
        ],
      },
      {
        heading: 'Making it scale',
        paragraphs: [
          'Aggregates like course stat bands and the professor ladder read from cron-refreshed materialized views instead of being computed per request, and public pages are served with incremental static regeneration.',
          'Review and discussion feeds use keyset pagination on (created_at, id) cursors so deep pages cost the same as the first, and realtime subscriptions are opt-in per view so connection counts track engaged users rather than raw traffic.',
        ],
      },
    ],
  },
  {
    slug: 'tcp-ip-stack',
    title: 'Userspace TCP/IP Stack',
    stackSummary: 'C++ · concurrent systems',
    category: 'Systems',
    dates: 'Feb–May 2026',
    tagline:
      'A full IPv4, TCP, and RIP implementation written from scratch over UDP tunnels.',
    links: [
      // TODO: point at the real TCP/IP stack repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['C++', 'TCP', 'RIP', 'UDP Sockets', 'Concurrency'],
    highlights: [
      { value: '3', label: 'protocol layers built' },
      { value: '4-tuple', label: 'socket demux' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'A userspace networking stack implementing the IP and transport layers from the ground up, running over UDP tunnels that emulate physical links between virtual hosts and routers.',
        ],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'An IPv4 layer with header parsing, checksum validation, TTL handling, and longest-prefix-match forwarding, plus a custom RIP implementation carried over IP protocol 200 for dynamic route distribution.',
          'A full TCP implementation: three-way handshake, socket demultiplexing by 4-tuple, sliding-window transfer, RTT/RTO estimation with exponential backoff, and zero-window probing.',
          'Graceful connection teardown handling all FIN states across the state machine.',
        ],
      },
    ],
  },
  {
    slug: 'pokematch',
    title: 'PokéMatch',
    stackSummary: 'PyTorch · CLIP',
    category: 'Machine learning',
    dates: '2026',
    tagline:
      'An ML recommender that ranks trading cards by visual cohesion rather than set, rarity, or type.',
    media: { type: 'image', src: '/media/pokematch-poster.png' },
    links: [
      // TODO: point at the real PokéMatch repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['PyTorch', 'CLIP', 'scikit-learn', 'NumPy'],
    highlights: [
      { value: '90–92%', label: 'pairwise accuracy' },
      { value: '67%', label: 'preferred over baseline' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'PokéMatch recommends trading cards that look good together, ranking by visual cohesion rather than the usual metadata like set, rarity, or type.',
        ],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'An end-to-end pipeline processing 13K+ card images into 527-dimensional representations that combine 512-dim CLIP ViT-B/32 embeddings with 15 handcrafted color features.',
          'A human-in-the-loop labeling interface that collected 200 preference examples, used to train an MLP ranker with a pairwise logistic ranking loss.',
        ],
      },
      {
        heading: 'Results',
        paragraphs: [
          'In a human study across 20 binder-page comparisons, the model was preferred 67% overall and 72% in the single-card query setting.',
        ],
      },
    ],
  },
  {
    slug: 'jungle',
    title: 'Jungle',
    stackSummary: 'Spring Boot · WebSockets',
    category: 'Full-stack',
    dates: '2026–present',
    tagline:
      'A browser implementation of Dou Shou Qi with AI opponents and real-time online multiplayer.',
    media: { type: 'image', src: '/media/jungle.png' },
    links: [
      // TODO: point at the real Jungle repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['Java', 'Spring Boot', 'WebSockets', 'SQLite', 'JavaScript'],
    highlights: [
      { value: '4', label: 'gameplay modes' },
      { value: '2', label: 'AI opponents' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'A browser-based implementation of Dou Shou Qi (Jungle / Animal Chess), featuring AI opponents and real-time online multiplayer.',
        ],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'Four gameplay modes: local two-player, human vs. AI, agent-vs-agent spectating, and online multiplayer.',
          'Two AI opponents: a greedy one-ply agent and a minimax search with alpha-beta pruning at depths 2 and 4, with randomized root jitter to vary play.',
          'A Spring Boot backend serving REST plus WebSocket rooms with reconnectable state, resignations, and in-room chat, backed by a SQLite leaderboard API with persistent match history.',
        ],
      },
    ],
  },
  {
    slug: 'cocube',
    title: 'CoCube',
    stackSummary: 'C# · .NET 8 · SignalR',
    category: 'Full-stack',
    dates: '2026',
    tagline:
      'A two-player cooperative Rubik’s cube where each player controls three faces and neither can solve it alone.',
    links: [
      // TODO: point at the real CoCube repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['C#', '.NET 8', 'ASP.NET Core', 'SignalR', 'Blazor WebAssembly', 'xUnit'],
    highlights: [
      { value: '444', label: 'tests across engine, server, client' },
      { value: '3/3', label: 'face split per player' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'Two players share a single 3x3 cube. Each controls three faces, turns alternate strictly, and one two-minute countdown runs for both — so the cube is solved together or not at all.',
        ],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'A cube engine modeling all 54 facelets in Singmaster order, where each face is defined exactly once as five disjoint 4-cycles and prime and double turns derive from a quarter-turn count, so variants cannot drift from the base permutation.',
          'A server that is the sole source of truth for cube state, turn order, face permissions, and the clock. The client sends move intents and renders what it is told, and connection-to-room mapping happens server-side so no gameplay call carries a room code a client could forge.',
          'A seeded scrambler that rejects back-to-back same-face turns and re-rolls sequences cancelling to the identity, since opposite faces commute and R L R’ L’ is a four-move no-op that would hand out a solved cube.',
        ],
      },
      {
        heading: 'Getting the rules right',
        paragraphs: [
          'Face grants partition all six faces 3/3 (U/D/F against L/R/B) so no scramble is unsolvable by the pair, enforced by tests asserting union, disjointness, and exactly one owner per face.',
          'The round deadline is enforced two independent ways — checked on every submitted move, and swept every 250 ms by a background service — both funnelled through one lock-guarded expiry call, so a round where nobody moves again still resolves, and exactly one end-of-game event fires whichever path wins.',
          'An injected time provider keeps the system clock out of the engine, letting deadline tests assert exact boundaries: no expiry at 119.5s, expiry at 120.0s, post-deadline moves discarded. Two real SignalR clients drive a live test host to verify byte-identical state and no cross-room leakage.',
        ],
      },
    ],
  },
  {
    slug: 'ufb-budget',
    title: 'UFB Budget & Reimbursement',
    stackSummary: 'Java 21 · Spring Boot · Oracle',
    category: 'Backend',
    dates: 'Jun–Aug 2026',
    tagline:
      'A multi-club budget and reimbursement system built around separation of duties, modeled on Brown’s Undergraduate Finance Board.',
    links: [
      // TODO: point at the real UFB repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['Java 21', 'Spring Boot', 'Oracle', 'PL/SQL', 'Flyway', 'Angular', 'Docker'],
    highlights: [
      { value: '3', label: 'club-scoped roles' },
      { value: '403', label: 'not 404, on foreign ids' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'A budget and reimbursement system covering the full tree from fiscal year down to line item, plus recorded expenses, reimbursement claims, and tournament invoicing across multiple clubs.',
        ],
      },
      {
        heading: 'Separation of duties',
        paragraphs: [
          'Three club-scoped roles — treasurer, signatory, viewer — are resolved per request by mapping any addressed id back to the club that owns it. The treasurer who spends cannot approve repaying it, and the signatory who approves a claim cannot also mark it paid.',
          'Ids belonging to another club return 403 rather than 404, so probing cannot reveal which ids exist. A 404 appears only for resources the caller already holds the role to read, so error codes never leak the database’s contents.',
        ],
      },
      {
        heading: 'Correctness under concurrency',
        paragraphs: [
          'The approval decision moved into a PL/SQL procedure that locks the line-item row before summing committed claims, closing a race where two signatories each see budget room and together overrun the line. Approved and paid claims both count as committed, so pending approvals cannot quietly be double-spent.',
          'Each budget item’s cached spend total is written in the same transaction as the expense row under a pessimistic row lock, with a resync endpoint to rebuild it. Schema changes go exclusively through Flyway with Hibernate pinned to validate mode, so the running app can never alter a production table out from under a migration.',
          'Invoices copy the letterhead onto each one at creation, so later configuration changes cannot rewrite invoices a club has already sent — they stay stable for audit.',
        ],
      },
    ],
  },
  {
    slug: 'texttrack',
    title: 'TextTrack',
    stackSummary: 'Python · OpenCV · PyTorch',
    category: 'Computer vision',
    dates: '2026',
    tagline:
      'A pipeline that detects, tracks, removes, and replaces text in broadcast video — on deforming fabric, under occlusion and motion blur.',
    links: [
      // TODO: point at the real TextTrack repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['Python', 'OpenCV', 'EasyOCR', 'PyTorch', 'Kalman Filtering'],
    highlights: [
      { value: '3', label: 'fused per-region estimators' },
      { value: '4', label: 'visibility states' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'An end-to-end computer-vision pipeline for in-video text replacement, built for the hardest version of the problem: sports-jersey wordmarks on fabric that deforms, gets occluded, blurs with motion, and changes scale shot to shot.',
        ],
      },
      {
        heading: 'Tracking',
        paragraphs: [
          'Three per-region estimators are fused: a constant-velocity Kalman filter carries a region through occlusion, Lucas-Kanade optical flow follows fabric deformation, and a One-Euro filter smooths corner jitter. Regions are associated across frames by Hungarian assignment on IoU.',
          'A false-positive stage rejects everything that looks like text but isn’t the target: geometry gates, exclusion zones, screen-static suppression that discards fixed-position scoreboards and ad boards, and OCR fuzzy-matching against the target brand string.',
        ],
      },
      {
        heading: 'Replacement',
        paragraphs: [
          'A visibility state machine (VISIBLE / OCCLUDED / NON_FRONTAL / LOST) with hysteresis and alpha ramping guarantees replacement text is never projected onto an occluded or non-frontal surface.',
          'Inpainting stays temporally consistent by blending each frame’s Telea result with the previous frame’s output warped forward by dense optical flow on the ROI, which eliminates the flicker of naive per-frame inpainting. Compositing warps the replacement by homography onto the tracked quad and matches fabric shading and directional motion blur.',
        ],
      },
    ],
  },
  {
    slug: 'quizbowl-cat',
    title: 'Quizbowl CAT',
    stackSummary: 'Python · Flask · Item Response Theory',
    category: 'Applied math',
    dates: 'Oct–Dec 2025',
    tagline:
      'A computerized adaptive test that estimates quizbowl ability on a latent-trait scale using a Rasch measurement engine.',
    links: [
      // TODO: point at the real Quizbowl CAT repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['Python', 'Flask', 'gunicorn', 'JavaScript', 'Rasch/1PL'],
    highlights: [
      { value: '2', label: 'total dependencies' },
      { value: '6', label: 'tier score predictions' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'An adaptive test for quizbowl bonus parts: it streams questions from the QBReader API, grades free-text answers against its answerline matcher, and estimates ability on a latent-trait scale rather than just counting correct answers.',
        ],
      },
      {
        heading: 'The measurement engine',
        paragraphs: [
          'A Rasch (1PL) model updates ability by Robbins-Monro stochastic approximation — a fixed step times the residual between outcome and logistic response probability, which is the single-response gradient of the Rasch log-likelihood, with theta clamped to ±5.',
          'Fisher information P(1-P) accumulates per response to derive a standard error and 95% confidence interval, suppressed entirely until at least one response is recorded. The final estimate converts into a 1–10 score plus six independent predictions of points-per-bonus, from middle school through open and college nationals.',
        ],
      },
      {
        heading: 'Item selection and plumbing',
        paragraphs: [
          'The item bank is a hand-calibrated table mapping tournament level crossed with bonus part position onto a difficulty anchor, sidestepping the per-item calibration the app collects no response data for. Items are selected by nearest anchor within a relative near-tie window of 0.12 logits, so interchangeable tiers randomize and the candidate set widens where the estimate is least decisive.',
          'A two-tier fetch demands well-curated packets first, then falls back to a deliberately relaxed query so sparse cells still yield questions, reporting explicit exhaustion when a cell yields nothing usable.',
          'The Flask process is fully stateless — all session state lives in a signed, zlib-compressed cookie so any gunicorn worker can serve any request. The dependency surface is held to two packages by using the standard library for outbound HTTP, with hand-rolled retry and per-request timeouts against a flaky upstream.',
        ],
      },
    ],
  },
  {
    slug: 'oughttosee',
    title: 'OughtToSee',
    stackSummary: 'React Native · FastAPI · Gemini',
    category: 'Full-stack',
    dates: '2026',
    tagline:
      'An AI event-discovery app that turns a city, budget, and date into a day rendered as a list, a map route, and an aerial tour.',
    links: [
      // TODO: point at the real OughtToSee repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['React Native', 'Expo', 'TypeScript', 'FastAPI', 'Gemini', 'Google Maps'],
    highlights: [
      { value: '3', label: 'tier aerial-tour fallback' },
      { value: '20', label: 'city bounding boxes validated' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'An itinerary planner with a React Native (Expo) client and an async FastAPI backend. You give it a city, a budget, a date, and some interests; it gives you back a planned day as a list, a map route, and an aerial flyover.',
        ],
      },
      {
        heading: 'Making the LLM reliable',
        paragraphs: [
          'The generation pipeline splits responsibilities: SerpAPI does recall, the LLM does precision. Search queries are kept deliberately minimal after specific queries embedding dates and preferences turned out to fall off an empty-result cliff.',
          'Gemini runs in JSON response mode with Pydantic validation on the way out, so output is guaranteed parseable into typed itinerary items rather than scraped from prose. The prompt requires street addresses with city and state, supplying good and bad examples, because those strings feed the Geocoding API and a vague "Downtown" breaks the map.',
          'Every geocoding result is validated against a 20-city bounding-box table and retried once with an explicit city and country suffix when a result lands outside its box, defending against same-name-city ambiguity. Budget filtering relaxes progressively rather than dead-ending: strict per-event cap, then double cap, then any 20 events, then a curated fallback set labeled as suggestions.',
        ],
      },
      {
        heading: 'The client',
        paragraphs: [
          'The navigation stack is itself the state machine, accumulating one field per screen into a params object forwarded to the next, with no global store at all — so Start Over is a single pop to top.',
          'A gesture-driven budget slider clamps to container width and snaps to $25 steps while driving an animated thumb and React state in sync, next to a from-scratch calendar grid with no date library. Google Directions polylines are decoded with a hand-written varint/zigzag implementation, rendering multi-stop routes without a mapping SDK helper.',
          'Exports go out as PDF via fpdf2 — with a text sanitizer mapping smart quotes and accents down to ASCII, since the built-in font is Latin-1 only — and as .ics files emitting one timed event per item, so a finished plan imports straight into a real calendar.',
        ],
      },
    ],
  },
];
