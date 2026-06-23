import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { canAccessAdmin, formatDate, formatRelative } from '@/lib/utils'
import AgentManager from '@/components/admin/AgentManager'

export const metadata: Metadata = { title: 'Agent Management' }

export default async function AdminAgentsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: currentAgent } = await supabase
    .from('agents')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!currentAgent || !canAccessAdmin(currentAgent.role)) redirect('/dashboard')

  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Agent accounts</h1>
          <p className="page-subtitle">{agents?.length || 0} agents · Topaz World Group</p>
        </div>
      </div>
      <AgentManager
        agents={(agents || []) as any}
        currentAgentRole={currentAgent.role}
      />
    </div>
  )
}
