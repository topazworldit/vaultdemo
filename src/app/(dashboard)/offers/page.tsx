import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FilePlus, Search, Filter } from 'lucide-react'
import { formatAED, formatRelative, canViewAllOffers } from '@/lib/utils'
import type { Offer } from '@/types'

export const metadata: Metadata = { title: 'My Offers' }

export default async function OffersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; template?: string; page?: string }
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const canSeeAll = canViewAllOffers(agent?.role || 'agent')
  const page      = parseInt(searchParams.page || '1')
  const limit     = 25
  const offset    = (page - 1) * limit

  let query = supabase
    .from('offers')
    .select('*, agent:agents(full_name, display_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (!canSeeAll) query = query.eq('agent_id', session.user.id)
  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.template) query = query.eq('template', searchParams.template)
  if (searchParams.search) {
    query = query.or(
      `unit_reference.ilike.%${searchParams.search}%,` +
      `project_name_snapshot.ilike.%${searchParams.search}%,` +
      `reference_number.ilike.%${searchParams.search}%`
    )
  }

  const { data: offers, count } = await query
  const totalPages = Math.ceil((count || 0) / limit)

  const STATUS_OPTIONS = ['generated', 'sent', 'accepted', 'rejected', 'expired']
  const TEMPLATE_OPTIONS = [
    { value: 'T1_portrait', label: 'Classic Dark' },
    { value: 'T2_editorial', label: 'Editorial White' },
    { value: 'T3_landscape', label: 'Pitch Deck' },
  ]

  const STATUS_BADGES: Record<string, string> = {
    draft: 'badge-gray', generated: 'badge-blue', sent: 'badge-amber',
    accepted: 'badge-green', rejected: 'badge-red', expired: 'badge-gray',
  }

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">{canSeeAll ? 'All offers' : 'My offers'}</h1>
          <p className="page-subtitle">{count || 0} total offers</p>
        </div>
        <Link href="/offers/new" className="btn-primary">
          <FilePlus className="w-4 h-4" /> New offer
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form className="flex items-center gap-2 flex-1 min-w-60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400" />
            <input
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search by unit ref, project, reference..."
              className="pl-8 w-full"
            />
          </div>
          <button type="submit" className="btn-secondary btn-sm">Search</button>
        </form>

        <div className="flex gap-2">
          {STATUS_OPTIONS.map(s => (
            <Link
              key={s}
              href={`/offers?status=${s}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
              className={`btn-sm rounded-lg px-3 py-1.5 text-xs border transition-colors ${
                searchParams.status === s
                  ? 'bg-dark-800 text-white border-dark-800'
                  : 'bg-white text-dark-600 border-dark-200 hover:border-dark-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
          {searchParams.status && (
            <Link href="/offers" className="btn-ghost btn-sm">Clear</Link>
          )}
        </div>
      </div>

      {/* Table */}
      {!offers || offers.length === 0 ? (
        <div className="card empty-state">
          <FilePlus className="empty-state-icon" />
          <p className="empty-state-title">No offers found</p>
          <p className="empty-state-text mb-6">
            {searchParams.search || searchParams.status
              ? 'Try adjusting your search or filters'
              : 'Create your first offer to get started'}
          </p>
          <Link href="/offers/new" className="btn-primary btn-sm">New offer</Link>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Property</th>
                    {canSeeAll && <th>Agent</th>}
                    <th>Type</th>
                    <th>Price</th>
                    <th>Template</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(offers as any[]).map((offer: any) => (
                    <tr key={offer.id}>
                      <td>
                        <span className="font-mono text-xs text-dark-500">
                          {offer.reference_number}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-dark-800 text-sm">
                            {offer.project_name_snapshot}
                          </p>
                          <p className="text-dark-400 text-xs">
                            {offer.community_name_snapshot} · {offer.unit_reference}
                          </p>
                        </div>
                      </td>
                      {canSeeAll && (
                        <td className="text-xs text-dark-500">
                          {offer.agent?.display_name || offer.agent?.full_name?.split(' ')[0]}
                        </td>
                      )}
                      <td>
                        <span className="badge-gray badge text-xs">
                          {offer.market_type === 'off_plan' ? 'Off-plan'
                           : offer.market_type === 'ready' ? 'Ready'
                           : 'Resale'}
                        </span>
                      </td>
                      <td className="font-medium text-sm">
                        {formatAED(offer.asking_price_aed)}
                      </td>
                      <td>
                        <span className="text-xs text-dark-500">
                          {offer.template === 'T1_portrait' ? 'Dark'
                           : offer.template === 'T2_editorial' ? 'Editorial'
                           : 'Pitch'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGES[offer.status] || 'badge-gray'}`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="text-xs text-dark-500 text-center">
                        {offer.share_view_count || 0}
                      </td>
                      <td className="text-xs text-dark-400">
                        {formatRelative(offer.created_at)}
                      </td>
                      <td>
                        <Link
                          href={`/offers/${offer.id}`}
                          className="text-gold-600 hover:underline text-xs font-medium"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-dark-400">
                Page {page} of {totalPages} · {count} total
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/offers?page=${page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
                        className="btn-secondary btn-sm">Previous</Link>
                )}
                {page < totalPages && (
                  <Link href={`/offers?page=${page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
                        className="btn-primary btn-sm">Next</Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
