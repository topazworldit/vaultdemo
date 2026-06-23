'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const S = {
  bg: '#0B0B0A',
  s1: '#141413',
  s2: '#1D1D1B',
  s3: '#252523',
  b1: '#2E2E2C',
  b2: '#3C3C39',
  t1: '#ECEAE6',
  t2: '#8C8A85',
  t3: '#504E4B',
  ac: '#C2B49A',
  acDim: '#7C7060',
  pos: '#7EA882',
  neg: '#A87060',
}

const NAV = [
  { href: '/demo',          label: 'Home',      icon: '⌂' },
  { href: '/demo/portfolio',label: 'Portfolio', icon: '◈' },
  { href: '/demo/market',   label: 'Market',    icon: '◆' },
  { href: '/demo/vault',    label: 'Vault',     icon: '⬡' },
  { href: '/demo/more',     label: 'More',      icon: '···' },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/demo') return pathname === '/demo'
    return pathname.startsWith(href)
  }

  const moreActive = ['/demo/roe', '/demo/payments', '/demo/maintenance'].some(h => pathname.startsWith(h))

  return (
    <div style={{
      minHeight: '100svh',
      background: S.bg,
      fontFamily: 'Inter, system-ui, sans-serif',
      color: S.t1,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: ${S.bg}; --s1: ${S.s1}; --s2: ${S.s2}; --s3: ${S.s3};
          --b1: ${S.b1}; --b2: ${S.b2};
          --t1: ${S.t1}; --t2: ${S.t2}; --t3: ${S.t3};
          --ac: ${S.ac}; --ac-dim: ${S.acDim};
          --pos: ${S.pos}; --neg: ${S.neg};
        }
        body { background: ${S.bg}; }
        @media (min-width: 600px) {
          .demo-main { padding: 24px 28px !important; }
        }
      `}</style>

      {/* Scrollable content */}
      <main className="demo-main" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        paddingBottom: '80px',
      }}>
        {children}
      </main>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: S.s1,
        borderTop: `1px solid ${S.b1}`,
        display: 'flex',
        padding: '10px 0 14px',
        zIndex: 50,
      }}>
        {NAV.map(item => {
          const active = item.href === '/demo/more' ? moreActive : isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <span style={{
                fontSize: '18px',
                color: active ? S.ac : S.t3,
                lineHeight: 1,
                fontFamily: 'monospace',
              }}>{item.icon}</span>
              <span style={{
                fontSize: '10px',
                color: active ? S.ac : S.t3,
                fontWeight: active ? 500 : 400,
                letterSpacing: '0.02em',
              }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
