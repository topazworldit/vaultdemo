'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function CopyShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button onClick={handleCopy} className="btn-secondary btn-sm">
      {copied
        ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
        : <><Share2 className="w-3.5 h-3.5" /> Copy link</>
      }
    </button>
  )
}
