'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PROPERTIES, calcROE, fmtAED } from '@/lib/demo-data'

type DocStatus = 'verified' | 'uploaded' | 'pending'

const DOC_TYPES = [
  { key: 'passport',  label: 'Passport',            sub: 'Owner identification',   status: 'verified' as DocStatus },
  { key: 'emiratesid', label: 'Emirates ID',         sub: 'UAE resident ID',        status: 'verified' as DocStatus },
  { key: 'spa',       label: 'Sales Purchase Agmt.', sub: 'Executed SPA',           status: 'uploaded' as DocStatus },
  { key: 'oqood',     label: 'Oqood / Title Deed',   sub: 'DLD registration',       status: 'uploaded' as DocStatus },
]

const STATUS_STYLE: Record<DocStatus, { bg: string; color: string; label: string }> = {
  verified: { bg: 'rgba(126,168,130,.15)', color: '#7EA882', label: 'Verified' },
  uploaded: { bg: 'rgba(194,180,154,.12)', color: '#C2B49A', label: 'Uploaded' },
  pending:  { bg: 'rgba(80,78,75,.3)',     color: '#8C8A85', label: 'Pending' },
}

function PassportCard({ name }: { name: string }) {
  return (
    <div style={{ background: '#1A1A18', border: '1px solid #3C3C39', borderRadius: '8px', padding: '12px', width: '100%', aspectRatio: '1.58/1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#C2B49A' }} />
      <div>
        <p style={{ fontSize: '7px', letterSpacing: '0.15em', color: '#8C8A85', textTransform: 'uppercase' }}>United Arab Emirates</p>
        <p style={{ fontSize: '8px', letterSpacing: '0.1em', color: '#C2B49A', fontWeight: 600, textTransform: 'uppercase', marginTop: '1px' }}>Passport</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: '8px', color: '#504E4B' }}>Surname / Given Names</p>
          <p style={{ fontSize: '9px', color: '#ECEAE6', fontWeight: 500, marginTop: '1px', letterSpacing: '0.04em' }}>
            {name.split(' ')[0].toUpperCase()}
          </p>
          <p style={{ fontSize: '9px', color: '#ECEAE6', letterSpacing: '0.04em' }}>
            {name.split(' ').slice(1).join(' ').toUpperCase()}
          </p>
        </div>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2A2A28', border: '1px solid #3C3C39', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '14px', color: '#C2B49A' }}>⊕</span>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #2E2E2C', paddingTop: '6px' }}>
        <p style={{ fontSize: '7px', color: '#3C3C39', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
          P&lt;UAE{name.replace(/\s/g,'').toUpperCase().padEnd(18, '<').slice(0,18)}
        </p>
      </div>
    </div>
  )
}

function EmiratesIDCard({ name }: { name: string }) {
  return (
    <div style={{ background: '#1A1A18', border: '1px solid #3C3C39', borderRadius: '8px', padding: '12px', width: '100%', aspectRatio: '1.58/1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#7EA882' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#7EA882', textTransform: 'uppercase', fontWeight: 600 }}>Emirates ID</p>
          <p style={{ fontSize: '7px', color: '#504E4B', marginTop: '1px' }}>Identity Card</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '7px', color: '#504E4B', letterSpacing: '0.06em' }}>UAE</p>
          <p style={{ fontSize: '10px', color: '#C2B49A' }}>◈</p>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '8px', color: '#504E4B' }}>Name</p>
        <p style={{ fontSize: '10px', color: '#ECEAE6', fontWeight: 500, marginTop: '2px' }}>{name}</p>
      </div>
      <div style={{ borderTop: '1px solid #2E2E2C', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '8px', color: '#504E4B', fontFamily: 'monospace', letterSpacing: '0.06em' }}>784-19••-•••••••-•</p>
        <p style={{ fontSize: '7px', color: '#504E4B' }}>Exp: 2031</p>
      </div>
    </div>
  )
}

function SPACard({ propertyName, developer }: { propertyName: string; developer: string }) {
  return (
    <div style={{ background: '#1A1A18', border: '1px solid #3C3C39', borderRadius: '8px', padding: '12px', width: '100%', aspectRatio: '1.58/1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '7px', color: '#C2B49A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Agreement</p>
          <p style={{ fontSize: '8px', color: '#ECEAE6', fontWeight: 500, marginTop: '1px' }}>Sales Purchase</p>
        </div>
        <span style={{ fontSize: '16px', color: '#3C3C39' }}>◇</span>
      </div>
      <div>
        <p style={{ fontSize: '8px', color: '#504E4B' }}>Property</p>
        <p style={{ fontSize: '9px', color: '#ECEAE6', fontWeight: 500, marginTop: '1px' }}>{propertyName}</p>
        <p style={{ fontSize: '8px', color: '#8C8A85', marginTop: '1px' }}>{developer}</p>
      </div>
      <div style={{ borderTop: '1px solid #2E2E2C', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '7px', color: '#504E4B' }}>Executed & notarised</p>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(126,168,130,.15)', border: '1px solid #7EA882', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '8px', color: '#7EA882' }}>✓</span>
        </div>
      </div>
    </div>
  )
}

function OqoodCard({ propertyName, dldTxn }: { propertyName: string; dldTxn: string }) {
  return (
    <div style={{ background: '#1A1A18', border: '1px solid #3C3C39', borderRadius: '8px', padding: '12px', width: '100%', aspectRatio: '1.58/1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '7px', color: '#C2B49A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>DLD — Oqood</p>
          <p style={{ fontSize: '8px', color: '#ECEAE6', fontWeight: 500, marginTop: '1px' }}>Title Deed</p>
        </div>
        <span style={{ fontSize: '14px', color: '#C2B49A' }}>⬡</span>
      </div>
      <div>
        <p style={{ fontSize: '8px', color: '#504E4B' }}>Property</p>
        <p style={{ fontSize: '9px', color: '#ECEAE6', fontWeight: 500, marginTop: '1px' }}>{propertyName}</p>
        <p style={{ fontSize: '7px', color: '#504E4B', fontFamily: 'monospace', marginTop: '3px', letterSpacing: '0.04em' }}>{dldTxn}</p>
      </div>
      <div style={{ borderTop: '1px solid #2E2E2C', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '7px', color: '#504E4B' }}>Dubai Land Department</p>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(126,168,130,.15)', border: '1px solid #7EA882', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '8px', color: '#7EA882' }}>✓</span>
        </div>
      </div>
    </div>
  )
}

export default function VaultPage() {
  const [connected] = useState(true)
  const [listingProp, setListingProp] = useState<typeof PROPERTIES[0] | null>(null)
  const [contract, setContract] = useState('open')
  const [expandedDocs, setExpandedDocs] = useState<string | null>(null)

  return (
    <div>
      <div style={{ paddingTop: '8px', marginBottom: '24px' }}>
        <Link href="/demo" style={{ fontSize: '12px', color: 'var(--ac)', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ‹ Home
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>Property Vault</h1>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>Your complete property record · DLD registered</p>
      </div>

      {/* UAE Pass connect hero */}
      <div style={{ background: '#181610', border: '1px solid #3A3420', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--s3)', border: '1px solid var(--b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>↑</div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>Dubai REST / UAE Pass</p>
            <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>One-tap sync of all DLD-registered properties</p>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(126,168,130,.15)', border: '1px solid #7EA882', borderRadius: '20px', padding: '4px 10px', flexShrink: 0 }}>
            <p style={{ fontSize: '10px', color: '#7EA882', fontWeight: 500 }}>Connected</p>
          </div>
        </div>

        {/* Workflow steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px solid #3A3420' }}>
          {[
            { n: '1', label: 'Open app', sub: 'You\'re taken to the Vault' },
            { n: '2', label: 'Connect via UAE Pass', sub: 'One-time authentication' },
            { n: '3', label: 'Properties auto-populate', sub: 'All DLD-registered assets sync' },
            { n: '4', label: 'Full portfolio view', sub: 'All data loaded across every section' },
          ].map(step => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--s3)', border: '1px solid #3A3420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '9px', color: 'var(--ac)', fontWeight: 600 }}>{step.n}</span>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--t1)' }}>{step.label}</p>
                <p style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '1px' }}>{step.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Properties section */}
      <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
        Your Properties — 5 Assets
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
        {PROPERTIES.map(p => {
          const roe   = calcROE(p)
          const gain  = p.currentDLD - p.purchasePrice
          const docsOpen = expandedDocs === p.id

          return (
            <div key={p.id} style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '16px', overflow: 'hidden' }}>

              {/* Property header */}
              <div style={{ padding: '18px 18px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--t1)' }}>{p.name}</p>
                      <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '20px', background: 'var(--s3)', color: 'var(--ac)', border: '1px solid var(--b2)', fontWeight: 500 }}>{p.devBadge}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--t3)' }}>{p.unit} · {p.location}</p>
                    <p style={{ fontSize: '10px', color: 'var(--t3)', fontFamily: 'monospace', marginTop: '3px' }}>{p.dldTxn}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: '#7EA882' }}>{roe.toFixed(0)}%</p>
                    <p style={{ fontSize: '9px', color: 'var(--t3)', marginTop: '1px' }}>ROE</p>
                  </div>
                </div>

                {/* Mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '14px' }}>
                  <div style={{ background: 'var(--s2)', borderRadius: '8px', padding: '8px 10px' }}>
                    <p style={{ fontSize: '8px', color: 'var(--t3)', marginBottom: '2px' }}>DLD Value</p>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#7EA882' }}>{(p.currentDLD / 1e6).toFixed(2)}M</p>
                  </div>
                  <div style={{ background: 'var(--s2)', borderRadius: '8px', padding: '8px 10px' }}>
                    <p style={{ fontSize: '8px', color: 'var(--t3)', marginBottom: '2px' }}>Gain</p>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: '#7EA882' }}>+{(gain / 1e6).toFixed(2)}M</p>
                  </div>
                  <div style={{ background: 'var(--s2)', borderRadius: '8px', padding: '8px 10px' }}>
                    <p style={{ fontSize: '8px', color: 'var(--t3)', marginBottom: '2px' }}>Paid</p>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--t1)' }}>{p.paidPct}%</p>
                  </div>
                </div>

                {/* Primary actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setListingProp(p)}
                    style={{
                      flex: 1, background: 'var(--ac)', color: '#0B0B0A',
                      border: 'none', borderRadius: '10px', padding: '12px',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      letterSpacing: '0.01em',
                    }}
                  >
                    List with Agency
                  </button>
                  <button
                    onClick={() => setExpandedDocs(docsOpen ? null : p.id)}
                    style={{
                      background: 'var(--s2)', color: 'var(--t1)',
                      border: '1px solid var(--b2)', borderRadius: '10px', padding: '12px 14px',
                      fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}
                  >
                    <span>Docs</span>
                    <span style={{ fontSize: '10px', color: 'var(--t3)', transform: docsOpen ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
                  </button>
                </div>
              </div>

              {/* Document section — expandable */}
              {docsOpen && (
                <div style={{ borderTop: '1px solid var(--b1)', padding: '18px' }}>
                  <p style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                    Uploaded Documents
                  </p>

                  {/* Passport & Emirates ID side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <PassportCard name="Ahmed Al Mansoori" />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--t1)', fontWeight: 500 }}>Passport</p>
                        <span style={{ fontSize: '9px', background: STATUS_STYLE.verified.bg, color: STATUS_STYLE.verified.color, padding: '2px 7px', borderRadius: '20px' }}>Verified</span>
                      </div>
                      <p style={{ fontSize: '9px', color: 'var(--t3)', marginTop: '1px' }}>Owner identification</p>
                    </div>
                    <div>
                      <EmiratesIDCard name="Ahmed Al Mansoori" />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--t1)', fontWeight: 500 }}>Emirates ID</p>
                        <span style={{ fontSize: '9px', background: STATUS_STYLE.verified.bg, color: STATUS_STYLE.verified.color, padding: '2px 7px', borderRadius: '20px' }}>Verified</span>
                      </div>
                      <p style={{ fontSize: '9px', color: 'var(--t3)', marginTop: '1px' }}>UAE resident ID</p>
                    </div>
                  </div>

                  {/* SPA & Oqood side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <SPACard propertyName={p.name} developer={p.developer} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--t1)', fontWeight: 500 }}>SPA</p>
                        <span style={{ fontSize: '9px', background: STATUS_STYLE.uploaded.bg, color: STATUS_STYLE.uploaded.color, padding: '2px 7px', borderRadius: '20px' }}>Uploaded</span>
                      </div>
                      <p style={{ fontSize: '9px', color: 'var(--t3)', marginTop: '1px' }}>Sales Purchase Agmt.</p>
                    </div>
                    <div>
                      <OqoodCard propertyName={p.name} dldTxn={p.dldTxn} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--t1)', fontWeight: 500 }}>Oqood</p>
                        <span style={{ fontSize: '9px', background: STATUS_STYLE.uploaded.bg, color: STATUS_STYLE.uploaded.color, padding: '2px 7px', borderRadius: '20px' }}>Uploaded</span>
                      </div>
                      <p style={{ fontSize: '9px', color: 'var(--t3)', marginTop: '1px' }}>DLD Title Deed</p>
                    </div>
                  </div>

                  {/* Upload prompt */}
                  <button style={{
                    marginTop: '12px', width: '100%',
                    background: 'var(--s2)', border: '1px dashed var(--b2)',
                    borderRadius: '10px', padding: '12px',
                    fontSize: '11px', color: 'var(--t3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    <span style={{ fontSize: '14px' }}>+</span> Upload additional documents
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* List with Agency modal — slide up sheet */}
      {listingProp && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'flex-end',
            maxWidth: '480px', left: '50%', transform: 'translateX(-50%)',
          }}
          onClick={() => setListingProp(null)}
        >
          <div
            style={{
              background: 'var(--s1)', width: '100%',
              borderRadius: '20px 20px 0 0',
              border: '1px solid var(--b2)', borderBottom: 'none',
              padding: '6px 24px 32px',
              maxHeight: '88vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', paddingTop: '10px' }}>
              <div style={{ width: '36px', height: '4px', background: 'var(--b2)', borderRadius: '2px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--t1)' }}>List with Agency</p>
                <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>{listingProp.name} · {listingProp.unit}</p>
              </div>
              <button onClick={() => setListingProp(null)} style={{ background: 'var(--s3)', border: 'none', color: 'var(--t2)', fontSize: '18px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px' }}>×</button>
            </div>

            {/* Pricing context */}
            <p style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Pricing Overview</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              {[
                { label: 'DLD Market Value',      val: fmtAED(listingProp.currentDLD),                                              color: '#7EA882' },
                { label: 'Suggested List Price',  val: fmtAED(Math.round(listingProp.currentDLD * 1.05 / 50000) * 50000),           color: 'var(--t1)' },
                { label: 'Portal Avg (Bayut/PF)', val: fmtAED(Math.round((listingProp.bayutListed + listingProp.pfListed) / 2)),     color: 'var(--t2)' },
                { label: 'Your ROE on Exit',       val: `${calcROE(listingProp).toFixed(0)}%`,                                      color: '#7EA882' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--s2)', padding: '11px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--t3)' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>

            {/* Contract type */}
            <p style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Contract Type
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {[
                { val: 'open',      label: 'Contract A — Open Listing',      sub: 'Up to 3 agencies may list simultaneously' },
                { val: 'exclusive', label: 'Contract A — Exclusive Listing',  sub: 'One agency exclusively · higher commitment' },
                { val: 'form-b',    label: 'Contract B — Buyer\'s Agency',    sub: 'Buyer representation agreement' },
                { val: 'form-f',    label: 'Form F — MOU Agreement',         sub: 'Memorandum of Understanding with buyer' },
              ].map(opt => (
                <label key={opt.val} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                  background: contract === opt.val ? '#181610' : 'var(--s2)',
                  border: `1px solid ${contract === opt.val ? '#3A3420' : 'var(--b1)'}`,
                }}>
                  <input type="radio" name="contract" value={opt.val}
                    checked={contract === opt.val}
                    onChange={() => setContract(opt.val)}
                    style={{ accentColor: 'var(--ac)', marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--t1)' }}>{opt.label}</p>
                    <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Who lists note */}
            <div style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: 'var(--t2)', lineHeight: 1.6 }}>
                Under RERA regulations, a maximum of <span style={{ color: 'var(--t1)', fontWeight: 500 }}>3 agencies</span> may hold an open listing on the same unit. Exclusive listings grant sole rights to <span style={{ color: 'var(--t1)', fontWeight: 500 }}>1 agency</span>. All contracts are registered via the Dubai Brokers app.
              </p>
            </div>

            <button style={{
              width: '100%', background: 'var(--ac)', color: '#0B0B0A',
              border: 'none', borderRadius: '14px', padding: '16px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.01em',
            }}>
              Generate Contract &amp; Notify Agency
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
