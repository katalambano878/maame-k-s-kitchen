import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Mama K â€” your authentic Ghanaian restaurant at Cornerstone, Calgary, Alberta. Our story, mission, and commitment to real Ghanaian flavours.',
  keywords: [
    'about Mama K',
    'Calgary Ghanaian restaurant',
    'Alberta Ghanaian food',
    'Cornerstone Calgary restaurant',
    'authentic Ghanaian food',
    'our story',
  ],
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: 'About Us | Mama K',
    description: 'Learn about Mama K â€” your authentic Ghanaian restaurant at Cornerstone, Calgary, Alberta.',
    url: `${siteUrl}/about`,
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

