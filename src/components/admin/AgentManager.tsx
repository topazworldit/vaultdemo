'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { UserPlus, Edit2, ToggleLeft, ToggleRight, X, Loader2, CheckCircle } from 'lucide-react'
import { formatDate, formatRelative, cn } from '@/lib/utils'
import type { Agent, AgentRole } from '@/types'

const ROLE_OPTIONS: { value: AgentRole; label: string }[] = [
  { value: 'agent',        label: 'Agent' },
  { value: 'senior_agent', label: 'Senior Agent' },
  { value: 'admin',        label: 'Admin' },
  { value: 'super_admin',  label: 'Super Admin' },
]

const ROLE_BADGES: Record<AgentRole, string> = {
  agent:        'badge-gray',
  senior_agent: 'badge-blue',
  admin:        'badge-amber',
  super_admin:  'badge-gold',
}

interface AgentManagerProps {
  agents: Agent[]
  currentAgentRole: AgentRole
}

interface AgentForm {
  full_name:    string
  email:        string
  role:         AgentRole
  title:        string
  phone:        string
  rera_number:  string
  rera_expiry:  string
}

const EMPTY_FORM: AgentForm = {
  full_name:   '',
  email:       '',
  role:        'agent',
  title:       'Investment Advisor',
  phone:       '',
  rera_number: '',
  rera_expiry: '',
}

export default function AgentManager({ agents: initialAgents, currentAgentRole }: AgentManagerProps) {
  const supabase = createClient()
  const router   = useRouter()

  const [agents, setAgents]     = useState(initialAgents)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState<Agent | null>(null)
  const [form, setForm]         = useState<AgentForm>(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError(null)
    setTempPassword(null)
    setShowModal(true)
  }

  function openEdit(agent: Agent) {
    setEditing(agent)
    setForm({
      full_name:   agent.full_name,
      email:       agent.email,
      role:        agent.role,
      title:       agent.title || 'Investment Advisor',
      phone:       agent.phone || '',
      rera_number: agent.rera_number || '',
      rera_expiry: agent.rera_expiry || '',
    })
    setError(null)
    setTempPassword(null)
    setShowModal(true)
  }

  async function handleSave() {
    setError(null)
    setSaving(true)

    if (!form.full_name || !form.email) {
      setError('Name and email are required')
      setSaving(false)
      return
    }

    try {
      if (editing) {
        // Update existing agent
        const { error: updateError } = await supabase
          .from('agents')
          .update({
            full_name:   form.full_name,
            role:        form.role,
            title:       form.title,
            phone:       form.phone || null,
            rera_number: form.rera_number || null,
            rera_expiry: form.rera_expiry || null,
          })
          .eq('id', editing.id)

        if (updateError) throw updateError

        setAgents(prev => prev.map(a =>
          a.id === editing.id ? { ...a, ...form } : a
        ))
        setSuccess('Agent updated successfully')
      } else {
        // Create new agent via API route
        const res = await fetch('/api/admin/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error)

        setTempPassword(result.temp_password)
        setAgents(prev => [result.agent, ...prev])
        setSuccess('Agent created successfully')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save agent')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(agent: Agent) {
    const { error } = await supabase
      .from('agents')
      .update({ active: !agent.active })
      .eq('id', agent.id)

    if (!error) {
      setAgents(prev => prev.map(a =>
        a.id === agent.id ? { ...a, active: !a.active } : a
      ))
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Add agent
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Role</th>
                <th>RERA</th>
                <th>Phone</th>
                <th>Last login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-xs font-medium text-gold-700 shrink-0">
                        {agent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-dark-800 text-sm">{agent.full_name}</p>
                        <p className="text-dark-400 text-xs">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ROLE_BADGES[agent.role]}`}>
                      {ROLE_OPTIONS.find(r => r.value === agent.role)?.label}
                    </span>
                  </td>
                  <td>
                    {agent.rera_number ? (
                      <div>
                        <p className="text-xs font-mono text-dark-700">{agent.rera_number}</p>
                        {agent.rera_expiry && (
                          <p className={`text-xs ${
                            new Date(agent.rera_expiry) < new Date()
                              ? 'text-red-500' : 'text-dark-400'
                          }`}>
                            Exp: {formatDate(agent.rera_expiry)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-dark-300 text-xs">Not set</span>
                    )}
                  </td>
                  <td className="text-sm text-dark-600">{agent.phone || '—'}</td>
                  <td className="text-xs text-dark-400">
                    {agent.last_login_at ? formatRelative(agent.last_login_at) : 'Never'}
                  </td>
                  <td>
                    <span className={agent.active ? 'badge-green badge' : 'badge-gray badge'}>
                      {agent.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(agent)}
                        className="btn-ghost btn-sm p-1.5"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleActive(agent)}
                        className="btn-ghost btn-sm p-1.5"
                        title={agent.active ? 'Suspend' : 'Activate'}
                      >
                        {agent.active
                          ? <ToggleRight className="w-3.5 h-3.5 text-green-500" />
                          : <ToggleLeft className="w-3.5 h-3.5 text-dark-400" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-dark-800">
                {editing ? 'Edit agent' : 'Add new agent'}
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

            {tempPassword && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 mb-4">
                <p className="text-sm font-medium text-green-700 mb-1">Agent created successfully</p>
                <p className="text-xs text-green-600 mb-2">
                  Share these credentials with the agent. They should change their password on first login.
                </p>
                <p className="text-xs font-mono bg-white border border-green-200 rounded px-2 py-1">
                  Temporary password: <strong>{tempPassword}</strong>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group col-span-2">
                  <label className="form-label">Full name</label>
                  <input
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Ahmad Shannak"
                  />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="ahmad@topazworldgroup.com"
                    disabled={!!editing}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value as AgentRole }))}
                    disabled={currentAgentRole !== 'super_admin' && form.role === 'super_admin'}
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Investment Advisor"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+971 50 000 0000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">RERA number</label>
                  <input
                    value={form.rera_number}
                    onChange={e => setForm(f => ({ ...f, rera_number: e.target.value }))}
                    placeholder="RERA-XXXXX"
                  />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">RERA expiry date</label>
                  <input
                    type="date"
                    value={form.rera_expiry}
                    onChange={e => setForm(f => ({ ...f, rera_expiry: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                {tempPassword ? 'Done' : 'Cancel'}
              </button>
              {!tempPassword && (
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : editing ? 'Save changes' : 'Create agent'
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
