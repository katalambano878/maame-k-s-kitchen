import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maamekskitchen.ca';

export const metadata: Metadata = {
  title: 'Events',
  description:
    "The Chop Bar Experience, catering highlights, and upcoming community food events from Maame K's Kitchen in Cornerstone, NE Calgary.",
  alternates: { canonical: `${siteUrl}/events` },
  openGraph: {
    title: "Events | Maame K's Kitchen",
    description: 'Food fest, catering, and community events — The Chop Bar Experience and more.',
    url: `${siteUrl}/events`,
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
