import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maamekskitchen.ca';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Get in touch with Maame K's Kitchen. Call (587) 582-2421, WhatsApp us, or find us at Cornerstone, NE Calgary. We're open Monday–Sunday, 10am–9pm.",
  keywords: [
    "Maame K's Kitchen contact", 'Ghanaian restaurant Calgary phone', 'contact Ghanaian food Calgary',
    'Cornerstone Calgary food order', 'Ghanaian catering inquiry Calgary',
  ],
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: "Contact Us | Maame K's Kitchen",
    description: "Call (587) 582-2421 or WhatsApp us. Based in Cornerstone, NE Calgary. Open Mon–Sun 10am–9pm.",
    url: `${siteUrl}/contact`,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: "Contact Maame K's Kitchen" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Contact Us | Maame K's Kitchen",
    description: "Call (587) 582-2421. Based in Cornerstone, NE Calgary. Open Mon–Sun 10am–9pm.",
  },
};

import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Contact', path: '/contact' }]} />
      {children}
    </>
  );
}