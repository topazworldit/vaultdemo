'use client'

import { useState, useEffect } from 'react'
import { Sparkles, AlertTriangle, CheckCircle, Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIInsightsPanelProps {
  property:        any
  marketData?:     any[]
  availableComps?: any[]
  onNarrativeSet?: (text: string) => void
  onCompsSet?:     (comps: any[]) => void
}

export default function AIInsightsPanel({
  property, marketData = [], availableComps = [],
  onNarrativeSet, onCompsSet
}: AIInsightsPanelProps) {
  const [loading, setLoading]         = useState(false)
  const [narrative, setNarrative]     = useState('')
  const [anomaly, setAnomaly]         = useState<any>(null)
  const [selectedComps, setSelectedComps] = useState<any[]>([])
  const [error, setError]             = useState<string | null>(null)
  const [expanded, setExpanded]       = useState(true)
  const [editingNarrative, setEditingNarrative] = useState(false)
  const [editedText, setEditedText]   = useState('')

  useEffect(() => {
    if (property?.asking_price_aed) {
      runAnalysis()
    }
  }, [])

  async function runAnalysis() {
    setLoading(true); setError(null)
    try {
      // Run anomaly check and narrative in parallel
      const [anomalyRes, narrativeRes, compsRes] = await Promise.all([
        // Anomaly detection
        fetch('/api/ai/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'anomaly', property, marketData }),
        }).then(r => r.json()),

        // Narrative generation
        fetch('/api/ai/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'narrative', property }),
        }).then(r => r.json()),

        // Smart comparables (only if comps available)
        availableComps.length > 0 ? fetch('/api/ai/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'comparables', property, availableComps }),
        }).then(r => r.json()) : Promise.resolve({ comparables: [] }),
      ])

      setAnomaly(anomalyRes)
      setNarrative(narrativeRes.narrative || '')
      setEditedText(narrativeRes.narrative || '')
      setSelectedComps(compsRes.comparables || [])

      if (narrativeRes.narrative && onNarrativeSet) {
        onNarrativeSet(narrativeRes.narrative)
      }
      if (compsRes.comparables?.length > 0 && onCompsSet) {
        onCompsSet(compsRes.comparables)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function applyNarrativeEdit() {
    setNarrative(editedText)
    setEditingNarrative(false)
    if (onNarrativeSet) onNarrativeSet(editedText)
  }

  if (!property?.asking_price_aed) return null

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-dark-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gold-50 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-gold-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-dark-800">AI Analysis</p>
            <p className="text-xs text-dark-400">Investment narrative · Comparables · Anomaly check</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 text-dark-400 animate-spin" />}
          {!loading && anomaly?.anomaly && (
            <span className={cn('badge text-xs',
              anomaly.severity === 'high' ? 'badge-red' :
              anomaly.severity === 'medium' ? 'badge-amber' : 'badge-gray'
            )}>
              {anomaly.severity} severity
            </span>
          )}
          {!loading && !anomaly?.anomaly && anomaly && (
            <span className="badge badge-green text-xs">All clear</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-dark-400" /> : <ChevronDown className="w-4 h-4 text-dark-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-dark-100 divide-y divide-dark-100">

          {/* Loading state */}
          {loading && (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 text-gold-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-dark-500">Claude is analysing this property...</p>
              <p className="text-xs text-dark-400 mt-1">Checking price anomalies · Writing narrative · Selecting comparables</p>
            </div>
          )}

          {error && (
            <div className="p-5">
              <p className="text-sm text-red-600">{error}</p>
              <button onClick={runAnalysis} className="btn-secondary btn-sm mt-2">Retry</button>
            </div>
          )}

          {/* Anomaly check */}
          {!loading && anomaly && (
            <div className="p-5">
              <p className="text-xs font-medium text-dark-500 uppercase tracking-wide mb-3">Price & Data Validation</p>
              <div className={cn(
                'rounded-lg p-4 flex items-start gap-3',
                anomaly.anomaly
                  ? anomaly.severity === 'high' ? 'bg-red-50 border border-red-200'
                  : 'bg-amber-50 border border-amber-200'
                  : 'bg-green-50 border border-green-200'
              )}>
                {anomaly.anomaly
                  ? <AlertTriangle className={cn('w-5 h-5 shrink-0 mt-0.5',
                      anomaly.severity === 'high' ? 'text-red-500' : 'text-amber-500')} />
                  : <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className={cn('text-sm font-medium',
                    anomaly.anomaly
                      ? anomaly.severity === 'high' ? 'text-red-700' : 'text-amber-700'
                      : 'text-green-700'
                  )}>
                    {anomaly.message}
                  </p>
                  {anomaly.flags?.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {anomaly.flags.map((f: string, i: number) => (
                        <li key={i} className="text-xs text-dark-600">· {f}</li>
                      ))}
                    </ul>
                  )}
                  {anomaly.recommendation && (
                    <p className="text-xs text-dark-500 mt-2 italic">{anomaly.recommendation}</p>
                  )}
                  {anomaly.storedPsf && (
                    <p className="text-xs text-dark-400 mt-2">
                      Market avg: AED {Number(anomaly.storedPsf).toLocaleString()} psf ·
                      Entered: AED {Number(anomaly.enteredPsf).toLocaleString()} psf ·
                      Deviation: {anomaly.deviation}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Smart comparables */}
          {!loading && selectedComps.length > 0 && (
            <div className="p-5">
              <p className="text-xs font-medium text-dark-500 uppercase tracking-wide mb-3">
                Smart Comparables <span className="text-gold-500 ml-1">AI selected</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {selectedComps.map((comp: any, i: number) => (
                  <div key={i} className="rounded-lg border border-dark-150 p-3">
                    <p className="text-xs font-medium text-dark-700 truncate">{comp.project_name}</p>
                    <p className="text-xs text-dark-400">{comp.community_name} · {comp.bedrooms}BR</p>
                    <p className="text-sm font-medium text-gold-600 mt-1">
                      AED {Number(comp.psf_aed).toLocaleString()} psf
                    </p>
                    <p className="text-xs text-dark-300">{comp.psf_source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investment narrative */}
          {!loading && narrative && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-dark-500 uppercase tracking-wide">
                  Investment Narrative <span className="text-gold-500 ml-1">AI drafted</span>
                </p>
                <div className="flex gap-2">
                  <button onClick={runAnalysis} className="btn-ghost btn-sm p-1" title="Regenerate">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingNarrative(!editingNarrative); setEditedText(narrative) }}
                    className="btn-ghost btn-sm text-xs"
                  >
                    {editingNarrative ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>

              {editingNarrative ? (
                <div>
                  <textarea
                    value={editedText}
                    onChange={e => setEditedText(e.target.value)}
                    rows={8}
                    className="w-full text-sm"
                  />
                  <button onClick={applyNarrativeEdit} className="btn-primary btn-sm mt-2">
                    Use this narrative
                  </button>
                </div>
              ) : (
                <p className="text-sm text-dark-600 leading-relaxed whitespace-pre-line">
                  {narrative}
                </p>
              )}
              <p className="text-xs text-dark-300 mt-3">
                This narrative will appear on the investment analysis page of the PDF. Edit to personalise.
              </p>
            </div>
          )}

          {/* Re-run button */}
          {!loading && (narrative || anomaly) && (
            <div className="p-4 bg-dark-25">
              <button onClick={runAnalysis} className="btn-secondary btn-sm w-full">
                <RefreshCw className="w-3.5 h-3.5" /> Re-run AI analysis
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
