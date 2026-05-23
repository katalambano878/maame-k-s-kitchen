import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maamekskitchen.ca';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: "Maame K's Kitchen returns and refund policy. Issues with your order? Contact us within 24 hours and we'll make it right with a refund, replacement, or store credit.",
  alternates: { canonical: `${siteUrl}/returns` },
  openGraph: {
    title: "Returns & Refunds | Maame K's Kitchen",
    description: "Issues with your order? Contact us within 24 hours for a refund, replacement, or store credit.",
    url: `${siteUrl}/returns`,
  },
  robots: { index: true, follow: true },
};

import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Returns & Refunds', path: '/returns' }]} />
      {children}
    </>
  );
}