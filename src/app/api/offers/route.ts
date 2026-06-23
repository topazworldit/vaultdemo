import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'
import { computeDLDCosts } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()

    // Fetch agent
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    // Parse price
    const price = parseFloat((body.asking_price_aed || '0').replace(/,/g, ''))
    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const marketType = body.market_type || 'off_plan'
    const isResale   = marketType === 'resale'

    // Compute all costs
    const costs = computeDLDCosts(
      price,
      marketType,
      isResale ? 0 : (body.dld_waiver_pct || 0),
      body.agency_commission_pct || 2,
      body.completion_date || null,
      body.misc_fees_applicable || false,
      parseFloat(body.misc_fees_aed || '5000'),
      parseFloat(body.noc_fee_aed || '5250'),
    )

    const isOffplanResale = isResale && body.completion_date
      ? new Date(body.completion_date) > new Date()
      : false

    // Fetch payment plan snapshot if template selected
    let paymentPlanSnapshot = null
    let paymentPlanName     = null
    if (body.payment_plan_template_id) {
      const { data: plan } = await supabase
        .from('payment_plan_templates')
        .select('*, instalments:payment_plan_instalments(*)')
        .eq('id', body.payment_plan_template_id)
        .single()

      if (plan) {
        paymentPlanName     = plan.plan_name
        paymentPlanSnapshot = plan.instalments?.sort(
          (a: any, b: any) => a.instalment_number - b.instalment_number
        ) || []
      }
    }

    // Fetch comparables snapshot
    const { data: marketData } = await supabase
      .from('market_data')
      .select(`
        psf_aed, bedroom_label, psf_source,
        project:projects(name, community:communities(name))
      `)
      .in('psf_status', ['fresh', 'stale'])
      .limit(5)

    const comparablesSnapshot = (marketData || []).map((m: any) => ({
      project_name:   m.project?.name || '',
      community_name: m.project?.community?.name || '',
      bedroom_label:  m.bedroom_label || '',
      psf_aed:        m.psf_aed,
      psf_source:     m.psf_source,
    }))

    // Build offer insert
    const bua  = parseFloat(body.bua_sqft || '0')
    const plot = parseFloat(body.plot_sqft || '0') || null

    const offerInsert = {
      agent_id:                 session.user.id,
      client_id:                body.client_id || null,
      client_name_snapshot:     body.client_name || null,
      project_id:               body.project_id || null,
      source_document_id:       body.source_document_id || null,
      input_method:             body.input_method || 'manual',
      template:                 body.template,
      status:                   'generated',
      market_type:              marketType,

      // Property data — RERA critical
      developer_name_snapshot:  body.developer_name_snapshot,
      community_name_snapshot:  body.community_name_snapshot,
      project_name_snapshot:    body.project_name_snapshot,
      unit_reference:           body.unit_reference,
      unit_type_label:          body.unit_type_label || null,
      bedrooms:                 body.bedrooms || null,
      bathrooms:                body.bathrooms || null,
      bua_sqft:                 bua,
      plot_sqft:                plot,
      floor_number:             body.floor_number ? parseInt(body.floor_number) : null,
      view_description:         body.view_description || null,
      asking_price_aed:         Math.round(price),
      price_psf_aed:            bua > 0 ? Math.round((price / bua) * 100) / 100 : null,
      service_charge_psf:       null,
      completion_date_label:    body.completion_date_label || null,
      completion_date:          body.completion_date || null,

      // Payment plan
      payment_plan_name:        paymentPlanName,
      payment_plan_snapshot:    paymentPlanSnapshot,

      // DLD & costs
      dld_waiver_type:          isResale ? 'none' : (body.dld_waiver_type || 'none'),
      dld_waiver_pct:           isResale ? 0 : (body.dld_waiver_pct || 0),
      dld_waiver_label:         isResale ? null : (body.dld_waiver_label || null),
      dld_waiver_valid_until:   isResale ? null : (body.dld_waiver_valid_until || null),
      dld_fee_pct:              4.00,
      dld_fee_gross_aed:        costs.dldGross,
      dld_fee_buyer_aed:        costs.dldBuyer,
      dld_fee_developer_aed:    costs.dldDeveloper,
      dld_waiver_saving_aed:    costs.dldDeveloper,
      agency_commission_pct:    isResale ? (body.agency_commission_pct || 2) : 0,
      agency_commission_aed:    costs.agencyAed,
      agency_commission_visible: isResale,
      trustee_fee_aed:          costs.trusteeAed,
      trustee_fee_applicable:   isResale,
      title_deed_fee_aed:       580,
      title_deed_fee_applicable: isResale,
      noc_fee_aed:              isOffplanResale ? (parseFloat(body.noc_fee_aed || '5250')) : 0,
      noc_fee_applicable:       isOffplanResale,
      misc_fees_aed:            isResale && body.misc_fees_applicable ? parseFloat(body.misc_fees_aed || '5000') : 0,
      misc_fees_applicable:     isResale && (body.misc_fees_applicable || false),
      total_buyer_cost_aed:     costs.total,
      total_buyer_cost_pct:     costs.totalPct,

      // Images
      image_hero:        body.image_hero       || null,
      image_lifestyle:   body.image_lifestyle  || null,
      image_map:         body.image_map        || null,
      image_masterplan:  body.image_masterplan || null,

      // Comparables
      comparables_snapshot:     comparablesSnapshot,

      // Share
      valid_hours:              24,
      notes:                    body.notes || null,
    }

    // Insert offer
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .insert(offerInsert)
      .select()
      .single()

    if (offerError) {
      console.error('Offer insert error:', offerError)
      return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 })
    }

    // Set share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${offer.share_token}`
    await supabase
      .from('offers')
      .update({ share_url: shareUrl })
      .eq('id', offer.id)

    // Log activity
    await supabase.from('offer_activity_log').insert({
      offer_id: offer.id,
      agent_id: session.user.id,
      action:   'created',
      details:  { template: body.template, market_type: marketType, input_method: body.input_method },
    })

    // Trigger PDF generation asynchronously
    // We return the offer ID immediately so the UI can redirect,
    // then PDF generation happens in the background
    generatePDFAsync(offer.id, offer, agent, paymentPlanSnapshot)

    return NextResponse.json({
      success: true,
      data: { ...offer, share_url: shareUrl },
    })

  } catch (error: any) {
    console.error('Offer creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create offer' },
      { status: 500 }
    )
  }
}

// Async PDF generation — runs after response is returned
async function generatePDFAsync(
  offerId: string,
  offer: any,
  agent: any,
  paymentPlan: any
) {
  try {
    const serviceClient = createServiceClient()

    // Call the PDF generation endpoint internally
    const pdfResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/pdf`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.PDF_API_SECRET || '',
        },
        body: JSON.stringify({ offer_id: offerId }),
      }
    )

    if (!pdfResponse.ok) {
      const err = await pdfResponse.json()
      console.error('PDF generation failed:', err)
      return
    }

    const pdfResult = await pdfResponse.json()

    // Update offer with PDF URL
    if (pdfResult.pdf_url) {
      await serviceClient
        .from('offers')
        .update({
          pdf_url:          pdfResult.pdf_url,
          pdf_size_bytes:   pdfResult.pdf_size_bytes,
          pdf_generated_at: new Date().toISOString(),
          pdf_generation_ms: pdfResult.generation_ms,
          expires_at:       new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', offerId)

      await serviceClient.from('offer_activity_log').insert({
        offer_id: offerId,
        agent_id: offer.agent_id,
        action:   'pdf_generated',
        details:  { pdf_url: pdfResult.pdf_url, size_bytes: pdfResult.pdf_size_bytes },
      })
    }
  } catch (err) {
    console.error('Async PDF generation error:', err)
  }
}

// GET — fetch offers list
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: agent } = await supabase
      .from('agents')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const url    = new URL(request.url)
    const page   = parseInt(url.searchParams.get('page')   || '1')
    const limit  = parseInt(url.searchParams.get('limit')  || '20')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')
    const offset = (page - 1) * limit

    let query = supabase
      .from('offers')
      .select('*, agent:agents(full_name, display_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Role-based filtering
    if (!['senior_agent', 'admin', 'super_admin'].includes(agent?.role || '')) {
      query = query.eq('agent_id', session.user.id)
    }

    if (status) query = query.eq('status', status)
    if (search) {
      query = query.or(
        `unit_reference.ilike.%${search}%,` +
        `project_name_snapshot.ilike.%${search}%,` +
        `community_name_snapshot.ilike.%${search}%,` +
        `reference_number.ilike.%${search}%`
      )
    }

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      data,
      count,
      page,
      per_page: limit,
      total_pages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
