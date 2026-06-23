'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Tag, Info } from 'lucide-react'
import { cn, formatAED, computeDLDCosts, AGENCY_COMMISSION_OPTIONS } from '@/lib/utils'
import type { DLDWaiverType, MarketType } from '@/types'

interface CostBreakdownFormProps {
  formData: Record<string, any>
  onBack:   () => void
  onNext:   (data: Record<string, any>) => void
}

export default function CostBreakdownForm({ formData, onBack, onNext }: CostBreakdownFormProps) {
  const marketType: MarketType = formData.market_type || 'off_plan'
  const isResale   = marketType === 'resale'
  const isPrimary  = !isResale
  const price      = parseFloat((formData.asking_price_aed || '0').replace(/,/g, '')) || 0

  // Primary market state
  const [dldWaiverType, setDldWaiverType] = useState<DLDWaiverType>('none')
  const [dldWaiverLabel, setDldWaiverLabel] = useState('')
  const [dldWaiverValidUntil, setDldWaiverValidUntil] = useState('')

  // Resale state
  const [agencyCommissionPct, setAgencyCommissionPct] = useState(2.00)
  const [miscFeesApplicable, setMiscFeesApplicable] = useState(false)
  const [miscFeesAed, setMiscFeesAed] = useState('5000')
  const [nocFeeAed, setNocFeeAed] = useState('5250')

  // Compute derived values
  const dldWaiverPct =
    dldWaiverType === 'full_4pct' ? 4.0 :
    dldWaiverType === 'half_2pct' ? 2.0 : 0.0

  const isOffplanResale = isResale && formData.completion_date
    ? new Date(formData.completion_date) > new Date()
    : false

  const costs = computeDLDCosts(
    price,
    marketType,
    isPrimary ? dldWaiverPct : 0,
    agencyCommissionPct,
    formData.completion_date || null,
    miscFeesApplicable,
    parseFloat(miscFeesAed) || 5000,
    parseFloat(nocFeeAed) || 5250,
  )

  function handleNext() {
    onNext({
      dld_waiver_type:          isPrimary ? dldWaiverType : 'none',
      dld_waiver_pct:           isPrimary ? dldWaiverPct : 0,
      dld_waiver_label:         isPrimary && dldWaiverType !== 'none' ? dldWaiverLabel : null,
      dld_waiver_valid_until:   isPrimary && dldWaiverType !== 'none' ? dldWaiverValidUntil : null,
      agency_commission_pct:    isResale ? agencyCommissionPct : 0,
      misc_fees_applicable:     isResale ? miscFeesApplicable : false,
      misc_fees_aed:            miscFeesAed,
      noc_fee_aed:              nocFeeAed,
    })
  }

  const WAIVER_OPTIONS: { value: DLDWaiverType; label: string; saving: number; badge: string }[] = [
    { value: 'none',       label: 'No waiver — buyer pays full 4%',      saving: 0,                badge: '' },
    { value: 'half_2pct',  label: '2% waiver — developer pays 2%',       saving: costs.dldGross / 2, badge: 'badge-amber' },
    { value: 'full_4pct',  label: '4% waiver — developer pays full DLD', saving: costs.dldGross,   badge: 'badge-gold' },
  ]

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-base font-medium text-dark-800 mb-1">Cost breakdown</h2>
        <p className="text-sm text-dark-400">
          {isPrimary
            ? 'Configure DLD fees for this off-plan / primary market offer.'
            : 'Configure fees for this resale transaction.'}
        </p>
      </div>

      {/* ── PRIMARY MARKET ── */}
      {isPrimary && (
        <div className="space-y-5">

          {/* DLD waiver selector */}
          <div>
            <label className="form-label">DLD fee waiver</label>
            <div className="space-y-2 mt-1">
              {WAIVER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDldWaiverType(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors duration-150',
                    dldWaiverType === opt.value
                      ? 'border-gold-400 bg-gold-50'
                      : 'border-dark-200 bg-white hover:border-dark-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      dldWaiverType === opt.value
                        ? 'border-gold-500'
                        : 'border-dark-300'
                    )}>
                      {dldWaiverType === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-gold-500" />
                      )}
                    </div>
                    <span className="text-sm text-dark-700">{opt.label}</span>
                  </div>
                  {opt.saving > 0 && price > 0 && (
                    <span className={cn('badge text-xs', opt.badge)}>
                      Save {formatAED(opt.saving)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Waiver details (if waiver selected) */}
          {dldWaiverType !== 'none' && (
            <div className="rounded-xl border border-gold-200 bg-gold-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-600" />
                <p className="text-sm font-medium text-gold-800">Waiver promotion details</p>
              </div>
              <div className="form-group">
                <label className="form-label">Promotion label (shown on PDF)</label>
                <input
                  value={dldWaiverLabel}
                  onChange={e => setDldWaiverLabel(e.target.value)}
                  placeholder={dldWaiverType === 'full_4pct'
                    ? '4% DLD Fee Waiver Included'
                    : '2% DLD Fee Waiver Included'}
                />
                <p className="form-hint">Leave blank to use default label</p>
              </div>
              <div className="form-group">
                <label className="form-label">Promotion valid until (optional)</label>
                <input
                  type="date"
                  value={dldWaiverValidUntil}
                  onChange={e => setDldWaiverValidUntil(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RESALE ── */}
      {isResale && (
        <div className="space-y-5">

          {/* Agency commission */}
          <div className="form-group">
            <label className="form-label">Agency commission</label>
            <select
              value={agencyCommissionPct}
              onChange={e => setAgencyCommissionPct(parseFloat(e.target.value))}
            >
              {AGENCY_COMMISSION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="form-hint">
              Shown on the client PDF. Discuss any further discount verbally.
            </p>
          </div>

          {/* NOC fee (off-plan resale only) */}
          {isOffplanResale && (
            <div className="form-group">
              <label className="form-label">NOC fee (AED)</label>
              <input
                type="number"
                value={nocFeeAed}
                onChange={e => setNocFeeAed(e.target.value)}
                placeholder="5250"
              />
              <p className="form-hint">
                Required for off-plan resale — issued by the original developer.
                Default AED 5,250. Verify with developer.
              </p>
            </div>
          )}

          {/* Miscellaneous fees toggle */}
          <div className="flex items-center justify-between rounded-xl border border-dark-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-dark-700">Include miscellaneous admin fees</p>
              <p className="text-xs text-dark-400">Trustee admin processing, conveyancing, document clearance</p>
            </div>
            <button
              type="button"
              onClick={() => setMiscFeesApplicable(!miscFeesApplicable)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-200',
                miscFeesApplicable ? 'bg-gold-500' : 'bg-dark-200'
              )}
            >
              <span className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                miscFeesApplicable ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>

          {miscFeesApplicable && (
            <div className="form-group">
              <label className="form-label">Miscellaneous fees (AED)</label>
              <input
                type="number"
                value={miscFeesAed}
                onChange={e => setMiscFeesAed(e.target.value)}
                placeholder="5000"
              />
            </div>
          )}

          {/* DLD notice */}
          <div className="flex items-start gap-3 rounded-xl bg-dark-50 border border-dark-100 px-4 py-3">
            <Info className="w-4 h-4 text-dark-400 mt-0.5 shrink-0" />
            <p className="text-xs text-dark-500">
              DLD fee (4%) on resale transactions is always paid by the buyer and cannot be waived —
              this is a transaction between two individuals, not a developer promotion.
            </p>
          </div>
        </div>
      )}

      {/* ── Cost summary ── */}
      {price > 0 && (
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-medium text-dark-700">Cost summary</h3>
          <div className="space-y-2 text-sm">
            <CostRow label="Property price"     value={formatAED(price)}                    bold />
            <CostRow label="DLD fee (4% gross)"  value={formatAED(costs.dldGross)}            />
            {costs.dldDeveloper > 0 && (
              <CostRow label="Developer pays (waiver)" value={`− ${formatAED(costs.dldDeveloper)}`} accent />
            )}
            <CostRow label="Buyer pays DLD"      value={formatAED(costs.dldBuyer)}            />
            {isResale && (
              <CostRow label={`Agency (${agencyCommissionPct}%)`} value={formatAED(costs.agencyAed)} />
            )}
            {!isResale && (
              <CostRow label="Agency commission"  value="Paid by developer (not shown to client)" muted />
            )}
            {costs.trusteeAed > 0 && (
              <CostRow label="Trustee office fee" value={formatAED(costs.trusteeAed)}          />
            )}
            {costs.titleDeedAed > 0 && (
              <CostRow label="Title deed + admin" value={formatAED(costs.titleDeedAed)}        />
            )}
            {costs.nocAed > 0 && (
              <CostRow label="NOC fee"            value={formatAED(costs.nocAed)}               />
            )}
            {costs.miscAed > 0 && (
              <CostRow label="Miscellaneous"      value={formatAED(costs.miscAed)}              />
            )}
            <div className="border-t border-dark-100 pt-2 mt-2">
              <CostRow
                label={`Total acquisition cost (${costs.totalPct}%)`}
                value={formatAED(costs.total)}
                bold accent
              />
            </div>
            {costs.dldDeveloper > 0 && (
              <div className="rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 mt-2">
                <p className="text-xs font-medium text-gold-700">
                  Client saving: {formatAED(costs.dldDeveloper)} — will appear as gold callout on PDF
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={price === 0}
          className="btn-primary flex-1"
        >
          Continue to template <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function CostRow({
  label, value, bold, accent, muted
}: {
  label: string; value: string; bold?: boolean; accent?: boolean; muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(
        'text-sm',
        muted ? 'text-dark-400' : 'text-dark-600'
      )}>
        {label}
      </span>
      <span className={cn(
        'text-sm',
        bold   ? 'font-medium text-dark-800' : 'text-dark-700',
        accent ? 'text-gold-600 font-medium' : '',
        muted  ? 'text-dark-400 italic text-xs' : '',
      )}>
        {value}
      </span>
    </div>
  )
}
