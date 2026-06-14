// src/utils/schema.js
// Schema.org templates for the Blog Builder.
// Each schema can be edited two ways:
//   • "default" → edit the schema's key→value pairs in input boxes
//   • "upload"  → paste raw JSON / a <script type="application/ld+json"> block,
//                 then Save to load those values into the Default fields.
// Object schemas keep the FULL pasted object as their editable data, so nothing
// is lost (e.g. an added "name"); list schemas (FAQ/Breadcrumb) use repeatable
// item rows. Shared by the builder (UI + preview) and the live page (+Head).

// Parse JSON-LD, tolerating two things that commonly break pasted schema:
//   • curly "smart" quotes  →  straight quotes
//   • missing commas between properties / array items on separate lines
export function parseJsonLd(raw = "") {
  if (!raw || !raw.trim()) return null;
  let s = raw.trim();
  const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (m) s = m[1].trim();
  s = s
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/`/g, "");
  try { return JSON.parse(s); } catch { /* tolerant pass below */ }
  let fixed = s
    .replace(/(["\d\]}]|true|false|null)(\s*\r?\n\s*)(["[{])/g, "$1,$2$3")
    .replace(/,(\s*[}\]])/g, "$1");
  try { return JSON.parse(fixed); } catch { return null; }
}

const clone = (o) => JSON.parse(JSON.stringify(o));

// ── Schema definitions ────────────────────────────────────────────────────────
// kind "object": the editable `data` IS the JSON-LD object (template below).
// kind "list":   repeatable rows built into a list-type schema.
export const SCHEMA_DEFS = [
  {
    id: "faq",
    label: "FAQ Schema",
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
    kind: "object",
    template: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: { "@type": "WebPage", "@id": "" },
      headline: "",
      image: "",
      author: { "@type": "Organization", name: "", url: "" },
      publisher: { "@type": "Organization", name: "", logo: { "@type": "ImageObject", url: "" } },
      datePublished: "",
      dateModified: "",
    },
  },

  {
    id: "breadcrumb",
    label: "Breadcrumb Schema",
    kind: "list",
    addLabel: "Add breadcrumb",
    itemFields: [
      { key: "name", label: "Name", type: "text", placeholder: "Blogs" },
      { key: "item", label: "URL", type: "text", placeholder: "https://…/blogs" },
    ],
    newItem: () => ({ name: "", item: "" }),
    defaultItems: [{ name: "", item: "" }],
    build: (d) => ({
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      itemListElement: (d.items || [])
        .filter((i) => i.name || i.item)
        .map((i, idx) => ({ "@type": "ListItem", position: String(idx + 1), name: i.name, item: i.item })),
    }),
  },

  {
    id: "review",
    label: "Review Rating Schema",
    kind: "object",
    template: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "",
        reviewCount: "",
        bestRating: "",
        worstRating: "",
      },
    },
  },

  {
    id: "video",
    label: "Video Schema",
    kind: "object",
    template: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "",
      description: "",
      thumbnailUrl: "",
      uploadDate: "",
      duration: "",
      contentUrl: "",
      embedUrl: "",
    },
  },

  {
    id: "product",
    label: "Product Schema",
    kind: "object",
    template: {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: "",
      image: "",
      description: "",
      brand: { "@type": "Brand", name: "" },
      sku: "",
      offers: {
        "@type": "Offer",
        url: "",
        priceCurrency: "",
        price: "",
        priceValidUntil: "",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "",
        bestRating: "",
        worstRating: "",
        ratingCount: "",
      },
    },
  },
];

// default build for object schemas = the data object itself
export function buildSchemaObject(def, data) {
  if (def.kind === "list") return def.build(data || {});
  return data || clone(def.template);
}

// Empty config keyed by schema id.
export function initSchemas() {
  const out = {};
  for (const def of SCHEMA_DEFS) {
    out[def.id] = {
      enabled: false,
      mode: "default",
      data: def.kind === "list"
        ? { items: (def.defaultItems || []).map((x) => ({ ...x })) }
        : clone(def.template),
      json: "",
    };
  }
  return out;
}

// Merge a saved config onto the template set (so new schema types still appear
// when editing an older post).
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
      try { out.push(buildSchemaObject(def, cfg.data || {})); } catch { /* skip */ }
    }
  }
  return out;
}

// Live-page entry point. New posts use blog.schemas; old posts get a minimal
// BlogPosting so nothing regresses.
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

export function schemaGraphToString(schemas) {
  return JSON.stringify(buildSchemaGraph(schemas), null, 2);
}

// Map a pasted/parsed JSON-LD object into the editable `data` shape.
//  • list schemas  → pull rows out of mainEntity / itemListElement
//  • object schemas→ keep the whole object (so every key, incl. extras, shows)
export function extractToData(id, json) {
  if (!json || typeof json !== "object") return null;
  const str = (v) => (v == null ? "" : String(v));
  if (id === "faq") {
    return { items: (json.mainEntity || []).map((q) => ({
      name: str(q && q.name),
      text: str(q && q.acceptedAnswer && q.acceptedAnswer.text),
    })) };
  }
  if (id === "breadcrumb") {
    return { items: (json.itemListElement || []).map((li) => ({
      name: str(li && li.name),
      item: str(li && li.item),
    })) };
  }
  return json; // object schemas keep the full parsed object
}