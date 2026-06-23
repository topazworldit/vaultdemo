'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Edit2, ToggleLeft, ToggleRight, X, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Developer, DeveloperTier, MortgageRule } from '@/types'

const TIER_OPTIONS: { value: DeveloperTier; label: string; badge: string }[] = [
  { value: 'tier_1_gov',      label: 'Gov / Semi-Gov',  badge: 'badge-gold' },
  { value: 'tier_1_private',  label: 'Tier 1 Private',  badge: 'badge-blue' },
  { value: 'tier_2_private',  label: 'Tier 2 Private',  badge: 'badge-gray' },
  { value: 'tier_3_boutique', label: 'Boutique',         badge: 'badge-gray' },
]

const MORTGAGE_OPTIONS: { value: MortgageRule; label: string }[] = [
  { value: 'emaar',          label: 'Emaar — 50% construction' },
  { value: 'dubai_holdings', label: 'Dubai Holdings — 50% payment (Apr 2026)' },
  { value: 'standard_uae',   label: 'Standard UAE — 50% paid or 40% construction' },
  { value: 'freehold_only',  label: 'Cash only — no mortgage' },
  { value: 'tbc',            label: 'TBC — confirm with developer' },
]

interface DevForm {
  name: string; short_name: string; tier: DeveloperTier
  mortgage_rule: MortgageRule; website: string; notes: string
}

const EMPTY: DevForm = {
  name: '', short_name: '', tier: 'tier_2_private',
  mortgage_rule: 'standard_uae', website: '', notes: '',
}

export default function DeveloperManager({ developers: initial }: { developers: Developer[] }) {
  const supabase = createClient()
  const [devs, setDevs]           = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Developer | null>(null)
  const [form, setForm]           = useState<DevForm>(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [tierFilter, setTierFilter] = useState<DeveloperTier | 'all'>('all')

  const filtered = devs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.short_name || '').toLowerCase().includes(search.toLowerCase())
    const matchTier = tierFilter === 'all' || d.tier === tierFilter
    return matchSearch && matchTier
  })

  function openCreate() {
    setEditing(null); setForm(EMPTY); setError(null); setShowModal(true)
  }

  function openEdit(dev: Developer) {
    setEditing(dev)
    setForm({
      name: dev.name, short_name: dev.short_name || '',
      tier: dev.tier, mortgage_rule: dev.mortgage_rule,
      website: dev.website || '', notes: dev.notes || '',
    })
    setError(null); setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Developer name is required'); return }
    setSaving(true); setError(null)
    const payload = {
      name: form.name.trim(), short_name: form.short_name.trim() || null,
      tier: form.tier, mortgage_rule: form.mortgage_rule,
      website: form.website.trim() || null, notes: form.notes.trim() || null,
    }
    if (editing) {
      const { data, error: e } = await supabase
        .from('developers').update(payload).eq('id', editing.id).select().single()
      if (e) { setError(e.message); setSaving(false); return }
      setDevs(prev => prev.map(d => d.id === editing.id ? data : d))
    } else {
      const { data, error: e } = await supabase
        .from('developers').insert(payload).select().single()
      if (e) { setError(e.message); setSaving(false); return }
      setDevs(prev => [...prev, data])
    }
    setSaving(false); setShowModal(false)
  }

  async function toggleActive(dev: Developer) {
    const { error: e } = await supabase
      .from('developers').update({ active: !dev.active }).eq('id', dev.id)
    if (!e) setDevs(prev => prev.map(d => d.id === dev.id ? { ...d, active: !d.active } : d))
  }

  const getTierBadge = (tier: DeveloperTier) =>
    TIER_OPTIONS.find(t => t.value === tier)?.badge || 'badge-gray'
  const getTierLabel = (tier: DeveloperTier) =>
    TIER_OPTIONS.find(t => t.value === tier)?.label || tier

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search developers..."
          className="flex-1 max-w-xs"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setTierFilter('all')}
            className={cn('btn-sm rounded-lg px-3 py-1.5 text-xs border transition-colors',
              tierFilter === 'all' ? 'bg-dark-800 text-white border-dark-800' : 'bg-white text-dark-600 border-dark-200')}
          >All</button>
          {TIER_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => setTierFilter(t.value)}
              className={cn('btn-sm rounded-lg px-3 py-1.5 text-xs border transition-colors',
                tierFilter === t.value ? 'bg-dark-800 text-white border-dark-800' : 'bg-white text-dark-600 border-dark-200')}
            >{t.label}</button>
          ))}
        </div>
        <button onClick={openCreate} className="btn-primary ml-auto">
          <Plus className="w-4 h-4" /> Add developer
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Developer</th>
                <th>Tier</th>
                <th>Mortgage rule</th>
                <th>Website</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dev => (
                <tr key={dev.id}>
                  <td>
                    <div>
                      <p className="font-medium text-dark-800 text-sm">{dev.name}</p>
                      {dev.short_name && <p className="text-dark-400 text-xs">{dev.short_name}</p>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getTierBadge(dev.tier)}`}>
                      {getTierLabel(dev.tier)}
                    </span>
                  </td>
                  <td className="text-xs text-dark-500 max-w-[200px]">
                    {MORTGAGE_OPTIONS.find(m => m.value === dev.mortgage_rule)?.label || dev.mortgage_rule}
                  </td>
                  <td>
                    {dev.website ? (
                      <a href={dev.website} target="_blank" rel="noopener noreferrer"
                         className="text-gold-600 hover:underline text-xs flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Website
                      </a>
                    ) : <span className="text-dark-300 text-xs">—</span>}
                  </td>
                  <td>
                    <span className={dev.active ? 'badge-green badge' : 'badge-gray badge'}>
                      {dev.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(dev)} className="btn-ghost btn-sm p-1.5">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleActive(dev)} className="btn-ghost btn-sm p-1.5">
                        {dev.active
                          ? <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                          : <ToggleLeft className="w-3.5 h-3.5 text-dark-400" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-dark-400 text-sm">
                  No developers found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-dark-800">
                {editing ? 'Edit developer' : 'Add developer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost btn-sm p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-4 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Official name (RERA exact) *</label>
                <input value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Emaar Properties PJSC" />
                <p className="form-hint">Must match DLD/RERA records exactly</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Short name</label>
                  <input value={form.short_name}
                    onChange={e => setForm(f => ({ ...f, short_name: e.target.value }))}
                    placeholder="e.g. Emaar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tier</label>
                  <select value={form.tier}
                    onChange={e => setForm(f => ({ ...f, tier: e.target.value as DeveloperTier }))}>
                    {TIER_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mortgage rule</label>
                <select value={form.mortgage_rule}
                  onChange={e => setForm(f => ({ ...f, mortgage_rule: e.target.value as MortgageRule }))}>
                  {MORTGAGE_OPTIONS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://www.developer.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Internal notes</label>
                <textarea value={form.notes} rows={2}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes for the admin team..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editing ? 'Save changes' : 'Add developer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
