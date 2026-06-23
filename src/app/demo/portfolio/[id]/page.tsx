import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProperty, calcROE, calcROI, fmtAED, fmtShort } from '@/lib/demo-data'

export default function PropertyDetail({ params }: { params: { id: string } }) {
  const p = getProperty(params.id)
  if (!p) notFound()

  const roe    = calcROE(p)
  const roi    = calcROI(p)
  const gain   = p.currentDLD - p.purchasePrice
  const invested = p.purchasePrice * (p.paidPct / 100)
  const leverage = roe / roi

  return (
    <div>
      <div style={{ paddingTop: '8px', marginBottom: '20px' }}>
        <Link href="/demo/portfolio" style={{ fontSize: '12px', color: 'var(--ac)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          ‹ Portfolio
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>{p.name}</h1>
            <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '3px' }}>{p.unit} · {p.location}</p>
          </div>
          <span style={{
            fontSize: '10px', padding: '4px 10px', borderRadius: '20px',
            background: 'var(--s3)', color: 'var(--ac)', border: '1px solid var(--b2)',
            letterSpacing: '0.04em', marginTop: '4px',
          }}>
            {p.devBadge}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6, marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--b1)' }}>
        {p.description}
      </p>

      {/* ROE hero */}
      <div style={{ background: '#181610', border: '1px solid #3A3420', borderRadius: '14px', padding: '20px', marginBottom: '12px' }}>
        <p style={{ fontSize: '10px', color: 'var(--ac-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Return on Equity
        </p>
        <p style={{ fontSize: '48px', fontWeight: 600, color: '#7EA882', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {roe.toFixed(0)}%
        </p>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '8px' }}>
          {fmtAED(gain)} gain on {fmtAED(invested)} deployed · {leverage.toFixed(1)}× leverage
        </p>
        <div style={{ marginTop: '14px', height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(roe, 100)}%`, background: '#7EA882' }} />
        </div>
      </div>

      {/* ROI comparison */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Return on Investment
        </p>
        <p style={{ fontSize: '32px', fontWeight: 600, color: 'var(--t1)', lineHeight: 1 }}>
          {roi.toFixed(0)}%
        </p>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '6px' }}>
          {fmtAED(gain)} gain on {fmtAED(p.purchasePrice)} full asset value
        </p>
        <div style={{ marginTop: '14px', height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(roi, 100)}%`, background: 'var(--t3)' }} />
        </div>
      </div>

      {/* Key details */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Property Details</p>
        {[
          { label: 'Developer', val: p.developer },
          { label: 'Developer type', val: p.devType },
          { label: 'Property type', val: `${p.type} · ${p.bedrooms}BR / ${p.bathrooms}BA` },
          { label: 'Area', val: `${p.area.toLocaleString()} sq ft` },
          { label: 'Purchase date', val: p.purchaseDate },
          { label: 'Handover', val: p.handover },
          { label: 'DLD registration', val: p.dldTxn },
          { label: 'Construction', val: `${p.completionPct}% complete` },
        ].map((row, i, arr) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < arr.length - 1 ? '1px solid var(--b1)' : 'none',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--t3)' }}>{row.label}</p>
            <p style={{ fontSize: '12px', color: 'var(--t1)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{row.val}</p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Pricing</p>
        {[
          { label: 'Purchase Price',  val: fmtAED(p.purchasePrice), color: 'var(--t1)' },
          { label: 'DLD Market Value', val: fmtAED(p.currentDLD),   color: 'var(--pos)' },
          { label: 'Unrealised Gain', val: `+${fmtAED(gain)}`,      color: 'var(--pos)' },
          { label: 'Bayut Listed',    val: fmtAED(p.bayutListed),    color: 'var(--t2)' },
          { label: 'Property Finder', val: fmtAED(p.pfListed),      color: 'var(--t2)' },
          { label: 'Portal Premium',  val: `+${(((p.bayutListed + p.pfListed) / 2 / p.currentDLD) - 1) * 100 | 0}% above DLD`, color: 'var(--neg)' },
        ].map((row, i, arr) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < arr.length - 1 ? '1px solid var(--b1)' : 'none',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--t3)' }}>{row.label}</p>
            <p style={{ fontSize: '12px', fontWeight: 500, color: row.color }}>{row.val}</p>
          </div>
        ))}
      </div>

      {/* Payment plan */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment Plan</p>
          <span style={{ fontSize: '11px', color: 'var(--ac)', fontWeight: 500 }}>{p.paymentPlan}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {p.planBreakdown.map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '10px',
              background: row.status === 'paid' ? 'var(--s2)' : row.status === 'upcoming' ? '#1A1710' : 'var(--s1)',
              border: `1px solid ${row.status === 'upcoming' ? '#3A3420' : 'var(--b1)'}`,
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: row.status === 'paid' ? 'var(--pos)' : row.status === 'upcoming' ? 'var(--ac)' : 'var(--t3)' }} />
              <p style={{ fontSize: '12px', color: row.status === 'paid' ? 'var(--t3)' : 'var(--t1)', flex: 1 }}>{row.label}</p>
              <p style={{ fontSize: '11px', color: 'var(--t3)' }}>{row.due}</p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: row.status === 'paid' ? 'var(--t3)' : row.status === 'upcoming' ? 'var(--ac)' : 'var(--t2)', minWidth: '32px', textAlign: 'right' }}>
                {row.pct}%
              </p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--b1)', fontSize: '12px' }}>
          <span style={{ color: 'var(--t3)' }}>Paid so far</span>
          <span style={{ color: 'var(--t1)', fontWeight: 500 }}>{fmtAED(invested)} ({p.paidPct}%)</span>
        </div>
      </div>

      {/* Market comparison mini */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          DLD vs Portal Pricing
        </p>
        {[
          { label: 'DLD Transacted', val: p.currentDLD, color: 'var(--pos)' },
          { label: 'Bayut Listed',   val: p.bayutListed, color: 'var(--t2)' },
          { label: 'Prop. Finder',   val: p.pfListed,    color: 'var(--t2)' },
        ].map(row => {
          const max = Math.max(p.currentDLD, p.bayutListed, p.pfListed)
          const w = (row.val / max) * 100
          return (
            <div key={row.label} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--t3)' }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: 500 }}>{fmtAED(row.val)}</span>
              </div>
              <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${w}%`, background: row.color, borderRadius: '2px' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
        <Link href="/demo/vault" style={{
          flex: 1, textAlign: 'center', textDecoration: 'none',
          background: 'var(--ac)', color: '#0B0B0A',
          borderRadius: '12px', padding: '14px',
          fontSize: '13px', fontWeight: 600,
        }}>
          List with Agency
        </Link>
        <Link href="/demo/market" style={{
          flex: 1, textAlign: 'center', textDecoration: 'none',
          background: 'var(--s2)', color: 'var(--t1)',
          border: '1px solid var(--b2)',
          borderRadius: '12px', padding: '14px',
          fontSize: '13px', fontWeight: 500,
        }}>
          Market Data
        </Link>
      </div>
    </div>
  )
}
