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
            <span className="font-medium text-primary">Rohan Vittal</span>
            <span className="hidden text-muted sm:inline">
              Applied Math + CS · Brown '28
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-14 max-w-[620px] text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] text-primary md:text-[44px]">
            Software engineer working in flight systems, networking, and ML.
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-[460px] text-[16px] leading-[1.6] text-secondary">
            Currently building flight software for a CubeSat launching in 2027
            and interning at Mirico.
          </p>

          {/* Divider */}
          <hr className="my-10 border-0 border-t border-border" />

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
