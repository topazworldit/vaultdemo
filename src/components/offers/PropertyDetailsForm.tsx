'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type {
  Developer, Community, Project, UnitType,
  PaymentPlanTemplate, ExtractedPropertyData,
  ExtractionConfidence
} from '@/types'

const schema = z.object({
  market_type:          z.enum(['off_plan', 'ready', 'resale']),
  developer_id:         z.string().min(1, 'Select a developer'),
  community_id:         z.string().min(1, 'Select a community'),
  project_id:           z.string().min(1, 'Select a project'),
  unit_reference:       z.string().min(1, 'Unit reference is required'),
  unit_type_label:      z.string().optional(),
  bedrooms:             z.coerce.number().int().min(0).optional(),
  bathrooms:            z.coerce.number().min(0).optional(),
  bua_sqft:             z.string().min(1, 'BUA is required'),
  plot_sqft:            z.string().optional(),
  floor_number:         z.string().optional(),
  view_description:     z.string().optional(),
  asking_price_aed:     z.string().min(1, 'Price is required'),
  completion_date_label:z.string().optional(),
  completion_date:      z.string().optional(),
  payment_plan_template_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface PropertyDetailsFormProps {
  initialData:  Partial<FormValues & { developer_name?: string; community_name?: string; project_name?: string }>
  extracted:    ExtractedPropertyData | null
  developers:   Developer[]
  communities:  Community[]
  onBack:       () => void
  onNext:       (data: FormValues & { payment_plan_name?: string; project_name_snapshot?: string; developer_name_snapshot?: string; community_name_snapshot?: string }) => void
}

export default function PropertyDetailsForm({
  initialData, extracted, developers, communities, onBack, onNext
}: PropertyDetailsFormProps) {
  const supabase = createClient()

  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null)
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(communities)
  const [projects, setProjects] = useState<Project[]>([])
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([])
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlanTemplate[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      market_type:           'off_plan',
      developer_id:          '',
      community_id:          '',
      project_id:            '',
      unit_reference:        initialData.unit_reference || '',
      unit_type_label:       initialData.unit_type_label || '',
      bedrooms:              initialData.bedrooms,
      bathrooms:             initialData.bathrooms,
      bua_sqft:              initialData.bua_sqft || '',
      plot_sqft:             initialData.plot_sqft || '',
      floor_number:          initialData.floor_number || '',
      view_description:      initialData.view_description || '',
      asking_price_aed:      initialData.asking_price_aed || '',
      completion_date_label: initialData.completion_date_label || '',
      completion_date:       initialData.completion_date || '',
    },
  })

  const watchedDeveloperId  = watch('developer_id')
  const watchedCommunityId  = watch('community_id')
  const watchedProjectId    = watch('project_id')
  const watchedMarketType   = watch('market_type')

  // When developer changes — filter communities and load projects
  useEffect(() => {
    if (!watchedDeveloperId) {
      setFilteredCommunities(communities)
      setProjects([])
      return
    }
    const dev = developers.find(d => d.id === watchedDeveloperId) || null
    setSelectedDeveloper(dev)
    setValue('community_id', '')
    setValue('project_id', '')
    setProjects([])
    setUnitTypes([])
    setPaymentPlans([])
  }, [watchedDeveloperId])

  // When community changes — load projects
  useEffect(() => {
    if (!watchedCommunityId || !watchedDeveloperId) return
    setValue('project_id', '')
    setUnitTypes([])
    setPaymentPlans([])
    loadProjects(watchedDeveloperId, watchedCommunityId)
  }, [watchedCommunityId])

  // When project changes — load unit types and payment plans
  useEffect(() => {
    if (!watchedProjectId) return
    loadProjectDetails(watchedProjectId)
  }, [watchedProjectId])

  async function loadProjects(developerId: string, communityId: string) {
    setLoadingProjects(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('developer_id', developerId)
      .eq('community_id', communityId)
      .eq('active', true)
      .order('name')
    setProjects(data || [])
    setLoadingProjects(false)
  }

  async function loadProjectDetails(projectId: string) {
    const [unitTypesRes, plansRes] = await Promise.all([
      supabase.from('unit_types').select('*').eq('project_id', projectId).eq('active', true),
      supabase.from('payment_plan_templates')
        .select('*, instalments:payment_plan_instalments(*)')
        .eq('project_id', projectId)
        .order('is_default', { ascending: false }),
    ])
    setUnitTypes(unitTypesRes.data || [])
    setPaymentPlans(plansRes.data || [])

    // Auto-select default payment plan
    const defaultPlan = plansRes.data?.find(p => p.is_default)
    if (defaultPlan) setValue('payment_plan_template_id', defaultPlan.id)

    // Pre-fill completion date from project
    const { data: project } = await supabase
      .from('projects')
      .select('completion_date, completion_date_label')
      .eq('id', projectId)
      .single()
    if (project?.completion_date_label && !watch('completion_date_label')) {
      setValue('completion_date_label', project.completion_date_label)
    }
    if (project?.completion_date && !watch('completion_date')) {
      setValue('completion_date', project.completion_date)
    }
  }

  function onSubmit(data: FormValues) {
    const dev  = developers.find(d => d.id === data.developer_id)
    const comm = communities.find(c => c.id === data.community_id)
    const proj = projects.find(p => p.id === data.project_id)
    const plan = paymentPlans.find(p => p.id === data.payment_plan_template_id)

    onNext({
      ...data,
      developer_name_snapshot: dev?.name || '',
      community_name_snapshot: comm?.name || '',
      project_name_snapshot:   proj?.name || '',
      payment_plan_name:       plan?.plan_name || '',
    })
  }

  function confidenceBadge(field: string) {
    if (!extracted) return null
    const conf: ExtractionConfidence = extracted.confidence[field]
    if (!conf || conf === 'manual') return null
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs ml-2 rounded px-1.5 py-0.5',
        conf === 'high'   ? 'bg-green-50 text-green-600' :
        conf === 'medium' ? 'bg-amber-50 text-amber-600' :
                            'bg-red-50 text-red-600'
      )}>
        {conf === 'high' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
        {conf}
      </span>
    )
  }

  // Market type tabs
  const MARKET_TYPES = [
    { value: 'off_plan', label: 'Off-plan' },
    { value: 'ready',    label: 'Ready' },
    { value: 'resale',   label: 'Resale' },
  ] as const

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-slide-up">

      {/* ── RERA compliance notice ── */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
        <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>RERA compliance:</strong> All property names, unit references, and prices must
          match the official developer documents exactly. No abbreviations or rounding.
        </p>
      </div>

      {/* ── Market type ── */}
      <div>
        <label className="form-label">Transaction type</label>
        <div className="flex gap-2 mt-1">
          {MARKET_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setValue('market_type', t.value)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors duration-150',
                watchedMarketType === t.value
                  ? 'bg-dark-800 text-white border-dark-800'
                  : 'bg-white text-dark-600 border-dark-200 hover:border-dark-300'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Developer → Community → Project cascade ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-dark-700 border-b border-dark-100 pb-2">
          Project identification
        </h3>

        {/* Developer */}
        <div className="form-group">
          <label className="form-label">Developer</label>
          <select {...register('developer_id')}>
            <option value="">Select developer...</option>
            {developers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.developer_id && <p className="form-error">{errors.developer_id.message}</p>}
        </div>

        {/* Community */}
        <div className="form-group">
          <label className="form-label">Community</label>
          <select {...register('community_id')} disabled={!watchedDeveloperId}>
            <option value="">Select community...</option>
            {communities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.community_id && <p className="form-error">{errors.community_id.message}</p>}
        </div>

        {/* Project */}
        <div className="form-group">
          <label className="form-label">Project</label>
          <select {...register('project_id')} disabled={!watchedCommunityId || loadingProjects}>
            <option value="">
              {loadingProjects ? 'Loading...' : 'Select project...'}
            </option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.project_id && <p className="form-error">{errors.project_id.message}</p>}
          {watchedCommunityId && !loadingProjects && projects.length === 0 && (
            <p className="form-hint text-amber-600">
              No projects found. Check developer + community selection or contact admin to add the project.
            </p>
          )}
        </div>
      </div>

      {/* ── Unit details ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-dark-700 border-b border-dark-100 pb-2">
          Unit details
        </h3>

        {/* Unit reference — RERA critical */}
        <div className="form-group">
          <label className="form-label">
            Unit reference {confidenceBadge('unit_reference')}
          </label>
          <input
            {...register('unit_reference')}
            placeholder="e.g. DE Park Gate 2-V-1"
            className={cn(errors.unit_reference && 'border-red-400 focus:ring-red-400')}
          />
          <p className="form-hint">
            Copy exactly from the developer SPA or sales offer. No abbreviations.
          </p>
          {errors.unit_reference && <p className="form-error">{errors.unit_reference.message}</p>}
        </div>

        {/* Unit type */}
        <div className="form-group">
          <label className="form-label">
            Unit type {confidenceBadge('unit_type_label')}
          </label>
          {unitTypes.length > 0 ? (
            <select {...register('unit_type_label')}>
              <option value="">Select unit type...</option>
              {unitTypes.map(u => (
                <option key={u.id} value={u.type_label}>{u.type_label}</option>
              ))}
            </select>
          ) : (
            <input
              {...register('unit_type_label')}
              placeholder="e.g. 4-Bedroom Villa, Type 4B"
            />
          )}
        </div>

        {/* Bedrooms + Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Bedrooms</label>
            <select {...register('bedrooms', { valueAsNumber: true })}>
              <option value="">Select...</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n === 0 ? 'Studio' : `${n} BR`}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bathrooms</label>
            <select {...register('bathrooms', { valueAsNumber: true })}>
              <option value="">Select...</option>
              {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* BUA — critical — never round */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">
              BUA (sq.ft) {confidenceBadge('bua_sqft')}
            </label>
            <input
              {...register('bua_sqft')}
              placeholder="e.g. 5146.35"
              className={cn(errors.bua_sqft && 'border-red-400 focus:ring-red-400')}
            />
            <p className="form-hint">Enter exact figure — do not round</p>
            {errors.bua_sqft && <p className="form-error">{errors.bua_sqft.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Plot area (sq.ft)</label>
            <input
              {...register('plot_sqft')}
              placeholder="e.g. 5119.00 (villas only)"
            />
          </div>
        </div>

        {/* Floor + View */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Floor number</label>
            <input
              {...register('floor_number')}
              placeholder="e.g. 12 (apartments)"
            />
          </div>
          <div className="form-group">
            <label className="form-label">View</label>
            <input
              {...register('view_description')}
              placeholder="e.g. Golf course and park view"
            />
          </div>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-dark-700 border-b border-dark-100 pb-2">
          Pricing
        </h3>

        <div className="form-group">
          <label className="form-label">
            Asking price (AED) {confidenceBadge('asking_price_aed')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-dark-400 font-medium">
              AED
            </span>
            <input
              {...register('asking_price_aed')}
              placeholder="14,574,888"
              className={cn('pl-12', errors.asking_price_aed && 'border-red-400 focus:ring-red-400')}
            />
          </div>
          <p className="form-hint">Enter exact price from SPA or sales offer</p>
          {errors.asking_price_aed && <p className="form-error">{errors.asking_price_aed.message}</p>}
        </div>

        {/* Completion date */}
        {watchedMarketType !== 'resale' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                Completion (label) {confidenceBadge('completion_date_label')}
              </label>
              <input
                {...register('completion_date_label')}
                placeholder="e.g. 28 February 2027"
              />
              <p className="form-hint">Shown verbatim on PDF</p>
            </div>
            <div className="form-group">
              <label className="form-label">Completion date</label>
              <input type="date" {...register('completion_date')} />
            </div>
          </div>
        )}
      </div>

      {/* ── Payment plan (off-plan only) ── */}
      {watchedMarketType === 'off_plan' && paymentPlans.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-dark-700 border-b border-dark-100 pb-2">
            Payment plan
          </h3>
          <div className="form-group">
            <label className="form-label">Select payment plan</label>
            <select {...register('payment_plan_template_id')}>
              <option value="">No payment plan</option>
              {paymentPlans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.plan_name} ({p.total_instalments} instalments)
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Mortgage info (read-only, derived from developer) ── */}
      {selectedDeveloper && (
        <div className="rounded-xl bg-dark-50 border border-dark-100 px-4 py-3">
          <p className="text-xs font-medium text-dark-500 mb-1">Mortgage eligibility</p>
          <p className="text-xs text-dark-600 leading-relaxed">
            {getMortgageLabel(selectedDeveloper.mortgage_rule)}
          </p>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button type="submit" className="btn-primary flex-1">
          Continue to costs <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

function getMortgageLabel(rule: string): string {
  const labels: Record<string, string> = {
    emaar: 'Mortgage available at 50% construction completion. Banks: Emirates NBD, ADCB, Mashreq, Dubai Islamic Bank.',
    dubai_holdings: 'Mortgage available at 50% payment (irrespective of construction). Bank: Emirates NBD (exclusive — April 2026).',
    standard_uae: 'Mortgage available at 50% paid OR 40% construction completion. All major UAE banks.',
    freehold_only: 'Cash only — mortgage financing not available for this project.',
    tbc: 'Mortgage eligibility to be confirmed — contact the developer directly.',
  }
  return labels[rule] || 'Mortgage eligibility subject to developer and bank approval.'
}
