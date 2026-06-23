export const INVESTOR = {
  name: 'Ahmed Al Mansoori',
  initials: 'AM',
  title: 'Private Investor',
  location: 'Dubai, UAE',
}

export const PROPERTIES = [
  {
    id: 'address-downtown',
    name: 'Address Residences',
    unit: 'Penthouse PH-4201',
    location: 'Downtown Dubai',
    developer: 'Emaar Properties',
    devType: 'Government-Linked',
    devBadge: 'Emaar',
    type: 'Penthouse',
    bedrooms: 4,
    bathrooms: 5,
    area: 6800,
    purchaseDate: 'Mar 2024',
    purchasePrice: 8500000,
    currentDLD: 11050000,
    bayutListed: 12500000,
    pfListed: 12800000,
    paymentPlan: '50/50',
    planBreakdown: [
      { label: 'Down Payment', pct: 20, due: 'Mar 2024', status: 'paid' as const },
      { label: 'Construction 10%', pct: 10, due: 'Sep 2024', status: 'paid' as const },
      { label: 'Construction 10%', pct: 10, due: 'Apr 2025', status: 'paid' as const },
      { label: 'Construction 10%', pct: 10, due: 'Dec 2025', status: 'upcoming' as const },
      { label: 'Handover 50%', pct: 50, due: 'Q4 2026', status: 'future' as const },
    ],
    paidPct: 40,
    status: 'Under Construction',
    handover: 'Q4 2026',
    completionPct: 55,
    ready: false,
    dldTxn: 'DLD-2024-0318472',
    description: 'Branded residences within the iconic Address Downtown tower, overlooking the Burj Khalifa and Dubai Fountain.',
  },
  {
    id: 'bluewaters',
    name: 'Bluewaters Residences',
    unit: 'Island 5 · Apt 404',
    location: 'Bluewaters Island',
    developer: 'Meraas',
    devType: 'Dubai Holding',
    devBadge: 'Meraas',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 4,
    area: 2100,
    purchaseDate: 'Aug 2024',
    purchasePrice: 4200000,
    currentDLD: 5166000,
    bayutListed: 5800000,
    pfListed: 5600000,
    paymentPlan: '60/40',
    planBreakdown: [
      { label: 'Down Payment', pct: 24, due: 'Aug 2024', status: 'paid' as const },
      { label: 'Construction 11%', pct: 11, due: 'Feb 2025', status: 'paid' as const },
      { label: 'Construction 25%', pct: 25, due: 'Nov 2025', status: 'upcoming' as const },
      { label: 'Handover 40%', pct: 40, due: 'Q2 2027', status: 'future' as const },
    ],
    paidPct: 35,
    status: 'Under Construction',
    handover: 'Q2 2027',
    completionPct: 38,
    ready: false,
    dldTxn: 'DLD-2024-0847291',
    description: 'Waterfront residences on the artificial Bluewaters Island, adjacent to Ain Dubai — the world\'s largest observation wheel.',
  },
  {
    id: 'creek-harbour',
    name: 'Harbour Views',
    unit: 'Tower 2 · 1804',
    location: 'Dubai Creek Harbour',
    developer: 'Emaar Properties',
    devType: 'Government-Linked',
    devBadge: 'Emaar',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 3,
    area: 1290,
    purchaseDate: 'Jan 2025',
    purchasePrice: 2800000,
    currentDLD: 3192000,
    bayutListed: 3650000,
    pfListed: 3500000,
    paymentPlan: '50/50',
    planBreakdown: [
      { label: 'Down Payment', pct: 24, due: 'Jan 2025', status: 'paid' as const },
      { label: 'Construction 6%', pct: 6, due: 'Jul 2025', status: 'paid' as const },
      { label: 'Construction 20%', pct: 20, due: 'Mar 2026', status: 'upcoming' as const },
      { label: 'Handover 50%', pct: 50, due: 'Q1 2027', status: 'future' as const },
    ],
    paidPct: 30,
    status: 'Under Construction',
    handover: 'Q1 2027',
    completionPct: 28,
    ready: false,
    dldTxn: 'DLD-2025-0109384',
    description: 'Creek Harbour is set to become Dubai\'s new downtown. Tower 2 offers panoramic views of the Dubai Creek Tower and skyline.',
  },
  {
    id: 'port-de-la-mer',
    name: 'Port De La Mer',
    unit: 'La Rive C · 602',
    location: 'Jumeirah 1',
    developer: 'Meraas',
    devType: 'Dubai Holding',
    devBadge: 'Meraas',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 4,
    area: 1850,
    purchaseDate: 'Jun 2025',
    purchasePrice: 3600000,
    currentDLD: 3924000,
    bayutListed: 4400000,
    pfListed: 4250000,
    paymentPlan: '40/60 Post-Handover',
    planBreakdown: [
      { label: 'Down Payment', pct: 24, due: 'Jun 2025', status: 'paid' as const },
      { label: 'Construction 16%', pct: 16, due: 'Feb 2026', status: 'upcoming' as const },
      { label: 'Handover 20%', pct: 20, due: 'Q3 2027', status: 'future' as const },
      { label: 'Post-HO · 20%', pct: 20, due: '2028', status: 'future' as const },
      { label: 'Post-HO · 20%', pct: 20, due: '2029', status: 'future' as const },
    ],
    paidPct: 24,
    status: 'Under Construction',
    handover: 'Q3 2027',
    completionPct: 18,
    ready: false,
    dldTxn: 'DLD-2025-0628174',
    description: 'Mediterranean-inspired waterfront district on the Jumeirah coastline, developed by Meraas under the Dubai Holding umbrella.',
  },
  {
    id: 'dubai-hills',
    name: 'Golf Grove Villas',
    unit: 'Villa 12 · Golf Course View',
    location: 'Dubai Hills Estate',
    developer: 'Emaar / Meraas',
    devType: 'Government JV',
    devBadge: 'Dubai Hills',
    type: 'Villa',
    bedrooms: 5,
    bathrooms: 6,
    area: 7200,
    purchaseDate: 'Feb 2026',
    purchasePrice: 5500000,
    currentDLD: 5775000,
    bayutListed: 6800000,
    pfListed: 7000000,
    paymentPlan: '40/60',
    planBreakdown: [
      { label: 'Down Payment', pct: 20, due: 'Feb 2026', status: 'paid' as const },
      { label: 'Construction 4%', pct: 4, due: 'Aug 2026', status: 'upcoming' as const },
      { label: 'Construction 16%', pct: 16, due: 'Apr 2027', status: 'future' as const },
      { label: 'Handover 60%', pct: 60, due: 'Q2 2028', status: 'future' as const },
    ],
    paidPct: 24,
    status: 'Off-Plan',
    handover: 'Q2 2028',
    completionPct: 8,
    ready: false,
    dldTxn: 'DLD-2026-0219847',
    description: 'Stand-alone villa on the 18-hole championship golf course in Dubai Hills Estate — an integrated city within a city by Emaar and Meraas.',
  },
]

export type Property = typeof PROPERTIES[0]

export function getProperty(id: string) {
  return PROPERTIES.find(p => p.id === id)
}

export function calcROE(p: Property) {
  const gain = p.currentDLD - p.purchasePrice
  const invested = p.purchasePrice * (p.paidPct / 100)
  return (gain / invested) * 100
}

export function calcROI(p: Property) {
  return ((p.currentDLD - p.purchasePrice) / p.purchasePrice) * 100
}

export function fmtAED(n: number) {
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `AED ${(n / 1_000).toFixed(0)}K`
  return `AED ${n.toLocaleString()}`
}

export function fmtShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  return `${(n / 1_000).toFixed(0)}K`
}

export const MAINTENANCE = [
  { property: 'address-downtown', name: 'Address Residences', task: 'Snag list review — 28 items open', due: 'Ongoing', priority: 'high' as const, cost: '—', type: 'snag' },
  { property: 'bluewaters', name: 'Bluewaters Residences', task: 'Quarterly construction site visit', due: 'Jul 20, 2026', priority: 'medium' as const, cost: '—', type: 'inspection' },
  { property: 'creek-harbour', name: 'Harbour Views', task: 'Construction milestone inspection', due: 'Aug 5, 2026', priority: 'medium' as const, cost: '—', type: 'inspection' },
  { property: 'port-de-la-mer', name: 'Port De La Mer', task: 'Down payment certificate collection', due: 'Jul 10, 2026', priority: 'high' as const, cost: '—', type: 'document' },
  { property: 'dubai-hills', name: 'Golf Grove Villas', task: 'Construction commencement photo report', due: 'Sep 1, 2026', priority: 'low' as const, cost: '—', type: 'inspection' },
]

export const DOCUMENTS = [
  { property: 'address-downtown', name: 'Address Residences', docs: ['SPA', 'Title Deed (Off-Plan)', 'NOC', 'Payment Receipts'] },
  { property: 'bluewaters', name: 'Bluewaters Residences', docs: ['SPA', 'Title Deed (Off-Plan)', 'Payment Receipts'] },
  { property: 'creek-harbour', name: 'Harbour Views', docs: ['SPA', 'Title Deed (Off-Plan)', 'Payment Receipts'] },
  { property: 'port-de-la-mer', name: 'Port De La Mer', docs: ['SPA', 'Payment Receipts'] },
  { property: 'dubai-hills', name: 'Golf Grove Villas', docs: ['SPA', 'Booking Form'] },
]
