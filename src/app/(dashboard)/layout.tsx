import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import Sidebar from '@/components/ui/Sidebar'
import TopBar from '@/components/ui/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!agent || !agent.active) redirect('/login')

  return (
    <div className="flex h-screen bg-cream-50 overflow-hidden">
      <Sidebar agent={agent} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar agent={agent} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
