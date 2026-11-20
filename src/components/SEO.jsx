
export default function SEO({ title, description, canonicalPath }) {
  const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/+$/, "");

  const canonicalUrl = siteUrl && canonicalPath
    ? `${siteUrl}${canonicalPath}`
    : null;

  return (
    <>
      <title>{title}</title>

      <meta name="description" content={description} />

      {canonicalUrl && (
        <link rel="canonical" href={canonicalUrl} />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      {canonicalUrl && (
        <meta property="og:url" content={canonicalUrl} />
      )}

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
