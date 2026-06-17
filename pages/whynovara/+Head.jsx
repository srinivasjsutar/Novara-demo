export default function Head() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://novaranatureestates.com/whynovara/#aboutpage",
    "url": "https://novaranatureestates.com/whynovara",
    "name": "About Novara Nature Estates",
    "description": "Learn about Novara Nature Estates, a premium managed farmland developer offering secure agricultural investment opportunities near Lepakshi, close to Bangalore.",
    "isPartOf": {
      "@id": "https://novaranatureestates.com/"
    },
    "mainEntity": {
      "@id": "https://novaranatureestates.com/#organization"
    }
  };

  return (
    <>
      <link rel="canonical" href="https://www.novaranatureestates.com/whynovara" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
