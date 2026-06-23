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
      {/* Header */}
      <div style={{ paddingTop: '8px', paddingBottom: '28px' }}>
        <p style={{ fontSize: '12px', color: 'var(--t3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Topaz Investor
        </p>
        <p style={{ fontSize: '15px', color: 'var(--t1)', fontWeight: 500 }}>Ahmed Al Mansoori</p>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>Private Portfolio · Dubai</p>
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
