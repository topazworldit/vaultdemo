import Link from 'next/link'
import { PROPERTIES, MAINTENANCE } from '@/lib/demo-data'

const priorityColor: Record<string, string> = {
  high: 'var(--neg)',
  medium: 'var(--ac)',
  low: 'var(--t3)',
}

const typeIcon: Record<string, string> = {
  snag: '⚑',
  inspection: '◎',
  document: '◇',
}

export default function MaintenancePage() {
  const high   = MAINTENANCE.filter(m => m.priority === 'high')
  const medium = MAINTENANCE.filter(m => m.priority === 'medium')
  const low    = MAINTENANCE.filter(m => m.priority === 'low')

  return (
    <div>
      <div style={{ paddingTop: '8px', marginBottom: '24px' }}>
        <Link href="/demo/more" style={{ fontSize: '12px', color: 'var(--ac)', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ‹ More
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>Maintenance</h1>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>Snag tracking, inspections & documents</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '28px' }}>
        {[
          { label: 'High Priority', val: `${high.length}`, color: 'var(--neg)' },
          { label: 'Medium', val: `${medium.length}`, color: 'var(--ac)' },
          { label: 'Low', val: `${low.length}`, color: 'var(--t3)' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ fontSize: '9px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{m.label}</p>
            <p style={{ fontSize: '22px', fontWeight: 600, color: m.color }}>{m.val}</p>
          </div>
        ))}
      </div>

      {/* All tasks */}
      <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        Open Tasks
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
        {MAINTENANCE.map((m, i) => (
          <div key={i} style={{
            background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: priorityColor[m.priority] }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)' }}>{m.task}</p>
                <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '3px' }}>{m.name}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '16px', color: 'var(--t3)' }}>{typeIcon[m.type]}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--b1)' }}>
              <span style={{ fontSize: '10px', padding: '3px 8px', background: 'var(--s3)', color: priorityColor[m.priority], borderRadius: '20px', fontWeight: 500 }}>
                {m.priority}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{m.due}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Construction progress per property */}
      <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
        Construction Progress
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
        {PROPERTIES.map(p => (
          <div key={p.id} style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)' }}>{p.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{p.developer} · {p.location}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: p.completionPct > 50 ? 'var(--pos)' : 'var(--ac)' }}>
                  {p.completionPct}%
                </p>
                <p style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '1px' }}>{p.handover}</p>
              </div>
            </div>
            <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${p.completionPct}%`, background: p.completionPct > 50 ? 'var(--pos)' : 'var(--ac)', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--t3)' }}>
              <span>{p.status}</span>
              <span>Handover: {p.handover}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
