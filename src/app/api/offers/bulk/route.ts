import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'

export const maxDuration = 60

// POST /api/offers/bulk
// Generates all 3 templates for a single offer payload simultaneously
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const serviceClient = createServiceClient()

    // Get agent data
    const { data: agent } = await serviceClient
      .from('agents').select('*').eq('id', session.user.id).single()
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const templates = ['T1_portrait', 'T2_editorial', 'T3_landscape'] as const

    // Create 3 offers simultaneously
    const offerCreations = await Promise.all(
      templates.map(async (template) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/offers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ ...body, template }),
        })
        const data = await res.json()
        return { template, ...data }
      })
    )

    const successful = offerCreations.filter(o => o.offer_id || o.id)
    const failed     = offerCreations.filter(o => !o.offer_id && !o.id)

    return NextResponse.json({
      success:    true,
      generated:  successful.length,
      failed:     failed.length,
      offers:     successful.map(o => ({
        template:  o.template,
        offer_id:  o.offer_id || o.id,
        pdf_url:   o.pdf_url,
        reference: o.reference_number,
      })),
      errors: failed.map(o => ({ template: o.template, error: o.error })),
    })

  } catch (error: any) {
    console.error('Bulk generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
