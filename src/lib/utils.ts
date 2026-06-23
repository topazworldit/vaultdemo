// ============================================================
// Utility functions — used throughout the app
// ============================================================

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

// ── Tailwind class merger ──
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Currency formatting ──
export function formatAED(amount: number | null | undefined, decimals = 0): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatAEDShort(amount: number): string {
  if (amount >= 1_000_000) return `AED ${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `AED ${(amount / 1_000).toFixed(0)}K`
  return `AED ${amount.toLocaleString()}`
}

// ── Number formatting ──
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString('en-AE')
}

export function formatPSF(psf: number | null | undefined): string {
  if (psf === null || psf === undefined) return '—'
  return `AED ${Math.round(psf).toLocaleString()} psf`
}

export function formatSqft(sqft: number | null | undefined): string {
  if (sqft === null || sqft === undefined) return '—'
  return `${sqft.toLocaleString('en-AE', { maximumFractionDigits: 2 })} sq.ft`
}

export function formatSqm(sqm: number | null | undefined): string {
  if (sqm === null || sqm === undefined) return '—'
  return `${sqm.toFixed(2)} sq.m`
}

// ── Date formatting ──
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'd MMM yyyy')
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return format(new Date(dateStr), 'MMM yyyy')
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

// ── Percentage ──
export function formatPct(pct: number | null | undefined, decimals = 1): string {
  if (pct === null || pct === undefined) return '—'
  return `${pct.toFixed(decimals)}%`
}

// ── BUA conversion ──
export function sqftToSqm(sqft: number): number {
  return Math.round(sqft * 0.092903 * 100) / 100
}

export function sqmToSqft(sqm: number): number {
  return Math.round(sqm / 0.092903 * 100) / 100
}

// ── Offer reference generation (mirrors SQL function) ──
export function generateOfferReference(
  communityName: string,
  year = new Date().getFullYear()
): string {
  const code = communityName
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 6)
  const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `TW/${year}/${code}/${seq}`
}

// ── File helpers ──
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileType(mimeType: string | null): 'pdf' | 'image' | 'unknown' {
  if (!mimeType) return 'unknown'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('image/')) return 'image'
  return 'unknown'
}

// ── Validation helpers ──
export function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[0-9\s\-()]{7,20}$/.test(phone)
}

export function isValidPrice(price: string): boolean {
  const n = parseFloat(price.replace(/,/g, ''))
  return !isNaN(n) && n > 0
}

export function parsePrice(price: string): number {
  return parseFloat(price.replace(/,/g, ''))
}

// ── DLD computation (mirrors SQL trigger) ──
export function computeDLDCosts(
  askingPrice: number,
  marketType: 'off_plan' | 'ready' | 'resale',
  dldWaiverPct: number = 0,
  agencyCommissionPct: number = 2,
  completionDate: string | null = null,
  miscFeesApplicable: boolean = false,
  miscFeesAed: number = 5000,
  nocFeeAed: number = 5250
) {
  const isResale = marketType === 'resale'
  const isOffplanResale = isResale && completionDate
    ? new Date(completionDate) > new Date()
    : false

  // DLD
  const dldGross = Math.round(askingPrice * 0.04)
  const dldDeveloper = isResale ? 0 : Math.round(askingPrice * dldWaiverPct / 100)
  const dldBuyer = dldGross - dldDeveloper

  // Agency
  const agencyVisible = isResale
  const agencyAed = isResale ? Math.round(askingPrice * agencyCommissionPct / 100) : 0

  // Fixed fees (resale only)
  const trusteeAed = isResale ? (askingPrice > 500000 ? 4200 : 2100) : 0
  const titleDeedAed = isResale ? 580 : 0
  const nocAed = isOffplanResale ? nocFeeAed : 0
  const miscAed = isResale && miscFeesApplicable ? miscFeesAed : 0

  const total = askingPrice + dldBuyer + agencyAed + trusteeAed + titleDeedAed + nocAed + miscAed
  const totalPct = Math.round((total / askingPrice) * 10000) / 100

  return {
    dldGross,
    dldDeveloper,
    dldBuyer,
    dldWaiverSaving: dldDeveloper,
    agencyAed,
    agencyVisible,
    trusteeAed,
    titleDeedAed,
    nocAed,
    miscAed,
    total,
    totalPct,
  }
}

// ── Role helpers ──
export function canAccessAdmin(role: string): boolean {
  return ['admin', 'super_admin'].includes(role)
}

export function canViewAllOffers(role: string): boolean {
  return ['senior_agent', 'admin', 'super_admin'].includes(role)
}

// ── Truncate text ──
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

// ── Sleep (for retry logic) ──
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Generate share URL ──
export function getShareUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://topazbuilder.com'
  return `${base}/share/${token}`
}

// ── WhatsApp share message ──
export function getWhatsAppMessage(offer: {
  reference_number: string
  project_name_snapshot: string
  community_name_snapshot: string
  asking_price_aed: number
  share_url: string | null
  agent?: { full_name: string; phone: string | null }
}): string {
  const price = formatAED(offer.asking_price_aed)
  const link = offer.share_url || ''
  return encodeURIComponent(
    `Dear Client,\n\nPlease find below the investment offer for *${offer.project_name_snapshot}*, ${offer.community_name_snapshot}.\n\n` +
    `Price: *${price}*\nRef: ${offer.reference_number}\n\n` +
    `View your personalised offer here:\n${link}\n\n` +
    `This offer is valid for 24 hours from the date of issue.\n\n` +
    `Warm regards,\n${offer.agent?.full_name || 'Topaz World Group'}\nTopaz World Group\n${offer.agent?.phone || '+971 4 000 0000'}`
  )
}

export const AGENCY_COMMISSION_OPTIONS = [
  { value: 1.0, label: '1.0%' },
  { value: 1.5, label: '1.5%' },
  { value: 2.0, label: '2.0%' },
  { value: 2.5, label: '2.5%' },
]
