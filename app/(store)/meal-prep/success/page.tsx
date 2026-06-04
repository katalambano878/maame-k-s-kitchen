'use client';

import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function MealPrepSuccessPage() {
  usePageTitle('Subscription Active');

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[#fdf9ec] border border-[#e8c87a] flex items-center justify-center mx-auto mb-6">
          <i className="ri-check-line text-3xl text-[#C8952A]"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">You&apos;re subscribed!</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Welcome to weekly meal prep. Choose your meals for this week and manage your subscription from your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account?tab=meal-prep"
            className="px-6 py-3 rounded-xl bg-[#111111] text-white font-semibold text-sm hover:bg-black transition-colors"
          >
            Choose This Week&apos;s Meals
          </Link>
          <Link
            href="/menu"
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    </main>
  );
}
