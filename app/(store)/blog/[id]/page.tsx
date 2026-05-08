import { Metadata } from 'next';
import Link from 'next/link';
import { sanitizeHtml } from '@/lib/sanitize';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maamekskitchen.ca';

const posts: Record<string, {
  title: string;
  image: string;
  category: string;
  date: string;
  dateISO: string;
  readTime: string;
  author: string;
  content: string;
}> = {
  '1': {
    title: 'The Story Behind Maame Ks Kitchen',
    image: 'https://readdy.ai/api/search-image?query=Ghanaian%20woman%20chef%20cooking%20authentic%20food%20restaurant%20kitchen%20Calgary%20warm%20lighting&width=1200&height=600&seq=blogpost1&orientation=landscape',
    category: 'Our Story',
    date: 'December 15, 2024',
    dateISO: '2024-12-15',
    readTime: '8 min read',
    author: 'Maame K',
    content: `
      <p>Every dish we serve carries a story — one that begins thousands of kilometres away in Ghana and ends on your plate in Calgary. Maame Ks Kitchen was born out of a simple conviction: that authentic Ghanaian food deserves a home in Canada.</p>
      <h2>Where It Began</h2>
      <p>Growing up in Ghana, food was never just sustenance. It was ceremony. Sunday mornings meant the smell of kontomire stew drifting through the house. Celebrations called for jollof rice cooked over firewood, its smoky flavour something no gas flame can fully replicate. Every milestone had its dish, its ritual, its memory.</p>
      <p>When I arrived in Calgary, I missed that connection. The Ghanaian community here is warm and close-knit, but authentic Ghanaian food was almost impossible to find.</p>
      <h2>A Kitchen Becomes a Restaurant</h2>
      <p>It started small. Friends asking me to cook for their gatherings. Community events where I would bring a pot of groundnut soup and watch it disappear in minutes. Opening Maame Ks Kitchen in Cornerstone, NE Calgary was both terrifying and exhilarating.</p>
      <p>We wanted to serve food that felt genuinely homemade — not a watered-down version of Ghanaian cuisine adapted for Western palates, but the real thing. The spice levels, the fermented notes in the banku, the palm oil richness of the stews. Authentic.</p>
      <h2>What Sets Us Apart</h2>
      <p>We source ingredients carefully. Our palm oil comes from trusted suppliers who work directly with producers in West Africa. Our spices are ground fresh. Our proteins are halal-certified. Nothing is frozen and reheated — every order is prepared fresh.</p>
      <h2>The Community That Built Us</h2>
      <p>Every positive review, every returning customer, every message saying "this tastes exactly like my grandmother's cooking" keeps us going. That is the whole point.</p>
    `
  },
  '2': {
    title: '5 Ghanaian Dishes You Need to Try This Season',
    image: 'https://readdy.ai/api/search-image?query=Authentic%20Ghanaian%20food%20spread%20jollof%20rice%20banku%20stew%20colourful%20dishes%20restaurant%20photography%20warm%20lighting&width=1200&height=600&seq=blogpost2&orientation=landscape',
    category: 'Food Guide',
    date: 'December 12, 2024',
    dateISO: '2024-12-12',
    readTime: '6 min read',
    author: 'Maame K',
    content: `
      <p>Ghanaian cuisine is one of West Africa's most diverse and flavour-forward food traditions. Here are five dishes from our menu that every food lover in Calgary needs to experience.</p>
      <h2>1. Banku with Okro Stew</h2>
      <p>Banku is fermented corn and cassava dough, cooked to a smooth, slightly sour dumpling. Paired with our okro stew — loaded with seafood, palm oil, and garden eggs — it delivers a combination of textures and flavours that is deeply satisfying.</p>
      <h2>2. Jollof Rice</h2>
      <p>Our jollof is cooked slowly in a rich tomato and pepper base with our house spice blend. The result is deeply flavoured rice with a slightly caramelised bottom — the coveted "party jollof" texture that Ghanaians dream about.</p>
      <h2>3. Waakye</h2>
      <p>Waakye (pronounced "waa-chay") is rice and beans cooked together with dried millet stalks, which give the dish its distinctive reddish-brown colour and earthy depth. It comes with shito, fried plantain, spaghetti, and your choice of protein.</p>
      <h2>4. Groundnut Soup with Fufu</h2>
      <p>Groundnut soup is peanut-based, slow-simmered with tomatoes, peppers, onions, and meat until it becomes a thick, fragrant stew. Fufu — smooth, elastic dough made from cassava and plantain — is the traditional pairing.</p>
      <h2>5. Kelewele</h2>
      <p>Ripe plantain cubes seasoned with ginger, cayenne, and spices, deep-fried until golden and caramelised outside with a soft, sweet interior. Nearly impossible to stop eating.</p>
    `
  },
  '3': {
    title: 'What Makes Authentic Ghanaian Food Different',
    image: 'https://readdy.ai/api/search-image?query=Ghanaian%20spices%20palm%20oil%20ingredients%20peppers%20traditional%20cooking%20West%20African%20food%20culture%20photography&width=1200&height=600&seq=blogpost3&orientation=landscape',
    category: 'Culture',
    date: 'December 10, 2024',
    dateISO: '2024-12-10',
    readTime: '7 min read',
    author: 'Maame K',
    content: `
      <p>Walk into a Ghanaian kitchen and you will notice something immediately: the smell. A deep, layered aroma of palm oil, fermented grain, smoked fish, and fresh peppers that is unlike any other cuisine in the world.</p>
      <h2>The Role of Fermentation</h2>
      <p>Fermentation is central to Ghanaian cooking. Banku and kenkey are made from fermented corn dough. The fermentation process, which can take several days, develops a tangy, complex flavour profile that forms the backbone of the dish. There are no substitutes for properly fermented dough.</p>
      <h2>Palm Oil: The Foundation</h2>
      <p>Red palm oil is to Ghanaian cooking what olive oil is to Mediterranean cuisine — the default cooking fat, the flavour base, and the colour source all in one. We use unrefined red palm oil that retains its natural flavour compounds, sourced from trusted suppliers.</p>
      <h2>Fresh Peppers and Heat</h2>
      <p>Ghanaian food can be spicy, but heat is not the point — flavour is. The peppers used (scotch bonnets, garden peppers) contribute fruity, complex flavour alongside their heat. We calibrate our heat levels to be authentic without overwhelming.</p>
      <h2>The One-Pot Philosophy</h2>
      <p>Many Ghanaian dishes are slow-cooked in a single pot over extended time. Groundnut soup simmers for hours until the flavours fully meld. This approach produces depth that fast cooking cannot achieve.</p>
      <h2>Community and Occasion</h2>
      <p>In Ghana, specific dishes are associated with specific occasions. Waakye is morning street food. Fufu and soup are for leisurely Sunday afternoons. Jollof rice signals a celebration. When you order from us, you are getting a piece of Ghanaian food culture prepared with the care passed down through generations.</p>
    `
  }
};

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = posts[id] || posts['1'];

  const description = post.category === 'Our Story'
    ? `${post.title} — The origin story of authentic Ghanaian cuisine coming to Calgary, Alberta.`
    : `${post.title} — Ghanaian food stories and recipes from the Maame Ks Kitchen team in Calgary.`;

  return {
    title: post.title,
    description,
    authors: [{ name: post.author }],
    openGraph: {
      title: `${post.title} | Maame Ks Kitchen`,
      description,
      url: `${siteUrl}/blog/${id}`,
      type: 'article',
      publishedTime: post.dateISO,
      authors: [post.author],
      images: [{ url: post.image, width: 1200, height: 600, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [post.image],
    },
    alternates: {
      canonical: `${siteUrl}/blog/${id}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = posts[id] || posts['1'];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: `${post.title} — Ghanaian food stories from Maame Ks Kitchen in Calgary.`,
    image: post.image,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Maame Ks Kitchen',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
    },
    url: `${siteUrl}/blog/${id}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${id}` },
  };

  const allIds = ['1', '2', '3'];
  const relatedIds = allIds.filter((rid) => rid !== id).slice(0, 2);
  const relatedPosts = relatedIds.map((rid) => ({ id: rid, ...posts[rid] }));

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="relative h-96 bg-[#0d0d0d]">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block bg-[#111111] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              {post.category}
            </span>
            <h1 className="text-5xl font-bold text-white mb-6">{post.title}</h1>
            <div className="flex items-center justify-center gap-6 text-amber-100">
              <span className="flex items-center gap-2"><i className="ri-user-line"></i>{post.author}</span>
              <span className="flex items-center gap-2"><i className="ri-calendar-line"></i>{post.date}</span>
              <span className="flex items-center gap-2"><i className="ri-time-line"></i>{post.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <article className="prose prose-lg max-w-none">
          <div
            className="text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
          />
        </article>

        <div className="mt-12 pt-12 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Written by</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#fdf9ec] rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-[#C8952A] text-xl"></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-500">Maame Ks Kitchen</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-3">Share this article</p>
              <div className="flex gap-3">
                {['ri-facebook-fill', 'ri-twitter-fill', 'ri-linkedin-fill', 'ri-whatsapp-line'].map((icon) => (
                  <button key={icon} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#fdf9ec] transition-colors cursor-pointer">
                    <i className={`${icon} text-gray-600`}></i>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                <div className="relative h-48">
                  <img src={relatedPost.image} alt={relatedPost.title} className="w-full h-full object-cover" />
                  <span className="absolute top-4 left-4 bg-[#111111] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {relatedPost.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{relatedPost.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-br from-[#111111] to-[#0d0d0d] rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-amber-100 mb-8 text-lg">Authentic Ghanaian cuisine, freshly made in Cornerstone, NE Calgary.</p>
          <Link href="/menu" className="inline-flex items-center gap-2 bg-white text-[#C8952A] px-8 py-4 rounded-full font-medium hover:bg-[#fdf9ec] transition-colors whitespace-nowrap">
            Explore Menu<i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#C8952A] font-medium hover:gap-3 transition-all">
            <i className="ri-arrow-left-line"></i>Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
