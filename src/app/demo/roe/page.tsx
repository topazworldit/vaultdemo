'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PROPERTIES, calcROE, calcROI, fmtAED } from '@/lib/demo-data'

export default function ROEPage() {
  const [selected, setSelected] = useState(0)
  const p = PROPERTIES[selected]
  const roe = calcROE(p)
  const roi = calcROI(p)
  const gain = p.currentDLD - p.purchasePrice
  const invested = p.purchasePrice * (p.paidPct / 100)
  const leverage = roe / roi

  return (
    <div>
      <div style={{ paddingTop: '8px', marginBottom: '24px' }}>
        <Link href="/demo/more" style={{ fontSize: '12px', color: 'var(--ac)', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ‹ More
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>Return on Equity</h1>
        <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>Off-plan leverage analysis</p>
      </div>

      {/* Explainer */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.6 }}>
          Off-plan payment plans mean only a fraction of the asset is deployed upfront. ROE measures return on <em>actual cash committed</em>, not the full purchase price — producing a much higher figure than traditional ROI.
        </p>
      </div>

      {/* Property selector */}
      <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
        Select Property
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
        {PROPERTIES.map((prop, i) => (
          <button key={prop.id} onClick={() => setSelected(i)} style={{
            textAlign: 'left', cursor: 'pointer',
            background: selected === i ? '#181610' : 'var(--s1)',
            border: `1px solid ${selected === i ? '#3A3420' : 'var(--b1)'}`,
            borderRadius: '12px', padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)' }}>{prop.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{prop.location} · {prop.paidPct}% paid</p>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: selected === i ? '#7EA882' : 'var(--t3)' }}>
              {calcROE(prop).toFixed(0)}%
            </p>
          </button>
        ))}
      </div>

      {/* ROE hero */}
      <div style={{ background: '#181610', border: '1px solid #3A3420', borderRadius: '14px', padding: '24px', marginBottom: '10px' }}>
        <p style={{ fontSize: '10px', color: 'var(--ac-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Return on Equity — {p.name}
        </p>
        <p style={{ fontSize: '52px', fontWeight: 600, color: '#7EA882', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {roe.toFixed(0)}%
        </p>
        <div style={{ marginTop: '14px', height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(roe, 100)}%`, background: '#7EA882' }} />
        </div>
      </div>

      {/* ROI comparison */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Return on Investment (comparison)
        </p>
        <p style={{ fontSize: '36px', fontWeight: 600, color: 'var(--t2)', lineHeight: 1 }}>{roi.toFixed(0)}%</p>
        <div style={{ marginTop: '14px', height: '4px', background: 'var(--s3)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(roi, 100)}%`, background: 'var(--t3)' }} />
        </div>
      </div>

      {/* Leverage callout */}
      <div style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6 }}>
          Paying only <span style={{ color: 'var(--t1)', fontWeight: 500 }}>{p.paidPct}%</span> of the purchase price gives you{' '}
          <span style={{ color: '#7EA882', fontWeight: 600 }}>{leverage.toFixed(1)}× leverage</span> — your equity return is{' '}
          {leverage.toFixed(1)}× higher than a fully-paid investor in the same property.
        </p>
      </div>

      {/* Breakdown table */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '20px', marginBottom: '8px' }}>
        <p style={{ fontSize: '11px', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          Calculation Breakdown
        </p>
        {[
          { label: 'Purchase Price',         val: fmtAED(p.purchasePrice),  color: 'var(--t1)' },
          { label: `Paid (${p.paidPct}%)`,   val: fmtAED(invested),         color: 'var(--t1)' },
          { label: 'Outstanding Balance',    val: fmtAED(p.purchasePrice - invested), color: 'var(--t2)' },
          { label: 'DLD Market Value',       val: fmtAED(p.currentDLD),     color: 'var(--pos)' },
          { label: 'Unrealised Gain',        val: `+${fmtAED(gain)}`,       color: 'var(--pos)' },
          { label: 'ROE (gain ÷ paid)',      val: `${roe.toFixed(1)}%`,      color: '#7EA882' },
          { label: 'ROI (gain ÷ purchase)',  val: `${roi.toFixed(1)}%`,      color: 'var(--t2)' },
          { label: 'Leverage multiple',      val: `${leverage.toFixed(2)}×`, color: '#7EA882' },
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
    </div>
  )
}
