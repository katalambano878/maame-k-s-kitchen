'use client';

import { useEffect, useState } from 'react';
import {
  AppliedCoupon,
  calculateCouponDiscount,
  fetchActiveCoupons,
  toCartCoupon,
  validateCouponCode,
  type CartCoupon,
} from '@/lib/coupons';

interface AdvancedCouponSystemProps {
  subtotal: number;
  deliveryFee?: number;
  onApply: (coupon: CartCoupon) => void;
  onRemove: () => void;
  appliedCoupon: CartCoupon | null;
}

export default function AdvancedCouponSystem({
  subtotal,
  deliveryFee = 0,
  onApply,
  onRemove,
  appliedCoupon,
}: AdvancedCouponSystemProps) {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<AppliedCoupon[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setLoadingList(true);
    fetchActiveCoupons()
      .then(setAvailableCoupons)
      .finally(() => setLoadingList(false));
  }, []);

  const tryApply = async (code: string) => {
    setApplying(true);
    setError('');
    const { coupon, error: err } = await validateCouponCode(code, subtotal);
    setApplying(false);
    if (err || !coupon) {
      setError(err || 'Invalid coupon');
      return;
    }
    onApply(toCartCoupon(coupon));
    setCouponCode('');
    setShowAvailable(false);
  };

  const handleQuickApply = (coupon: AppliedCoupon) => {
    if (coupon.minPurchase > 0 && subtotal < coupon.minPurchase) {
      setError(`Add CA$${(coupon.minPurchase - subtotal).toFixed(2)} more to use this coupon`);
      return;
    }
    setError('');
    onApply(toCartCoupon(coupon));
    setShowAvailable(false);
  };

  return (
    <div className="space-y-4">
      {!appliedCoupon ? (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Have a coupon code?</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8952A] focus:border-[#C8952A] text-sm"
              />
              <button
                type="button"
                onClick={() => tryApply(couponCode)}
                disabled={applying || !couponCode.trim()}
                className="bg-[#111111] hover:bg-black text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {applying ? '...' : 'Apply'}
              </button>
            </div>
            {error && (
              <p className="text-sm text-[#C8952A] mt-2 flex items-center">
                <i className="ri-error-warning-line mr-1"></i>
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAvailable(!showAvailable)}
            className="text-sm text-[#C8952A] hover:text-[#7a5418] font-medium flex items-center whitespace-nowrap"
          >
            <i className={`ri-arrow-${showAvailable ? 'up' : 'down'}-s-line mr-1`}></i>
            {showAvailable ? 'Hide' : 'View'} available coupons
          </button>

          {showAvailable && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {loadingList ? (
                <p className="text-sm text-gray-500 text-center py-2">Loading coupons...</p>
              ) : availableCoupons.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">No active coupons right now.</p>
              ) : (
                availableCoupons.map((coupon) => {
                  const isEligible = !coupon.minPurchase || subtotal >= coupon.minPurchase;
                  const needed = coupon.minPurchase ? coupon.minPurchase - subtotal : 0;

                  return (
                    <div
                      key={coupon.code}
                      className={`bg-white rounded-lg p-4 border-2 transition-all ${
                        isEligible
                          ? 'border-[#e8c87a] hover:border-[#C8952A]/50'
                          : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-[#fdf9ec] text-[#a07020] px-3 py-1 rounded-lg font-bold text-sm">
                            {coupon.code}
                          </span>
                          {!isEligible && (
                            <span className="text-xs text-gray-500">
                              Add CA${needed.toFixed(2)} more
                            </span>
                          )}
                        </div>
                        {isEligible && (
                          <button
                            type="button"
                            onClick={() => handleQuickApply(coupon)}
                            className="text-[#C8952A] hover:text-[#7a5418] font-semibold text-sm whitespace-nowrap"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#fdf9ec] border-2 border-[#e8c87a] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <i className="ri-price-tag-3-fill text-[#C8952A]"></i>
                <span className="font-bold text-[#a07020]">{appliedCoupon.code}</span>
              </div>
              <p className="text-sm text-[#C8952A]">{appliedCoupon.description}</p>
              <p className="text-xs text-[#7a5418] mt-1">
                Saves CA$
                {calculateCouponDiscount(subtotal, appliedCoupon, deliveryFee).toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="w-8 h-8 flex items-center justify-center text-[#C8952A] hover:text-[#7a5418] transition-colors"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
