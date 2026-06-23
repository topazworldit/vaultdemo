import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'

// GET /api/templates — list agent's templates
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const serviceClient = createServiceClient()
    const { data: templates } = await serviceClient
      .from('offer_templates')
      .select('*')
      .eq('agent_id', session.user.id)
      .order('used_count', { ascending: false })

    return NextResponse.json({ templates: templates || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/templates — save a new template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    if (!body.name) return NextResponse.json({ error: 'Template name required' }, { status: 400 })

    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('offer_templates')
      .insert({
        agent_id:         session.user.id,
        name:             body.name,
        description:      body.description || null,
        developer_name:   body.developer_name || null,
        community_name:   body.community_name || null,
        project_name:     body.project_name || null,
        market_type:      body.market_type || 'off_plan',
        template_style:   body.template_style || 'T1_portrait',
        form_data:        body.form_data || {},
        used_count:       0,
        created_at:       new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ template: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/templates?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const serviceClient = createServiceClient()
    await serviceClient
      .from('offer_templates')
      .delete()
      .eq('id', id)
      .eq('agent_id', session.user.id) // RLS: only own templates

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
