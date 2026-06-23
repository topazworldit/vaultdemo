import Link from 'next/link'
import { PROPERTIES, calcROE, calcROI, fmtAED } from '@/lib/demo-data'

export default function PortfolioPage() {
  const totalValue   = PROPERTIES.reduce((a, p) => a + p.currentDLD, 0)
  const totalGain    = PROPERTIES.reduce((a, p) => a + (p.currentDLD - p.purchasePrice), 0)

  return (
    <div>
      {/* Header */}
      <div style={{ paddingTop: '8px', marginBottom: '24px' }}>
        <Link href="/demo" style={{ fontSize: '12px', color: 'var(--ac)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          ‹ Home
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>Portfolio</h1>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>{PROPERTIES.length} properties · {fmtAED(totalValue)}</p>
      </div>

      {/* Summary bar */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '0' }}>
        {[
          { label: 'Portfolio Value', val: fmtAED(totalValue) },
          { label: 'Total Gain', val: `+${fmtAED(totalGain)}`, color: 'var(--pos)' },
          { label: 'Properties', val: `${PROPERTIES.length}` },
        ].map((m, i) => (
          <div key={m.label} style={{
            flex: 1,
            paddingLeft: i > 0 ? '16px' : 0,
            borderLeft: i > 0 ? '1px solid var(--b1)' : 'none',
            marginLeft: i > 0 ? '16px' : 0,
          }}>
            <p style={{ fontSize: '9px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>{m.label}</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: (m as { color?: string }).color ?? 'var(--t1)' }}>{m.val}</p>
          </div>
        ))}
      </div>

      {/* ROE vs ROI bars */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Return on equity vs ROI
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {PROPERTIES.map(p => {
            const roe = calcROE(p)
            const roi = calcROI(p)
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '90px', flexShrink: 0 }}>
                  <p style={{ fontSize: '10px', color: 'var(--t1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                  </p>
                  <p style={{ fontSize: '9px', color: 'var(--t3)', marginTop: '1px' }}>{p.location.split(' ')[0]}</p>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ height: '8px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(roe, 100)}%`, background: '#7EA882', borderRadius: '2px' }} />
                  </div>
                  <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(roi, 100)}%`, background: 'var(--t3)', borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{ width: '48px', textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#7EA882' }}>{roe.toFixed(0)}%</p>
                  <p style={{ fontSize: '9px', color: 'var(--t3)' }}>{roi.toFixed(0)}%</p>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--b1)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--t3)' }}>
            <span style={{ width: '12px', height: '4px', background: '#7EA882', borderRadius: '1px', display: 'inline-block' }} /> ROE
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--t3)' }}>
            <span style={{ width: '12px', height: '4px', background: 'var(--t3)', borderRadius: '1px', display: 'inline-block' }} /> ROI
          </span>
        </div>
      </div>

      {/* Property list */}
      <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        All Properties
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PROPERTIES.map(p => {
          const gain = p.currentDLD - p.purchasePrice
          const roe  = calcROE(p)
          return (
            <Link key={p.id} href={`/demo/portfolio/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '18px', transition: 'border-color 0.15s' }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>{p.name}</p>
                      <span style={{
                        fontSize: '9px', padding: '2px 8px', borderRadius: '20px',
                        background: 'var(--s3)', color: 'var(--ac)', border: '1px solid var(--b2)',
                        fontWeight: 500, letterSpacing: '0.04em',
                      }}>
                        {p.devBadge}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--t3)' }}>{p.unit} · {p.location}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#7EA882' }}>{roe.toFixed(0)}%</p>
                    <p style={{ fontSize: '9px', color: 'var(--t3)', marginTop: '1px' }}>ROE</p>
                  </div>
                </div>

                {/* Key numbers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontSize: '9px', color: 'var(--t3)', marginBottom: '3px' }}>Purchase</p>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--t2)' }}>{fmtAED(p.purchasePrice)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '9px', color: 'var(--t3)', marginBottom: '3px' }}>DLD Value</p>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--pos)' }}>{fmtAED(p.currentDLD)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '9px', color: 'var(--t3)', marginBottom: '3px' }}>Gain</p>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--pos)' }}>+{fmtAED(gain)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--t3)', marginBottom: '5px' }}>
                    <span>{p.paidPct}% paid · {p.paymentPlan}</span>
                    <span>{p.status}</span>
                  </div>
                  <div style={{ height: '3px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.paidPct}%`, background: 'var(--ac)', borderRadius: '2px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <p style={{ fontSize: '10px', color: 'var(--t3)' }}>{p.developer} · {p.devType}</p>
                  <p style={{ fontSize: '12px', color: 'var(--t3)' }}>› View details</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
