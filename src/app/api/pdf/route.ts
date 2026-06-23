import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'

export const maxDuration = 60 // Allow up to 60s for PDF generation

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Internal secret check — this route is called by offers/route.ts only
    const internalSecret = request.headers.get('x-internal-secret')
    const isInternal = internalSecret === process.env.PDF_API_SECRET

    // Also allow authenticated agents to trigger directly (for re-generation)
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!isInternal && !session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await request.json()
    const { offer_id } = body

    if (!offer_id) {
      return NextResponse.json({ error: 'offer_id required' }, { status: 400 })
    }

    // Fetch full offer data
    const serviceClient = createServiceClient()
    const { data: offer, error: fetchError } = await serviceClient
      .from('v_offer_full')
      .select('*')
      .eq('id', offer_id)
      .single()

    if (fetchError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Build the Python script payload
    const pdfPayload = buildPDFPayload(offer)

    // Call the Python PDF generator (Vercel Python serverless function)
    // In production this calls /api/pdf/generate (a Python route)
    // For now we generate via the Python script directly using exec
    const pdfResult = await generatePDFViaScript(pdfPayload, offer.template)

    if (!pdfResult.success) {
      return NextResponse.json({ error: pdfResult.error }, { status: 500 })
    }

    // Upload PDF to Supabase Storage
    const fileName    = `offers/${offer_id}/${offer.reference_number.replace(/\//g, '_')}.pdf`
    const pdfBuffer   = Buffer.from(pdfResult.pdfBase64, 'base64')

    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('PDF upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 })
    }

    const { data: urlData } = serviceClient.storage
      .from('documents')
      .getPublicUrl(fileName)

    const generationMs = Date.now() - startTime

    return NextResponse.json({
      success: true,
      pdf_url: urlData.publicUrl,
      pdf_size_bytes: pdfBuffer.length,
      generation_ms: generationMs,
    })

  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ── Build Python-friendly payload from offer data ──
function buildPDFPayload(offer: any) {
  return {
    // Identity
    reference_number:        offer.reference_number,
    template:                offer.template,

    // Agent
    agent_name:              offer.agent_name || offer.agent_display_name,
    agent_title:             offer.agent_title || 'Senior Investment Advisor',
    agent_phone:             offer.agent_phone || '',
    agent_email:             offer.agent_email || '',
    agent_rera:              offer.agent_rera_number || '',
    agent_office:            offer.agent_office_address || 'Happiness Street, City Walk Building 5, Dubai, UAE',
    agent_photo_url:         offer.agent_photo_url || null,

    // Property
    developer_name:          offer.developer_name_snapshot,
    community_name:          offer.community_name_snapshot,
    project_name:            offer.project_name_snapshot,
    unit_reference:          offer.unit_reference,
    unit_type_label:         offer.unit_type_label || '',
    bedrooms:                offer.bedrooms || 0,
    bathrooms:               offer.bathrooms || 0,
    bua_sqft:                offer.bua_sqft,
    bua_sqm:                 offer.bua_sqm,
    plot_sqft:               offer.plot_sqft,
    plot_sqm:                offer.plot_sqm,
    floor_number:            offer.floor_number,
    view_description:        offer.view_description || '',
    completion_date_label:   offer.completion_date_label || '',
    market_type:             offer.market_type,

    // Pricing
    asking_price_aed:        offer.asking_price_aed,
    price_psf_aed:           offer.price_psf_aed,
    service_charge_psf:      offer.service_charge_psf,

    // DLD & costs
    dld_waiver_type:         offer.dld_waiver_type,
    dld_waiver_label:        offer.dld_waiver_label,
    dld_waiver_saving_aed:   offer.dld_waiver_saving_aed,
    dld_fee_gross_aed:       offer.dld_fee_gross_aed,
    dld_fee_buyer_aed:       offer.dld_fee_buyer_aed,
    agency_commission_pct:   offer.agency_commission_pct,
    agency_commission_aed:   offer.agency_commission_aed,
    agency_commission_visible: offer.agency_commission_visible,
    trustee_fee_aed:         offer.trustee_fee_aed,
    trustee_fee_applicable:  offer.trustee_fee_applicable,
    title_deed_fee_aed:      offer.title_deed_fee_aed,
    title_deed_fee_applicable: offer.title_deed_fee_applicable,
    noc_fee_aed:             offer.noc_fee_aed,
    noc_fee_applicable:      offer.noc_fee_applicable,
    misc_fees_aed:           offer.misc_fees_aed,
    misc_fees_applicable:    offer.misc_fees_applicable,
    total_buyer_cost_aed:    offer.total_buyer_cost_aed,
    total_buyer_cost_pct:    offer.total_buyer_cost_pct,

    // Payment plan
    payment_plan_name:       offer.payment_plan_name,
    payment_plan_instalments: offer.payment_plan_snapshot || [],

    // Comparables
    comparables:             offer.comparables_snapshot || [],

    // Images — from offer or Supabase Storage
    image_hero:       (offer as any).image_hero       || null,
    image_lifestyle:  (offer as any).image_lifestyle  || null,
    image_map:        (offer as any).image_map        || null,
    image_masterplan: (offer as any).image_masterplan || null,

    // Meta
    generated_date:          new Date().toLocaleDateString('en-AE', {
      day: 'numeric', month: 'long', year: 'numeric'
    }),
    valid_hours:             offer.valid_hours || 24,
    company_name:            'Topaz World Group',
    company_website:         'topazworldgroup.com',
    company_email:           'info@topazworldgroup.com',
  }
}

// ── PDF generation via Python script ──
// Uses Vercel's Python runtime or falls back to exec
async function generatePDFViaScript(
  payload: any,
  template: string
): Promise<{ success: boolean; pdfBase64: string; error?: string }> {

  try {
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)
    const fs = require('fs')
    const path = require('path')
    const os = require('os')

    // Write payload to temp file
    const tmpDir     = os.tmpdir()
    const payloadPath = path.join(tmpDir, `topaz_payload_${Date.now()}.json`)
    const outputPath  = path.join(tmpDir, `topaz_offer_${Date.now()}.pdf`)

    fs.writeFileSync(payloadPath, JSON.stringify(payload))

    // Determine which Python script to call
    const scriptMap: Record<string, string> = {
      T1_portrait:  't1_portrait_dynamic.py',
      T2_editorial: 't2_editorial_dynamic.py',
      T3_landscape: 't3_landscape_dynamic.py',
    }

    const scriptName = scriptMap[template]
    if (!scriptName) {
      return { success: false, pdfBase64: '', error: `Unknown template: ${template}` }
    }

    const scriptPath = path.join(process.cwd(), 'python', scriptName)

    // Run Python
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${payloadPath}" "${outputPath}"`,
      { timeout: 50000 }
    )

    if (stderr && !stderr.includes('Warning')) {
      console.error('Python stderr:', stderr)
    }

    // Read generated PDF
    if (!fs.existsSync(outputPath)) {
      return { success: false, pdfBase64: '', error: 'PDF file not created' }
    }

    const pdfBuffer = fs.readFileSync(outputPath)
    const pdfBase64 = pdfBuffer.toString('base64')

    // Clean up temp files
    fs.unlinkSync(payloadPath)
    fs.unlinkSync(outputPath)

    return { success: true, pdfBase64 }

  } catch (error: any) {
    console.error('PDF script error:', error)
    return { success: false, pdfBase64: '', error: error.message }
  }
}
