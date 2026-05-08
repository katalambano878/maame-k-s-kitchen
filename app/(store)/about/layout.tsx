import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maamekskitchen.ca';

export const metadata: Metadata = {
  title: 'About Us',
  description: "The story behind Maame K's Kitchen — authentic Ghanaian cuisine served from Cornerstone, NE Calgary. Meet the team behind the flavours of Ghana.",
  keywords: [
    "Maame K's Kitchen story", 'Ghanaian restaurant Calgary', 'about Ghanaian kitchen',
    'African restaurant Calgary Alberta', 'Ghanaian chef Calgary', 'Cornerstone Calgary restaurant',
  ],
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    title: "About Us | Maame K's Kitchen",
    description: "The story behind Maame K's Kitchen — authentic Ghanaian cuisine from Cornerstone, NE Calgary.",
    url: `${siteUrl}/about`,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: "About Maame K's Kitchen" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Us | Maame K's Kitchen",
    description: "The story behind Maame K's Kitchen — authentic Ghanaian cuisine from Cornerstone, NE Calgary.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}