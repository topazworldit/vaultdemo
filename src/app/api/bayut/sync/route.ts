import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'
import { calcPSFFromTransactions, searchLocation } from '@/lib/bayut'

export const maxDuration = 60

// POST /api/bayut/sync
// Body: { community_slug?: string, community_id?: string, all?: boolean }
// Called manually from admin UI or by cron job
export async function POST(request: NextRequest) {
  try {
    // Auth check — admin only
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: agent } = await supabase
      .from('agents').select('role').eq('id', session.user.id).single()
    if (!agent || !['admin', 'super_admin'].includes(agent.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const serviceClient = createServiceClient()

    // Get communities to sync
    let communities: any[] = []
    if (body.all) {
      const { data } = await serviceClient
        .from('communities')
        .select('id, name, bayut_location_slug')
        .eq('active', true)
      communities = data || []
    } else if (body.community_id) {
      const { data } = await serviceClient
        .from('communities')
        .select('id, name, bayut_location_slug')
        .eq('id', body.community_id)
        .single()
      if (data) communities = [data]
    }

    if (communities.length === 0) {
      return NextResponse.json({ error: 'No communities to sync' }, { status: 400 })
    }

    const results: any[] = []
    const alerts:  any[] = []

    for (const community of communities) {
      let slug = community.bayut_location_slug

      // If no slug stored, search for it
      if (!slug) {
        const locations = await searchLocation(community.name)
        if (locations.length === 0) {
          results.push({ community: community.name, status: 'no_location_found' })
          continue
        }
        slug = locations[0].slug
        // Save slug for future syncs
        await serviceClient
          .from('communities')
          .update({ bayut_location_slug: slug })
          .eq('id', community.id)
      }

      // Sync PSF for each bedroom type 1-5
      for (const bedrooms of [1, 2, 3, 4, 5]) {
        try {
          const psf = await calcPSFFromTransactions(slug, bedrooms, 12)
          if (!psf || psf.txCount < 3) continue // need at least 3 data points

          // Get current stored PSF to check for anomaly
          const { data: existing } = await serviceClient
            .from('market_data')
            .select('psf_aed, id')
            .eq('community_id', community.id)
            .eq('bedrooms', bedrooms)
            .maybeSingle()

          // Check for >10% deviation from stored value — create alert
          if (existing && existing.psf_aed) {
            const deviation = Math.abs(psf.avgPsf - existing.psf_aed) / existing.psf_aed
            if (deviation > 0.10) {
              alerts.push({
                community:    community.name,
                bedrooms,
                stored_psf:   existing.psf_aed,
                new_psf:      psf.avgPsf,
                deviation_pct: Math.round(deviation * 100),
                direction:    psf.avgPsf > existing.psf_aed ? 'up' : 'down',
              })
            }
          }

          // Upsert market data
          await serviceClient.from('market_data').upsert({
            community_id:   community.id,
            bedrooms,
            bedroom_label:  `${bedrooms} BR`,
            psf_aed:        psf.avgPsf,
            psf_min_aed:    psf.minPsf,
            psf_max_aed:    psf.maxPsf,
            tx_count:       psf.txCount,
            psf_source:     `Bayut DLD — ${psf.txCount} tx (${psf.latestDate})`,
            psf_status:     'fresh',
            valid_from:     new Date().toISOString(),
            updated_at:     new Date().toISOString(),
            updated_by:     session.user.id,
            data_source:    'bayut_api',
          }, { onConflict: 'community_id,bedrooms' })

          results.push({
            community: community.name,
            bedrooms,
            psf:       psf.avgPsf,
            txCount:   psf.txCount,
            status:    'updated',
          })
        } catch (err: any) {
          results.push({
            community: community.name,
            bedrooms,
            status:   'error',
            error:     err.message,
          })
        }
      }
    }

    // Store alerts in DB if any
    if (alerts.length > 0) {
      await serviceClient.from('market_alerts').upsert(
        alerts.map(a => ({
          ...a,
          created_at:  new Date().toISOString(),
          resolved:    false,
        }))
      )
    }

    return NextResponse.json({
      success:     true,
      synced:      results.filter(r => r.status === 'updated').length,
      skipped:     results.filter(r => r.status !== 'updated').length,
      alerts:      alerts.length,
      results,
      alert_details: alerts,
    })

  } catch (error: any) {
    console.error('Bayut sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/bayut/sync — check sync status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const serviceClient = createServiceClient()

    const { data: lastSync } = await serviceClient
      .from('market_data')
      .select('updated_at, data_source')
      .eq('data_source', 'bayut_api')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    const { data: alerts } = await serviceClient
      .from('market_alerts')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      lastSync: lastSync?.updated_at || null,
      activeAlerts: alerts?.length || 0,
      alerts: alerts || [],
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
