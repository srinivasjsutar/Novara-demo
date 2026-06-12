import { usePageContext } from "vike-react/usePageContext";
import { useEffect } from "react";
import { BLOGS } from "../src/data/blogs";

// Schema definitions per page

const getSchema = (urlPathname, blog = null) => {
  const base = "https://novaranatureestates.com";
  const www = "https://www.novaranatureestates.com";

  // Blog detail page
  if (blog) {
    return [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${base}/blogs/${blog.slug}/#blogposting`,
        headline: blog.title,
        description: blog.description,
        image: `${www}${blog.heroImage || blog.image}`,
        url: `${base}/blogs/${blog.slug}`,
        datePublished: "2026-01-01",
        author: { "@type": "Organization", name: "Novara Nature Estates" },
        publisher: { "@id": `${base}/#organization` },
        keywords: blog.keywords || "",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${base}/blogs/${blog.slug}`,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${base}/blogs`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: blog.title,
            item: `${base}/blogs/${blog.slug}`,
          },
        ],
      },
    ];
  }

  // Blogs listing
  if (urlPathname === "/blogs") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": "https://novaranatureestates.com/blogs/#blog",
        url: "https://novaranatureestates.com/blogs",
        name: "Novara Nature Estates Blog",
        description:
          "Insights and guides on managed farmland investment, farmland near Bangalore, Lepakshi farmland opportunities and agricultural land investment strategies.",
        publisher: {
          "@type": "Organization",
          "@id": "https://novaranatureestates.com/#organization",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://novaranatureestates.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://novaranatureestates.com/blogs",
          },
        ],
      },
    ];
  }

  // Projects
  if (urlPathname === "/projects") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "@id": "https://www.novaranatureestates.com/projects/#listing",
        name: "Ecovara Managed Farmland Near Lepakshi",
        description:
          "Explore Ecovara, premium managed farmland for sale near Lepakshi.",
        url: "https://www.novaranatureestates.com/projects",
        image: "https://www.novaranatureestates.com/images/ecovara.webp",
        datePosted: "2026-02-01",
        mainEntity: {
          "@id": "https://www.novaranatureestates.com/projects/#property",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Place",
        "@id": "https://www.novaranatureestates.com/projects/#property",
        name: "Ecovara Farmland",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lepakshi",
          addressRegion: "Andhra Pradesh",
          addressCountry: "IN",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://www.novaranatureestates.com/#organization",
        name: "Novara Nature Estates",
        url: "https://www.novaranatureestates.com",
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://novaranatureestates.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: "https://novaranatureestates.com/projects/",
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": "https://novaranatureestates.com/ecovara/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Ecovara by Novara Nature Estates?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ecovara is a premium gated farmland project offering legally clear agricultural land near Bangalore, designed for secure ownership, weekend retreats, and long-term farmland investment.",
            },
          },
          {
            "@type": "Question",
            name: "Where is the Ecovara project located?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Ecovara offers farm plots near Lepakshi , strategically positioned within the North Bangalore growth corridor. The location provides peaceful natural surroundings while remaining well connected to Bangalore and the airport region.",
            },
          },
          {
            "@type": "Question",
            name: "Is Ecovara a gated farmland community?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Ecovara is a planned gated farmland project near Bangalore with secure entry, compound fencing, internal roads, and structured layout development.",
            },
          },
          {
            "@type": "Question",
            name: "Is Ecovara suitable for farmland investment near Bangalore?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Due to its location advantage and increasing demand for farm plots near Bangalore, Ecovara presents strong long-term appreciation potential.",
            },
          },
          {
            "@type": "Question",
            name: "Can I build a farmhouse on my plot?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, buyers can develop private farmhouses on their agricultural land near Lepakshi, subject to applicable local regulations.",
            },
          },
          {
            "@type": "Question",
            name: "Is the land legally verified and ready for registration?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "All plots come with legally verified documentation and are ready for registration, ensuring safe agricultural land investment.",
            },
          },
          {
            "@type": "Question",
            name: "How can I book a site visit for Ecovara farm plots?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can schedule a guided site visit by contacting our team through the enquiry form or by calling our sales representatives directly.",
            },
          },
        ],
      },
    ];
  }

  // Contact Us
  if (urlPathname === "/contactus") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "@id": "https://novaranatureestates.com/contactus/#contactpage",
        url: "https://novaranatureestates.com/contactus",
        name: "Contact Novara Nature Estates",
        description:
          "Get in touch with Novara Nature Estates for managed farmland investment opportunities near Lepakshi and Bangalore.",
      },
      {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "@id": "https://novaranatureestates.com/#localbusiness",
        name: "Novara Nature Estates",
        url: "https://novaranatureestates.com/",
        telephone: "+91-8660200662",
        email: "info@novaranatureestates.com",
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "13th Cross Rd, F Block, CQAL Layout, Sahakar Nagar, Bengaluru, Karnataka 560092",
          addressLocality: "Bangalore",
          addressRegion: "Karnataka",
          postalCode: "560092",
          addressCountry: "IN",
        },
        areaServed: [
          { "@type": "Place", name: "Bangalore" },
          { "@type": "Place", name: "Lepakshi" },
        ],
      },
    ];
  }

  // Why Novara
  if (urlPathname === "/whynovara") {
    return [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": "https://novaranatureestates.com/whynovara/#aboutpage",
        url: "https://novaranatureestates.com/whynovara",
        name: "About Novara Nature Estates",
        description:
          "Learn about Novara Nature Estates, a premium managed farmland developer offering secure agricultural investment opportunities near Lepakshi, close to Bangalore.",
        isPartOf: {
          "@id": "https://novaranatureestates.com/",
        },
        mainEntity: {
          "@id": "https://novaranatureestates.com/#organization",
        },
      },
    ];
  }

  // Home (default)
  return [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://novaranatureestates.com/#organization",
          name: "Novara Nature Estates",
          url: "https://www.novaranatureestates.com",
          logo: "https://novaranatureestates.com/logo.svg",
          description:
            "Invest in premium managed farmlands near Bangalore at Novara Nature Estates. Clear titles, gated layout & professional farm management. Enquire now.",
          sameAs: [
            "https://www.facebook.com/novaranatureestates",
            "https://www.instagram.com/novaranatureestates",
            "https://www.youtube.com/@novaranatureestates",
            "https://www.linkedin.com/company/novara-nature-estates/",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-8660200662",
            contactType: "sales",
            areaServed: "IN",
            availableLanguage: ["English", "Kannada", "Hindi"],
          },
        },
        {
          "@type": "RealEstateAgent",
          "@id": "https://novaranatureestates.com/#localbusiness",
          name: "Novara Nature Estates",
          url: "https://novaranatureestates.com/",
          telephone: "+91-8660200662",
          address: {
            "@type": "PostalAddress",
            streetAddress:
              "13th Cross Rd, F Block, CQAL Layout, Sahakar Nagar, Bengaluru, Karnataka 560092",
            addressLocality: "Bangalore",
            addressRegion: "Karnataka",
            postalCode: "560092",
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 13.0583, // 👈 replace with your exact latitude
            longitude: 77.5942, // 👈 replace with your exact longitude
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "09:00",
              closes: "18:00",
            },
          ],
          areaServed: [
            { "@type": "Place", name: "Bangalore" },
            { "@type": "Place", name: "Lepakshi" },
          ],
        },
        {
          "@type": "FAQPage",
          "@id": "https://novaranatureestates.com/#faq",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is Novara Nature Estates?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Novara Nature Estates is a premium Managed farmland Developer offering gated farm Lands near Bangalore with clear titles, managed infrastructure, and long-term investment potential.",
              },
            },
            {
              "@type": "Question",
              name: "Where are your Projects located?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Our Project are strategically located near Lepakshi, in the fast-developing North Bangalore corridor, offering excellent connectivity to the airport region while preserving peaceful natural surroundings and long-term investment potential.",
              },
            },
            {
              "@type": "Question",
              name: "Is agricultural land a good investment near Bangalore?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Farmland near Bangalore has shown strong appreciation due to airport expansion, infrastructure growth, and increasing demand for gated farmland communities.",
              },
            },
            {
              "@type": "Question",
              name: "Do you provide gated farmland projects?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Novara offers gated farmland projects with internal roads, fencing, water facilities, and plantation support for a secure and structured investment experience.",
              },
            },
            {
              "@type": "Question",
              name: "Is the farmland legally clear?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "All our agricultural land parcels come with clear titles, proper documentation, and legal due diligence to ensure a safe purchase.",
              },
            },
            {
              "@type": "Question",
              name: "Do you provide plantation or farm management support?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we offer optional managed farmland services including plantation assistance and maintenance support.",
              },
            },
          ],
        },
      ],
    },
  ];
};

// Helper: inject schemas into <head>

function injectSchemas(schemas) {
  // Remove ALL schema tags (both static from +Head.jsx and previously injected)
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((el) => el.remove());

  schemas.forEach((schema) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-dynamic-schema", "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

// Layout

export default function Layout({ children }) {
  const pageContext = usePageContext();
  const { config, urlPathname } = pageContext;

  useEffect(() => {
    let title = config?.title;
    let description = config?.metaDescription;
    let keywords = config?.keywords;
    let blog = null;

    // Blog slug pages
    const blogMatch = urlPathname.match(/^\/blogs\/(.+)$/);
    if (blogMatch) {
      const slug = blogMatch[1];
      blog = BLOGS.find((b) => b.slug === slug);
      if (blog) {
        title = blog.title;
        description =
          blog.description ||
          blog.sections
            ?.find((s) => s.type === "p" && typeof s.text === "string")
            ?.text?.slice(0, 160) ||
          description;
        keywords = blog.keywords || keywords;
      }
    }

    //Title
    if (title) document.title = title;

    //Description
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.setAttribute("name", "description");
      document.head.appendChild(descTag);
    }
    descTag.setAttribute("content", description ?? "");

    // Keywords
    let kwTag = document.querySelector('meta[name="keywords"]');
    if (!kwTag) {
      kwTag = document.createElement("meta");
      kwTag.setAttribute("name", "keywords");
      document.head.appendChild(kwTag);
    }
    kwTag.setAttribute("content", keywords ?? "");

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute(
      "href",
      `https://www.novaranatureestates.com${urlPathname === "/" ? "" : urlPathname}`,
    );

    // Schema
    injectSchemas(getSchema(urlPathname, blog));
  }, [urlPathname]);

  return <main>{children}</main>;
}
