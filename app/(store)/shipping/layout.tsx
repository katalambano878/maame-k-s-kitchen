import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Delivery & Pickup',
  description: "Mama K delivery and pickup information â€” same-day delivery within Calgary, scheduled delivery to neighbouring areas, and free pickup from Cornerstone, NE Calgary, Alberta.",
  keywords: [
    "Mama K delivery",
    'Ghanaian food delivery Calgary',
    'Cornerstone Calgary pickup',
    'Calgary food delivery',
    'Alberta Ghanaian food',
  ],
  alternates: {
    canonical: `${siteUrl}/shipping`,
  },
  openGraph: {
    title: 'Delivery & Pickup | Mama K',
    description: 'Same-day delivery within Calgary, scheduled delivery to neighbouring areas, and free pickup from Cornerstone, NE Calgary, Alberta.',
    url: `${siteUrl}/shipping`,
    type: 'website',
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

