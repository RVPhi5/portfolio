import { Helmet } from 'react-helmet-async';

type SeoProps = {
  title: string;
  description: string;
};

/** Per-route <title> and <meta> tags. */
export default function Seo({ title, description }: SeoProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
