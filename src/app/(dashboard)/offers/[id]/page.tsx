import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Download, Share2, MessageCircle, CheckCircle,
  Clock, ArrowLeft, ExternalLink, RefreshCw
} from 'lucide-react'
import {
  formatAED, formatSqft, formatDate,
  formatRelative, getWhatsAppMessage, getShareUrl
} from '@/lib/utils'
import type { Offer, Agent } from '@/types'
import OfferStatusUpdater from '@/components/offers/OfferStatusUpdater'
import PDFRetryButton from '@/components/offers/PDFRetryButton'
import CopyShareLink from '@/components/offers/CopyShareLink'

export const metadata: Metadata = { title: 'Offer Details' }

export default async function OfferDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: offer } = await supabase
    .from('v_offer_full')
    .select('*')
    .eq('id', params.id)
    .single() as { data: (Offer & { agent_name: string; agent_email: string; agent_phone: string; agent_rera_number: string; client_full_name: string | null }) | null }

  if (!offer) notFound()

  const shareUrl = offer.share_url || getShareUrl(offer.share_token || '')
  const whatsAppMsg = getWhatsAppMessage({
    reference_number:      offer.reference_number,
    project_name_snapshot: offer.project_name_snapshot,
    community_name_snapshot: offer.community_name_snapshot,
    asking_price_aed:      offer.asking_price_aed,
    share_url:             shareUrl,
    agent: {
      full_name: offer.agent_name,
      phone:     offer.agent_phone,
    },
  })

  const isPDFReady = !!offer.pdf_url

  return (
    <div className="max-w-3xl animate-fade-in">

      {/* ── Back + header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/offers" className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-dark-600 mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> All offers
          </Link>
          <h1 className="text-xl font-medium text-dark-800">{offer.project_name_snapshot}</h1>
          <p className="text-sm text-dark-400 mt-0.5">
            {offer.community_name_snapshot} · {offer.unit_reference}
          </p>
          <p className="font-mono text-xs text-dark-400 mt-1">{offer.reference_number}</p>
        </div>
        <OfferStatusUpdater offerId={offer.id} currentStatus={offer.status} />
      </div>

      {/* ── DLD waiver callout ── */}
      {offer.dld_waiver_type !== 'none' && (offer.dld_waiver_saving_aed || 0) > 0 && (
        <div className="waiver-banner mb-6">
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-medium">%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gold-800">
              {offer.dld_waiver_label ||
                (offer.dld_waiver_type === 'full_4pct' ? '4% DLD Fee Waiver Included' : '2% DLD Fee Waiver Included')}
            </p>
            <p className="text-xs text-gold-700 mt-0.5">
              Client saving: {formatAED(offer.dld_waiver_saving_aed)}
            </p>
          </div>
        </div>
      )}

      {/* ── Action bar ── */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">

          {/* PDF download */}
          {isPDFReady ? (
            <a
              href={offer.pdf_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>
          ) : (
            <PDFRetryButton offerId={offer.id} />
          )}

          {/* WhatsApp */}
          <a
            href={`https://wa.me/?text=${whatsAppMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <MessageCircle className="w-4 h-4 text-green-600" /> Share on WhatsApp
          </a>

          {/* Copy share link */}
          <CopyShareLink url={shareUrl} />

          {/* View share page */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost btn-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Client view
          </a>
        </div>

        {/* Share link preview */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-dark-50 px-3 py-2">
          <span className="text-xs text-dark-400 font-mono flex-1 truncate">{shareUrl}</span>
          {offer.share_expires_at && (
            <span className="text-xs text-dark-400 shrink-0">
              Expires {formatDate(offer.share_expires_at)}
            </span>
          )}
        </div>
      </div>

      {/* ── Property details ── */}
      <div className="card divide-y divide-dark-100 overflow-hidden mb-6">
        <div className="px-5 py-4 bg-dark-50">
          <p className="text-xs font-medium text-dark-600 uppercase tracking-wide">Property details</p>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
          <Detail label="Developer"     value={offer.developer_name_snapshot} />
          <Detail label="Community"     value={offer.community_name_snapshot} />
          <Detail label="Project"       value={offer.project_name_snapshot} />
          <Detail label="Unit ref"      value={offer.unit_reference} mono />
          <Detail label="Type"          value={offer.unit_type_label || '—'} />
          <Detail label="Bedrooms"      value={offer.bedrooms?.toString() || '—'} />
          <Detail label="BUA"           value={formatSqft(offer.bua_sqft)} />
          {offer.plot_sqft && (
            <Detail label="Plot area" value={formatSqft(offer.plot_sqft)} />
          )}
          {offer.floor_number && (
            <Detail label="Floor" value={`Floor ${offer.floor_number}`} />
          )}
          {offer.view_description && (
            <Detail label="View" value={offer.view_description} />
          )}
          {offer.completion_date_label && (
            <Detail label="Completion" value={offer.completion_date_label} />
          )}
          <Detail label="Market type"  value={
            offer.market_type === 'off_plan' ? 'Off-plan'
            : offer.market_type === 'ready' ? 'Ready'
            : 'Resale'
          } />
        </div>

        {/* Pricing section */}
        <div className="px-5 py-4 bg-dark-50">
          <p className="text-xs font-medium text-dark-600 uppercase tracking-wide">Pricing & costs</p>
        </div>
        <div className="p-5 space-y-2.5">
          <CostLine label="Asking price"      value={formatAED(offer.asking_price_aed)} large />
          <CostLine label="Price per sq.ft"   value={offer.price_psf_aed ? formatAED(offer.price_psf_aed, 0) + ' psf' : '—'} />
          <CostLine label="DLD fee (gross 4%)" value={formatAED(offer.dld_fee_gross_aed)} />
          {(offer.dld_fee_developer_aed || 0) > 0 && (
            <CostLine label="Developer pays (waiver)" value={`− ${formatAED(offer.dld_fee_developer_aed)}`} accent />
          )}
          <CostLine label="Buyer pays DLD"    value={formatAED(offer.dld_fee_buyer_aed)} />
          {offer.agency_commission_visible && (
            <CostLine label={`Agency (${offer.agency_commission_pct}%)`} value={formatAED(offer.agency_commission_aed)} />
          )}
          {!offer.agency_commission_visible && (
            <CostLine label="Agency commission" value="Paid by developer" muted />
          )}
          {offer.trustee_fee_applicable && (
            <CostLine label="Trustee fee" value={formatAED(offer.trustee_fee_aed)} />
          )}
          {offer.title_deed_fee_applicable && (
            <CostLine label="Title deed + admin" value={formatAED(offer.title_deed_fee_aed)} />
          )}
          {offer.noc_fee_applicable && (
            <CostLine label="NOC fee" value={formatAED(offer.noc_fee_aed)} />
          )}
          {offer.misc_fees_applicable && offer.misc_fees_aed > 0 && (
            <CostLine label="Miscellaneous" value={formatAED(offer.misc_fees_aed)} />
          )}
          <div className="border-t border-dark-100 pt-2.5">
            <CostLine
              label={`Total acquisition (${offer.total_buyer_cost_pct}%)`}
              value={formatAED(offer.total_buyer_cost_aed)}
              large accent
            />
          </div>
        </div>

        {/* Payment plan if present */}
        {offer.payment_plan_snapshot && Array.isArray(offer.payment_plan_snapshot) && offer.payment_plan_snapshot.length > 0 && (
          <>
            <div className="px-5 py-4 bg-dark-50">
              <p className="text-xs font-medium text-dark-600 uppercase tracking-wide">
                Payment plan — {offer.payment_plan_name}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Milestone</th>
                    <th>%</th>
                    <th>Amount</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {(offer.payment_plan_snapshot as any[]).map((inst, i) => (
                    <tr key={i} className={inst.is_handover ? 'bg-gold-50' : ''}>
                      <td className="text-dark-400">{inst.instalment_number}</td>
                      <td className={inst.is_handover ? 'font-medium text-gold-700' : ''}>{inst.milestone_label}</td>
                      <td>{inst.percentage}%</td>
                      <td className="font-medium">
                        {formatAED(Math.round(offer.asking_price_aed * inst.percentage / 100))}
                      </td>
                      <td className="text-dark-400">{inst.due_date_label || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Meta ── */}
      <div className="card p-5 grid grid-cols-2 gap-4 text-sm">
        <Detail label="Generated"    value={formatRelative(offer.created_at)} />
        <Detail label="Agent"        value={offer.agent_name} />
        <Detail label="Template"     value={
          offer.template === 'T1_portrait' ? 'Classic Dark' :
          offer.template === 'T2_editorial' ? 'Editorial White' : 'Pitch Deck'
        } />
        <Detail label="Client"       value={offer.client_full_name || offer.client_name_snapshot || '—'} />
        <Detail label="Views"        value={offer.share_view_count.toString()} />
        <Detail label="Expires"      value={offer.expires_at ? formatDate(offer.expires_at) : '24 hours from generation'} />
      </div>
    </div>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-dark-400">{label}</p>
      <p className={`text-sm mt-0.5 text-dark-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}

function CostLine({
  label, value, large, accent, muted
}: {
  label: string; value: string; large?: boolean; accent?: boolean; muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${muted ? 'text-dark-400' : 'text-dark-600'}`}>{label}</span>
      <span className={`text-sm ${large ? 'font-medium text-dark-800 text-base' : ''} ${accent ? 'text-gold-600 font-medium' : ''} ${muted ? 'text-dark-400 italic text-xs' : ''}`}>
        {value}
      </span>
    </div>
  )
}


