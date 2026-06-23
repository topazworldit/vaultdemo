import Link from 'next/link'
import { PROPERTIES, fmtAED } from '@/lib/demo-data'

export default function MarketPage() {
  const avgPremium = PROPERTIES.reduce((a, p) => {
    const avg = (p.bayutListed + p.pfListed) / 2
    return a + ((avg / p.currentDLD) - 1) * 100
  }, 0) / PROPERTIES.length

  const maxVal = Math.max(...PROPERTIES.flatMap(p => [p.currentDLD, p.bayutListed, p.pfListed]))

  return (
    <div>
      <div style={{ paddingTop: '8px', marginBottom: '24px' }}>
        <Link href="/demo" style={{ fontSize: '12px', color: 'var(--ac)', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ‹ Home
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>Market Intelligence</h1>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>DLD transacted vs portal listing prices</p>
      </div>

      {/* Headline insight */}
      <div style={{ background: '#181610', border: '1px solid #3A3420', borderRadius: '14px', padding: '22px', marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', color: 'var(--ac-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Average Portal Premium
        </p>
        <p style={{ fontSize: '44px', fontWeight: 600, color: 'var(--ac)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          +{avgPremium.toFixed(1)}%
        </p>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '8px', lineHeight: 1.5 }}>
          Portals list units well above DLD-transacted prices. Your ROE is always calculated on real market data — not asking prices.
        </p>
      </div>

      {/* Key callout */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '16px', color: 'var(--ac)', flexShrink: 0 }}>◆</span>
        <p style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.6 }}>
          DLD transaction data reflects actual agreed sale prices. Portal listings include agent markups of 8–15%. This gap is the key transparency metric for off-plan investors.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {[
          { color: 'var(--pos)', label: 'DLD Transacted' },
          { color: 'var(--t3)', label: 'Bayut Listed' },
          { color: 'var(--b2)', label: 'Property Finder' },
        ].map(l => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--t3)' }}>
            <span style={{ width: '10px', height: '3px', background: l.color, borderRadius: '1px', display: 'inline-block', flexShrink: 0 }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Per-property comparison */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {PROPERTIES.map(p => {
          const avgPortal = (p.bayutListed + p.pfListed) / 2
          const premium   = ((avgPortal / p.currentDLD) - 1) * 100
          return (
            <Link key={p.id} href={`/demo/portfolio/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{p.location} · {p.devBadge}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--neg)', fontWeight: 600 }}>+{premium.toFixed(1)}%</span>
                </div>

                {[
                  { label: 'DLD',   val: p.currentDLD, color: 'var(--pos)' },
                  { label: 'Bayut', val: p.bayutListed, color: 'var(--t3)' },
                  { label: 'PF',    val: p.pfListed,    color: 'var(--b2)' },
                ].map(row => {
                  const w = (row.val / maxVal) * 100
                  return (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--t3)', width: '28px', flexShrink: 0 }}>{row.label}</span>
                      <div style={{ flex: 1, height: row.label === 'DLD' ? '8px' : '5px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${w}%`, background: row.color, borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: row.color, width: '40px', textAlign: 'right', flexShrink: 0 }}>
                        {(row.val / 1_000_000).toFixed(2)}M
                      </span>
                    </div>
                  )
                })}

                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--b1)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--t3)' }}>DLD: {fmtAED(p.currentDLD)}</span>
                  <span style={{ color: 'var(--t3)' }}>Portal avg: {fmtAED(Math.round(avgPortal / 50000) * 50000)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Summary table */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '18px', marginBottom: '8px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Premium Summary
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {PROPERTIES.map((p, i, arr) => {
            const avg = (p.bayutListed + p.pfListed) / 2
            const prem = ((avg / p.currentDLD) - 1) * 100
            return (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--b1)' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--t1)' }}>{p.name}</p>
                  <p style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '1px' }}>{p.location}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neg)' }}>+{prem.toFixed(1)}%</p>
                  <p style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '1px' }}>{fmtAED(p.currentDLD)} DLD</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
