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
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent 0%, #C8952A 40%, #e8b428 60%, transparent 100%)', display: 'flex' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: '#C8952A', fontSize: 12, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 24, display: 'flex' }}>
            Authentic Ghanaian Cuisine
          </div>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', border: '2px solid #C8952A',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
            background: 'rgba(200,149,42,0.1)',
          }}>
            <span style={{ color: '#C8952A', fontSize: 34, fontWeight: 700, letterSpacing: 4, display: 'flex' }}>MK</span>
          </div>
          <div style={{ color: '#ffffff', fontSize: 62, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16, display: 'flex' }}>
            Maame K's Kitchen
          </div>
          <div style={{ width: 72, height: 2, background: '#C8952A', marginBottom: 18, display: 'flex' }} />
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex' }}>
            Cornerstone, NE Calgary
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}