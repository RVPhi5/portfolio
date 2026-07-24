# Rohan Vittal — Portfolio

A minimal, dark, typographic personal portfolio. React + TypeScript + Vite,
Tailwind CSS, React Router. Deployed on Vercel.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

Other scripts:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
```

## Add a new project

All project content lives in a single typed file:
[`src/data/projects.ts`](src/data/projects.ts). It is the single source of
truth — the homepage list, the detail pages, and prev/next navigation all
derive from this array and its order.

To add a project, append a new object to the `projects` array following the
`Project` type. The `slug` becomes the URL segment (`/projects/<slug>`). Order
in the array controls the homepage numbering and prev/next sequence.

## Media assets

Drop images and videos in [`public/media/`](public/media/) and reference them
from a project's `media` field:

```ts
media: { type: 'image', src: '/media/pvdx.jpg' }
// or
media: { type: 'video', src: '/media/pvdx.mp4', poster: '/media/pvdx.jpg' }
```

If `media` is omitted, a "media coming soon" placeholder renders. Videos
autoplay muted and looped, and fall back to the poster frame for viewers who
prefer reduced motion.

## Deploy (Vercel)

Import the GitHub repo in Vercel. Framework preset **Vite**, build command
`npm run build`, output directory `dist`. Client-side routing is handled by the
rewrite in [`vercel.json`](vercel.json), so deep links like
`/projects/pvdx-cubesat` resolve correctly.

The custom domain `rohanvittal.com` is attached in the Vercel dashboard once
purchased — no code change needed.
