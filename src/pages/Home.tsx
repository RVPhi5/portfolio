import { ArrowDown } from 'lucide-react';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import Seo from '../components/Seo';
import { projects } from '../data/projects';

/** Shared horizontal track. Wider than the reading column the detail pages use,
 *  because the project grid needs room for two cards side by side. */
const TRACK = 'mx-auto w-full max-w-[1240px] px-6 md:px-8';

export default function Home() {
  return (
    <>
      <Seo
        title="Rohan Vittal — Software Engineer"
        description="Software engineer working in flight systems, networking, and ML. Currently building flight software for a CubeSat launching in 2027 and interning at Mirico."
      />

      <main>
        {/* Hero. `min-h-svh` rather than `min-h-screen` so mobile browser
            chrome cannot push the button below the fold. */}
        <section className="relative flex min-h-svh flex-col justify-center">
          <div className={`${TRACK} relative`}>
            {/* Solid panel holding the name and the button together, so both
                sit on flat `bg` instead of on moving cubes. `inline-block` so
                it hugs its contents rather than spanning the track. */}
            <div className="inline-block rounded-xl border border-border bg-bg px-6 py-5 md:px-7 md:py-6">
              {/* Serif display face, set lighter and with looser tracking than
                  the Inter Tight UI — a serif needs the room that a tightly-
                  tracked grotesque does not. */}
              <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-normal leading-[1.08] tracking-[-0.01em] text-primary">
                Rohan Vittal
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-5">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14px] font-medium text-bg transition-opacity duration-150 hover:opacity-90"
                >
                  View projects
                  <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* `scroll-mt` keeps the heading clear of the viewport edge after the
            anchor jump. */}
        <section id="projects" className={`${TRACK} scroll-mt-8 pb-24 pt-8`}>
          <h2 className="text-[13px] uppercase tracking-[0.14em] text-muted">
            Projects
          </h2>

          <ul className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {projects.map((project, i) => (
              <li key={project.slug} className="h-full">
                {/* Even indices land in the left column at `lg`, so their media
                    panel goes left; odd indices mirror. */}
                <ProjectCard project={project} flip={i % 2 === 0} />
              </li>
            ))}
          </ul>

          <Footer />
        </section>
      </main>
    </>
  );
}
