import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ProductDetailClient from './ProductDetailClient';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

async function getProductMeta(slug: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('products')
      .select('name, description, product_images(url)')
      .eq('slug', slug)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductMeta(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'This product could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const title = product.name;
  const rawDescription = product.description || '';
  const description = rawDescription
    ? rawDescription.replace(/<[^>]*>/g, '').slice(0, 155)
    : `Shop ${title} at Maame Ks Kitchen — authentic Ghanaian cuisine from Cornerstone, Calgary, Alberta, Canada, Canada.`;

  const images = product.product_images as { url: string }[] | null;
  const firstImage = images?.[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Maame Ks Kitchen`,
      description,
      url: `${siteUrl}/product/${slug}`,
      type: 'website',
      images: firstImage
        ? [{ url: firstImage, width: 800, height: 800, alt: title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Maame Ks Kitchen`,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/product/${slug}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
