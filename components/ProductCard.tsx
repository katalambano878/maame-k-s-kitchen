'use client';

import { useState } from 'react';
import Link from 'next/link';
import LazyImage from './LazyImage';
import { useCart } from '@/context/CartContext';

// Kept as stubs so existing imports don't break while other files are updated
export const COLOR_MAP: Record<string, string> = {};
export function getColorHex(_name: string): string | null { return null; }
export interface ColorVariant { name: string; hex: string; }

const SPICE_LABELS = ['', 'Mild', 'Medium', 'Hot'];
const SPICE_COLOURS = ['', 'text-yellow-600', 'text-orange-500', 'text-red-600'];
const SPICE_ICONS  = ['', '🌶', '🌶🌶', '🌶🌶🌶'];

const DIETARY_STYLES: Record<string, string> = {
  halal:       'bg-[#fdf9ec] text-[#C8952A] border-[#e8c87a]',
  vegan:       'bg-[#fdf9ec]  text-[#C8952A]  border-green-200',
  vegetarian:  'bg-lime-50   text-lime-700   border-lime-200',
  'gluten-free': 'bg-amber-50 text-amber-700 border-amber-200',
  'nut-free':  'bg-blue-50   text-blue-700   border-blue-200',
  'dairy-free':'bg-sky-50    text-sky-700    border-sky-200',
};

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  maxStock?: number;
  moq?: number;
  hasVariants?: boolean;
  minVariantPrice?: number;
  // Food-specific
  prepTime?: string;
  spiceLevel?: 0 | 1 | 2 | 3;
  dietaryFlags?: string[];
  portionNote?: string;
  // Legacy — unused, kept so call-sites don't break
  colorVariants?: ColorVariant[];
}

export default function ProductCard({
  id, slug, name, price, originalPrice, image,
  rating = 5, reviewCount = 0, badge,
  inStock = true, maxStock = 50, moq = 1,
  hasVariants = false, minVariantPrice,
  prepTime, spiceLevel = 0, dietaryFlags = [], portionNote,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const displayPrice = hasVariants && minVariantPrice ? minVariantPrice : price;
  const discount = originalPrice && originalPrice > displayPrice
    ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
  const isLowStock = inStock && maxStock > 0 && maxStock <= 5;
  const fmt = (v: number) => `CA$${v.toFixed(2)}`;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock || added) return;
    addToCart({ id, name, price, image, quantity: moq, slug, maxStock, moq });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group relative flex flex-col">

      {/* ── Image Frame ── */}
      <div className="relative overflow-hidden rounded-[18px] bg-[#F2EFE9]" style={{ aspectRatio: '4/3' }}>

        {/* Image */}
        <Link href={`/product/${slug}`} className="absolute inset-0">
          <LazyImage
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        </Link>

        {/* Veil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

        {/* ── Top Row: Badges ── */}
        <div className="absolute top-0 inset-x-0 flex items-start justify-between p-3.5 z-20">
          <div className="flex flex-col gap-1.5">
            {badge && (
              <span className="inline-flex h-[22px] items-center px-2.5 rounded-md bg-white/90 backdrop-blur-md text-[8.5px] font-black uppercase tracking-[0.22em] text-gray-800 border border-white/50 shadow-sm">
                {badge}
              </span>
            )}
            {discount > 0 && (
              <span className="inline-flex h-[22px] items-center px-2.5 rounded-md bg-[#111111] text-[8.5px] font-black uppercase tracking-[0.18em] text-white shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Prep time pill */}
          {prepTime && (
            <span className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9.5px] font-semibold">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <circle cx="4.5" cy="4.5" r="3.8" />
                <path d="M4.5 2.5v2l1.2 1.2" />
              </svg>
              {prepTime}
            </span>
          )}
        </div>

        {/* Unavailable overlay */}
        {!inStock && (
          <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-white/95 text-gray-900 text-[10px] font-black uppercase tracking-[0.24em] shadow-lg">
              Unavailable
            </span>
          </div>
        )}

        {/* ── Add CTA ── */}
        {inStock && (
          <div className="absolute bottom-0 inset-x-0 flex items-end justify-center pb-4 z-20 pointer-events-none">
            {hasVariants ? (
              <Link
                href={`/product/${slug}`}
                onClick={e => e.stopPropagation()}
                className="pointer-events-auto flex items-center gap-2 h-10 px-5 rounded-full bg-white text-gray-950 text-[10.5px] font-black uppercase tracking-[0.18em] shadow-[0_8px_24px_rgba(0,0,0,0.22)] border border-white/80
                  opacity-0 translate-y-3 scale-95
                  group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                  transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  hover:bg-[#111111] hover:text-white active:scale-95"
              >
                Choose Portion
              </Link>
            ) : (
              <button
                onClick={handleAdd}
                className={`pointer-events-auto flex items-center gap-2.5 h-10 px-5 rounded-full text-[10.5px] font-black uppercase tracking-[0.18em] shadow-[0_8px_24px_rgba(0,0,0,0.22)]
                  opacity-0 translate-y-3 scale-95
                  group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                  transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  active:scale-95 ${
                  added
                    ? 'bg-[#111111] text-white border border-[#C8952A]'
                    : 'bg-white text-gray-950 border border-white/80 hover:bg-[#111111] hover:text-white hover:border-[#C8952A]'
                }`}
              >
                {added ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 6.5l3 3 5-5" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 1h1.4l1.8 6h6l1.3-4H3.2" />
                      <circle cx="5.5" cy="11" r=".9" fill="currentColor" stroke="none" />
                      <circle cx="9.5" cy="11" r=".9" fill="currentColor" stroke="none" />
                    </svg>
                    Add to Order
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Low stock ticker */}
        {isLowStock && (
          <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1.5 group-hover:opacity-0 transition-opacity duration-500">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8952A] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C8952A]" />
            </span>
            <span className="text-[9.5px] font-semibold text-white/90 drop-shadow tracking-wide">
              {maxStock} left today
            </span>
          </div>
        )}
      </div>

      {/* ── Info Strip ── */}
      <div className="pt-3 px-0.5 space-y-1.5">

        {/* Name */}
        <Link href={`/product/${slug}`}>
          <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 tracking-[-0.01em] hover:text-[#C8952A] transition-colors duration-300">
            {name}
          </h3>
        </Link>

        {/* Price + portion note */}
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-gray-950 tracking-tight">
            {hasVariants && minVariantPrice ? `From ${fmt(minVariantPrice)}` : fmt(displayPrice)}
          </span>
          {originalPrice && originalPrice > displayPrice && (
            <span className="text-[11px] text-gray-400 line-through decoration-gray-300">
              {fmt(originalPrice)}
            </span>
          )}
          {portionNote && (
            <span className="text-[10px] text-gray-400 font-medium">{portionNote}</span>
          )}
        </div>

        {/* Food meta row: spice + dietary + rating */}
        <div className="flex items-center justify-between pt-0.5 flex-wrap gap-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {spiceLevel > 0 && (
              <span className={`text-[10px] font-semibold ${SPICE_COLOURS[spiceLevel]}`}>
                {SPICE_ICONS[spiceLevel]} {SPICE_LABELS[spiceLevel]}
              </span>
            )}
            {dietaryFlags.slice(0, 2).map(flag => (
              <span key={flag} className={`inline-flex h-[17px] items-center px-1.5 rounded text-[8px] font-bold uppercase tracking-wide border ${DIETARY_STYLES[flag] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {flag}
              </span>
            ))}
          </div>

          {reviewCount > 0 && (
            <div className="flex items-center gap-1" title={`${rating}/5`}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="#059669">
                <path d="M5 1l1.1 2.3 2.5.4-1.8 1.7.4 2.5L5 6.7l-2.2 1.2.4-2.5L1.4 3.7l2.5-.4z" />
              </svg>
              <span className="text-[10.5px] font-semibold text-gray-700 leading-none">{rating.toFixed(1)}</span>
              <span className="text-[9.5px] text-gray-400 leading-none">({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Mobile CTA */}
        <div className="lg:hidden pt-1">
          {hasVariants ? (
            <Link
              href={`/product/${slug}`}
              className="flex items-center justify-center w-full h-9 rounded-xl bg-gray-100 text-[10px] font-black uppercase tracking-[0.18em] text-gray-900 hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Choose Portion
            </Link>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!inStock}
              className={`flex items-center justify-center gap-2 w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300 active:scale-[0.98] ${
                added
                  ? 'bg-[#111111] text-white'
                  : inStock
                  ? 'bg-gray-100 text-gray-900 hover:bg-[#111111] hover:text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              {added ? (
                <><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg> Added</>
              ) : inStock ? 'Add to Order' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}