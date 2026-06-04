import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maamekskitchen.ca';

export const metadata: Metadata = {
  title: 'Delivery & Shipping',
  description: "Maame K's Kitchen delivery and pickup information — same-day delivery within Calgary and free pickup from Cornerstone, NE Calgary, Alberta.",
  keywords: ['Ghanaian food delivery Calgary', 'same day food delivery Calgary', 'African food delivery NE Calgary', 'Cornerstone food delivery'],
  alternates: { canonical: `${siteUrl}/shipping` },
  openGraph: {
    title: "Delivery & Shipping | Maame K's Kitchen",
    description: 'Same-day delivery across Calgary. Pickup at Cornerstone, NE Calgary.',
    url: `${siteUrl}/shipping`,
  },
};
import Link from 'next/link';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-emerald-50 via-white to-[#0d0d0d] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Shipping Policy</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              How it works — processing times and delivery information for our store.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none space-y-10">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              All orders take <strong className="text-gray-900">1–3 business days</strong> to process after payment confirmation.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <i className="ri-checkbox-circle-line text-[#C8952A] mt-1 flex-shrink-0"></i>
                <span><strong className="text-gray-900">Calgary (local) orders</strong> are typically delivered within <strong className="text-gray-900">1–2 business days</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-checkbox-circle-line text-[#C8952A] mt-1 flex-shrink-0"></i>
                <span><strong className="text-gray-900">Other regions in Canada</strong> are typically delivered within <strong className="text-gray-900">2–5 business days</strong> via courier.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-checkbox-circle-line text-[#C8952A] mt-1 flex-shrink-0"></i>
                <span><strong className="text-gray-900">Store pickup</strong> is available at no charge from our Cornerstone, Calgary, Alberta, Canada location.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Delivery Summary</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#fdf9ec] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-time-line text-[#C8952A] text-lg"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Processing</h3>
                  <p className="text-gray-600 text-sm">1–3 business days after payment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#fdf9ec] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-pin-line text-[#C8952A] text-lg"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Calgary (Local)</h3>
                  <p className="text-gray-600 text-sm">1–2 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#fdf9ec] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-truck-line text-[#C8952A] text-lg"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Other Canada Regions</h3>
                  <p className="text-gray-600 text-sm">2–5 business days via courier</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#fdf9ec] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-store-2-line text-[#C8952A] text-lg"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Store Pickup</h3>
                  <p className="text-gray-600 text-sm">Free — Cornerstone, Calgary, Alberta, Canada</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Need Help?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Questions about shipping or your order? Reach out — we&apos;re here to help.
            </p>
            <div className="bg-[#0d0d0d] rounded-2xl p-8 text-white border border-white/10">
              <p className="text-gray-300 mb-2"><strong className="text-white">Phone:</strong> (587) 582-2421 / (587) 582-2421</p>
              <p className="text-gray-300 mb-4"><strong className="text-white">Location:</strong> Cornerstone, Calgary, Alberta, Canada</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white text-[#7a5418] px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
