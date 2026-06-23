import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import AgentProfile from '@/components/forms/AgentProfile'

export const metadata: Metadata = { title: 'My Profile' }

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: agent } = await supabase
    .from('agents').select('*').eq('id', session.user.id).single()
  if (!agent) redirect('/login')

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="page-title">My profile</h1>
        <p className="page-subtitle">Your details appear on every generated PDF</p>
      </div>
      <AgentProfile agent={agent} />
    </div>
  )
}
