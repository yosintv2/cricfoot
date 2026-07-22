export const runtime = 'edge';

import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'CricFoot — Football Live on TV';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d2040 0%, #1a3a6b 60%, #1e4d8c 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 64,
                border: '7px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '14px solid transparent',
                  borderBottom: '14px solid transparent',
                  borderLeft: '24px solid white',
                  marginLeft: 6,
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, color: 'white' }}>
            Cric<span style={{ color: '#ef4444' }}>Foot</span>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 38, color: 'rgba(255,255,255,0.85)' }}>
          Football Live on TV — Schedules &amp; Channels
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)', marginTop: 18 }}>
          World Cup · Champions League · Premier League · La Liga · Serie A
        </div>
      </div>
    ),
    size
  );
}
