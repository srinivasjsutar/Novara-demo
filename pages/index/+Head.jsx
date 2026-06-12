export default function Head() {
  const schema = {
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
            "13th Cross Rd, F Block, Sahakar Nagar, Byatarayanapura, Bengaluru, Karnataka 560092",
          addressLocality: "Bangalore",
          addressRegion: "Karnataka",
          postalCode: "560092",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 13.062526806781209,
          longitude:  77.58860358010297,
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
              "Sunday"
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
  };

  return (
    <>
      <link rel="canonical" href="https://www.novaranatureestates.com" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content="Managed Farmlands Near Bangalore | Novara Nature Estates"
      />
      <meta
        property="og:description"
        content="Invest in premium managed farmlands near Bangalore at Novara Nature Estates. Clear titles, gated layout & professional farm management. Enquire now."
      />
      <meta property="og:url" content="https://www.novaranatureestates.com/" />
      <meta
        property="og:image"
        content="https://www.novaranatureestates.com/images/Ecovara%20_11zon.webp"
      />
      <meta property="og:site_name" content="Novara Nature Estates" />
      <meta property="og:locale" content="en_IN" />
    </>
  );
}
