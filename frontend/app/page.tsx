import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Find Schools in India | UDISE+ Data | Quality Metrics & Fees | GetSchoolsInfo',
  description: 'Search 38,000+ schools in India with official UDISE+ data. Compare fees, student-teacher ratios, and infrastructure quality to make informed choices.',
  keywords: 'schools in India, school fees, UDISE plus data, best schools, compare schools, school admission',
  alternates: {
    canonical: 'https://getschoolsinfo.com',
  },
  openGraph: {
    title: 'Find Schools in India | UDISE+ Data | Quality Metrics',
    description: 'Data-driven school search. No bias, just facts. Compare schools based on government UDISE+ data.',
    url: 'https://getschoolsinfo.com',
    siteName: 'GetSchoolsInfo',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "GetSchoolsInfo",
        "url": "https://getschoolsinfo.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://getschoolsinfo.com/search?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "GetSchoolsInfo",
        "url": "https://getschoolsinfo.com",
        "logo": "https://getschoolsinfo.com/logo.png",
        "sameAs": [
          "https://twitter.com/getschoolsinfo"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How is the school data verified?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "All data is sourced directly from the government's UDISE+ (Unified District Information System for Education) database, ensuring official and verified statistics."
            }
          },
          {
            "@type": "Question",
            "name": "Is GetSchoolsInfo free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, GetSchoolsInfo is a completely free public utility for parents to access transparent school data."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
