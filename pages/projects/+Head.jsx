export default function Head() {
  const realEstateListing = {
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
  };
  const placeSchema = {
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
  };
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.novaranatureestates.com/#organization",
    name: "Novara Nature Estates",
    url: "https://www.novaranatureestates.com",
  };

  const breadcrumb = {
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
  };

  const faq = {
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
  };

  return (
    <>
      <link
        rel="canonical"
        href="https://www.novaranatureestates.com/projects"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateListing) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
