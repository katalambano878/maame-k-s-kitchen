import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maamekskitchen.ca';

export const metadata: Metadata = {
  title: 'Full Menu',
  description: 'Browse our full menu of authentic Ghanaian dishes — banku, jollof rice, waakye, fufu, soups, grills, drinks and more. Order online for same-day delivery in Calgary.',
  keywords: [
    'Ghanaian menu Calgary', 'banku Calgary', 'jollof rice Calgary', 'waakye Calgary',
    'fufu Calgary', 'Ghanaian food online order', 'African food delivery Calgary',
    'omotuo', 'okro soup', 'groundnut soup', 'Ghanaian catering Calgary',
  ],
  alternates: { canonical: `${siteUrl}/menu` },
  openGraph: {
    title: "Our Menu | Maame K's Kitchen",
    description: 'Authentic Ghanaian dishes made fresh daily — order online for same-day delivery or pickup in Calgary.',
    url: `${siteUrl}/menu`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: "Maame K's Kitchen Full Menu" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Our Menu | Maame K's Kitchen",
    description: 'Authentic Ghanaian dishes made fresh daily. Order online for same-day delivery in Calgary.',
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}