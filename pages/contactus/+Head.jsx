export default function Head() {
  const contactPage = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://novaranatureestates.com/contactus/#contactpage",
    "url": "https://novaranatureestates.com/contactus",
    "name": "Contact Novara Nature Estates",
    "description": "Get in touch with Novara Nature Estates for managed farmland investment opportunities near Lepakshi and Bangalore."
  }

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://novaranatureestates.com/#localbusiness",
    "name": "Novara Nature Estates",
    "url": "https://novaranatureestates.com/",
    "telephone": "+91-8660200662",
    "email": "info@novaranatureestates.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "13th Cross Rd, F Block, Sahakar Nagar, Byatarayanapura, Bengaluru, Karnataka 560092",
      "addressLocality": "Bangalore",
      "addressRegion": "Karnataka",
      "postalCode": "560092",
      "addressCountry": "IN"
    },
    "areaServed": [
      { "@type": "Place", "name": "Bangalore" },
      { "@type": "Place", "name": "Lepakshi" }
    ]
  }

  return (
    <>
      <link rel="canonical" href="https://www.novaranatureestates.com/contactus" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
    </>
  )
}