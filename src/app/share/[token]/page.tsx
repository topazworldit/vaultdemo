import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { formatAED, formatSqft, formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: { token: string }
}): Promise<Metadata> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('offers')
    .select('project_name_snapshot, community_name_snapshot, asking_price_aed')
    .eq('share_token', params.token)
    .single()

  if (!data) return { title: 'Investment Offer | Topaz World Group' }

  return {
    title: `${data.project_name_snapshot} — ${data.community_name_snapshot} | Topaz World Group`,
    description: `Investment offer for ${data.project_name_snapshot}. Asking price: AED ${data.asking_price_aed?.toLocaleString()}.`,
  }
}

export default async function SharePage({
  params
}: {
  params: { token: string }
}) {
  const supabase = createServiceClient()

  const { data: offer } = await supabase
    .from('v_offer_full')
    .select('*')
    .eq('share_token', params.token)
    .single()

  if (!offer) notFound()

  // Check if expired
  if (offer.share_expires_at && new Date(offer.share_expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gold-400 text-sm mb-2">Topaz World Group</p>
          <h1 className="text-xl font-medium text-white mb-3">This offer has expired</h1>
          <p className="text-dark-400 text-sm">
            Please contact your agent for an updated offer.
          </p>
        </div>
      </div>
    )
  }

  // Increment view count
  await supabase
    .from('offers')
    .update({
      share_view_count:    (offer.share_view_count || 0) + 1,
      share_last_viewed_at: new Date().toISOString(),
    })
    .eq('id', offer.id)

  const isResale = offer.market_type === 'resale'

  return (
    <div className="min-h-screen bg-dark-800">

      {/* ── Header ── */}
      <header className="bg-dark-900 border-b border-dark-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-medium text-white">Topaz</span>
              <span className="text-base font-light text-gold-400">World Group</span>
            </div>
            <p className="text-xs text-dark-500">topazworldgroup.com</p>
          </div>
          {offer.pdf_url && (
            <a
              href={offer.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-sm"
            >
              Download PDF
            </a>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* DLD waiver callout */}
        {offer.dld_waiver_type !== 'none' && (offer.dld_waiver_saving_aed || 0) > 0 && (
          <div className="flex items-center gap-4 rounded-xl border-2 border-gold-500 bg-dark-700 px-5 py-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
              <span className="text-white font-medium">%</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gold-400">
                {offer.dld_waiver_label ||
                  (offer.dld_waiver_type === 'full_4pct' ? '4% DLD Fee Waiver Included' : '2% DLD Fee Waiver Included')}
              </p>
              <p className="text-xs text-gold-600 mt-0.5">
                Your saving: {formatAED(offer.dld_waiver_saving_aed)}
              </p>
            </div>
          </div>
        )}

        {/* Property headline */}
        <div className="mb-8">
          <p className="text-dark-400 text-sm mb-1">{offer.community_name_snapshot}</p>
          <h1 className="text-2xl font-medium text-white">{offer.project_name_snapshot}</h1>
          <p className="text-dark-400 text-sm mt-1">{offer.unit_type_label || `${offer.bedrooms}BR`} · {offer.unit_reference}</p>
          <div className="w-10 h-0.5 bg-gold-500 mt-4" />
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Asking Price" value={formatAED(offer.asking_price_aed)} gold />
          <StatCard label="Built-up Area" value={formatSqft(offer.bua_sqft)} />
          {offer.completion_date_label
            ? <StatCard label="Completion" value={offer.completion_date_label} />
            : <StatCard label="Bedrooms" value={`${offer.bedrooms} BR`} />
          }
        </div>

        {/* Cost breakdown */}
        <div className="bg-dark-700 rounded-xl p-5 mb-6">
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wide mb-4">
            Total acquisition cost
          </p>
          <div className="space-y-2.5">
            <ShareCostRow label="Property price" value={formatAED(offer.asking_price_aed)} />
            <ShareCostRow
              label={offer.dld_waiver_type !== 'none' && !isResale
                ? `DLD fee — ${offer.dld_waiver_type === 'full_4pct' ? '4% waived by developer' : '2% waived by developer'}`
                : 'Dubai Land Department fee (4%)'}
              value={formatAED(offer.dld_fee_buyer_aed)}
            />
            {offer.agency_commission_visible && (
              <ShareCostRow label={`Agency commission (${offer.agency_commission_pct}%)`} value={formatAED(offer.agency_commission_aed)} />
            )}
            {offer.trustee_fee_applicable && (
              <ShareCostRow label="Trustee office fee" value={formatAED(offer.trustee_fee_aed)} />
            )}
            {offer.title_deed_fee_applicable && (
              <ShareCostRow label="Title deed & admin" value={formatAED(offer.title_deed_fee_aed)} />
            )}
            {offer.noc_fee_applicable && (
              <ShareCostRow label="NOC fee" value={formatAED(offer.noc_fee_aed)} />
            )}
            {offer.misc_fees_applicable && (
              <ShareCostRow label="Miscellaneous fees" value={formatAED(offer.misc_fees_aed)} />
            )}
            <div className="border-t border-dark-600 pt-3 mt-3">
              <ShareCostRow
                label={`Total (${offer.total_buyer_cost_pct}% of price)`}
                value={formatAED(offer.total_buyer_cost_aed)}
                highlight
              />
            </div>
          </div>
        </div>

        {/* Agent card */}
        <div className="bg-dark-700 rounded-xl p-5">
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wide mb-4">Your agent</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
              {(offer as any).agent_photo_url ? (
                <img src={(offer as any).agent_photo_url} alt={(offer as any).agent_name}
                     className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-white font-medium">
                  {(offer as any).agent_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-white">{(offer as any).agent_name}</p>
              <p className="text-dark-400 text-sm">{(offer as any).agent_title || 'Investment Advisor'} · Topaz World Group</p>
              <p className="text-dark-400 text-sm">{(offer as any).agent_phone}</p>
            </div>
          </div>
        </div>

        {/* Validity + disclaimer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-dark-500">
            Offer ref: {offer.reference_number} · Valid until {formatDate(offer.expires_at || '')}
          </p>
          <p className="text-xs text-dark-600 leading-relaxed">
            This document is for information purposes only. Prices and completion dates are indicative and subject to change.
            Topaz World Group · RERA Registered · topazworldgroup.com
          </p>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="bg-dark-700 rounded-xl p-4">
      <p className="text-xs text-dark-400 mb-1">{label}</p>
      <p className={`text-sm font-medium ${gold ? 'text-gold-400' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function ShareCostRow({
  label, value, highlight
}: {
  label: string; value: string; highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${highlight ? 'text-white font-medium' : 'text-dark-400'}`}>{label}</span>
      <span className={`text-sm ${highlight ? 'text-gold-400 font-medium text-base' : 'text-dark-300'}`}>{value}</span>
    </div>
  )
}
