import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: {
    default: 'Premium Online Store | Shop High-Quality Products',
    template: '%s | Premium Store',
  },
  description: 'Discover premium products with fast shipping, secure checkout, and 24/7 customer support. Shop thousands of high-quality items with exclusive deals.',
  keywords: ['online store', 'shopping', 'premium products', 'fast delivery', 'secure payment'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shop.gurpreetsandhu.tech',
    title: 'Premium Online Store | Shop High-Quality Products',
    description: 'Discover premium products with fast shipping, secure checkout, and 24/7 customer support.',
    siteName: 'Premium Store',
    images: [
      {
        url: 'https://shop.gurpreetsandhu.tech/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Premium Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Online Store | Shop High-Quality Products',
    description: 'Discover premium products with fast shipping, secure checkout, and 24/7 customer support.',
    creator: '@premiumstore',
    images: ['https://shop.gurpreetsandhu.tech/twitter-image.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Premium Store',
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Meta Tags */}
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://shop.gurpreetsandhu.tech" />

        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        {/* Preconnect to External Resources */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

        {/* Theme Color */}
        <meta name="theme-color" content="#3b82f6" />

        {/* Verification Tags (Add your actual verification codes) */}
        <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Premium Store',
              url: 'https://shop.gurpreetsandhu.tech',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://shop.gurpreetsandhu.tech/products?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Premium Store',
              url: 'https://shop.gurpreetsandhu.tech',
              logo: 'https://shop.gurpreetsandhu.tech/logo.png',
              description: 'Premium online store with high-quality products and fast shipping',
              sameAs: [
                'https://facebook.com/premiumstore',
                'https://twitter.com/premiumstore',
                'https://instagram.com/premiumstore',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                telephone: '+1-XXX-XXX-XXXX',
                email: 'support@store.example.com',
              },
            }),
          }}
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
