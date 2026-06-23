'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Camera, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from '@/types'

export default function AgentProfile({ agent }: { agent: Agent }) {
  const supabase  = createClient()
  const router    = useRouter()
  const fileRef   = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name:    agent.full_name,
    display_name: agent.display_name || '',
    title:        agent.title || 'Investment Advisor',
    phone:        agent.phone || '',
    whatsapp:     agent.whatsapp || '',
    rera_number:  agent.rera_number || '',
    rera_expiry:  agent.rera_expiry || '',
    office_address: agent.office_address || '',
  })
  const [photoUrl, setPhotoUrl]   = useState(agent.photo_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Password change
  const [showPwSection, setShowPwSection] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [pwSaving, setPwSaving]   = useState(false)
  const [pwError, setPwError]     = useState<string | null>(null)
  const [pwSaved, setPwSaved]     = useState(false)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `agent-photos/${agent.id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('documents').upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) { setError(uploadError.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
    setPhotoUrl(urlData.publicUrl)
    await supabase.from('agents').update({ photo_url: urlData.publicUrl }).eq('id', agent.id)
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true); setError(null); setSaved(false)
    const { error: e } = await supabase
      .from('agents').update({
        full_name:      form.full_name,
        display_name:   form.display_name || null,
        title:          form.title,
        phone:          form.phone || null,
        whatsapp:       form.whatsapp || null,
        rera_number:    form.rera_number || null,
        rera_expiry:    form.rera_expiry || null,
        office_address: form.office_address || null,
      }).eq('id', agent.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  async function handlePasswordChange() {
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    if (newPw.length < 8)    { setPwError('Password must be at least 8 characters'); return }
    setPwSaving(true); setPwError(null)
    const { error: e } = await supabase.auth.updateUser({ password: newPw })
    if (e) { setPwError(e.message); setPwSaving(false); return }
    setPwSaving(false); setPwSaved(true)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setTimeout(() => { setPwSaved(false); setShowPwSection(false) }, 3000)
  }

  const initials = form.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      {/* Photo + name card */}
      <div className="card p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gold-100 flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt={form.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gold-700 text-xl font-medium">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold-500 hover:bg-gold-600
                         flex items-center justify-center shadow-sm transition-colors"
            >
              {uploading
                ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                : <Camera className="w-3.5 h-3.5 text-white" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div>
            <p className="text-base font-medium text-dark-800">{form.full_name}</p>
            <p className="text-sm text-dark-400">{form.title}</p>
            <p className="text-xs text-dark-400">{agent.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group col-span-2 md:col-span-1">
            <label className="form-label">Full name (on PDF)</label>
            <input value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div className="form-group col-span-2 md:col-span-1">
            <label className="form-label">Display name (optional)</label>
            <input value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              placeholder="e.g. Ahmad (used in app greetings)" />
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Title (on PDF)</label>
            <input value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Senior Investment Advisor" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone (on PDF)</label>
            <input value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+971 50 000 0000" />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input value={form.whatsapp}
              onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
              placeholder="+971 50 000 0000" />
          </div>
        </div>
      </div>

      {/* RERA details */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-dark-700 mb-4">RERA certification</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">RERA number</label>
            <input value={form.rera_number}
              onChange={e => setForm(f => ({ ...f, rera_number: e.target.value }))}
              placeholder="RERA-XXXXX" />
          </div>
          <div className="form-group">
            <label className="form-label">RERA expiry date</label>
            <input type="date" value={form.rera_expiry}
              onChange={e => setForm(f => ({ ...f, rera_expiry: e.target.value }))} />
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">Office address (on PDF)</label>
            <input value={form.office_address}
              onChange={e => setForm(f => ({ ...f, office_address: e.target.value }))}
              placeholder="Happiness Street, City Walk Building 5, Dubai, UAE" />
          </div>
        </div>
      </div>

      {/* Error + save */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
         : saved  ? <><CheckCircle className="w-4 h-4 text-green-400" /> Saved</>
         : 'Save profile'}
      </button>

      {/* Password change */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-700">Password</p>
            <p className="text-xs text-dark-400">Change your login password</p>
          </div>
          <button onClick={() => setShowPwSection(!showPwSection)} className="btn-secondary btn-sm">
            {showPwSection ? 'Cancel' : 'Change password'}
          </button>
        </div>

        {showPwSection && (
          <div className="mt-4 space-y-3">
            {pwError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {pwError}
              </div>
            )}
            {pwSaved && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Password updated successfully
              </div>
            )}
            <div className="relative form-group">
              <label className="form-label">New password</label>
              <input type={showPw ? 'text' : 'password'} value={newPw}
                onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters"
                className="pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-8 text-dark-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input type={showPw ? 'text' : 'password'} value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" />
            </div>
            <button onClick={handlePasswordChange} disabled={pwSaving || !newPw || !confirmPw}
              className="btn-primary w-full">
              {pwSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
