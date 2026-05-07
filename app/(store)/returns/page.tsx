'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const mockOrders = [
  {
    id: 'ORD-2024-156',
    date: '2024-01-20',
    items: [
      { id: 1, name: 'Banku & Tilapia (Regular)', price: 22, eligible: true },
      { id: 2, name: 'Jollof Rice (Large)', price: 18, eligible: true },
    ]
  }
];

export default function OrderIssuesPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [issueReasons, setIssueReasons] = useState<Record<number, string>>({});
  const [resolution, setResolution] = useState<'refund' | 'remake'>('remake');
  const [isLoading, setIsLoading] = useState(false);
  const [foundOrder, setFoundOrder] = useState<any>(null);

  const reasons = [
    'Wrong item delivered',
    'Missing item from order',
    'Quality not as expected',
    'Order arrived cold / damaged',
    'Other — describe in notes',
  ];

  const handleFindOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setFoundOrder(mockOrders[0]);
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/returns/confirmation');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Issues</h1>
        <p className="text-gray-600 mb-6">
          <strong className="text-gray-900">Had a problem with your order?</strong> We want to make it right. Contact us within 2 hours of receiving your food and we will do our best to resolve it quickly.
        </p>

        <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Our quality guarantee</h2>
          <div className="text-gray-600 text-sm space-y-4 leading-relaxed">
            <p>
              <strong className="text-gray-900">Wrong item or missing items</strong> — if we got your order wrong, we will remake it or refund the affected item, no questions asked. Please report within <strong>2 hours of receiving your order</strong>.
            </p>
            <p>
              <strong className="text-gray-900">Quality concerns</strong> — if your food did not meet our standard, let us know with a brief description and a photo if possible. We will review every case promptly.
            </p>
            <p>
              Because we prepare food fresh to order, we are unable to accept physical returns. Resolutions are either a <strong>remake / replacement</strong> on your next order or a <strong>refund</strong> where appropriate.
            </p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                  i <= step ? 'bg-[#111111] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <i className="ri-check-line"></i> : i}
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${i < step ? 'bg-[#111111]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-semibold text-gray-900">Find Order</span>
            <span className="text-sm font-semibold text-gray-900">Describe Issue</span>
            <span className="text-sm font-semibold text-gray-900">Submit</span>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Order</h2>
            <form onSubmit={handleFindOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Order Number *
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  placeholder="ORD-2024-156"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A]"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111111] hover:bg-[#111111] text-white py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? 'Finding Order...' : 'Find Order'}
              </button>
            </form>

            <div className="mt-8 p-4 bg-[#fdf9ec] border border-[#e8c87a] rounded-lg">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-xl text-[#C8952A] mt-0.5"></i>
                <div className="text-sm text-[#C8952A]">
                  <p className="font-semibold mb-1">Quick reminders</p>
                  <ul className="space-y-1">
                    <li>• Report issues <strong>within 2 hours</strong> of receiving your order.</li>
                    <li>• A photo of the issue helps us resolve it faster.</li>
                    <li>• Resolution: <strong>remake on your next order</strong> or <strong>refund</strong>.</li>
                    <li>• You can also reach us directly via <Link href="/contact" className="underline">Contact Us</Link>.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && foundOrder && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Items with Issues</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Order #{foundOrder.id} &bull; Placed on {foundOrder.date}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {foundOrder.items.map((item: any) => (
                <div key={item.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="mt-1 w-5 h-5 text-[#C8952A] rounded border-gray-300 focus:ring-[#C8952A]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{item.name}</p>
                      <p className="text-lg font-bold text-gray-900 mb-3">CA${item.price.toFixed(2)}</p>

                      {selectedItems.includes(item.id) && (
                        <div className="mt-4">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            What went wrong? *
                          </label>
                          <select
                            value={issueReasons[item.id] || ''}
                            onChange={(e) => setIssueReasons({ ...issueReasons, [item.id]: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] pr-8"
                            required
                          >
                            <option value="">Select a reason</option>
                            {reasons.map((reason) => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Preferred resolution *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setResolution('remake')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    resolution === 'remake'
                      ? 'border-[#C8952A] bg-[#fdf9ec]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <i className="ri-restaurant-line text-2xl text-[#C8952A] mb-2"></i>
                  <p className="font-semibold text-gray-900">Remake / Replacement</p>
                  <p className="text-sm text-gray-600 mt-1">We&apos;ll prepare the correct item on your next order at no charge</p>
                </button>

                <button
                  type="button"
                  onClick={() => setResolution('refund')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    resolution === 'refund'
                      ? 'border-[#C8952A] bg-[#fdf9ec]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <i className="ri-refund-line text-2xl text-[#C8952A] mb-2"></i>
                  <p className="font-semibold text-gray-900">Refund</p>
                  <p className="text-sm text-gray-600 mt-1">Refund to your original payment method (reviewed within 24h)</p>
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedItems.length === 0 || !selectedItems.every(id => issueReasons[id])}
                className="flex-1 py-4 bg-[#111111] hover:bg-[#111111] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Issue Summary</h3>
              <div className="space-y-3">
                {foundOrder.items
                  .filter((item: any) => selectedItems.includes(item.id))
                  .map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Issue: {issueReasons[item.id]}</p>
                      </div>
                      <p className="font-bold text-gray-900">CA${item.price.toFixed(2)}</p>
                    </div>
                  ))}
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Preferred resolution: <strong className="text-gray-900">{resolution === 'remake' ? 'Remake / Replacement' : 'Refund'}</strong>
              </p>
            </div>

            <div className="mb-8 p-6 border-2 border-[#e8c87a] bg-[#fdf9ec] rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-[#C8952A]">1.</span>
                  <span>We review your request — usually within <strong>2 hours</strong> during opening hours.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-[#C8952A]">2.</span>
                  <span>We may reach out for a photo or extra details to help us investigate.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-[#C8952A]">3.</span>
                  <span>We confirm your resolution — remake on next order or refund processed within 3–5 business days.</span>
                </li>
              </ol>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 py-4 bg-[#111111] hover:bg-[#111111] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? 'Submitting...' : 'Submit Issue Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}