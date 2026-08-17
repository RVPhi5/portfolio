import { Link } from 'react-router-dom';
import { ArrowUpRight, Github } from 'lucide-react';
import type { Project } from '../data/projects';
import MediaWell from './MediaWell';
import TagPill from './TagPill';

type ProjectCardProps = {
  project: Project;
  /**
   * Mirrors the media panel to the outer edge of the two-column grid: cards in
   * the left column get media on the left, right-column cards on the right, so
   * the two text blocks meet in the middle rather than sandwiching a gutter
   * between two images.
   */
  flip?: boolean;
};

/** How many stack tags render before collapsing into a "+N more" pill. */
const VISIBLE_TAGS = 3;

export default function ProjectCard({ project, flip = false }: ProjectCardProps) {
  const shown = project.tags.slice(0, VISIBLE_TAGS);
  const overflow = project.tags.length - shown.length;
  const primary = project.links[0];

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex h-full flex-col sm:flex-row">
        {/* `order` rather than DOM order, so the media panel stays after the
            heading for screen readers and tab order no matter which side it
            renders on. */}
        <div
          className={`sm:w-[42%] sm:shrink-0 ${flip ? 'sm:order-first' : 'sm:order-last'}`}
        >
          {/* `fill` drops the well's own 16:9 box so the panel matches the
              text column's height instead of leaving a gap under the shorter
              of the two. */}
          <MediaWell media={project.cardMedia ?? project.media} title={project.title} fill />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 md:p-7">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-[0.12em] text-muted">
              {project.category} · {project.dates}
            </span>
            <h3 className="text-[24px] font-medium leading-tight">
              <Link
                to={`/projects/${project.slug}`}
                className="text-primary transition-colors duration-150 hover:text-accent"
              >
                {project.title}
              </Link>
            </h3>
          </div>

          <p className="text-[15px] leading-relaxed text-secondary">{project.tagline}</p>

          <ul className="flex flex-wrap gap-2" aria-label="Stack">
            {shown.map((tag) => (
              <li key={tag}>
                <TagPill label={tag} />
              </li>
            ))}
            {overflow > 0 && (
              <li>
                <TagPill label={`+${overflow} more`} />
              </li>
            )}
          </ul>

          {/* Pushed to the bottom so buttons line up across cards of differing
              tagline length. */}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
            {primary && (
              <a
                href={primary.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[14px] font-medium text-bg transition-opacity duration-150 hover:opacity-90"
              >
                {primary.icon === 'github' ? (
                  <Github size={16} strokeWidth={2} aria-hidden="true" />
                ) : null}
                {primary.label}
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            )}
            <Link
              to={`/projects/${project.slug}`}
              className="text-[14px] text-secondary transition-colors duration-150 hover:text-primary"
            >
              Read more
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
