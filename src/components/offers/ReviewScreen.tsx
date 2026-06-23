'use client'

import { useState } from 'react'
import { ChevronLeft, Loader2, CheckCircle, AlertTriangle, User, Building2, FileText, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatAED, formatSqft, computeDLDCosts, cn } from '@/lib/utils'
import { TEMPLATE_OPTIONS } from '@/types'
import type { OfferFormData, Agent, Client } from '@/types'
import ImageUploader from './ImageUploader'
import AIInsightsPanel from '@/components/ai/AIInsightsPanel'

interface ReviewScreenProps {
  formData:       OfferFormData
  agent:          Agent
  onBack:         () => void
  onGenerate:     () => Promise<void>
  generating:     boolean
  onImagesUpdate:   (imgs: Record<string, string>) => void
  onNarrativeSet?:  (text: string) => void
  onCompsSet?:      (comps: any[]) => void
  marketData?:      any[]
  availableComps?:  any[]
}

export default function ReviewScreen({
  formData, agent, onBack, onGenerate, generating, onImagesUpdate,
  onNarrativeSet, onCompsSet, marketData = [], availableComps = []
}: ReviewScreenProps) {
  const supabase = createClient()
  const [clientName, setClientName] = useState(formData.client_name || '')
  const [clientSearch, setClientSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState(formData.client_id || '')
  const [notes, setNotes] = useState(formData.notes || '')

  const [confirmed, setConfirmed] = useState(false)

  const template = TEMPLATE_OPTIONS.find(t => t.id === formData.template)
  const price    = parseFloat((formData.asking_price_aed || '0').replace(/,/g, '')) || 0
  const isResale = formData.market_type === 'resale'

  const costs = computeDLDCosts(
    price,
    formData.market_type || 'off_plan',
    isResale ? 0 : (formData.dld_waiver_pct || 0),
    formData.agency_commission_pct || 2,
    formData.completion_date || null,
    formData.misc_fees_applicable || false,
    parseFloat(formData.misc_fees_aed || '5000'),
    parseFloat(formData.noc_fee_aed || '5250'),
  )

  async function searchClients(q: string) {
    setClientSearch(q)
    if (q.length < 2) { setClients([]); return }
    const { data } = await supabase
      .from('clients')
      .select('*')
      .ilike('full_name', `%${q}%`)
      .limit(5)
    setClients(data || [])
  }

  const dataErrors: string[] = []
  if (!formData.developer_id)    dataErrors.push('Developer not selected')
  if (!formData.community_id)    dataErrors.push('Community not selected')
  if (!formData.project_id)      dataErrors.push('Project not selected')
  if (!formData.unit_reference)  dataErrors.push('Unit reference missing')
  if (!formData.bua_sqft)        dataErrors.push('BUA not entered')
  if (!formData.asking_price_aed) dataErrors.push('Price not entered')
  if (!formData.template)        dataErrors.push('Template not selected')

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-base font-medium text-dark-800 mb-1">Review your offer</h2>
        <p className="text-sm text-dark-400">
          Verify all details before generating the PDF. Once generated, this offer is saved permanently.
        </p>
      </div>

      {/* Validation errors */}
      {dataErrors.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Missing required information</p>
              <ul className="text-xs text-red-600 space-y-0.5">
                {dataErrors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Property summary */}
      <div className="card divide-y divide-dark-100 overflow-hidden">
        <SectionHeader icon={<Building2 className="w-4 h-4" />} label="Property" />
        <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
          <ReviewRow label="Developer"     value={formData.developer_name_snapshot || '—'} />
          <ReviewRow label="Community"     value={formData.community_name_snapshot || '—'} />
          <ReviewRow label="Project"       value={formData.project_name_snapshot || '—'} />
          <ReviewRow label="Unit ref"      value={formData.unit_reference || '—'} highlight />
          <ReviewRow label="Type"          value={formData.unit_type_label || '—'} />
          <ReviewRow label="Bedrooms"      value={formData.bedrooms?.toString() || '—'} />
          <ReviewRow label="BUA"           value={formatSqft(parseFloat(formData.bua_sqft || '0'))} highlight />
          {formData.plot_sqft && (
            <ReviewRow label="Plot area" value={formatSqft(parseFloat(formData.plot_sqft))} />
          )}
          {formData.view_description && (
            <ReviewRow label="View" value={formData.view_description} />
          )}
          {formData.completion_date_label && (
            <ReviewRow label="Completion" value={formData.completion_date_label} />
          )}
        </div>

        <SectionHeader icon={<DollarSign className="w-4 h-4" />} label="Pricing" />
        <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
          <ReviewRow label="Asking price"   value={formatAED(price)} highlight />
          <ReviewRow label="Price per sq.ft" value={price && parseFloat(formData.bua_sqft || '1') > 0
            ? formatAED(price / parseFloat(formData.bua_sqft), 0) + ' psf'
            : '—'} />
          <ReviewRow label="DLD fee (buyer)" value={formatAED(costs.dldBuyer)} />
          {costs.dldDeveloper > 0 && (
            <ReviewRow label="DLD waiver saving" value={formatAED(costs.dldDeveloper)} accent />
          )}
          {isResale && (
            <ReviewRow label={`Agency (${formData.agency_commission_pct}%)`} value={formatAED(costs.agencyAed)} />
          )}
          {!isResale && (
            <ReviewRow label="Agency" value="Paid by developer" muted />
          )}
          <ReviewRow label="Total cost to buyer" value={`${formatAED(costs.total)} (${costs.totalPct}%)`} highlight />
        </div>

        <SectionHeader icon={<FileText className="w-4 h-4" />} label="Template" />
        <div className="p-4">
          {template ? (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-10 rounded flex items-center justify-center text-xs font-medium"
                style={{ background: template.preview_color, color: template.preview_color === '#FAFAF8' ? '#1C1C1A' : '#fff' }}
              >
                {template.pages}p
              </div>
              <div>
                <p className="text-sm font-medium text-dark-800">{template.name}</p>
                <p className="text-xs text-dark-400">{template.best_for}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-dark-400">No template selected</p>
          )}
        </div>
      </div>

      {/* AI analysis */}
      <AIInsightsPanel
        property={formData}
        marketData={marketData}
        availableComps={availableComps}
        onNarrativeSet={onNarrativeSet}
        onCompsSet={onCompsSet}
      />

      {/* Property images */}
      <div className="card p-5">
        <ImageUploader
          onImagesChange={(imgs) => {
            onImagesUpdate(imgs)
          }}
        />
      </div>

      {/* Client (optional) */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-dark-400" />
          <p className="text-sm font-medium text-dark-700">Client (optional)</p>
        </div>

        <div className="relative form-group">
          <label className="form-label">Search existing clients</label>
          <input
            value={clientSearch}
            onChange={e => searchClients(e.target.value)}
            placeholder="Type client name..."
          />
          {clients.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-dark-200 rounded-lg shadow-card overflow-hidden">
              {clients.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedClientId(c.id)
                    setClientName(c.full_name)
                    setClientSearch(c.full_name)
                    setClients([])
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-dark-50 text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-dark-100 flex items-center justify-center text-xs font-medium text-dark-500">
                    {c.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-dark-800">{c.full_name}</p>
                    <p className="text-xs text-dark-400">{c.phone || c.email || ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Or enter client name</label>
          <input
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="e.g. Mohammed Al Rashid"
          />
          <p className="form-hint">Shown on agent's copy only — not on the client PDF</p>
        </div>

        <div className="form-group">
          <label className="form-label">Internal notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Any notes about this offer..."
          />
        </div>
      </div>

      {/* RERA confirmation checkbox */}
      <div
        onClick={() => setConfirmed(!confirmed)}
        className={cn(
          'flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors duration-150',
          confirmed ? 'border-green-400 bg-green-50' : 'border-dark-200 bg-white hover:border-dark-300'
        )}
      >
        <div className={cn(
          'w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border-2 transition-colors',
          confirmed ? 'border-green-500 bg-green-500' : 'border-dark-300'
        )}>
          {confirmed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </div>
        <div>
          <p className="text-sm font-medium text-dark-700">I confirm the data above is accurate</p>
          <p className="text-xs text-dark-400 mt-0.5">
            As a RERA certified agent, I confirm that all property details, prices, and unit references
            match the official developer documentation. I take responsibility for the accuracy of this offer.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-secondary" disabled={generating}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => {
            formData.client_id   = selectedClientId
            formData.client_name = clientName
            formData.notes       = notes
            onGenerate()
          }}
          disabled={!confirmed || dataErrors.length > 0 || generating}
          className="btn-primary flex-1 btn-lg"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
          ) : (
            'Generate PDF offer'
          )}
        </button>
      </div>
    </div>
  )
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-dark-50">
      <span className="text-dark-400">{icon}</span>
      <span className="text-xs font-medium text-dark-600 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function ReviewRow({
  label, value, highlight, accent, muted
}: {
  label: string; value: string; highlight?: boolean; accent?: boolean; muted?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-dark-400">{label}</p>
      <p className={cn(
        'text-sm mt-0.5',
        highlight ? 'font-medium text-dark-800' :
        accent    ? 'font-medium text-gold-600' :
        muted     ? 'text-dark-400 italic' :
        'text-dark-700'
      )}>
        {value}
      </p>
    </div>
  )
}
