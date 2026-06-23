import Link from 'next/link'
import { PROPERTIES, calcROE, fmtAED } from '@/lib/demo-data'

const totalValue   = PROPERTIES.reduce((a, p) => a + p.currentDLD, 0)
const totalInvested = PROPERTIES.reduce((a, p) => a + p.purchasePrice * (p.paidPct / 100), 0)
const avgROE        = PROPERTIES.reduce((a, p) => a + calcROE(p), 0) / PROPERTIES.length

const MORE_ITEMS = [
  {
    href: '/demo/roe',
    icon: '◎',
    label: 'Return on Equity',
    sub: 'Per-property ROE vs ROI analysis',
    val: `${avgROE.toFixed(0)}% avg`,
  },
  {
    href: '/demo/payments',
    icon: '◇',
    label: 'Payment Schedule',
    sub: 'All milestones & cashflow planner',
    val: fmtAED(totalInvested) + ' paid',
  },
  {
    href: '/demo/maintenance',
    icon: '◉',
    label: 'Maintenance & Snag',
    sub: 'Inspection tracker, open tasks',
    val: '5 open',
  },
]

export default function MorePage() {
  return (
    <div>
      <div style={{ paddingTop: '8px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>More</h1>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>Additional tools & analysis</p>
      </div>

      {/* Investor card */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'var(--s3)', border: '1px solid var(--b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 500, color: 'var(--ac)',
          }}>AM</div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--t1)' }}>Ahmed Al Mansoori</p>
            <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>Private Investor · Dubai, UAE</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '18px' }}>
          {[
            { label: 'Portfolio', val: fmtAED(totalValue) },
            { label: 'Avg ROE', val: `${avgROE.toFixed(0)}%` },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--s2)', borderRadius: '10px', padding: '12px' }}>
              <p style={{ fontSize: '9px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{m.label}</p>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ac)' }}>{m.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More navigation */}
      <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        Tools
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
        {MORE_ITEMS.map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px',
              padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: 'var(--s3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', color: 'var(--ac)', fontFamily: 'monospace',
                }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)' }}>{item.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{item.sub}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: 'var(--ac)', fontWeight: 500 }}>{item.val}</p>
                <p style={{ fontSize: '16px', color: 'var(--t3)', marginTop: '2px' }}>›</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links back */}
      <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        Quick Access
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        {[
          { href: '/demo',           label: 'Home',      icon: '⌂' },
          { href: '/demo/portfolio', label: 'Portfolio', icon: '◈' },
          { href: '/demo/market',    label: 'Market',    icon: '◆' },
          { href: '/demo/vault',     label: 'Vault',     icon: '⬡' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '12px',
              padding: '16px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '16px', color: 'var(--ac)', fontFamily: 'monospace' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', color: 'var(--t1)' }}>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--b1)' }}>
        <p style={{ fontSize: '10px', color: 'var(--t3)', textAlign: 'center' }}>
          Topaz Investor · Portfolio Management System
        </p>
        <p style={{ fontSize: '10px', color: 'var(--t3)', textAlign: 'center', marginTop: '3px' }}>
          Connected: DLD · Bayut · Property Finder · Demo Build Jun 2026
        </p>
      </div>
    </div>
  )
}
