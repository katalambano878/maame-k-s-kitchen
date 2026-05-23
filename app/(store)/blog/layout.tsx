import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Ghanaian food stories, recipes, and culinary inspiration from Maame K’s Kitchen. Stay updated with our latest dishes from Calgary, Alberta.',
  keywords: [
    'Ghanaian food blog',
    'African food blog Calgary',
    'Ghanaian recipes',
    'African cuisine Calgary',
    "Maame K’s Kitchen blog",
  ],
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: 'Blog | Maame K’s Kitchen',
    description: 'Ghanaian food stories, recipes, and culinary inspiration from Maame K’s Kitchen.',
    url: `${siteUrl}/blog`,
    type: 'website',
  },
};

import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Blog', path: '/blog' }]} />
      {children}
    </>
  );
}
