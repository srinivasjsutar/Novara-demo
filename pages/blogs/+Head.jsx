export default function Head() {
  const blog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://novaranatureestates.com/blogs/#blog",
    "url": "https://novaranatureestates.com/blogs",
    "name": "Novara Nature Estates Blog",
    "description": "Insights and guides on managed farmland investment, farmland near Bangalore, Lepakshi farmland opportunities and agricultural land investment strategies.",
    "publisher": {
      "@type": "Organization",
      "@id": "https://novaranatureestates.com/#organization"
    }
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://novaranatureestates.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://novaranatureestates.com/blogs" }
    ]
  }

  return (
    <>
      <link rel="canonical" href="https://www.novaranatureestates.com/blogs" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blog) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  )
}