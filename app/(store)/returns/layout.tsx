import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Order Issues & Refunds',
  description: "Maame Ks Kitchen quality guarantee. If something isn’t right with your order, contact us within 24 hours and we’ll make it right.",
  keywords: [
    'order issues Calgary',
    'refund policy Calgary',
    "Maame Ks Kitchen quality guarantee",
    'food order issues',
  ],
  alternates: {
    canonical: `${siteUrl}/returns`,
  },
  openGraph: {
    title: 'Order Issues & Refunds | Maame Ks Kitchen',
    description: 'If something isn’t right with your order, contact us within 24 hours and we’ll make it right.',
    url: `${siteUrl}/returns`,
    type: 'website',
  },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
