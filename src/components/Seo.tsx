import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/format";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: object | object[];
  noindex?: boolean;
  image?: string;
}

export default function Seo({ title, description, path, jsonLd, noindex, image }: SeoProps) {
  const fullTitle = title.includes("Katyayini") ? title : `${title} | Katyayini Banaras`;
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Katyayini Banaras" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image ?? `${SITE_URL}/logo.svg`} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
