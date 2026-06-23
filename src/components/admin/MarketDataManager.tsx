'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Edit2, AlertTriangle, CheckCircle, Clock, X, Loader2 } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'

interface MarketDataRow {
  project_name:     string
  developer_name:   string
  community_name:   string
  bedroom_label:    string
  psf_aed:          number
  psf_source:       string | null
  psf_status:       string
  updated_at:       string
  days_since_update: number
  updated_by_name:  string | null
}

interface Project {
  id:          string
  name:        string
  developer:   { name: string; short_name: string } | null
  community:   { name: string } | null
}

interface MarketDataManagerProps {
  marketData: MarketDataRow[]
  projects:   Project[]
}

interface PSFForm {
  project_id:     string
  bedroom_label:  string
  bedrooms:       string
  psf_aed:        string
  psf_source:     string
}

const BEDROOM_OPTIONS = [
  { value: '',    label: 'All types' },
  { value: '0',   label: 'Studio' },
  { value: '1',   label: '1 BR' },
  { value: '2',   label: '2 BR' },
  { value: '3',   label: '3 BR' },
  { value: '4',   label: '4 BR' },
  { value: '5',   label: '5 BR' },
  { value: '6',   label: '6 BR+' },
]

export default function MarketDataManager({ marketData: initialData, projects }: MarketDataManagerProps) {
  const supabase = createClient()

  const [data, setData]         = useState(initialData)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState<PSFForm>({
    project_id: '', bedroom_label: '', bedrooms: '', psf_aed: '', psf_source: ''
  })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const statusCounts = {
    fresh:  data.filter(d => d.psf_status === 'fresh').length,
    stale:  data.filter(d => d.psf_status === 'stale').length,
    expired: data.filter(d => d.psf_status === 'expired').length,
  }

  async function handleSave() {
    if (!form.project_id || !form.psf_aed) {
      setError('Project and PSF are required')
      return
    }
    setSaving(true)
    setError(null)

    const psf = parseFloat(form.psf_aed)
    if (isNaN(psf) || psf <= 0) {
      setError('Invalid PSF value')
      setSaving(false)
      return
    }

    const bedroomsVal = form.bedrooms !== '' ? parseInt(form.bedrooms) : null
    const bedroomLabel = form.bedroom_label || BEDROOM_OPTIONS.find(o => o.value === form.bedrooms)?.label || 'All'

    const { error: upsertError } = await supabase
      .from('market_data')
      .upsert({
        project_id:    form.project_id,
        bedrooms:      bedroomsVal,
        bedroom_label: bedroomLabel,
        psf_aed:       psf,
        psf_source:    form.psf_source || null,
        valid_from:    new Date().toISOString().split('T')[0],
      }, {
        onConflict: 'project_id,bedrooms',
      })

    if (upsertError) {
      setError(upsertError.message)
      setSaving(false)
      return
    }

    // Refresh data
    const { data: newData } = await supabase
      .from('v_market_data_health')
      .select('*')
      .order('psf_status', { ascending: false })

    setData(newData || [])
    setShowModal(false)
    setSaving(false)
    setForm({ project_id: '', bedroom_label: '', bedrooms: '', psf_aed: '', psf_source: '' })
  }

  function StatusIcon({ status }: { status: string }) {
    if (status === 'fresh')   return <CheckCircle className="w-3.5 h-3.5 text-green-500" />
    if (status === 'stale')   return <Clock className="w-3.5 h-3.5 text-amber-500" />
    return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
  }

  return (
    <div>
      {/* Health summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-lg font-medium text-dark-800">{statusCounts.fresh}</p>
            <p className="text-xs text-dark-400">Fresh (&lt;30 days)</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-lg font-medium text-dark-800">{statusCounts.stale}</p>
            <p className="text-xs text-dark-400">Stale (30–60 days)</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-lg font-medium text-dark-800">{statusCounts.expired}</p>
            <p className="text-xs text-dark-400">Expired (&gt;60 days)</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add PSF data
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Developer</th>
                <th>Type</th>
                <th>PSF (AED)</th>
                <th>Source</th>
                <th>Status</th>
                <th>Updated</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-dark-400 text-sm">
                    No PSF data yet. Add your first entry above.
                  </td>
                </tr>
              ) : data.map((row, i) => (
                <tr key={i}>
                  <td>
                    <p className="font-medium text-dark-800 text-sm">{row.project_name}</p>
                    <p className="text-dark-400 text-xs">{row.community_name}</p>
                  </td>
                  <td className="text-sm text-dark-600">{row.developer_name}</td>
                  <td className="text-sm">{row.bedroom_label || 'All'}</td>
                  <td className="font-medium text-dark-800">
                    AED {Math.round(row.psf_aed).toLocaleString()}
                  </td>
                  <td className="text-xs text-dark-400">{row.psf_source || '—'}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={row.psf_status} />
                      <span className={cn(
                        'text-xs font-medium',
                        row.psf_status === 'fresh'   ? 'text-green-600' :
                        row.psf_status === 'stale'   ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {row.days_since_update}d ago
                      </span>
                    </div>
                  </td>
                  <td className="text-xs text-dark-400">{formatDate(row.updated_at)}</td>
                  <td className="text-xs text-dark-500">{row.updated_by_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add PSF modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-dark-800">Add / update PSF</h2>
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
                <label className="form-label">Project</label>
                <select
                  value={form.project_id}
                  onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
                >
                  <option value="">Select project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.community?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Bedroom type</label>
                  <select
                    value={form.bedrooms}
                    onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
                  >
                    {BEDROOM_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PSF (AED)</label>
                  <input
                    type="number"
                    value={form.psf_aed}
                    onChange={e => setForm(f => ({ ...f, psf_aed: e.target.value }))}
                    placeholder="e.g. 2832"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Source</label>
                <input
                  value={form.psf_source}
                  onChange={e => setForm(f => ({ ...f, psf_source: e.target.value }))}
                  placeholder="e.g. Bayut Apr 2026 / DLD Q1 2026"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save PSF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
