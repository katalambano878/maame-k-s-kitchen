import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about ordering, delivery, pickup, payments, and more at Maame K’s Kitchen — authentic Ghanaian cuisine in Cornerstone, NE Calgary.',
  keywords: [
    'FAQ Maame K’s Kitchen',
    'Ghanaian restaurant FAQ Calgary',
    'delivery questions Calgary',
    'payment methods Calgary',
    'order questions Calgary',
  ],
  alternates: {
    canonical: `${siteUrl}/faqs`,
  },
  openGraph: {
    title: 'Frequently Asked Questions | Maame K’s Kitchen',
    description: 'Answers to common questions about ordering, shipping, returns, and payments at Maame K’s Kitchen.',
    url: `${siteUrl}/faqs`,
    type: 'website',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I place an order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Browse our menu, add dishes to your order, proceed to checkout, provide your delivery address, select payment method, and confirm. You'll receive an email confirmation with your order details.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I modify or cancel my order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can modify or cancel your order within 1 hour of placing it. Contact us as soon as possible through our contact form. Once an order is processed, modifications may not be possible.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I track my order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "After your order ships, you'll receive a tracking number via email and SMS. Visit our Order Tracking page and enter your order number and email address to see real-time updates on your delivery status.",
      },
    },
    {
      '@type': 'Question',
      name: 'What are your delivery times?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Calgary orders are typically delivered same-day or next day. Pickup is available at no charge from Cornerstone, NE Calgary.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does delivery cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Standard delivery within Calgary costs $5.99. Pickup is also available at no charge from our Cornerstone, NE Calgary location.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you deliver outside Calgary?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Currently, we deliver within Calgary and surrounding areas. Contact us to confirm whether your address is in our delivery zone. Pickup is always available from Cornerstone, NE Calgary.",
      },
    },
    {
      '@type': 'Question',
      name: 'What if something is wrong with my order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If your order isn’t right, contact us within 24 hours of receiving it and we’ll make it right — refund, replacement, or store credit, your choice.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept Visa and Mastercard credit/debit cards, Interac e-Transfer, and cash on pickup. Online payments are processed securely through our payment gateway.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I contact Maame K’s Kitchen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can reach us by phone at (587) 582-2421, follow us on Instagram @maame.k_kitchen or TikTok @maamekskitchenyyc, or visit us at Cornerstone, NE Calgary. You can also use the contact form on our website.',
      },
    },
  ],
};

import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbJsonLd items={[{ name: 'FAQs', path: '/faqs' }]} />
      {children}
    </>
  );
}
