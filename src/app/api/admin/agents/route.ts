import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'
import { canAccessAdmin } from '@/lib/utils'

// Generates a secure temporary password
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password + '!1'  // Ensure meets Supabase password requirements
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Check admin role
    const { data: currentAgent } = await supabase
      .from('agents')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!currentAgent || !canAccessAdmin(currentAgent.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { full_name, email, role, title, phone, rera_number, rera_expiry } = body

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    }

    // Validate email domain
    if (!email.endsWith('@topazworldgroup.com') && !email.endsWith('@topazbuilder.com')) {
      // Allow any email — remove this check if agents use personal emails
      // Or enforce domain policy here
    }

    const tempPassword = generateTempPassword()

    // Create Supabase Auth user using service role
    const serviceClient = createServiceClient()
    const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,  // Auto-confirm so agent can log in immediately
      user_metadata: {
        full_name,
        role,
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'An agent with this email already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Update the agent record (auto-created by trigger)
    const { data: agent, error: agentError } = await serviceClient
      .from('agents')
      .update({
        full_name,
        role,
        title: title || 'Investment Advisor',
        phone: phone || null,
        rera_number: rera_number || null,
        rera_expiry: rera_expiry || null,
        created_by: session.user.id,
      })
      .eq('id', authUser.user.id)
      .select()
      .single()

    if (agentError) {
      // Clean up auth user if agent update fails
      await serviceClient.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: 'Failed to create agent profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      agent,
      temp_password: tempPassword,
      message: `Agent created. Temporary password: ${tempPassword}`,
    })

  } catch (error: any) {
    console.error('Create agent error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
