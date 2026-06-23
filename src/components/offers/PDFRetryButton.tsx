'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'

export default function PDFRetryButton({ offerId }: { offerId: string }) {
  const [retrying, setRetrying] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router = useRouter()

  async function handleRetry() {
    setRetrying(true)
    setError(null)
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'PDF generation failed')
      }
      // Refresh page to show new PDF URL
      setTimeout(() => {
        router.refresh()
        setRetrying(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setRetrying(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleRetry}
        disabled={retrying}
        className="btn-primary"
      >
        {retrying
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
          : <><RefreshCw className="w-4 h-4" /> Generate PDF</>}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
