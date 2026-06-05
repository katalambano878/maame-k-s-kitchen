'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MiniCart from './MiniCart';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';

const NAV_LINKS = [
  { label: 'Menu',       href: '/menu',       icon: 'ri-restaurant-2-line' },
  { label: 'Meal Prep',  href: '/meal-prep',  icon: 'ri-calendar-check-line' },
  { label: 'Events',     href: '/events',     icon: 'ri-calendar-event-line' },
  { label: 'About',      href: '/about',      icon: 'ri-information-line' },
  { label: 'Contact',    href: '/contact',    icon: 'ri-phone-line' },
];

function getBusinessStatus() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Edmonton' }));
  const hour = now.getHours() + now.getMinutes() / 60;
  const isOpen = hour >= 10 && hour < 21;
  const closingIn = 21 - hour;
  return { isOpen, closingIn, opensAt: '10:00 AM' };
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen]         = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [searchResults, setSearchResults]       = useState<any[]>([]);
  const [isSearching, setIsSearching]           = useState(false);
  const [user, setUser]                         = useState<any>(null);
  const [isScrolled, setIsScrolled]             = useState(false);

  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { getSetting } = useCMS();
  const siteName = getSetting('site_name') || "Maame K's Kitchen";
  const monogram = 'MK';
  const biz = getBusinessStatus();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, product_images(url, position)')
        .eq('status', 'active')
        .ilike('name', `%${searchQuery}%`)
        .order('name')
        .limit(7);
      setSearchResults(data || []);
      setIsSearching(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]);
      window.location.href = `/menu?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Fixed header wrapper */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-white/97 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_32px_-8px_rgba(0,0,0,0.1)]'
          : 'bg-white/90 backdrop-blur-xl'
      }`}>

        {/* Info strip — collapses on scroll */}
        <div className={`overflow-hidden transition-all duration-500 ease-out ${
          isScrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
        } ${biz.isOpen
            ? biz.closingIn <= 1 ? 'bg-amber-600' : 'bg-[#111111]'
            : 'bg-[#111111]'
          } text-white`}
        >
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 h-9 flex items-center justify-between gap-4">
            <span className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 tracking-wide">
              <i className="ri-map-pin-2-line text-gold-400" style={{ color: '#C8952A' }} />
              Cornerstone, NE Calgary
            </span>
            <span className="flex items-center justify-center gap-2 text-[10.5px] font-semibold tracking-wide mx-auto sm:mx-0">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${biz.isOpen ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: biz.isOpen ? '#C8952A' : '#f87171' }} />
              {biz.isOpen
                ? biz.closingIn <= 1
                  ? `Closing soon — order in the next ${Math.round(biz.closingIn * 60)} min!`
                  : 'Open · Mon – Sun  10:00 AM – 9:00 PM MT'
                : `Closed · Opens today at ${biz.opensAt} MT`
              }
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-[10.5px] font-medium text-white/60 tracking-wide">
              <i className="ri-e-bike-line" style={{ color: '#C8952A' }} />
              Delivery across Calgary · Pickup Cornerstone NE
            </span>
          </div>
        </div>

        {/* Gold accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, #C8952A 40%, #e8b428 60%, transparent 100%)' }}
        />

        {/* Main nav row */}
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-6 transition-all duration-500 ${isScrolled ? 'h-[58px]' : 'h-[66px]'}`}>

            {/* Logo + identity */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden -ml-1 p-2 text-gray-500 hover:text-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <path d="M0 1h20M0 7h14M0 13h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              <Link href="/" className="group hidden lg:flex items-center gap-3 flex-shrink-0 select-none" aria-label={siteName}>
                <Image
                  src="/logo.png"
                  alt={siteName}
                  width={500}
                  height={500}
                  className={`w-auto object-contain transition-all duration-500 group-hover:opacity-85 ${isScrolled ? 'h-9' : 'h-11'}`}
                  priority
                  unoptimized
                />
                <div className={`hidden xl:flex flex-col leading-none transition-all duration-500 ${isScrolled ? 'opacity-0 w-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
                  <span className="text-[13px] font-bold text-gray-900 tracking-tight whitespace-nowrap">{siteName}</span>
                  <span className="text-[9px] font-bold tracking-[0.22em] uppercase mt-0.5" style={{ color: '#C8952A' }}>Authentic Ghanaian Kitchen</span>
                </div>
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center justify-center">
              <div className="flex items-center gap-0.5">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 hover:text-gray-900 hover:bg-gray-900/[0.04] transition-all duration-300"
                  >
                    {link.label}
                    <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"
                      style={{ backgroundColor: '#C8952A' }} />
                  </Link>
                ))}
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 col-start-3">

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-900/[0.05] transition-all duration-300 active:scale-90"
                aria-label="Search menu"
              >
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M12 12l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>

              {/* Track Order */}
              <Link
                href="/order-tracking"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-semibold text-gray-400 hover:text-gray-700 hover:bg-gray-100 tracking-wide transition-all duration-300 whitespace-nowrap"
              >
                <i className="ri-map-pin-time-line text-[14px]" />
                Track
              </Link>

              {/* Account */}
              <Link
                href={user ? '/account' : '/auth/login'}
                className="p-2.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-900/[0.05] transition-all duration-300 active:scale-90"
                aria-label="Account"
              >
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="8.5" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2 15c0-3 2.9-5.5 6.5-5.5S15 12 15 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </Link>

              {/* Cart */}
              <div className="relative ml-0.5">
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  aria-label="Your order"
                  className={`flex items-center gap-2 rounded-full border font-semibold text-[12px] transition-all duration-300 active:scale-95 ${
                    cartCount > 0
                      ? 'h-9 pl-3.5 pr-4 text-white border-transparent'
                      : 'h-9 px-3.5 border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
                  }`}
                  style={cartCount > 0 ? {
                    backgroundColor: '#111111',
                    boxShadow: '0 4px 16px rgba(200,149,42,0.35)',
                  } : undefined}
                >
                  <i className="ri-shopping-bag-line text-[15px]" />
                  {cartCount > 0 && <span className="tabular-nums">{cartCount}</span>}
                </button>
                <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
              </div>

              {/* Order Now CTA */}
              <Link
                href="/menu"
                className="hidden lg:flex items-center gap-2 ml-1.5 px-4 py-2.5 text-white rounded-full text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-300 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                style={{
                  backgroundColor: '#111111',
                  boxShadow: '0 4px 20px rgba(200,149,42,0.25)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#111111')}
              >
                <i className="ri-restaurant-line text-[13px]" style={{ color: '#C8952A' }} />
                Order Now
              </Link>

            </div>
          </div>
        </div>

        {/* Bottom hairline on scroll */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.08) 80%, transparent)' }}
        />
      </header>

      {/* Spacer */}
      <div className={`transition-all duration-500 ${isScrolled ? 'h-[58px]' : 'h-[103px]'}`} />

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-white/97 backdrop-blur-2xl" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} />
          <button
            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
            className="absolute top-6 right-7 p-2 text-gray-400 hover:text-gray-900 transition-colors z-10"
            aria-label="Close search"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 3l14 14M17 3L3 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="relative flex flex-col items-center justify-center flex-1 px-6">
            <p className="text-[9px] tracking-[0.4em] uppercase text-gray-400 mb-10 font-bold">Search our menu</p>
            <form onSubmit={handleSearch} className="w-full max-w-xl">
              <div className="relative flex items-center gap-4 border-b-2 border-gray-900 pb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Jollof, banku, waakye, fufu..."
                  className="flex-1 text-2xl sm:text-3xl font-light text-gray-900 placeholder:text-gray-300 bg-transparent focus:outline-none"
                  style={{ caretColor: '#C8952A' }}
                  autoFocus
                />
                <button type="submit" className="flex-shrink-0 p-1 text-gray-900 transition-colors" aria-label="Search"
                  onMouseEnter={e => (e.currentTarget.style.color = '#C8952A')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#111')}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M3 11h16M12 4l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4 font-light">
                Press <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-100 rounded border border-gray-200 font-mono">Enter</kbd> to search
              </p>
            </form>

            {/* Live recommendations */}
            {searchQuery.length >= 2 && (
              <div className="w-full max-w-xl mt-4">
                {isSearching && (
                  <p className="text-center text-[11px] text-gray-400 tracking-widest uppercase py-3">Searching...</p>
                )}
                {!isSearching && searchResults.length === 0 && (
                  <p className="text-center text-[13px] text-gray-400 py-3">No dishes found for &ldquo;{searchQuery}&rdquo;</p>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <div className="divide-y divide-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm">
                    {searchResults.map((item: any) => {
                      const img = item.product_images
                        ?.slice().sort((a: any, b: any) => a.position - b.position)[0]?.url;
                      return (
                        <Link
                          key={item.id}
                          href={`/product/${item.slug}`}
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#fdf9ec] transition-colors group"
                        >
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#fdf9ec] flex-shrink-0">
                            {img ? (
                              <Image src={img} alt={item.name} width={44} height={44} className="w-full h-full object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="ri-restaurant-line text-[#C8952A]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-[14px] truncate group-hover:text-[#C8952A] transition-colors">{item.name}</p>
                            <p className="text-[12px] text-gray-400">CA${item.price?.toFixed(2)}</p>
                          </div>
                          <i className="ri-arrow-right-line text-gray-300 group-hover:text-[#C8952A] transition-colors text-[14px]" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="relative pb-8 flex items-center justify-center gap-2">
            <div className="w-6 h-5 rounded-md bg-[#111111] flex items-center justify-center px-1">
              <span className="text-[9px] font-bold" style={{ color: '#C8952A', fontFamily: 'Georgia,serif' }}>{monogram}</span>
            </div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium">{siteName}</span>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-[80vw] max-w-[310px] bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5">
                <div className="w-9 h-7 rounded-lg bg-[#111111] flex items-center justify-center px-1.5">
                  <span className="text-[10px] font-bold tracking-wide" style={{ color: '#C8952A', fontFamily: 'Georgia,serif' }}>{monogram}</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-[13px] tracking-tight text-gray-900">{siteName}</span>
                  <span className="text-[8px] tracking-[0.2em] uppercase font-bold mt-0.5" style={{ color: '#C8952A' }}>Ghanaian Kitchen</span>
                </div>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-800 transition-colors">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path d="M2 2l13 13M15 2L2 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Status chip */}
            <div className={`mx-4 mt-3 px-3.5 py-2.5 rounded-2xl text-[11px] font-semibold flex items-center gap-2 ${
              biz.isOpen ? 'bg-[#fdf9ec] border border-[#f5de8f]' : 'bg-gray-50 text-gray-500 border border-gray-200'
            }`} style={biz.isOpen ? { color: '#A97520' } : undefined}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${biz.isOpen ? 'animate-pulse' : 'bg-gray-400'}`}
                style={biz.isOpen ? { backgroundColor: '#C8952A' } : undefined} />
              {biz.isOpen
                ? biz.closingIn <= 1
                  ? `Closing soon — ${Math.round(biz.closingIn * 60)} min left`
                  : 'Open · 10:00 AM – 9:00 PM'
                : `Closed · Opens at ${biz.opensAt}`
              }
            </div>

            {/* Order Now CTA */}
            <div className="px-4 pt-3">
              <Link
                href="/menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-white rounded-2xl font-bold text-[13px] tracking-wide transition-colors"
                style={{ backgroundColor: '#111111', boxShadow: '0 4px 16px rgba(200,149,42,0.3)' }}
              >
                <i className="ri-restaurant-line text-[16px]" style={{ color: '#C8952A' }} />
                Order Now
              </Link>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <i className="ri-home-line text-[18px] text-gray-400" />
                Home
              </Link>
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <i className={`${link.icon} text-[18px] text-gray-400`} />
                  {link.label}
                </Link>
              ))}

              <div className="my-2 h-px bg-gray-100 mx-2" />

              {[
                { label: 'Track My Order', href: '/order-tracking', icon: 'ri-map-pin-time-line' },
                { label: user ? 'My Account' : 'Sign In', href: user ? '/account' : '/auth/login', icon: 'ri-user-line' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all"
                >
                  <i className={`${link.icon} text-[16px]`} />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-5 py-4 border-t border-gray-100 space-y-1">
              <div className="flex items-center gap-1.5 justify-center">
                <i className="ri-map-pin-line text-[11px] text-gray-400" />
                <span className="text-[10px] text-gray-400">Cornerstone, NE Calgary · Delivery & pickup</span>
              </div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300 text-center font-medium">
                © {new Date().getFullYear()} {siteName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}





