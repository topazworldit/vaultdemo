'use client'

import { useState } from 'react'
import { RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Check, Loader2, Database, Zap } from 'lucide-react'
import { cn, formatAED } from '@/lib/utils'

interface MarketIntelDashboardProps {
  marketData:  any[]
  alerts:      any[]
  communities: any[]
  lastSync:    string | null
}

export default function MarketIntelDashboard({
  marketData, alerts: initialAlerts, communities, lastSync
}: MarketIntelDashboardProps) {
  const [syncing, setSyncing]     = useState(false)
  const [syncTarget, setSyncTarget] = useState<string>('all')
  const [syncResult, setSyncResult] = useState<any>(null)
  const [alerts, setAlerts]       = useState(initialAlerts)
  const [liveData, setLiveData]   = useState(marketData)
  const [txData, setTxData]       = useState<any[]>([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<string>('')
  const [selectedBedrooms, setSelectedBedrooms]   = useState<string>('')

  async function handleSync() {
    setSyncing(true); setSyncResult(null)
    try {
      const body = syncTarget === 'all'
        ? { all: true }
        : { community_id: syncTarget }
      const res = await fetch('/api/bayut/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setSyncResult(data)
      if (data.alert_details?.length > 0) {
        setAlerts(prev => [...data.alert_details, ...prev])
      }
    } catch (err: any) {
      setSyncResult({ error: err.message })
    } finally {
      setSyncing(false)
    }
  }

  async function loadTransactions() {
    if (!selectedCommunity) return
    setLoadingTx(true); setTxData([])
    try {
      const params = new URLSearchParams({ community: selectedCommunity, months: '12' })
      if (selectedBedrooms) params.set('bedrooms', selectedBedrooms)
      const res = await fetch(`/api/bayut/transactions?${params}`)
      const data = await res.json()
      setTxData(data.transactions || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingTx(false)
    }
  }

  async function resolveAlert(idx: number) {
    setAlerts(prev => prev.filter((_, i) => i !== idx))
  }

  // Group market data by community
  const grouped = liveData.reduce((acc: any, row: any) => {
    const name = row.community?.name || 'Unknown'
    if (!acc[name]) acc[name] = []
    acc[name].push(row)
    return acc
  }, {})

  const BR_LABELS: Record<number, string> = { 1: '1 BR', 2: '2 BR', 3: '3 BR', 4: '4 BR', 5: '5+ BR' }

  return (
    <div className="space-y-6">

      {/* Alerts banner */}
      {alerts.length > 0 && (
        <div className="card p-5 border-l-4 border-amber-400 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">{alerts.length} price alert{alerts.length > 1 ? 's' : ''} — market moved &gt;10% from stored PSF</p>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-amber-200">
                <div className="flex items-center gap-3">
                  {alert.direction === 'up'
                    ? <TrendingUp className="w-4 h-4 text-green-500" />
                    : <TrendingDown className="w-4 h-4 text-red-500" />}
                  <div>
                    <p className="text-sm font-medium text-dark-800">
                      {alert.community} · {alert.bedrooms} BR
                    </p>
                    <p className="text-xs text-dark-500">
                      Stored: AED {alert.stored_psf?.toLocaleString()} psf →
                      New: AED {alert.new_psf?.toLocaleString()} psf
                      <span className={cn('ml-2 font-medium', alert.direction === 'up' ? 'text-green-600' : 'text-red-600')}>
                        ({alert.direction === 'up' ? '+' : '-'}{alert.deviation_pct}%)
                      </span>
                    </p>
                  </div>
                </div>
                <button onClick={() => resolveAlert(i)} className="btn-ghost btn-sm p-1">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync controls */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-gold-600" />
          <p className="text-sm font-medium text-dark-700">Bayut API Sync</p>
          <span className="badge badge-gray ml-auto">Live DLD data</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={syncTarget}
            onChange={e => setSyncTarget(e.target.value)}
            className="w-56"
          >
            <option value="all">All communities</option>
            {communities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-primary"
          >
            {syncing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing...</>
              : <><RefreshCw className="w-4 h-4" /> Sync now</>}
          </button>
          <p className="text-xs text-dark-400">
            {lastSync
              ? `Last sync: ${new Date(lastSync).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
              : 'Never synced — click to pull live DLD data'}
          </p>
        </div>

        {syncResult && (
          <div className={cn(
            'mt-4 rounded-lg p-4 text-sm',
            syncResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'
          )}>
            {syncResult.error ? (
              <p>Error: {syncResult.error}</p>
            ) : (
              <div>
                <p className="font-medium mb-1">
                  ✅ Sync complete — {syncResult.synced} PSF records updated
                  {syncResult.alerts > 0 && `, ${syncResult.alerts} price alerts generated`}
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {syncResult.results?.slice(0, 9).map((r: any, i: number) => (
                    <div key={i} className="text-xs">
                      {r.status === 'updated'
                        ? `✅ ${r.community} ${r.bedrooms}BR: AED ${r.psf?.toLocaleString()} psf (${r.txCount} tx)`
                        : `⚠ ${r.community}: ${r.status}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live transaction explorer */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-gold-600" />
          <p className="text-sm font-medium text-dark-700">Live Transaction Explorer</p>
        </div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <select value={selectedCommunity} onChange={e => setSelectedCommunity(e.target.value)} className="w-56">
            <option value="">Select community...</option>
            {communities.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select value={selectedBedrooms} onChange={e => setSelectedBedrooms(e.target.value)} className="w-32">
            <option value="">All BR</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BR</option>)}
          </select>
          <button
            onClick={loadTransactions}
            disabled={!selectedCommunity || loadingTx}
            className="btn-secondary"
          >
            {loadingTx ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : 'Load transactions'}
          </button>
        </div>

        {txData.length > 0 && (
          <div className="overflow-auto max-h-64">
            <table className="table text-xs">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bedrooms</th>
                  <th>Area (sqft)</th>
                  <th>Price</th>
                  <th>AED/sqft</th>
                  <th>Project</th>
                </tr>
              </thead>
              <tbody>
                {txData.map((tx, i) => (
                  <tr key={i}>
                    <td>{tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('en-AE') : '—'}</td>
                    <td>{tx.rooms} BR</td>
                    <td>{tx.area?.toLocaleString()}</td>
                    <td className="font-medium">AED {tx.price?.toLocaleString()}</td>
                    <td className="text-gold-600 font-medium">AED {tx.pricePerSqFt?.toLocaleString()}</td>
                    <td className="text-dark-400">{tx.project || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PSF table by community */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-dark-100">
          <p className="text-sm font-medium text-dark-700">Stored PSF by community</p>
          <p className="text-xs text-dark-400">Auto-updated from Bayut DLD sync · Manually editable below</p>
        </div>
        <div className="overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Community</th>
                {[1,2,3,4,5].map(n => <th key={n}>{n} BR</th>)}
                <th>Source</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([name, rows]: any) => {
                const byBR: Record<number, any> = {}
                rows.forEach((r: any) => { byBR[r.bedrooms] = r })
                return (
                  <tr key={name}>
                    <td className="font-medium text-dark-800 text-sm">{name}</td>
                    {[1,2,3,4,5].map(br => (
                      <td key={br}>
                        {byBR[br] ? (
                          <span className={cn(
                            'text-sm font-medium',
                            byBR[br].psf_status === 'fresh' ? 'text-dark-800' :
                            byBR[br].psf_status === 'stale' ? 'text-amber-600' : 'text-red-500'
                          )}>
                            {byBR[br].psf_aed?.toLocaleString()}
                          </span>
                        ) : <span className="text-dark-300">—</span>}
                      </td>
                    ))}
                    <td>
                      <span className="text-xs text-dark-400">
                        {rows[0]?.data_source === 'bayut_api' ? '🔴 Live' : '✏️ Manual'}
                      </span>
                    </td>
                    <td className="text-xs text-dark-400">
                      {rows[0]?.updated_at ? new Date(rows[0].updated_at).toLocaleDateString('en-AE') : '—'}
                    </td>
                  </tr>
                )
              })}
              {Object.keys(grouped).length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-dark-400 text-sm">
                  No market data yet — click "Sync now" to pull live data from Bayut
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
