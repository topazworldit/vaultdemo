import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FilePlus, TrendingUp, Send, CheckCircle,
  Clock, ChevronRight, AlertTriangle
} from 'lucide-react'
import { formatAED, formatRelative, canViewAllOffers } from '@/lib/utils'
import type { Agent, Offer } from '@/types'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', session.user.id)
    .single() as { data: Agent | null }

  if (!agent) redirect('/login')

  const canSeeAll = canViewAllOffers(agent.role)

  // Fetch offers
  const offersQuery = supabase
    .from('offers')
    .select(`
      *,
      agent:agents(full_name, display_name),
      project:projects(name, community:communities(name))
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!canSeeAll) {
    offersQuery.eq('agent_id', agent.id)
  }

  const { data: offers } = await offersQuery as { data: Offer[] | null }

  // Stats
  const allOffers = offers || []
  const thisMonth = allOffers.filter(o => {
    const d = new Date(o.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const stats = {
    total: allOffers.length,
    thisMonth: thisMonth.length,
    sent: allOffers.filter(o => ['sent', 'accepted'].includes(o.status)).length,
    accepted: allOffers.filter(o => o.status === 'accepted').length,
  }

  // PSF staleness alerts (admin only)
  let staleData: { project_name: string; days_since_update: number }[] = []
  if (canViewAllOffers(agent.role)) {
    const { data } = await supabase
      .from('v_market_data_health')
      .select('project_name, days_since_update')
      .in('psf_status', ['stale', 'expired'])
      .limit(5)
    staleData = data || []
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-dark-800">
            Good {getGreeting()},{' '}
            <span className="text-gold-600">
              {agent.display_name || agent.full_name.split(' ')[0]}
            </span>
          </h1>
          <p className="text-sm text-dark-400 mt-0.5">
            {canSeeAll ? 'Team overview' : 'Your offers and activity'}
          </p>
        </div>
        <Link href="/offers/new" className="btn-primary">
          <FilePlus className="w-4 h-4" />
          New Offer
        </Link>
      </div>

      {/* ── PSF staleness alerts ── */}
      {staleData.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Market data needs updating</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {staleData.map(d => d.project_name).join(', ')} —
                PSF figures are {staleData[0]?.days_since_update}+ days old.
              </p>
              <Link href="/admin/market-data" className="text-xs text-amber-700 font-medium hover:underline mt-1 inline-block">
                Update now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total offers"
          value={stats.total}
          icon={<FilePlus className="w-4 h-4" />}
          color="gold"
        />
        <StatCard
          label="This month"
          value={stats.thisMonth}
          icon={<TrendingUp className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          label="Sent to clients"
          value={stats.sent}
          icon={<Send className="w-4 h-4" />}
          color="purple"
        />
        <StatCard
          label="Accepted"
          value={stats.accepted}
          icon={<CheckCircle className="w-4 h-4" />}
          color="green"
        />
      </div>

      {/* ── Recent offers ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-dark-700">Recent offers</h2>
          <Link href="/offers" className="text-sm text-gold-600 hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {allOffers.length === 0 ? (
          <div className="card empty-state">
            <FilePlus className="empty-state-icon" />
            <p className="empty-state-title">No offers yet</p>
            <p className="empty-state-text mb-6">Create your first offer in seconds</p>
            <Link href="/offers/new" className="btn-primary btn-sm">
              Create offer
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Property</th>
                    {canSeeAll && <th>Agent</th>}
                    <th>Price</th>
                    <th>Template</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {allOffers.slice(0, 8).map(offer => (
                    <tr key={offer.id}>
                      <td>
                        <span className="font-mono text-xs text-dark-500">
                          {offer.reference_number}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-dark-800 text-xs">
                            {offer.project_name_snapshot}
                          </p>
                          <p className="text-dark-400 text-xs">
                            {offer.community_name_snapshot} · {offer.unit_reference}
                          </p>
                        </div>
                      </td>
                      {canSeeAll && (
                        <td className="text-xs text-dark-500">
                          {(offer.agent as any)?.display_name || (offer.agent as any)?.full_name?.split(' ')[0]}
                        </td>
                      )}
                      <td className="font-medium text-xs">
                        {formatAED(offer.asking_price_aed)}
                      </td>
                      <td>
                        <TemplateBadge template={offer.template} />
                      </td>
                      <td>
                        <StatusBadge status={offer.status} />
                      </td>
                      <td className="text-dark-400 text-xs">
                        {formatRelative(offer.created_at)}
                      </td>
                      <td>
                        <Link
                          href={`/offers/${offer.id}`}
                          className="text-gold-600 hover:underline text-xs font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helper components ──

function StatCard({
  label, value, icon, color
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: 'gold' | 'blue' | 'purple' | 'green'
}) {
  const colors = {
    gold:   'bg-gold-50 text-gold-600',
    blue:   'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green:  'bg-green-50 text-green-600',
  }
  return (
    <div className="card p-5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-medium text-dark-800">{value}</p>
      <p className="text-xs text-dark-400 mt-0.5">{label}</p>
    </div>
  )
}

function TemplateBadge({ template }: { template: string }) {
  const map: Record<string, { label: string; className: string }> = {
    T1_portrait:  { label: 'Dark',      className: 'badge-gray' },
    T2_editorial: { label: 'Editorial', className: 'badge-blue' },
    T3_landscape: { label: 'Pitch',     className: 'badge-gold' },
  }
  const t = map[template] || { label: template, className: 'badge-gray' }
  return <span className={t.className + ' badge'}>{t.label}</span>
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:     { label: 'Draft',     className: 'badge-gray' },
    generated: { label: 'Generated', className: 'badge-blue' },
    sent:      { label: 'Sent',      className: 'badge-amber' },
    accepted:  { label: 'Accepted',  className: 'badge-green' },
    rejected:  { label: 'Rejected',  className: 'badge-red' },
    expired:   { label: 'Expired',   className: 'badge-gray' },
  }
  const s = map[status] || { label: status, className: 'badge-gray' }
  return <span className={s.className + ' badge'}>{s.label}</span>
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
