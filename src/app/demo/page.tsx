import Link from 'next/link'
import { PROPERTIES, calcROE, fmtAED } from '@/lib/demo-data'

export default function DemoHome() {
  const totalValue   = PROPERTIES.reduce((a, p) => a + p.currentDLD, 0)
  const totalPurchase = PROPERTIES.reduce((a, p) => a + p.purchasePrice, 0)
  const totalInvested = PROPERTIES.reduce((a, p) => a + p.purchasePrice * (p.paidPct / 100), 0)
  const totalGain    = totalValue - totalPurchase
  const avgROE       = PROPERTIES.reduce((a, p) => a + calcROE(p), 0) / PROPERTIES.length

  const sections = [
    { href: '/demo/portfolio',   label: 'Portfolio',           sub: `${PROPERTIES.length} properties`, icon: '◈', val: fmtAED(totalValue) },
    { href: '/demo/roe',         label: 'Return on Equity',    sub: 'Per-property analysis',            icon: '◎', val: `${avgROE.toFixed(0)}% avg` },
    { href: '/demo/market',      label: 'Market Intelligence', sub: 'DLD vs portal pricing',            icon: '◆', val: '+11.4% premium' },
    { href: '/demo/vault',       label: 'Property Vault',      sub: 'DLD registered assets',            icon: '⬡', val: '5 assets' },
    { href: '/demo/payments',    label: 'Payment Schedule',    sub: 'Upcoming obligations',             icon: '◇', val: fmtAED(totalInvested) },
    { href: '/demo/maintenance', label: 'Maintenance',         sub: 'Snag & inspection tracker',        icon: '◉', val: '5 open' },
  ]

  return (
    <div>
      {/* Branding header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', paddingBottom: '24px', borderBottom: '1px solid var(--b1)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#C2B49A"/>
            {/* Diamond top facets */}
            <polygon points="16,5 23,12 16,12" fill="#0B0B0A" opacity="0.75"/>
            <polygon points="16,5 9,12 16,12" fill="#0B0B0A" opacity="0.55"/>
            {/* Diamond left/right top */}
            <polygon points="7,10 9,12 16,12" fill="#0B0B0A" opacity="0.4"/>
            <polygon points="25,10 23,12 16,12" fill="#0B0B0A" opacity="0.6"/>
            {/* Diamond bottom */}
            <polygon points="9,12 16,12 16,27" fill="#0B0B0A" opacity="0.5"/>
            <polygon points="23,12 16,12 16,27" fill="#0B0B0A" opacity="0.85"/>
            {/* Outer outline */}
            <polygon points="16,5 25,10 23,12 16,27 9,12 7,10" stroke="#0B0B0A" strokeWidth="0.8" fill="none"/>
            <line x1="9" y1="12" x2="23" y2="12" stroke="#0B0B0A" strokeWidth="0.8"/>
            <line x1="16" y1="5" x2="16" y2="12" stroke="#0B0B0A" strokeWidth="0.8"/>
          </svg>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>Topaz Vault</p>
            <p style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '1px' }}>Investor Portfolio</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: 'var(--t1)', fontWeight: 500 }}>Ahmed Al Mansoori</p>
          <p style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '1px' }}>Dubai · Private Investor</p>
        </div>
      </div>

      {/* Hero */}
      <div style={{ paddingBottom: '32px', borderBottom: `1px solid var(--b1)`, marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Total Portfolio Value
        </p>
        <p style={{ fontSize: '42px', fontWeight: 600, color: 'var(--t1)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {fmtAED(totalValue)}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--pos)', marginTop: '8px' }}>
          ↑ {fmtAED(totalGain)} unrealised gain
        </p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
        {[
          { label: 'Invested to Date',  val: fmtAED(totalInvested), accent: false },
          { label: 'Avg Return on Equity', val: `${avgROE.toFixed(0)}%`, accent: true },
          { label: 'Purchase Price', val: fmtAED(totalPurchase), accent: false },
          { label: 'Properties', val: `${PROPERTIES.length}`, accent: false },
        ].map(m => (
          <div key={m.label} style={{
            background: m.accent ? '#1A1710' : 'var(--s1)',
            border: `1px solid ${m.accent ? '#3A3420' : 'var(--b1)'}`,
            borderRadius: '12px',
            padding: '16px',
          }}>
            <p style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {m.label}
            </p>
            <p style={{ fontSize: '20px', fontWeight: 600, color: m.accent ? 'var(--ac)' : 'var(--t1)' }}>
              {m.val}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation sections */}
      <p style={{ fontSize: '11px', color: 'var(--t3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
        Sections
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map(s => (
          <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--s1)',
              border: '1px solid var(--b1)',
              borderRadius: '14px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', color: 'var(--ac)', fontFamily: 'monospace',
                }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)' }}>{s.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{s.sub}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', color: 'var(--ac)', fontWeight: 500 }}>{s.val}</p>
                <p style={{ fontSize: '16px', color: 'var(--t3)', marginTop: '2px' }}>›</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--b1)' }}>
        <p style={{ fontSize: '10px', color: 'var(--t3)', textAlign: 'center' }}>
          Data sourced from Dubai Land Department · Bayut · Property Finder
        </p>
        <p style={{ fontSize: '10px', color: 'var(--t3)', textAlign: 'center', marginTop: '4px' }}>
          Demo Build · June 2026
        </p>
      </div>
    </div>
  )
}
