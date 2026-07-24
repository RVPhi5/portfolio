import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, Github } from 'lucide-react';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import MediaWell from '../components/MediaWell';
import TagPill from '../components/TagPill';
import Seo from '../components/Seo';
import NotFound from './NotFound';
import { projects } from '../data/projects';

const linkIcons = {
  github: Github,
  external: ExternalLink,
} as const;

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = index === -1 ? undefined : projects[index];

  // Reset scroll position when navigating between projects.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return <NotFound />;
  }

  // Wrap-around prev/next.
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <Seo
        title={`${project.title} — Rohan Vittal`}
        description={project.tagline}
      />
      <Layout>
        <main className="pt-12 md:pt-16">
          {/* Back link */}
          {/* -my-3 keeps the visual position while giving a 44px hit area. */}
          <Link
            to="/"
            className="-my-3 inline-flex min-h-[44px] items-center gap-1.5 py-3 text-[14px] text-muted transition-colors duration-150 hover:text-primary"
          >
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
            Projects
          </Link>

          {/* Header block */}
          <header className="mt-10">
            <p className="text-[12px] uppercase tracking-[0.06em] text-muted">
              {project.category} · {project.dates}
            </p>
            <h1 className="mt-3 text-[30px] font-medium leading-tight tracking-[-0.01em] text-primary">
              {project.title}
            </h1>
            <p className="mt-3 max-w-[520px] text-[16px] leading-[1.6] text-secondary">
              {project.tagline}
            </p>

            {project.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {project.links.map((link) => {
                  const Icon = linkIcons[link.icon];
                  return (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[13px] text-primary transition-colors duration-150 hover:border-accent hover:text-accent"
                    >
                      <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
                      {link.label}
                    </a>
                  );
                })}
              </div>
            )}
          </header>

          {/* Hero media */}
          <div className="mt-10">
            <MediaWell media={project.media} title={project.title} />
          </div>

          {/* Body: two columns on desktop, stacked on mobile */}
          <div className="mt-12 flex flex-col gap-12 md:flex-row md:gap-14">
            {/* Main column */}
            <div className="min-w-0 flex-1">
              {project.sections.map((section) => (
                <section key={section.heading} className="mb-9 last:mb-0">
                  <h2 className="text-[18px] font-medium text-primary">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((para, i) => (
                    <p
                      key={i}
                      className="mt-3 text-[15px] leading-[1.7] text-secondary"
                    >
                      {para}
                    </p>
                  ))}
                </section>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="w-full shrink-0 md:w-[180px]">
              <div>
                <h2 className="text-[12px] uppercase tracking-[0.06em] text-muted">
                  Stack
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <TagPill key={tag} label={tag} />
                  ))}
                </div>
              </div>

              {project.highlights.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-[12px] uppercase tracking-[0.06em] text-muted">
                    Highlights
                  </h2>
                  <dl className="mt-3 space-y-4">
                    {project.highlights.map((h) => (
                      <div key={h.label}>
                        <dd className="text-[20px] font-medium leading-tight text-primary">
                          {h.value}
                        </dd>
                        <dt className="mt-0.5 text-[12px] text-secondary">
                          {h.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </aside>
          </div>

          {/* Prev/next footer */}
          <nav
            className="mt-16 flex items-stretch justify-between gap-4 border-t border-border pt-6"
            aria-label="Project navigation"
          >
            <Link
              to={`/projects/${prev.slug}`}
              className="group flex min-w-0 flex-col items-start gap-1 text-left"
            >
              <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.06em] text-muted">
                <ArrowLeft
                  size={13}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="transition-transform duration-150 group-hover:-translate-x-[2px]"
                />
                Prev
              </span>
              <span className="text-[15px] font-medium text-primary transition-colors duration-150 group-hover:text-accent">
                {prev.title}
              </span>
            </Link>

            <Link
              to={`/projects/${next.slug}`}
              className="group flex min-w-0 flex-col items-end gap-1 text-right"
            >
              <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.06em] text-muted">
                Next
                <ArrowRight
                  size={13}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="transition-transform duration-150 group-hover:translate-x-[2px]"
                />
              </span>
              <span className="text-[15px] font-medium text-primary transition-colors duration-150 group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          </nav>

          <Footer />
        </main>
      </Layout>
    </>
  );
}
