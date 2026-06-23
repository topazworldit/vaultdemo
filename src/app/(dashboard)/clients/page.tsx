import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ClientManager from '@/components/admin/ClientManager'

export const metadata: Metadata = { title: 'Clients' }

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('agent_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">My clients</h1>
          <p className="page-subtitle">{clients?.length || 0} clients</p>
        </div>
      </div>
      <ClientManager clients={(clients || []) as any} agentId={session.user.id} />
    </div>
  )
}
