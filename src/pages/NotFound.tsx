import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <>
      <Seo
        title="Not found — Rohan Vittal"
        description="The page you were looking for doesn't exist."
      />
      <Layout>
        <main className="flex min-h-screen flex-col items-start justify-center py-24">
          <p className="text-[13px] uppercase tracking-[0.06em] text-muted">
            404
          </p>
          <h1 className="mt-3 text-[30px] font-medium tracking-[-0.01em] text-primary">
            Page not found
          </h1>
          <Link
            to="/"
            className="mt-4 inline-flex min-h-[44px] items-center text-[15px] text-accent underline-offset-4 hover:underline"
          >
            ← Back home
          </Link>
        </main>
      </Layout>
    </>
  );
}
