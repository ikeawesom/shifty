import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Shifty — Shift & Task Delegation for Teams'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const features = ['Assign Shifts', 'Track Completions', 'Automate Reminders']

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a14',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
          padding: '64px',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 60%, transparent 100%)',
          }}
        />

        {/* Purple glow orb — top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(124,58,237,0.38) 0%, rgba(168,85,247,0.14) 45%, transparent 70%)',
          }}
        />

        {/* Secondary glow — bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -60,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              background: 'rgba(124,58,237,0.18)',
              border: '1px solid rgba(124,58,237,0.45)',
              borderRadius: 4,
              padding: '5px 14px',
              color: '#a78bfa',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            SHIFT MANAGEMENT
          </div>
        </div>

        {/* Main heading */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-4px',
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          Shifty
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: '#94a3b8',
            letterSpacing: '-0.3px',
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          Shift &amp; Task Delegation for Teams
        </div>

        {/* Divider */}
        <div
          style={{
            width: 48,
            height: 1,
            background: 'rgba(124,58,237,0.5)',
            marginBottom: 28,
          }}
        />

        {/* Bottom row — feature pills + domain */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
            {features.map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 6,
                  padding: '9px 16px',
                  color: '#d4e4fa',
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  }}
                />
                {label}
              </div>
            ))}
          </div>

          {/* Domain */}
          <div
            style={{
              color: '#3d4f63',
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.03em',
            }}
          >
            shifty.app
          </div>
        </div>
      </div>
    ),
    size,
  )
}
