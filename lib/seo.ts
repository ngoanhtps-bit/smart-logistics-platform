import { site } from "@/lib/data";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: "https://logistics-platform.example",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.hotline,
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["Vietnamese"]
    }
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function localBusinessJsonLd(opts: {
  name: string;
  description: string;
  areaServed: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: opts.name,
    description: opts.description,
    areaServed: opts.areaServed,
    telephone: site.hotline,
    priceRange: "$$",
    url: "https://logistics-platform.example"
  };
}

export function serviceJsonLd(opts: { name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    provider: {
      "@type": "Organization",
      name: site.name
    },
    areaServed: "Vietnam"
  };
}
