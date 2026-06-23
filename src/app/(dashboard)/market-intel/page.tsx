import type { Metadata } from 'next'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { canAccessAdmin } from '@/lib/utils'
import MarketIntelDashboard from '@/components/market/MarketIntelDashboard'

export const metadata: Metadata = { title: 'Market Intelligence' }

export default async function MarketIntelPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: agent } = await supabase
    .from('agents').select('role').eq('id', session.user.id).single()
  if (!agent || !canAccessAdmin(agent.role)) redirect('/dashboard')

  const serviceClient = createServiceClient()

  // Fetch latest market data with community names
  const { data: marketData } = await serviceClient
    .from('market_data')
    .select(`
      *,
      community:communities(id, name, bayut_location_slug)
    `)
    .order('updated_at', { ascending: false })

  // Fetch unresolved alerts
  const { data: alerts } = await serviceClient
    .from('market_alerts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  // Fetch communities for sync selector
  const { data: communities } = await serviceClient
    .from('communities')
    .select('id, name, bayut_location_slug, active')
    .eq('active', true)
    .order('name')

  // Last bayut sync time
  const { data: lastSync } = await serviceClient
    .from('market_data')
    .select('updated_at')
    .eq('data_source', 'bayut_api')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Market intelligence</h1>
          <p className="page-subtitle">
            Live DLD transaction data via Bayut API ·{' '}
            {lastSync ? `Last synced ${new Date(lastSync.updated_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Not yet synced'}
          </p>
        </div>
      </div>
      <MarketIntelDashboard
        marketData={marketData || []}
        alerts={alerts || []}
        communities={communities || []}
        lastSync={lastSync?.updated_at || null}
      />
    </div>
  )
}
