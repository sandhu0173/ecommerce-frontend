'use client'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  ogType?: 'website' | 'product' | 'article'
  canonical?: string
  author?: string
  publishedDate?: string
  modifiedDate?: string
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  ogImage,
  ogType = 'website',
  canonical,
  author,
  publishedDate,
  modifiedDate,
}: SEOHeadProps) {
  return (
    <>
      {/* Page-specific metadata can be added here */}
      {/* Note: Most metadata should be in layout.tsx or generateMetadata */}

      {/* Structured Data for Rich Snippets */}
      {ogType === 'product' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: title,
              description: description,
              image: ogImage,
              brand: {
                '@type': 'Brand',
                name: 'Premium Store',
              },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
      )}

      {ogType === 'article' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: title,
              description: description,
              image: ogImage,
              author: {
                '@type': 'Person',
                name: author || 'Premium Store',
              },
              datePublished: publishedDate,
              dateModified: modifiedDate,
            }),
          }}
        />
      )}

      {/* Breadcrumb Schema (can be added per page as needed) */}
    </>
  )
}
