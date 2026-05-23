import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "Maame K’s Kitchen Privacy Policy — how we collect, use, and protect your personal information when you shop with us.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | Maame K’s Kitchen',
    description: 'How we collect, use, and protect your personal information at Maame K’s Kitchen.',
    url: `${siteUrl}/privacy`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: false,
  },
};

import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Privacy Policy', path: '/privacy' }]} />
      {children}
    </>
  );
}
