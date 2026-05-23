const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maamekskitchen.ca';

export type BreadcrumbItem = { name: string; path: string };

export default function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const fullItems: BreadcrumbItem[] = [{ name: 'Home', path: '/' }, ...items];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fullItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path === '/' ? siteUrl : `${siteUrl}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
