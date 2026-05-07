'use client';

import Link from 'next/link';
export default function ReturnConfirmationPage() {
  const returnId = `RET-2024-${Math.floor(Math.random() * 10000)}`;

  return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 flex items-center justify-center bg-[#fdf9ec] rounded-full mx-auto mb-6">
              <i className="ri-check-line text-4xl text-[#C8952A]"></i>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Return Request Submitted!</h1>
            <p className="text-gray-600 mb-2">Your return has been successfully processed</p>
            <p className="text-sm text-gray-500 mb-8">
              Return ID: <span className="font-semibold">{returnId}</span>
            </p>

            <div className="mb-8 p-6 bg-[#fdf9ec] border border-[#e8c87a] rounded-xl text-left">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                <i className="ri-information-line text-2xl text-[#C8952A] mr-2"></i>
                What happens next
              </h2>
              <p className="text-sm text-gray-700 mb-3">
                We will review your request against our policy (exchanges only for wrong item within 24 hours with labels intact; refunds only when absolutely necessary).
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <i className="ri-checkbox-circle-fill text-[#C8952A] mt-0.5"></i>
                  <span>We may contact you for order details or photos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-checkbox-circle-fill text-[#C8952A] mt-0.5"></i>
                  <span>Approved exchanges follow our return instructions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <i className="ri-checkbox-circle-fill text-[#C8952A] mt-0.5"></i>
                  <span>Questions? Call (587) 582-2421 / (587) 582-2421 or use the contact page</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                href="/account"
                className="block w-full bg-[#111111] hover:bg-[#111111] text-white py-4 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Track Return Status
              </Link>
              <Link
                href="/shop"
                className="block w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-4 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Continue Shopping
              </Link>
              <Link
                href="/support/ticket"
                className="block text-[#C8952A] hover:text-[#7a5418] font-semibold whitespace-nowrap"
              >
                Need Help? Contact Support
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-[#fdf9ec] border border-[#e8c87a] rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <i className="ri-alert-line text-2xl text-[#C8952A] mt-0.5"></i>
              <div>
                <p className="font-semibold text-[#7a5418] mb-2">Policy reminders</p>
                <ul className="text-sm text-[#a07020] space-y-1">
                  <li>• Exchanges only if the wrong item was delivered — within 24 hours of delivery</li>
                  <li>• Product and labels must stay intact</li>
                  <li>• Refunds only when absolutely necessary</li>
                  <li>• Follow any instructions we send after we approve your request</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
