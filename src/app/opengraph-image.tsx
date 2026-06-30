import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Shifty — Shift & Task Delegation for Teams'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-2px' }}>
          Shifty
        </div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.85, textAlign: 'center' }}>
          Shift &amp; Task Delegation for Teams
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 20,
            opacity: 0.65,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Assign shifts · Track completions · Automate reminders
        </div>
      </div>
    ),
    size,
  )
}
