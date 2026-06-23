'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { UserPlus, X, Loader2, Phone, Mail, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Client } from '@/types'

interface ClientManagerProps {
  clients:  Client[]
  agentId:  string
}

interface ClientForm {
  full_name:   string
  email:       string
  phone:       string
  whatsapp:    string
  nationality: string
  notes:       string
  budget_min:  string
  budget_max:  string
}

const EMPTY_FORM: ClientForm = {
  full_name: '', email: '', phone: '', whatsapp: '',
  nationality: '', notes: '', budget_min: '', budget_max: '',
}

export default function ClientManager({ clients: initial, agentId }: ClientManagerProps) {
  const supabase = createClient()
  const [clients, setClients]     = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Client | null>(null)
  const [form, setForm]           = useState<ClientForm>(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [search, setSearch]       = useState('')

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.nationality || '').toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError(null)
    setShowModal(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setForm({
      full_name:   client.full_name,
      email:       client.email || '',
      phone:       client.phone || '',
      whatsapp:    client.whatsapp || '',
      nationality: client.nationality || '',
      notes:       client.notes || '',
      budget_min:  client.budget_min_aed?.toString() || '',
      budget_max:  client.budget_max_aed?.toString() || '',
    })
    setError(null)
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.full_name) { setError('Name is required'); return }
    if (!form.email && !form.phone && !form.whatsapp) {
      setError('At least one contact method (email, phone, or WhatsApp) is required')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      agent_id:      agentId,
      full_name:     form.full_name,
      email:         form.email || null,
      phone:         form.phone || null,
      whatsapp:      form.whatsapp || null,
      nationality:   form.nationality || null,
      notes:         form.notes || null,
      budget_min_aed: form.budget_min ? parseInt(form.budget_min.replace(/,/g, '')) : null,
      budget_max_aed: form.budget_max ? parseInt(form.budget_max.replace(/,/g, '')) : null,
    }

    if (editing) {
      const { data, error: e } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()
      if (e) { setError(e.message); setSaving(false); return }
      setClients(prev => prev.map(c => c.id === editing.id ? data : c))
    } else {
      const { data, error: e } = await supabase
        .from('clients')
        .insert(payload)
        .select()
        .single()
      if (e) { setError(e.message); setSaving(false); return }
      setClients(prev => [data, ...prev])
    }

    setSaving(false)
    setShowModal(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="flex-1 max-w-xs"
        />
        <button onClick={openCreate} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Add client
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <UserPlus className="empty-state-icon" />
          <p className="empty-state-title">{search ? 'No clients found' : 'No clients yet'}</p>
          <p className="empty-state-text mb-6">
            {search ? 'Try a different search' : 'Add clients to link them to your offers'}
          </p>
          {!search && (
            <button onClick={openCreate} className="btn-primary btn-sm">Add first client</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <div
              key={client.id}
              className="card-hover p-5"
              onClick={() => openEdit(client)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-sm font-medium text-gold-700">
                    {client.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-dark-800 text-sm">{client.full_name}</p>
                    {client.nationality && (
                      <p className="text-xs text-dark-400">{client.nationality}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs text-dark-500">
                    <Phone className="w-3 h-3" /> {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-dark-500 truncate">
                    <Mail className="w-3 h-3" /> {client.email}
                  </div>
                )}
                {(client.budget_min_aed || client.budget_max_aed) && (
                  <p className="text-xs text-gold-600 font-medium mt-2">
                    Budget: {client.budget_min_aed ? `AED ${client.budget_min_aed.toLocaleString()}` : ''}
                    {client.budget_min_aed && client.budget_max_aed ? ' – ' : ''}
                    {client.budget_max_aed ? `AED ${client.budget_max_aed.toLocaleString()}` : ''}
                  </p>
                )}
                {client.notes && (
                  <p className="text-xs text-dark-400 mt-2 truncate">{client.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-dark-800">
                {editing ? 'Edit client' : 'Add client'}
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
                <label className="form-label">Full name *</label>
                <input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Mohammed Al Rashid"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+971 50 000 0000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="+971 50 000 0000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="client@email.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nationality</label>
                <input
                  value={form.nationality}
                  onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                  placeholder="e.g. UAE, UK, India"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Min budget (AED)</label>
                  <input
                    value={form.budget_min}
                    onChange={e => setForm(f => ({ ...f, budget_min: e.target.value }))}
                    placeholder="e.g. 5,000,000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max budget (AED)</label>
                  <input
                    value={form.budget_max}
                    onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))}
                    placeholder="e.g. 20,000,000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Preferences, requirements, follow-up notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : editing ? 'Save changes' : 'Add client'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
