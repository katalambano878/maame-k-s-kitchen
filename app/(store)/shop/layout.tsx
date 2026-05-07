import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Browse the full menu at Maame Ks Kitchen — banku, jollof, waakye, fufu, omotuo, Ghanaian Dish, and traditional Ghanaian sides. Authentic Ghanaian cuisine in Calgary, Alberta.',
  keywords: [
    'Ghanaian food menu Calgary',
    'banku and jollof Calgary',
    'banku and jollof Calgary',
    'banku and jollof Calgary',
    'banku and jollof Calgary',
    'banku and jollof Calgary',
    'tz Calgary',
    'okro soup Calgary',
    'banku and jollof Calgary',
    'African food Calgary',
    'Ghanaian takeout Calgary',
  ],
  alternates: {
    canonical: `${siteUrl}/shop`,
  },
  openGraph: {
    title: 'Menu | Maame Ks Kitchen',
    description: 'Browse the full menu — banku, jollof, waakye, fufu, omotuo, Ghanaian Dish, and traditional Ghanaian sides in Calgary, Alberta.',
    url: `${siteUrl}/shop`,
    type: 'website',
  },
  twitter: {
    title: 'Menu | Maame Ks Kitchen',
    description: 'Browse the full menu — banku, jollof, waakye, fufu, omotuo, Ghanaian Dish, and traditional Ghanaian sides in Calgary, Alberta.',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
