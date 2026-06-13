// src/utils/schema.js
// Fixed Schema.org templates for the Blog Builder.
// Each schema has a FIXED key structure. In the builder the blogger can either
//   • "default" → edit the values of those fixed keys (no new keys), or
//   • "upload"  → paste their own raw JSON / <script type="application/ld+json"> block.
// Shared by the builder (UI + preview) and the live page (+Head) so the preview
// always matches what ships.

// Strip a <script type="application/ld+json"> wrapper, normalise smart quotes,
// and parse. Returns an object/array, or null if it can't be parsed.
export function parseJsonLd(raw = "") {
  if (!raw || !raw.trim()) return null;
  let s = raw.trim();
  // remove <script ...> ... </script> wrapper if present
  const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (m) s = m[1].trim();
  // normalise curly quotes that often sneak in from docs
  s = s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
  // strip stray backticks
  s = s.replace(/`/g, "");
  try { return JSON.parse(s); } catch { return null; }
}

// ── Schema definitions ────────────────────────────────────────────────────────
// kind "object": flat list of `fields`.   kind "list": repeatable `itemFields`.
// build(data) returns the JSON-LD object for that schema.
export const SCHEMA_DEFS = [
  {
    id: "faq",
    label: "FAQ Schema",
    type: "FAQPage",
    kind: "list",
    addLabel: "Add question",
    itemFields: [
      { key: "name", label: "Question", type: "text", placeholder: "Which is better, Shorts or Reels?" },
      { key: "text", label: "Answer", type: "textarea", placeholder: "Answer text…" },
    ],
    newItem: () => ({ name: "", text: "" }),
    defaultItems: [{ name: "", text: "" }],
    build: (d) => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (d.items || [])
        .filter((i) => i.name || i.text)
        .map((i) => ({
          "@type": "Question",
          name: i.name,
          acceptedAnswer: { "@type": "Answer", text: i.text },
        })),
    }),
  },

  {
    id: "blog",
    label: "Blog Schema",
    type: "BlogPosting",
    kind: "object",
    fields: [
      { key: "id",            label: "Page URL (@id)",     type: "text", placeholder: "https://…/blog/slug" },
      { key: "headline",      label: "Headline",           type: "text", placeholder: "Post headline" },
      { key: "image",         label: "Image URL",          type: "text", placeholder: "https://…/image.webp" },
      { key: "authorName",    label: "Author name",        type: "text", placeholder: "Novara Nature Estates" },
      { key: "authorUrl",     label: "Author URL",         type: "text", placeholder: "https://…" },
      { key: "publisherName", label: "Publisher name",     type: "text", placeholder: "Novara Nature Estates" },
      { key: "publisherLogo", label: "Publisher logo URL", type: "text", placeholder: "https://…/logo.png" },
      { key: "datePublished", label: "Date published",     type: "text", placeholder: "2026-05-20T00:00:00+05:30" },
      { key: "dateModified",  label: "Date modified",      type: "text", placeholder: "2026-05-20T00:00:00+05:30" },
    ],
    build: (d) => ({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: { "@type": "WebPage", "@id": d.id || "" },
      headline: d.headline || "",
      image: d.image || "",
      author: { "@type": "Organization", name: d.authorName || "", url: d.authorUrl || "" },
      publisher: {
        "@type": "Organization",
        name: d.publisherName || "",
        logo: { "@type": "ImageObject", url: d.publisherLogo || "" },
      },
      datePublished: d.datePublished || "",
      dateModified: d.dateModified || "",
    }),
  },

  {
    id: "breadcrumb",
    label: "Breadcrumb Schema",
    type: "BreadcrumbList",
    kind: "list",
    addLabel: "Add breadcrumb",
    itemFields: [
      { key: "name", label: "Name", type: "text", placeholder: "Blogs" },
      { key: "item", label: "URL",  type: "text", placeholder: "https://…/blogs" },
    ],
    newItem: () => ({ name: "", item: "" }),
    defaultItems: [{ name: "", item: "" }],
    build: (d) => ({
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      itemListElement: (d.items || [])
        .filter((i) => i.name || i.item)
        .map((i, idx) => ({
          "@type": "ListItem",
          position: String(idx + 1),
          name: i.name,
          item: i.item,
        })),
    }),
  },

  {
    id: "review",
    label: "Review Rating Schema",
    type: "Product",
    kind: "object",
    fields: [
      { key: "ratingValue", label: "Rating value", type: "text", placeholder: "4.5" },
      { key: "reviewCount",  label: "Review count", type: "text", placeholder: "120" },
      { key: "bestRating",   label: "Best rating",  type: "text", placeholder: "5" },
      { key: "worstRating",  label: "Worst rating", type: "text", placeholder: "1" },
    ],
    build: (d) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: d.ratingValue || "",
        reviewCount: d.reviewCount || "",
        bestRating: d.bestRating || "",
        worstRating: d.worstRating || "",
      },
    }),
  },

  {
    id: "video",
    label: "Video Schema",
    type: "VideoObject",
    kind: "object",
    fields: [
      { key: "name",         label: "Name",          type: "text",     placeholder: "Video title" },
      { key: "description",  label: "Description",   type: "textarea", placeholder: "Video description…" },
      { key: "thumbnailUrl", label: "Thumbnail URL", type: "text",     placeholder: "https://…/thumb.jpg" },
      { key: "uploadDate",   label: "Upload date",   type: "text",     placeholder: "2026-03-26T00:01:45+05:30" },
      { key: "duration",     label: "Duration",      type: "text",     placeholder: "PT1M17S" },
      { key: "contentUrl",   label: "Content URL",   type: "text",     placeholder: "https://www.youtube.com/watch?v=…" },
      { key: "embedUrl",     label: "Embed URL",     type: "text",     placeholder: "https://www.youtube.com/embed/…" },
    ],
    build: (d) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: d.name || "",
      description: d.description || "",
      thumbnailUrl: d.thumbnailUrl || "",
      uploadDate: d.uploadDate || "",
      duration: d.duration || "",
      contentUrl: d.contentUrl || "",
      embedUrl: d.embedUrl || "",
      potentialAction: {
        "@type": "SeekToAction",
        target: `${d.contentUrl || ""}&t={seek_to_second_number}`,
        "startOffset-input": "required name=seek_to_second_number",
      },
    }),
  },

  {
    id: "product",
    label: "Product Schema",
    type: "Product",
    kind: "object",
    fields: [
      { key: "name",            label: "Name",             type: "text",     placeholder: "Ecovara" },
      { key: "image",           label: "Image URL",        type: "text",     placeholder: "https://…/image.webp" },
      { key: "description",     label: "Description",      type: "textarea", placeholder: "Product description…" },
      { key: "brandName",       label: "Brand name",       type: "text",     placeholder: "Ecovara" },
      { key: "sku",             label: "SKU",              type: "text",     placeholder: "ECOVARA" },
      { key: "offerUrl",        label: "Offer URL",        type: "text",     placeholder: "https://…" },
      { key: "priceCurrency",   label: "Price currency",   type: "text",     placeholder: "INR" },
      { key: "price",           label: "Price",            type: "text",     placeholder: "9876000" },
      { key: "priceValidUntil", label: "Price valid until", type: "text",    placeholder: "2026-05-31" },
      { key: "availability",    label: "Availability",     type: "text",     placeholder: "https://schema.org/InStock" },
      { key: "itemCondition",   label: "Item condition",   type: "text",     placeholder: "https://schema.org/NewCondition" },
      { key: "ratingValue",     label: "Rating value",     type: "text",     placeholder: "4.9" },
      { key: "bestRating",      label: "Best rating",      type: "text",     placeholder: "5" },
      { key: "worstRating",     label: "Worst rating",     type: "text",     placeholder: "3" },
      { key: "ratingCount",     label: "Rating count",     type: "text",     placeholder: "345" },
    ],
    build: (d) => ({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: d.name || "",
      image: d.image || "",
      description: d.description || "",
      brand: { "@type": "Brand", name: d.brandName || "" },
      sku: d.sku || "",
      offers: {
        "@type": "Offer",
        url: d.offerUrl || "",
        priceCurrency: d.priceCurrency || "",
        price: d.price || "",
        priceValidUntil: d.priceValidUntil || "",
        availability: d.availability || "https://schema.org/InStock",
        itemCondition: d.itemCondition || "https://schema.org/NewCondition",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: d.ratingValue || "",
        bestRating: d.bestRating || "",
        worstRating: d.worstRating || "",
        ratingCount: d.ratingCount || "",
      },
    }),
  },
];

// Build an empty config object keyed by schema id.
export function initSchemas() {
  const out = {};
  for (const def of SCHEMA_DEFS) {
    out[def.id] = {
      enabled: false,
      mode: "default",
      data: def.kind === "list"
        ? { items: (def.defaultItems || []).map((x) => ({ ...x })) }
        : {},
      json: "",
    };
  }
  return out;
}

// Merge a saved config onto the full template set (so newly-added schema types
// still appear when editing an older post).
export function normalizeSchemas(saved) {
  const base = initSchemas();
  if (!saved || typeof saved !== "object") return base;
  for (const def of SCHEMA_DEFS) {
    if (saved[def.id]) base[def.id] = { ...base[def.id], ...saved[def.id] };
  }
  return base;
}

// Turn the editor config into an array of JSON-LD objects (enabled schemas only).
export function buildSchemaGraph(schemas = {}) {
  const out = [];
  for (const def of SCHEMA_DEFS) {
    const cfg = schemas[def.id];
    if (!cfg || !cfg.enabled) continue;
    if (cfg.mode === "upload") {
      const parsed = parseJsonLd(cfg.json);
      if (parsed) Array.isArray(parsed) ? out.push(...parsed) : out.push(parsed);
    } else {
      try { out.push(def.build(cfg.data || {})); } catch { /* skip invalid */ }
    }
  }
  return out;
}

// Live-page entry point. New posts use blog.schemas; old posts (no schemas) get
// a minimal BlogPosting so nothing regresses.
export function buildBlogSchema(blog = {}) {
  if (blog.schemas) {
    const graph = buildSchemaGraph(blog.schemas);
    if (graph.length) return graph;
  }
  const SITE = "https://www.novaranatureestates.com";
  const date = blog.date && !Number.isNaN(Date.parse(blog.date))
    ? new Date(blog.date).toISOString() : undefined;
  return [{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.headline || blog.title || "",
    description: blog.description || "",
    ...((blog.heroImage || blog.image) ? { image: [blog.heroImage || blog.image] } : {}),
    ...(date ? { datePublished: date, dateModified: date } : {}),
    author: { "@type": "Organization", name: blog.author || "Novara Nature Estates" },
    publisher: {
      "@type": "Organization",
      name: "Novara Nature Estates",
      logo: { "@type": "ImageObject", url: `${SITE}/images/logo.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blogs/${blog.slug || ""}` },
  }];
}

// Pretty JSON for the editor's "view generated" panel.
export function schemaGraphToString(schemas) {
  return JSON.stringify(buildSchemaGraph(schemas), null, 2);
}