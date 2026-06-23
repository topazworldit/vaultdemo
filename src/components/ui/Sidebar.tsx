'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FilePlus, FolderOpen, Users,
  BarChart2, Settings, ChevronRight, Building2, BookMarked, Database,
  TrendingUp, UserCog
} from 'lucide-react'
import { cn, canAccessAdmin } from '@/lib/utils'
import type { Agent } from '@/types'

interface SidebarProps {
  agent: Agent
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',           icon: LayoutDashboard },
  { label: 'New Offer',    href: '/offers/new',          icon: FilePlus },
  { label: 'My Offers',    href: '/offers',              icon: FolderOpen },
  { label: 'Clients',      href: '/clients',             icon: Users },
  { label: 'Templates',    href: '/templates',           icon: BookMarked },
]

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Agents',       href: '/admin/agents',        icon: UserCog,    adminOnly: true },
  { label: 'Developers',   href: '/admin/developers',    icon: Building2,  adminOnly: true },
  { label: 'Market Data',  href: '/admin/market-data',   icon: TrendingUp, adminOnly: true },
  { label: 'Market Intel', href: '/market-intel',         icon: Database,   adminOnly: true },
  { label: 'Analytics',    href: '/admin/analytics',     icon: BarChart2,  adminOnly: true },
]

export default function Sidebar({ agent }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = canAccessAdmin(agent.role)

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-dark-800 border-r border-dark-700 overflow-y-auto scrollbar-thin">

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-dark-700">
        <Link href="/dashboard" className="flex items-baseline gap-1">
          <span className="text-lg font-medium text-white tracking-tight">Topaz</span>
          <span className="text-lg font-light text-gold-400 tracking-tight">Builder</span>
        </Link>
        <p className="text-dark-500 text-xs mt-0.5">Topaz World Group</p>
      </div>

      {/* ── New Offer CTA ── */}
      <div className="px-4 pt-5 pb-3">
        <Link
          href="/offers/new"
          className="flex items-center justify-between w-full rounded-lg
                     bg-gold-500 hover:bg-gold-600 px-4 py-2.5
                     text-white text-sm font-medium transition-colors duration-150"
        >
          <span className="flex items-center gap-2">
            <FilePlus className="w-4 h-4" />
            New Offer
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </Link>
      </div>

      {/* ── Main nav ── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.filter(item => item.href !== '/offers/new').map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
              isActive(item.href)
                ? 'bg-dark-700 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-5 pb-2 px-3">
              <p className="text-dark-600 text-xs font-medium uppercase tracking-wider">
                Admin
              </p>
            </div>
            {ADMIN_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive(item.href)
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* ── Agent card ── */}
      <div className="px-4 py-4 border-t border-dark-700">
        <Link href="/settings" className="flex items-center gap-3 group">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
            {agent.photo_url ? (
              <img src={agent.photo_url} alt={agent.full_name}
                   className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span className="text-white text-xs font-medium">
                {agent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate group-hover:text-gold-400 transition-colors">
              {agent.display_name || agent.full_name.split(' ')[0]}
            </p>
            <p className="text-dark-500 text-xs truncate">
              {agent.role === 'super_admin' ? 'Super Admin'
               : agent.role === 'admin' ? 'Admin'
               : agent.role === 'senior_agent' ? 'Senior Agent'
               : 'Agent'}
            </p>
          </div>
          <Settings className="w-3.5 h-3.5 text-dark-500 group-hover:text-dark-400 shrink-0" />
        </Link>
      </div>
    </aside>
  )
}
