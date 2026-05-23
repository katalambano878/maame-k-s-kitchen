import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Delivery & Pickup',
  description: "Maame K’s Kitchen delivery and pickup information — same-day delivery within Calgary, scheduled delivery to neighbouring areas, and free pickup from Cornerstone, NE Calgary, Alberta.",
  keywords: [
    "Maame K’s Kitchen delivery",
    'Ghanaian food delivery Calgary',
    'Cornerstone Calgary pickup',
    'Calgary food delivery',
    'Alberta Ghanaian food',
  ],
  alternates: {
    canonical: `${siteUrl}/shipping`,
  },
  openGraph: {
    title: 'Delivery & Pickup | Maame K’s Kitchen',
    description: 'Same-day delivery within Calgary, scheduled delivery to neighbouring areas, and free pickup from Cornerstone, NE Calgary, Alberta.',
    url: `${siteUrl}/shipping`,
    type: 'website',
  },
};

import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Delivery & Pickup', path: '/shipping' }]} />
      {children}
    </>
  );
}
