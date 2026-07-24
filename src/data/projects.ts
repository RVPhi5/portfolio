export type Project = {
  slug: string; // URL segment
  title: string;
  stackSummary: string; // shown inline on the homepage, e.g. "Embedded C · FreeRTOS"
  category: string; // eyebrow on detail page
  dates: string; // e.g. "2025–present"
  tagline: string; // one sentence
  media?: { type: 'image' | 'video'; src: string; poster?: string };
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
    slug: 'pvdx-cubesat',
    title: 'PVDX CubeSat',
    stackSummary: 'Embedded C · FreeRTOS',
    category: 'Flight software',
    dates: '2025–present',
    tagline:
      'Real-time flight software for a student-built CubeSat launching in 2027, running on a radiation-hardened microcontroller.',
    // media intentionally undefined — placeholder renders until an asset is added.
    links: [
      // TODO: point at the real PVDX repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['C/C++', 'FreeRTOS', 'NASA cFS', 'CFDP'],
    highlights: [
      { value: '0.1→97%', label: 'bit-flip reliability' },
      { value: '2027', label: 'launch year' },
    ],
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'PVDX is a CubeSat developed by Brown Space Engineering. Rohan works on the flight software core: the code that runs the satellite autonomously in orbit, out of contact with the ground.',
        ],
      },
      {
        heading: 'What I built',
        paragraphs: [
          'An autonomous fault-detection and recovery system that distinguishes transient bit-flips from permanent hardware failures, with a persistent "dead list" in MRAM so the command dispatcher routes around faulty components across reboots.',
          'A triplicated bootloader with checksums took bit-flip reliability from 0.1% to 97%. Watchdog recovery logic was verified against 100% of simulated corruption events using a custom fault-injection tool.',
        ],
      },
      {
        heading: 'Technical details',
        paragraphs: [
          'Built on a 7-stage deterministic state machine covering the full mission lifecycle. Static allocation throughout to avoid heap fragmentation in flight, and a "no infinite loops" standard to guarantee deterministic real-time behavior.',
        ],
      },
    ],
  },
  {
    slug: 'tcp-ip-stack',
    title: 'Userspace TCP/IP Stack',
    stackSummary: 'Go · concurrent systems',
    category: 'Systems',
    dates: '2026',
    tagline:
      'A full IPv4, TCP, and RIP implementation written from scratch over UDP tunnels.',
    links: [
      // TODO: point at the real TCP/IP stack repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['Go', 'TCP', 'RIP', 'Concurrency'],
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
    stackSummary: 'FastAPI · WebSockets',
    category: 'Full-stack',
    dates: '2026',
    tagline:
      'A browser implementation of Dou Shou Qi with AI opponents and real-time online multiplayer.',
    links: [
      // TODO: point at the real Jungle repository.
      { label: 'View code', href: 'https://github.com/RVPhi5', icon: 'github' },
    ],
    tags: ['FastAPI', 'WebSockets', 'SQLite', 'JavaScript'],
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
          'A FastAPI backend serving REST plus WebSocket rooms with reconnectable state, resignations, and in-room chat, backed by a SQLite leaderboard API with persistent match history.',
        ],
      },
    ],
  },
];
