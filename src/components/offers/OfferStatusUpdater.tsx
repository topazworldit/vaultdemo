'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { OfferStatus } from '@/types'

const STATUS_OPTIONS: { value: OfferStatus; label: string }[] = [
  { value: 'generated', label: 'Generated' },
  { value: 'sent',      label: 'Sent to client' },
  { value: 'accepted',  label: 'Accepted' },
  { value: 'rejected',  label: 'Rejected' },
  { value: 'expired',   label: 'Expired' },
]

const STATUS_COLORS: Record<OfferStatus, string> = {
  draft:     'badge-gray',
  generated: 'badge-blue',
  sent:      'badge-amber',
  accepted:  'badge-green',
  rejected:  'badge-red',
  expired:   'badge-gray',
}

export default function OfferStatusUpdater({
  offerId,
  currentStatus,
}: {
  offerId: string
  currentStatus: OfferStatus
}) {
  const [status, setStatus] = useState(currentStatus)
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()
  const router   = useRouter()

  async function updateStatus(newStatus: OfferStatus) {
    if (newStatus === status) return
    setUpdating(true)
    await supabase
      .from('offers')
      .update({ status: newStatus })
      .eq('id', offerId)
    setStatus(newStatus)
    setUpdating(false)
    router.refresh()
  }

  const currentOption = STATUS_OPTIONS.find(o => o.value === status)

  return (
    <div className="flex items-center gap-2">
      <span className={`badge ${STATUS_COLORS[status]}`}>
        {currentOption?.label || status}
      </span>
      <select
        value={status}
        onChange={e => updateStatus(e.target.value as OfferStatus)}
        disabled={updating}
        className="text-xs border-dark-200 rounded-lg py-1.5 pl-2 pr-6 text-dark-600"
        style={{ width: 'auto' }}
      >
        {STATUS_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
