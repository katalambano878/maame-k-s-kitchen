import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: "Maame K’s Kitchen Terms and Conditions — the rules and guidelines governing the use of our online store and services.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'Terms & Conditions | Maame K’s Kitchen',
    description: 'The rules and guidelines governing the use of Maame K’s Kitchen online store.',
    url: `${siteUrl}/terms`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: false,
  },
};

import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Terms & Conditions', path: '/terms' }]} />
      {children}
    </>
  );
}
