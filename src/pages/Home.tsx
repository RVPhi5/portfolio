import Layout from '../components/Layout';
import Footer from '../components/Footer';
import ProjectRow from '../components/ProjectRow';
import Seo from '../components/Seo';
import { projects } from '../data/projects';

export default function Home() {
  return (
    <>
      <Seo
        title="Rohan Vittal — Software Engineer"
        description="Software engineer working in flight systems, networking, and ML. Currently building flight software for a CubeSat launching in 2027 and interning at Mirico."
      />
      <Layout>
        <main className="pt-16 md:pt-24">
          {/* Header row */}
          <div className="flex items-baseline justify-between gap-4 text-[13px]">
            <span className="text-[16px] font-medium text-primary">Rohan Vittal</span>
            <span className="hidden text-muted sm:inline">
              Applied Math + CS · Brown '28
            </span>
          </div>

          {/* Visually-hidden page heading — keeps one h1 for a11y/SEO. */}
          <h1 className="sr-only">Rohan Vittal — Projects</h1>

          {/* Divider */}
          <hr className="mb-10 mt-12 border-0 border-t border-border" />

          {/* Project list */}
          <section aria-label="Projects">
            <ul className="border-b border-border">
              {projects.map((project, i) => (
                <li key={project.slug}>
                  <ProjectRow project={project} index={i} />
                </li>
              ))}
            </ul>
          </section>

          <Footer />
        </main>
      </Layout>
    </>
  );
}
