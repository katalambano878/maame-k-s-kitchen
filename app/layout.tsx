/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#059669',
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maame Ks Kitchen — Authentic Ghanaian Cuisine in Calgary",
    template: "%s | Maame Ks Kitchen"
  },
  description: "Order from Maame Ks Kitchen — banku, jollof, waakye, fufu and authentic Ghanaian dishes in Cornerstone, Calgary, Alberta. Real flavours of Canada you can trust.",
  keywords: [
    "Maame Ks Kitchen",
    "Ghanaian food Calgary",
    "Ghanaian restaurant Calgary",
    "Ghanaian food Alberta",
    "African food Calgary",
    "banku Calgary",
      "jollof Calgary",
      "waakye Calgary",
      "fufu Calgary",
      "omotuo Calgary",
      "okro soup Calgary",
    "Cornerstone Calgary food",
    "Ghanaian takeout Calgary",
    "Ghanaian delivery Calgary",
  ],
  authors: [{ name: "Maame Ks Kitchen" }],
  creator: "Maame Ks Kitchen",
  publisher: "Maame Ks Kitchen",
  applicationName: "Maame Ks Kitchen",
  referrer: "origin-when-cross-origin",
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
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Maame Ks Kitchen",
  },
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteUrl,
    title: "Maame Ks Kitchen — Authentic Ghanaian Cuisine in Calgary",
    description: "Order from Maame Ks Kitchen — banku, jollof, waakye, fufu and authentic Ghanaian dishes in Cornerstone, Calgary, Alberta.",
    siteName: "Maame Ks Kitchen",
    images: [{ url: "/og-image.jpg", width: 500, height: 500, alt: "Maame Ks Kitchen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maame Ks Kitchen — Authentic Ghanaian Cuisine in Calgary",
    description: "Order from Maame Ks Kitchen — banku, jollof, waakye, fufu and authentic Ghanaian dishes in Cornerstone, Calgary, Alberta.",
    site: "@maamekskitchenyyc",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "food",
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "Restaurant"],
  "@id": `${siteUrl}/#organization`,
  "name": "Maame Ks Kitchen",
  "url": siteUrl,
  "logo": {
    "@type": "ImageObject",
    "url": `${siteUrl}/logo.png`,
    "width": 270,
    "height": 317
  },
  "image": `${siteUrl}/logo.png`,
  "description": "Authentic Ghanaian restaurant serving banku, jollof, waakye, fufu, and traditional dishes in Cornerstone, Calgary, Alberta.",
  "telephone": "+15875822421",
  "servesCuisine": ["Ghanaian", "West African"],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Cornerstone, NE Calgary, Alberta",
    "addressLocality": "Calgary",
    "addressRegion": "AB",
    "postalCode": "",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 0.0000,
    "longitude": 0.0000
  },
  "priceRange": "$$",
  "currenciesAccepted": "CAD",
  "paymentAccepted": "Cash, Debit, Credit Card, Interac e-Transfer",
  "areaServed": {
    "@type": "City",
    "name": "Calgary"
  },
  "sameAs": [
    "https://www.instagram.com/maame.k_kitchen/",
    "https://www.tiktok.com/@maamekskitchenyyc",
    "https://www.snapchat.com/add/maameks_kitchen"
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  "name": "Maame Ks Kitchen",
  "url": siteUrl,
  "description": "Authentic Ghanaian cuisine in Calgary, Canada",
  "publisher": { "@id": `${siteUrl}/#organization` },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteUrl}/shop?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Maame Ks Kitchen" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Favicon */}
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-startup-image" href="/logo.png" />

        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* Structured Data — Organization + LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* Structured Data — WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>

      {/* Google Analytics */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* Google reCAPTCHA v3 */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      <body className="antialiased font-sans overflow-x-hidden pwa-body">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-6 focus:py-3 focus:bg-[#111111] focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <CartProvider>
          <WishlistProvider>
            <div id="main-content">
              {children}
            </div>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
