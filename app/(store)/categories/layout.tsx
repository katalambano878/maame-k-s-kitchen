import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Browse Menu',
  description: 'Browse our menu at Maame K’s Kitchen — banku, jollof, waakye, fufu, soups, stews and traditional sides. Authentic Ghanaian cuisine in Calgary, Alberta.',
  keywords: [
    'Ghanaian food menu Calgary',
    'rice dishes Calgary',
    'soups Calgary',
    'stews Calgary',
    'banku and jollof Calgary',
    'fufu and soup Calgary',
    'African food categories Calgary',
  ],
  alternates: {
    canonical: `${siteUrl}/categories`,
  },
  openGraph: {
    title: 'Browse Menu | Maame K’s Kitchen',
    description: 'Browse our menu — banku, jollof, waakye, fufu, soups, stews and traditional sides in Calgary, Alberta.',
    url: `${siteUrl}/categories`,
    type: 'website',
  },
};

import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Browse Menu', path: '/categories' }]} />
      {children}
    </>
  );
}
