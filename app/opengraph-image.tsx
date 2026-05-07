import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = "Maame Ks Kitchen — Authentic Ghanaian Cuisine in Calgary";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #022c22 100%)',
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
        {/* Top-left corner */}
        <div style={{ position: 'absolute', top: 52, left: 52, width: 70, height: 2, background: '#6ee7b7', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 52, left: 52, width: 2, height: 70, background: '#6ee7b7', display: 'flex' }} />
        {/* Top-right corner */}
        <div style={{ position: 'absolute', top: 52, right: 52, width: 70, height: 2, background: '#6ee7b7', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 52, right: 52, width: 2, height: 70, background: '#6ee7b7', display: 'flex' }} />
        {/* Bottom-left corner */}
        <div style={{ position: 'absolute', bottom: 52, left: 52, width: 70, height: 2, background: '#6ee7b7', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 52, left: 52, width: 2, height: 70, background: '#6ee7b7', display: 'flex' }} />
        {/* Bottom-right corner */}
        <div style={{ position: 'absolute', bottom: 52, right: 52, width: 70, height: 2, background: '#6ee7b7', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 52, right: 52, width: 2, height: 70, background: '#6ee7b7', display: 'flex' }} />

        {/* Subtle accent lines */}
        <div style={{ position: 'absolute', top: '28%', left: 120, right: 120, height: 1, background: 'rgba(110,231,183,0.12)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '28%', left: 120, right: 120, height: 1, background: 'rgba(110,231,183,0.12)', display: 'flex' }} />

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* MK Monogram Circle */}
          <div
            style={{
              width: 108,
              height: 108,
              borderRadius: '50%',
              border: '2px solid #6ee7b7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                color: '#6ee7b7',
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: 5,
                display: 'flex',
              }}
            >
              MK
            </span>
          </div>

          {/* Brand Name */}
          <div
            style={{
              color: '#ffffff',
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 20,
              display: 'flex',
            }}
          >
            Maame Ks Kitchen
          </div>

          {/* Divider */}
          <div
            style={{
              width: 90,
              height: 2,
              background: '#6ee7b7',
              marginBottom: 22,
              display: 'flex',
            }}
          />

          {/* Tagline */}
          <div
            style={{
              color: '#a7f3d0',
              fontSize: 22,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontWeight: 400,
              display: 'flex',
            }}
          >
            Authentic Ghanaian Cuisine · Calgary, Canada
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
