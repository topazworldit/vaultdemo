import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { canAccessAdmin } from '@/lib/utils'
import DeveloperManager from '@/components/admin/DeveloperManager'

export const metadata: Metadata = { title: 'Developers' }

export default async function DevelopersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: currentAgent } = await supabase
    .from('agents').select('role').eq('id', session.user.id).single()
  if (!currentAgent || !canAccessAdmin(currentAgent.role)) redirect('/dashboard')

  const { data: developers } = await supabase
    .from('developers')
    .select('*')
    .order('tier')
    .order('name')

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Developers</h1>
          <p className="page-subtitle">{developers?.length || 0} developers · Pre-seeded from DLD/RERA</p>
        </div>
      </div>
      <DeveloperManager developers={(developers || []) as any} />
    </div>
  )
}
