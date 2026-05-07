import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "Mama K Privacy Policy â€” how we collect, use, and protect your personal information when you shop with us.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | Mama K',
    description: 'How we collect, use, and protect your personal information at Mama K.',
    url: `${siteUrl}/privacy`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: false,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

