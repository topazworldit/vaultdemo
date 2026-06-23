'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LogOut, Bell } from 'lucide-react'
import type { Agent } from '@/types'

interface TopBarProps {
  agent: Agent
}

export default function TopBar({ agent }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 shrink-0 flex items-center justify-between
                       px-6 bg-white border-b border-dark-100">
      <div className="flex items-center gap-2">
        <p className="text-sm text-dark-400">
          {new Date().toLocaleDateString('en-AE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* RERA warning if expiring */}
        {agent.rera_expiry && (() => {
          const daysLeft = Math.ceil(
            (new Date(agent.rera_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
          if (daysLeft > 0 && daysLeft <= 30) {
            return (
              <span className="badge-amber text-xs">
                RERA expires in {daysLeft} days
              </span>
            )
          }
          if (daysLeft <= 0) {
            return (
              <span className="badge-red text-xs">
                RERA card expired
              </span>
            )
          }
          return null
        })()}

        <button className="relative p-2 text-dark-400 hover:text-dark-600 rounded-lg hover:bg-dark-50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-500
                     hover:text-dark-700 hover:bg-dark-50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </header>
  )
}
