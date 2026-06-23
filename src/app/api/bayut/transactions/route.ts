import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getTransactions, searchLocation, searchProperties } from '@/lib/bayut'

export const maxDuration = 30

// GET /api/bayut/transactions?community=Dubai+Hills+Estate&bedrooms=4&months=12
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const community = searchParams.get('community')
    const slug      = searchParams.get('slug')
    const bedrooms  = searchParams.get('bedrooms')
    const months    = parseInt(searchParams.get('months') || '12')
    const type      = searchParams.get('type') || 'transactions' // transactions | listings

    if (!community && !slug) {
      return NextResponse.json({ error: 'community or slug required' }, { status: 400 })
    }

    // Get slug if not provided
    let locationSlug = slug || ''
    if (!locationSlug && community) {
      const locations = await searchLocation(community)
      if (locations.length === 0) {
        return NextResponse.json({ error: `No location found for: ${community}` }, { status: 404 })
      }
      locationSlug = locations[0].slug
    }

    const minDate = new Date()
    minDate.setMonth(minDate.getMonth() - months)

    if (type === 'listings') {
      const { properties, total } = await searchProperties({
        locationSlug,
        rooms:    bedrooms ? parseInt(bedrooms) : undefined,
        hitsPerPage: 20,
      })
      return NextResponse.json({ properties, total, locationSlug })
    }

    // Default: transactions
    const { transactions, total } = await getTransactions({
      locationSlug,
      rooms:    bedrooms ? parseInt(bedrooms) : undefined,
      minDate:  minDate.toISOString().split('T')[0],
      hitsPerPage: 50,
    })

    // Calculate PSF stats
    const psfs = transactions.map(t => t.pricePerSqFt).filter(p => p > 0)
    const stats = psfs.length > 0 ? {
      avg:    Math.round(psfs.reduce((s, p) => s + p, 0) / psfs.length),
      min:    Math.round(Math.min(...psfs)),
      max:    Math.round(Math.max(...psfs)),
      count:  transactions.length,
      median: psfs.sort((a, b) => a - b)[Math.floor(psfs.length / 2)],
    } : null

    return NextResponse.json({ transactions, total, stats, locationSlug })

  } catch (error: any) {
    console.error('Bayut transactions error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
