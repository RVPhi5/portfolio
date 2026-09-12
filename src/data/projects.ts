export type Media = {
  type: 'image' | 'video' | 'youtube';
  /** A file URL for image/video, and a bare YouTube video id for `youtube`. */
  src: string;
  poster?: string;
  /**
   * How the asset sits in the 16:9 media well. `cover` (the default) fills the
   * frame and crops the overflow, which suits landscape stills and clips.
   * `contain` letterboxes instead, for assets whose aspect is far from 16:9 —
   * portrait phone captures, posters — where cropping would eat the content.
   */
  fit?: 'cover' | 'contain';
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
  /**
   * Keeps the project off the homepage grid and out of prev/next, while
   * `/projects/<slug>` keeps working — so a link already out in the world (a
   * resume, an application) still resolves. This is un-featuring, NOT a
   * privacy control: the page stays public to anyone holding the URL, and it
   * stays in the JS bundle. Delete the entry instead if it should be gone.
   */
  unlisted?: boolean;
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
        heading: 'What we built',
        paragraphs: [
          'Interactive prerequisite graphs rendered with Cytoscape over roughly 400K courses and 400K+ dependency edges, with per-school theming and department filtering.',
          'Python ingestion pipelines that normalize catalogs, offerings, and grade distributions from public university sources into a shared Postgres schema keyed by school.',
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
      'A from-scratch IPv4, TCP, and RIP implementation over UDP tunnels that interoperates with the course reference and moves 1 MB 2.28× faster.',
    // The 1 MB transfer-time chart from the write-up: the bimodal fast/stalled
    // split, and the staircase the zero-window probe paced. ~2.5:1, so
    // `contain` rather than a crop that would clip an axis.
    media: { type: 'image', src: '/media/tcp-ip-stack.png', fit: 'contain' },
    links: [
      // TODO: point at the real TCP/IP stack repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['C++', 'TCP', 'RIP', 'UDP Sockets', 'Concurrency', 'Wireshark'],
    highlights: [
      { value: '2.28×', label: 'faster than the reference on 1 MB' },
      { value: '3.37%', label: 'retransmit rate at 2% induced loss' },
      { value: '184×', label: 'run-to-run spread traced to one bug' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'A userspace networking stack built for Brown’s CSCI 1680, implementing the IP and transport layers from the ground up over UDP tunnels that emulate physical links between virtual hosts and routers. The course supplied a reference implementation and the link-file parser; IP forwarding, RIP, the TCP stack, the socket API, and the REPL are mine.',
        ],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'An IPv4 layer that validates headers and checksums, decrements TTL, and forwards or delivers by longest-prefix match, with one UDP socket per interface underneath and a protocol-to-handler map above — TCP on protocol 6, and a custom RIP with triggered updates, split horizon, and poisoned reverse on protocol 200.',
          'A full TCP: the state machine and three-way handshake, socket demultiplexing by 4-tuple, send and receive buffers with sliding-window transfer, a retransmit queue driven by RTT/RTO estimation with exponential backoff, an early-arrival queue for out-of-order segments, zero-window probing, and graceful teardown across every FIN state including half-close.',
          'A socket API — v_listen, v_accept, v_connect, v_read, v_write, v_close — and a REPL over it for bringing interfaces up and down, inspecting the routing and interface tables, and driving file sends and receives between nodes.',
        ],
      },
      {
        heading: 'Reliability decisions',
        paragraphs: [
          'RTO is SRTT + 4·RTTVAR, clamped, with RTTVAR updated first, against the old SRTT and every constant a power of two so the estimator needs no division. The margin has to scale with jitter rather than mean RTT: too short and the sender resends data still in flight, too long and the link goes dead after a loss. RFC 6298 mandates a one-second floor to absorb receivers that delay ACKs 200–500 ms to piggyback them; this stack has no delayed ACKs and RTTs in the microseconds, so the floor drops to 1 ms.',
          'Segments arriving past a gap are queued rather than dropped and spliced into the stream when the gap fills, since discarding them would force the peer to resend data that already arrived. When the receive buffer fills and the window closes, the reopening update is a pure ACK — and pure ACKs are never retransmitted — so the sender probes with a single byte outside the window rather than waiting on an update that may never arrive. A FIN carries the connection’s final sequence number and is only sent once the send buffer drains.',
          'A first 1 MB pass at 2% induced loss moved 832 data segments with 28 retransmissions (3.37%), against 2.16% measured loss on data and 2.21% on ACKs at the router. All 602 duplicate ACKs were ignored — there is no fast retransmit — nothing arrived out of order, and the transfer came through byte-identical.',
        ],
      },
      {
        heading: 'Finding a 184× stall',
        paragraphs: [
          'The same 1 MB transfer on the same machine took either 0.087 s or 16.02 s, never anything in between. A bimodal split with an empty middle rules out variable load, and the slow runs each logged exactly 16 zero-window events against zero on the fast ones.',
          'The first hypothesis, raised in a code review, was that RTT samples were being taken from retransmitted segments. Instrumenting it showed the path fired 19 times and changed the outcome zero times — the timestamp was already cleared a line earlier, so the bad sample was never taken — and the measured effect was −0.50 s against a pooled σ of 1.85 s. The real cause was a message that was never sent: the application drained the receive buffer, freeing space, without telling the sender, so the window reopened only when the one-second zero-window probe fired. Sixteen stalls of one second, one 64 KiB buffer apiece, is exactly 1 MiB and 16 s — the transfer was being paced by the probe timer. Probing is the backstop for a lost update, not the delivery path for every update.',
          'Emitting a window update whenever the application frees receive space removed the stall and left the fast path 2.28× faster than the reference. A second trap was in the instrument rather than the code: the first read of a lossy capture reported 825 retransmissions against a true count of 24, because both hops are on loopback, every packet is therefore captured twice, and the analyzer scores the duplicate as a retransmission. A display filter does not help — the analysis flags are computed over every frame before the filter is applied to the output.',
        ],
      },
      {
        heading: 'Keeping it correct',
        paragraphs: [
          'Most of the invariants are carried by the structure rather than by discipline. IP holds nothing but a protocol-to-handler map — no type at that layer names a socket or a route — so a layering violation is unreachable by construction. Addresses are value types throughout and byte-order conversion happens only inside header serialization, which turns a host/network mixup into a compile error. Every shared field names its mutex and the lock order is fixed stack-then-socket, since races were the dominant defect class early on. Timers are a single sorted queue on one thread rather than a timer object per outstanding segment. Sequence arithmetic goes only through wraparound-safe helpers, never a raw comparison or subtraction — an underflow once dropped 22 KB silently while reporting success.',
          'Each layer was tested as it landed, checked against the reference implementation for interoperability, and re-run repeatedly before any timing claim, with the capture analyzer itself verified before its numbers were trusted. The stack has no congestion control, no simultaneous open, no TCP options, no delayed ACKs, and no fast retransmit, and it runs over loopback only. TCP options, congestion control, and moving beyond loopback are next.',
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
    media: { type: 'image', src: '/media/pokematch-poster.png', fit: 'contain' },
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
        heading: 'What we built',
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
    media: { type: 'image', src: '/media/oughttosee.png', fit: 'contain' },
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

/** The homepage grid's source — `projects` minus anything `unlisted`. */
export const listedProjects: Project[] = projects.filter((p) => !p.unlisted);

/**
 * Wrap-around prev/next for a detail page, walking LISTED projects only so the
 * footer never links into an un-featured page.
 *
 * An unlisted project is still reachable by direct link, and needs neighbors
 * too — it just isn't in the listed ring. For that case we walk the full array
 * outward from its position to find the nearest listed project on either side,
 * which keeps the footer pointing at the same places a reader would have
 * arrived from. Returns nulls only when nothing is listed at all.
 */
export function projectNeighbors(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  if (listedProjects.length === 0) return { prev: null, next: null };

  const listedIndex = listedProjects.findIndex((p) => p.slug === slug);
  if (listedIndex !== -1) {
    const { length } = listedProjects;
    return {
      prev: listedProjects[(listedIndex - 1 + length) % length],
      next: listedProjects[(listedIndex + 1) % length],
    };
  }

  // Unlisted (or unknown): scan outward from its slot in the full array.
  const fullIndex = projects.findIndex((p) => p.slug === slug);
  if (fullIndex === -1) return { prev: null, next: null };

  const { length } = projects;
  const nearest = (step: -1 | 1): Project | null => {
    for (let i = 1; i <= length; i++) {
      // Double modulo so a negative step wraps to the end rather than to NaN.
      const at = (((fullIndex + step * i) % length) + length) % length;
      if (!projects[at].unlisted) return projects[at];
    }
    return null;
  };
  return { prev: nearest(-1), next: nearest(1) };
}
