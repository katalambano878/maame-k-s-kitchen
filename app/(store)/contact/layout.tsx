import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Mama K. Visit us at Cornerstone, Calgary, Alberta or reach us by phone. We\'re here to help with orders and enquiries.',
  keywords: [
    'contact Mama K',
    'Calgary Ghanaian restaurant contact',
    'Cornerstone Calgary food',
    'Calgary Ghanaian restaurant phone',
    'customer support Calgary',
  ],
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'Contact Us | Mama K',
    description: 'Get in touch with Mama K. Visit us at Cornerstone, Calgary, Alberta or reach us by phone.',
    url: `${siteUrl}/contact`,
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

