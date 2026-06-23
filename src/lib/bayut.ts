/**
 * TOPAZBUILDER — Bayut API Client
 * Official partner API via RapidAPI
 * Base: https://uae-real-estate2.p.rapidapi.com
 */

const BAYUT_BASE = 'https://uae-real-estate2.p.rapidapi.com'

function bayutHeaders() {
  const key = process.env.BAYUT_API_KEY
  if (!key) throw new Error('BAYUT_API_KEY environment variable not set')
  return {
    'X-RapidAPI-Key':  key,
    'X-RapidAPI-Host': 'uae-real-estate2.p.rapidapi.com',
    'Content-Type':    'application/json',
  }
}

async function bayutFetch(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(`${BAYUT_BASE}${path}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v))
  }
  const res = await fetch(url.toString(), {
    headers: bayutHeaders(),
    next: { revalidate: 3600 }, // cache 1 hour
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Bayut API ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

// ── TYPES ────────────────────────────────────────────────────────

export interface BayutTransaction {
  id:             string
  price:          number
  area:           number          // sq ft
  pricePerSqFt:   number
  rooms:          number          // bedroom count
  propertyType:   string
  transactionDate: string
  location: {
    name:     string
    slug:     string
    parentId: string
  }
  project?:       string
  developer?:     string
}

export interface BayutProperty {
  id:           string
  title:        string
  price:        number
  area:         number
  rooms:        number
  baths:        number
  purpose:      'for-sale' | 'for-rent'
  category:     string
  location:     { name: string; slug: string }
  agency?:      { name: string }
  photos:       { url: string }[]
  coverPhoto?:  { url: string }
  pricePerSqFt: number
  addedDate:    string
}

export interface BayutLocation {
  id:       string
  name:     string
  slug:     string
  level:    number
  parentId: string | null
}

export interface PSFSummary {
  community:    string
  bedrooms:     number
  avgPsf:       number
  minPsf:       number
  maxPsf:       number
  txCount:      number
  latestDate:   string
  source:       'bayut_transactions'
}

// ── ENDPOINTS ────────────────────────────────────────────────────

/**
 * Search for a location slug by community name
 * Used to get the location_slug needed for transactions
 */
export async function searchLocation(query: string): Promise<BayutLocation[]> {
  const data = await bayutFetch('/locations_search', { query, hitsPerPage: 10 })
  return (data.results || []).map((loc: any) => ({
    id:       String(loc.id),
    name:     loc.name,
    slug:     loc.slug,
    level:    loc.level,
    parentId: loc.parentId ? String(loc.parentId) : null,
  }))
}

/**
 * Fetch recent sale transactions for a community
 * Returns up to 50 transactions by default
 */
export async function getTransactions(params: {
  locationSlug: string
  rooms?:       number    // 1=1BR, 2=2BR, 3=3BR, 4=4BR, 5=5BR+, 0=studio
  minDate?:     string    // YYYY-MM-DD
  maxDate?:     string
  page?:        number
  hitsPerPage?: number
}): Promise<{ transactions: BayutTransaction[]; total: number }> {
  const query: Record<string, string | number> = {
    locationSlug: params.locationSlug,
    purpose:      'for-sale',
    hitsPerPage:  params.hitsPerPage || 50,
    page:         params.page || 0,
  }
  if (params.rooms !== undefined) query.rooms = params.rooms
  if (params.minDate) query.minDate = params.minDate
  if (params.maxDate) query.maxDate = params.maxDate

  const data = await bayutFetch('/transactions', query)
  const results = (data.results || data.hits || []) as any[]

  const transactions: BayutTransaction[] = results.map((tx: any) => ({
    id:              String(tx.id || tx.transactionId || ''),
    price:           Number(tx.price || tx.transactionPrice || 0),
    area:            Number(tx.area || tx.size || 0),
    pricePerSqFt:    Number(tx.pricePerSqft || tx.pricePerSqFt || 0) ||
                     (tx.price && tx.area ? Math.round(tx.price / tx.area) : 0),
    rooms:           Number(tx.rooms || tx.bedrooms || 0),
    propertyType:    tx.propertyType || tx.category || 'villa',
    transactionDate: tx.transactionDate || tx.date || '',
    location: {
      name:     tx.location?.name || tx.area?.name || '',
      slug:     tx.location?.slug || '',
      parentId: String(tx.location?.parentId || ''),
    },
    project:   tx.project || tx.buildingName || undefined,
    developer: tx.developer || undefined,
  })).filter(tx => tx.price > 0 && tx.area > 0)

  return {
    transactions,
    total: data.nbHits || data.total || results.length,
  }
}

/**
 * Search current property listings (for PSF from active listings)
 */
export async function searchProperties(params: {
  locationSlug: string
  rooms?:       number
  purpose?:     'for-sale' | 'for-rent'
  minPrice?:    number
  maxPrice?:    number
  page?:        number
  hitsPerPage?: number
}): Promise<{ properties: BayutProperty[]; total: number }> {
  const query: Record<string, string | number> = {
    locationSlug: params.locationSlug,
    purpose:      params.purpose || 'for-sale',
    hitsPerPage:  params.hitsPerPage || 25,
    page:         params.page || 0,
    categoryExternalID: '4',  // villas
  }
  if (params.rooms !== undefined) query.rooms = params.rooms
  if (params.minPrice)            query.priceMin = params.minPrice
  if (params.maxPrice)            query.priceMax = params.maxPrice

  const data = await bayutFetch('/properties_search', query)
  const results = (data.results || data.hits || []) as any[]

  const properties: BayutProperty[] = results.map((p: any) => ({
    id:           String(p.id),
    title:        p.title || '',
    price:        Number(p.price || 0),
    area:         Number(p.area || 0),
    rooms:        Number(p.rooms || 0),
    baths:        Number(p.baths || 0),
    purpose:      p.purpose || 'for-sale',
    category:     p.category?.nameSingular || 'Villa',
    location:     { name: p.location?.name || '', slug: p.location?.slug || '' },
    agency:       p.agency ? { name: p.agency.name } : undefined,
    photos:       (p.photos || []).map((ph: any) => ({ url: ph.url || ph.main })),
    coverPhoto:   p.coverPhoto ? { url: p.coverPhoto.url || p.coverPhoto.main } : undefined,
    pricePerSqFt: Number(p.pricePerSqft || p.pricePerSqFt || 0) ||
                  (p.price && p.area ? Math.round(p.price / p.area) : 0),
    addedDate:    p.addedDate || p.dateAdded || '',
  })).filter(p => p.price > 0)

  return { properties, total: data.nbHits || data.total || results.length }
}

/**
 * Calculate PSF summary from transactions — the core function
 * Used by the nightly sync and live market intel page
 */
export async function calcPSFFromTransactions(
  locationSlug: string,
  bedrooms: number,
  monthsBack = 12
): Promise<PSFSummary | null> {
  const minDate = new Date()
  minDate.setMonth(minDate.getMonth() - monthsBack)
  const minDateStr = minDate.toISOString().split('T')[0]

  const { transactions } = await getTransactions({
    locationSlug,
    rooms:      bedrooms,
    minDate:    minDateStr,
    hitsPerPage: 50,
  })

  if (transactions.length === 0) return null

  const psfs = transactions.map(t => t.pricePerSqFt).filter(p => p > 0)
  if (psfs.length === 0) return null

  const sorted = [...psfs].sort((a, b) => a - b)
  // Remove top and bottom 10% outliers
  const trimStart = Math.floor(sorted.length * 0.1)
  const trimEnd   = Math.ceil(sorted.length * 0.9)
  const trimmed   = sorted.slice(trimStart, trimEnd)

  const avg = Math.round(trimmed.reduce((s, p) => s + p, 0) / trimmed.length)

  const latestTx = transactions
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())[0]

  return {
    community:  locationSlug,
    bedrooms,
    avgPsf:     avg,
    minPsf:     Math.round(Math.min(...psfs)),
    maxPsf:     Math.round(Math.max(...psfs)),
    txCount:    transactions.length,
    latestDate: latestTx.transactionDate,
    source:     'bayut_transactions',
  }
}
