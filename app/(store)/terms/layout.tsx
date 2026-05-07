import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: "Mama K Terms and Conditions â€” the rules and guidelines governing the use of our online store and services.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'Terms & Conditions | Mama K',
    description: 'The rules and guidelines governing the use of Mama K online store.',
    url: `${siteUrl}/terms`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: false,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

