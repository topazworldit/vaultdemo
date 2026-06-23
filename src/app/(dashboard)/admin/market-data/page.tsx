import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { canAccessAdmin } from '@/lib/utils'
import MarketDataManager from '@/components/admin/MarketDataManager'

export const metadata: Metadata = { title: 'Market Data' }

export default async function MarketDataPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: currentAgent } = await supabase
    .from('agents')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!currentAgent || !canAccessAdmin(currentAgent.role)) redirect('/dashboard')

  const { data: marketHealth } = await supabase
    .from('v_market_data_health')
    .select('*')
    .order('psf_status', { ascending: false })
    .order('days_since_update', { ascending: false })

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, name,
      developer:developers(name, short_name),
      community:communities(name)
    `)
    .eq('active', true)
    .order('name')

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Market data (PSF)</h1>
          <p className="page-subtitle">
            Price per sq.ft by project · Update monthly to keep offers accurate
          </p>
        </div>
      </div>
      <MarketDataManager
        marketData={(marketHealth || []) as any}
        projects={(projects || []) as any}
      />
    </div>
  )
}
