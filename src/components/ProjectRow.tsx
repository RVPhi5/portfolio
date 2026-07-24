import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../data/projects';

type ProjectRowProps = {
  project: Project;
  index: number; // zero-based; displayed as a 1-based two-digit number
};

/** One row in the homepage project list. The whole row is the click target. */
export default function ProjectRow({ project, index }: ProjectRowProps) {
  const number = String(index + 1).padStart(2, '0');

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group flex items-start gap-4 border-t border-border py-[18px] outline-offset-4"
    >
      <span className="w-7 shrink-0 pt-1 text-[13px] tabular-nums text-muted">
        {number}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-x-3 md:flex-row md:flex-wrap md:items-baseline">
        <span className="text-[22px] font-medium leading-tight text-primary transition-colors duration-150 group-hover:text-accent">
          {project.title}
        </span>
        <span className="text-[14px] leading-snug text-secondary">
          {project.stackSummary}
        </span>
      </span>

      <ArrowUpRight
        size={20}
        strokeWidth={1.75}
        aria-hidden="true"
        className="mt-1 shrink-0 text-muted transition-transform duration-150 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]"
      />
    </Link>
  );
}
