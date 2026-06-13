// src/utils/schema.js
// Builds Schema.org JSON-LD structured data for a blog post.
// Shared by the Blog Builder (live preview) and BlogDetails (published output)
// so the preview always matches what actually ships.

const SITE_ORIGIN = "https://www.novaranatureestates.com";
const SITE_BASE = `${SITE_ORIGIN}/blogs/`;
const PUBLISHER = {
  "@type": "Organization",
  name: "Novara Nature Estates",
  logo: {
    "@type": "ImageObject",
    url: `${SITE_ORIGIN}/images/logo.svg`,
  },
};

// "Jun 13, 2026" / "2026-06-13" → ISO 8601 (or undefined if unparseable)
const toIso = (d) => {
  if (!d) return undefined;
  const t = Date.parse(d);
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
};

// Returns an array of JSON-LD objects (Article/BlogPosting [+ FAQPage]).
// Per-field overrides from the editor (blog.schemaOverrides) take precedence
// over the values auto-derived from the post.
export function buildBlogSchema(blog = {}) {
  const o = blog.schemaOverrides || {};
  const url = SITE_BASE + (blog.slug || "");
  const img = blog.heroImage || blog.image || "";
  const rawDate = o.datePublished || blog.date;
  const date = toIso(rawDate) || rawDate || undefined;

  const publisher = {
    "@type": "Organization",
    name: o.publisherName || PUBLISHER.name,
    logo: {
      "@type": "ImageObject",
      url: o.publisherLogo || PUBLISHER.logo.url,
    },
  };

  const article = {
    "@context": "https://schema.org",
    "@type": blog.schemaType || "BlogPosting",
    headline: o.headline || blog.headline || blog.title || "",
    description: o.description || blog.description || "",
    ...(img ? { image: [img] } : {}),
    ...(date ? { datePublished: date, dateModified: date } : {}),
    author: { "@type": "Organization", name: o.authorName || blog.author || PUBLISHER.name },
    publisher,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const out = [article];

  const faqs = (blog.faqs || []).filter((f) => f && f.q && f.a);
  if (faqs.length) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return out;
}

// Pretty-printed string for showing in the editor's preview box.
export function schemaToJsonLd(blog) {
  return JSON.stringify(buildBlogSchema(blog), null, 2);
}