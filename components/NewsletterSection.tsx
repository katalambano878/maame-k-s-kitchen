"use client";

import { useState } from 'react';

const PERKS = [
  { icon: 'ri-discount-percent-line', text: '10% off your first order' },
  { icon: 'ri-bowl-line',             text: 'First to know about new dishes' },
  { icon: 'ri-star-line',             text: 'Exclusive seasonal specials & events' },
];

const PREVIEW_ITEMS = [
  { icon: 'ri-restaurant-line', label: 'New dish drops — jollof, waakye, kelewele & more' },
  { icon: 'ri-gift-line',       label: 'Seasonal specials & weekend-only offers' },
  { icon: 'ri-team-line',       label: 'Catering deals for events & gatherings' },
];

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(false);
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-5">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl" style={{ backgroundColor: '#0d0d0d' }}>

          {/* Subtle glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px] pointer-events-none"
            style={{ backgroundColor: 'rgba(200,149,42,0.07)' }} />
          <div className="absolute top-0 inset-x-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(200,149,42,0.3), transparent)' }} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-7 md:p-10">

            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ backgroundColor: '#C8952A' }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: '#C8952A' }} />
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.38em]"
                  style={{ color: '#C8952A' }}>Maame K&apos;s Family</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-white leading-[1.15] tracking-tight mb-3">
                Taste the{' '}
                <em className="not-italic font-light" style={{ color: '#C8952A' }}>Latest</em>
                <br />Before Anyone Else
              </h3>

              <p className="text-white/40 text-[13px] leading-relaxed mb-5 max-w-[280px]">
                Get 10% off your first order and be first to hear about new dishes, seasonal specials, and catering offers.
              </p>

              <ul className="space-y-3">
                {PERKS.map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-white/55 text-[12px]">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(200,149,42,0.12)', border: '1px solid rgba(200,149,42,0.2)' }}>
                      <i className={`${icon} text-sm`} style={{ color: '#C8952A' }} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — form */}
            <div className="flex items-center">
              <div className="w-full">
                {status === 'success' ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(200,149,42,0.12)', border: '1px solid rgba(200,149,42,0.25)' }}>
                      <i className="ri-bowl-line text-xl" style={{ color: '#C8952A' }} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-[15px] mb-1">Welcome to the family!</p>
                      <p className="text-white/40 text-[12px] leading-relaxed">
                        Check your inbox for your 10% off code.<br />Your first Ghanaian feast awaits.
                      </p>
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      className="text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors"
                      style={{ color: '#C8952A' }}
                    >
                      Subscribe another email
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview card */}
                    <div className="rounded-xl p-4"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2.5"
                        style={{ color: 'rgba(200,149,42,0.6)' }}>What you&apos;ll get</p>
                      {PREVIEW_ITEMS.map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 py-2 ${i < PREVIEW_ITEMS.length - 1 ? 'border-b' : ''}`}
                          style={i < PREVIEW_ITEMS.length - 1 ? { borderColor: 'rgba(255,255,255,0.06)' } : undefined}
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(200,149,42,0.10)', border: '1px solid rgba(200,149,42,0.18)' }}>
                            <i className={`${item.icon} text-xs`} style={{ color: '#C8952A' }} />
                          </span>
                          <span className="text-white/50 text-[11.5px] leading-snug">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-2.5">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full text-white placeholder-white/25 px-4 py-3 rounded-xl text-[13px] outline-none transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(200,149,42,0.4)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full text-white font-semibold text-[11px] uppercase tracking-[0.2em] py-3 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2.5 group active:scale-[0.98]"
                        style={{
                          backgroundColor: '#C8952A',
                          boxShadow: '0 6px 20px rgba(200,149,42,0.3)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b8841f')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C8952A')}
                      >
                        {submitting ? (
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <>
                            Claim My 10% Off
                            <i className="ri-arrow-right-line text-sm transition-transform duration-300 group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                      <p className="text-white/20 text-[10px] text-center tracking-wide">
                        No spam. Unsubscribe anytime.
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}