import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = "Maame K's Kitchen — Authentic Ghanaian Cuisine in Calgary";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1410 50%, #0a0a0a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Gold accent line top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent 0%, #C8952A 40%, #e8b428 60%, transparent 100%)', display: 'flex' }} />

        {/* Corner brackets — gold */}
        <div style={{ position: 'absolute', top: 48, left: 48, width: 60, height: 3, background: '#C8952A', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 48, left: 48, width: 3, height: 60, background: '#C8952A', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 48, right: 48, width: 60, height: 3, background: '#C8952A', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 48, right: 48, width: 3, height: 60, background: '#C8952A', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 48, left: 48, width: 60, height: 3, background: '#C8952A', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 48, left: 48, width: 3, height: 60, background: '#C8952A', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 48, right: 48, width: 60, height: 3, background: '#C8952A', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 48, right: 48, width: 3, height: 60, background: '#C8952A', display: 'flex' }} />

        {/* Subtle horizontal rules */}
        <div style={{ position: 'absolute', top: '30%', left: 110, right: 110, height: 1, background: 'rgba(200,149,42,0.15)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '30%', left: 110, right: 110, height: 1, background: 'rgba(200,149,42,0.15)', display: 'flex' }} />

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Eyebrow */}
          <div style={{ color: '#C8952A', fontSize: 13, fontWeight: 700, letterSpacing: '0.45em', textTransform: 'uppercase', marginBottom: 28, display: 'flex' }}>
            Cornerstone · Calgary · Alberta · Canada
          </div>

          {/* MK Monogram */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            border: '2px solid #C8952A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 30,
            background: 'rgba(200,149,42,0.08)',
          }}>
            <span style={{ color: '#C8952A', fontSize: 36, fontWeight: 700, letterSpacing: 4, display: 'flex' }}>MK</span>
          </div>

          {/* Brand Name */}
          <div style={{ color: '#ffffff', fontSize: 68, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18, display: 'flex', lineHeight: 1 }}>
            Maame K's Kitchen
          </div>

          {/* Gold divider */}
          <div style={{ width: 80, height: 2, background: '#C8952A', marginBottom: 20, display: 'flex' }} />

          {/* Tagline */}
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 20, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 400, display: 'flex' }}>
            Authentic Ghanaian Cuisine
          </div>
        </div>

        {/* Bottom URL bar */}
        <div style={{ position: 'absolute', bottom: 62, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 1, background: 'rgba(200,149,42,0.5)', display: 'flex' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, letterSpacing: '0.2em', display: 'flex' }}>Order online · Same-day delivery in Calgary</span>
          <div style={{ width: 28, height: 1, background: 'rgba(200,149,42,0.5)', display: 'flex' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}