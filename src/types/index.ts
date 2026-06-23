// ============================================================
// TOPAZBUILDER — Core Type Definitions
// Single source of truth for all types across the app.
// Mirrors the Supabase schema exactly.
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type AgentRole = 'agent' | 'senior_agent' | 'admin' | 'super_admin'

export type DeveloperTier =
  | 'tier_1_gov'
  | 'tier_1_private'
  | 'tier_2_private'
  | 'tier_3_boutique'

export type MortgageRule =
  | 'emaar'
  | 'dubai_holdings'
  | 'standard_uae'
  | 'freehold_only'
  | 'tbc'

export type PropertyType =
  | 'apartment'
  | 'villa'
  | 'townhouse'
  | 'penthouse'
  | 'duplex'
  | 'mansion'
  | 'plot'
  | 'retail'
  | 'office'
  | 'warehouse'

export type MarketType = 'off_plan' | 'ready' | 'resale'

export type OfferStatus =
  | 'draft'
  | 'generated'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired'

export type PDFTemplate = 'T1_portrait' | 'T2_editorial' | 'T3_landscape'

export type InputMethod =
  | 'pdf_upload'
  | 'image_upload'
  | 'text_paste'
  | 'manual'

export type ExtractionConfidence = 'high' | 'medium' | 'low' | 'manual'

export type PSFStatus = 'fresh' | 'stale' | 'expired'

export type DocStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'superseded'

export type DLDWaiverType = 'none' | 'full_4pct' | 'half_2pct' | 'custom'

export type TransactionCostScenario =
  | 'primary_no_waiver'
  | 'primary_dld_waiver_2pct'
  | 'primary_dld_waiver_4pct'
  | 'resale_ready'
  | 'resale_offplan'

// ── Database Row Types ────────────────────────────────────────

export interface Agent {
  id: string
  email: string
  full_name: string
  display_name: string | null
  role: AgentRole
  rera_number: string | null
  rera_expiry: string | null
  phone: string | null
  whatsapp: string | null
  photo_url: string | null
  title: string
  office_address: string
  active: boolean
  onboarded_at: string
  last_login_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Developer {
  id: string
  name: string
  short_name: string | null
  tier: DeveloperTier
  mortgage_rule: MortgageRule
  logo_url: string | null
  website: string | null
  headquarters: string
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  city: string
  emirate: string
  master_developer: string | null
  zone: string | null
  latitude: number | null
  longitude: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  developer_id: string
  community_id: string
  name: string
  full_name: string | null
  market_type: MarketType
  property_types: PropertyType[]
  total_units: number | null
  completion_date: string | null
  completion_date_label: string | null
  service_charge_psf: number | null
  brochure_url: string | null
  active: boolean
  is_sold_out: boolean
  notes: string | null
  dld_waiver_type: DLDWaiverType
  dld_waiver_pct: number
  dld_waiver_label: string | null
  dld_waiver_valid_until: string | null
  dld_waiver_notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  developer?: Developer
  community?: Community
}

export interface UnitType {
  id: string
  project_id: string
  type_label: string
  bedrooms: number | null
  bathrooms: number | null
  bua_min_sqft: number | null
  bua_max_sqft: number | null
  plot_min_sqft: number | null
  plot_max_sqft: number | null
  price_min_aed: number | null
  price_max_aed: number | null
  active: boolean
  created_at: string
}

export interface PaymentPlanTemplate {
  id: string
  project_id: string
  plan_name: string
  is_default: boolean
  total_instalments: number
  created_at: string
  updated_at: string
  instalments?: PaymentPlanInstalment[]
}

export interface PaymentPlanInstalment {
  id: string
  template_id: string
  instalment_number: number
  milestone_label: string
  percentage: number
  due_date_label: string | null
  due_date: string | null
  is_down_payment: boolean
  is_handover: boolean
}

export interface MarketData {
  id: string
  project_id: string
  bedrooms: number | null
  bedroom_label: string | null
  psf_aed: number
  psf_source: string | null
  psf_status: PSFStatus
  valid_from: string
  updated_at: string
  updated_by: string | null
}

export interface Client {
  id: string
  agent_id: string
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  nationality: string | null
  budget_min_aed: number | null
  budget_max_aed: number | null
  preferred_types: PropertyType[] | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Offer {
  id: string
  reference_number: string
  agent_id: string
  client_id: string | null
  client_name_snapshot: string | null
  project_id: string | null
  source_document_id: string | null
  input_method: InputMethod
  template: PDFTemplate
  status: OfferStatus
  market_type: MarketType

  // Property data
  developer_name_snapshot: string
  community_name_snapshot: string
  project_name_snapshot: string
  unit_reference: string
  unit_type_label: string | null
  bedrooms: number | null
  bathrooms: number | null
  bua_sqft: number
  bua_sqm: number | null
  plot_sqft: number | null
  plot_sqm: number | null
  floor_number: number | null
  view_description: string | null
  asking_price_aed: number
  price_psf_aed: number | null
  service_charge_psf: number | null
  completion_date_label: string | null
  completion_date: string | null

  // Payment plan
  payment_plan_name: string | null
  payment_plan_snapshot: PaymentPlanInstalment[] | null

  // DLD & costs
  cost_scenario: TransactionCostScenario | null
  dld_waiver_type: DLDWaiverType
  dld_waiver_pct: number
  dld_waiver_label: string | null
  dld_waiver_valid_until: string | null
  dld_fee_pct: number
  dld_fee_gross_aed: number | null
  dld_fee_buyer_aed: number | null
  dld_fee_developer_aed: number | null
  dld_waiver_saving_aed: number | null
  agency_commission_pct: number
  agency_commission_aed: number | null
  agency_commission_visible: boolean
  trustee_fee_aed: number | null
  trustee_fee_applicable: boolean
  title_deed_fee_aed: number
  title_deed_fee_applicable: boolean
  noc_fee_aed: number | null
  noc_fee_applicable: boolean
  noc_fee_label: string | null
  misc_fees_aed: number
  misc_fees_applicable: boolean
  misc_fees_label: string | null
  total_buyer_cost_aed: number | null
  total_buyer_cost_pct: number | null

  // Comparables
  comparables_snapshot: CostBreakdownComparable[] | null

  // PDF
  pdf_url: string | null
  pdf_size_bytes: number | null
  pdf_generated_at: string | null
  pdf_generation_ms: number | null

  // Share
  share_token: string | null
  share_url: string | null
  share_expires_at: string | null
  share_view_count: number
  share_last_viewed_at: string | null

  // Validity
  valid_hours: number
  expires_at: string | null
  notes: string | null
  created_at: string
  updated_at: string

  // Joined
  agent?: Agent
  client?: Client
  project?: Project
}

export interface SourceDocument {
  id: string
  agent_id: string
  offer_id: string | null
  input_method: InputMethod
  file_name: string | null
  file_url: string | null
  file_size_bytes: number | null
  mime_type: string | null
  raw_text: string | null
  ai_raw_response: Record<string, unknown> | null
  status: DocStatus
  error_message: string | null
  processing_ms: number | null
  created_at: string
  updated_at: string
  extracted_fields?: AIExtractedField[]
}

export interface AIExtractedField {
  id: string
  source_document_id: string
  field_name: string
  extracted_value: string | null
  extracted_confidence: ExtractionConfidence
  extraction_note: string | null
  agent_confirmed_value: string | null
  agent_changed: boolean
  confirmed_at: string | null
  confirmed_by: string | null
}

// ── Cost Breakdown ────────────────────────────────────────────

export interface CostBreakdownItem {
  label: string | null
  amount: number
  pct?: number
  visible: boolean
  highlight?: boolean
  note?: string | null
}

export interface CostBreakdownComparable {
  project_name: string
  community_name: string
  bedroom_label: string
  psf_aed: number
  psf_source: string | null
}

export interface CostBreakdown {
  scenario: TransactionCostScenario
  is_primary: boolean
  is_resale: boolean
  currency: string
  property_price: CostBreakdownItem
  dld_fee: {
    label: string
    gross_amount: number
    buyer_amount: number
    developer_pays: number
    pct: number
    visible: boolean
    waiver_active: boolean
    waiver_saving: number
  }
  dld_waiver_callout: {
    show: boolean
    type: DLDWaiverType
    label: string | null
    saving_aed: number
    valid_until: string | null
  }
  agency_commission: CostBreakdownItem & { pct: number }
  trustee_fee: CostBreakdownItem
  title_deed_fee: CostBreakdownItem
  noc_fee: CostBreakdownItem
  misc_fees: CostBreakdownItem
  total: CostBreakdownItem
}

// ── AI Extraction ─────────────────────────────────────────────

export interface ExtractedPropertyData {
  developer_name?: string
  community_name?: string
  project_name?: string
  unit_reference?: string
  unit_type_label?: string
  bedrooms?: number
  bathrooms?: number
  bua_sqft?: number
  plot_sqft?: number
  floor_number?: number
  view_description?: string
  asking_price_aed?: number
  completion_date_label?: string
  completion_date?: string
  payment_plan_name?: string
  payment_plan_instalments?: Partial<PaymentPlanInstalment>[]
  confidence: Record<string, ExtractionConfidence>
  notes: string[]
}

// ── Form Types ────────────────────────────────────────────────

export type OfferFormData = Record<string, any>

// ── Dashboard Stats ───────────────────────────────────────────

export interface AgentStats {
  agent_id: string
  full_name: string
  role: AgentRole
  total_offers: number
  generated: number
  sent: number
  accepted: number
  offers_last_30d: number
  last_offer_at: string | null
}

export interface DashboardSummary {
  total_offers: number
  offers_this_month: number
  offers_sent: number
  offers_accepted: number
  conversion_rate: number
  recent_offers: Offer[]
}

// ── API Response Types ────────────────────────────────────────

export interface APIResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

// ── Template Display Config ───────────────────────────────────

export interface TemplateOption {
  id: PDFTemplate
  name: string
  description: string
  best_for: string
  orientation: 'portrait' | 'landscape'
  pages: number
  preview_color: string
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'T1_portrait',
    name: 'Classic Dark',
    description: 'Dark luxury portrait — 6 pages',
    best_for: 'WhatsApp · Client views on phone',
    orientation: 'portrait',
    pages: 6,
    preview_color: '#1C1C1A',
  },
  {
    id: 'T2_editorial',
    name: 'Editorial White',
    description: 'Clean white editorial — 4 pages',
    best_for: 'Email · Client views on desktop or prints',
    orientation: 'portrait',
    pages: 4,
    preview_color: '#FAFAF8',
  },
  {
    id: 'T3_landscape',
    name: 'Pitch Deck',
    description: 'Landscape pitch deck — 5 slides',
    best_for: 'Screen presentation · Agent presents on laptop',
    orientation: 'landscape',
    pages: 5,
    preview_color: '#B8975A',
  },
]

// ── Commission Dropdown Options ───────────────────────────────

export const AGENCY_COMMISSION_OPTIONS = [
  { value: 1.00, label: '1.00%' },
  { value: 1.25, label: '1.25%' },
  { value: 1.50, label: '1.50%' },
  { value: 1.75, label: '1.75%' },
  { value: 2.00, label: '2.00% (Standard)' },
  { value: 2.50, label: '2.50%' },
]

// ── Mortgage Rule Display ─────────────────────────────────────

export const MORTGAGE_RULE_LABELS: Record<MortgageRule, string> = {
  emaar: 'Emaar — Mortgage at 50% construction completion. Banks: Emirates NBD, ADCB, Mashreq, Dubai Islamic Bank.',
  dubai_holdings: 'Dubai Holdings — Mortgage at 50% payment (irrespective of construction). Bank: Emirates NBD (exclusive).',
  standard_uae: 'Standard UAE — Mortgage at 50% paid OR 40% construction. All major UAE banks.',
  freehold_only: 'Cash only — mortgage financing not available for this project.',
  tbc: 'Mortgage eligibility to be confirmed — please contact the developer.',
}

// ── Developer Tier Labels ─────────────────────────────────────

export const DEVELOPER_TIER_LABELS: Record<DeveloperTier, string> = {
  tier_1_gov: 'Government / Semi-Government',
  tier_1_private: 'Tier 1 Private',
  tier_2_private: 'Tier 2 Private',
  tier_3_boutique: 'Boutique',
}
