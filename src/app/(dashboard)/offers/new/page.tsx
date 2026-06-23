import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import NewOfferWizard from '@/components/offers/NewOfferWizard'

export const metadata: Metadata = { title: 'New Offer' }

export default async function NewOfferPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Pre-load all developers and communities for the form dropdowns
  const [developersRes, communitiesRes, agentRes] = await Promise.all([
    supabase
      .from('developers')
      .select('id, name, short_name, tier, mortgage_rule')
      .eq('active', true)
      .order('tier')
      .order('name'),
    supabase
      .from('communities')
      .select('id, name, city, emirate, master_developer')
      .eq('active', true)
      .order('name'),
    supabase
      .from('agents')
      .select('*')
      .eq('id', session.user.id)
      .single(),
  ])

  const developers = developersRes.data || []
  const communities = communitiesRes.data || []
  const agent = agentRes.data

  if (!agent) redirect('/login')

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-xl font-medium text-dark-800">New offer</h1>
        <p className="text-sm text-dark-400 mt-0.5">
          Upload a document, paste text, or enter details manually
        </p>
      </div>

      <NewOfferWizard
        agent={agent}
        developers={(developers) as any}
        communities={(communities) as any}
      />
    </div>
  )
}
