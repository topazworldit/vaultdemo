import Link from 'next/link'
import { PROPERTIES, fmtAED } from '@/lib/demo-data'

type Status = 'paid' | 'upcoming' | 'future'

interface Milestone {
  property: string
  label: string
  pct: number
  amount: number
  due: string
  status: Status
}

const ALL_MILESTONES: Milestone[] = PROPERTIES.flatMap(p =>
  p.planBreakdown.map(m => ({
    property: p.name,
    label: m.label,
    pct: m.pct,
    amount: p.purchasePrice * (m.pct / 100),
    due: m.due,
    status: m.status,
  }))
)

const paid     = ALL_MILESTONES.filter(m => m.status === 'paid')
const upcoming = ALL_MILESTONES.filter(m => m.status === 'upcoming')
const future   = ALL_MILESTONES.filter(m => m.status === 'future')

const totalPaid     = paid.reduce((a, m) => a + m.amount, 0)
const totalUpcoming = upcoming.reduce((a, m) => a + m.amount, 0)
const totalFuture   = future.reduce((a, m) => a + m.amount, 0)

const statusColor: Record<Status, string> = {
  paid: 'var(--t3)',
  upcoming: 'var(--ac)',
  future: 'var(--t3)',
}

function MilestoneList({ items, title, accent }: { items: Milestone[], title: string, accent?: boolean }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((m, i) => (
          <div key={i} style={{
            background: accent ? '#181610' : 'var(--s1)',
            border: `1px solid ${accent ? '#3A3420' : 'var(--b1)'}`,
            borderRadius: '12px', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
              background: m.status === 'paid' ? 'var(--pos)' : m.status === 'upcoming' ? 'var(--ac)' : 'var(--t3)',
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: m.status === 'paid' ? 'var(--t3)' : 'var(--t1)' }}>
                {m.property}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{m.label}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: statusColor[m.status] }}>
                {fmtAED(m.amount)}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>{m.due}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <div>
      <div style={{ paddingTop: '8px', marginBottom: '24px' }}>
        <Link href="/demo/more" style={{ fontSize: '12px', color: 'var(--ac)', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ‹ More
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>Payment Schedule</h1>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>All milestones across 5 properties</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
        {[
          { label: 'Total Paid', val: fmtAED(totalPaid), accent: false },
          { label: 'Upcoming', val: fmtAED(totalUpcoming), accent: true },
          { label: 'Future Obligations', val: fmtAED(totalFuture), accent: false },
          { label: 'Total Purchase', val: fmtAED(PROPERTIES.reduce((a, p) => a + p.purchasePrice, 0)), accent: false },
        ].map(m => (
          <div key={m.label} style={{
            background: m.accent ? '#1A1710' : 'var(--s1)',
            border: `1px solid ${m.accent ? '#3A3420' : 'var(--b1)'}`,
            borderRadius: '12px', padding: '16px',
          }}>
            <p style={{ fontSize: '9px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{m.label}</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: m.accent ? 'var(--ac)' : 'var(--t1)' }}>{m.val}</p>
          </div>
        ))}
      </div>

      {/* Cashflow timeline visual */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Cashflow overview
        </p>
        {PROPERTIES.map(p => {
          const total = p.purchasePrice
          return (
            <div key={p.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ color: 'var(--t1)', fontWeight: 500 }}>{p.name}</span>
                <span style={{ color: 'var(--t3)' }}>{fmtAED(total)}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${p.paidPct}%`, background: 'var(--pos)' }} />
                <div style={{ width: `${Math.max(0, 100 - p.paidPct - (100 - p.paidPct) * 0.4)}%`, background: 'var(--ac)' }} />
                <div style={{ flex: 1, background: 'var(--s3)' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '9px', color: 'var(--t3)' }}>
                <span style={{ color: 'var(--pos)' }}>✓ {p.paidPct}% paid</span>
                <span style={{ color: 'var(--ac)' }}>~ upcoming</span>
                <span>future</span>
              </div>
            </div>
          )
        })}
      </div>

      <MilestoneList items={upcoming} title={`Upcoming (${upcoming.length})`} accent />
      <MilestoneList items={paid}     title={`Paid (${paid.length})`} />
      <MilestoneList items={future}   title={`Future obligations (${future.length})`} />
    </div>
  )
}
