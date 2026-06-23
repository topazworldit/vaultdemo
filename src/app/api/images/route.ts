import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const formData  = await request.formData()
    const file      = formData.get('file') as File | null
    const imageType = formData.get('image_type') as string // hero|lifestyle|map|masterplan
    const offerId   = formData.get('offer_id') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!imageType) return NextResponse.json({ error: 'image_type required' }, { status: 400 })

    const VALID_TYPES = ['hero', 'lifestyle', 'map', 'masterplan']
    if (!VALID_TYPES.includes(imageType)) {
      return NextResponse.json({ error: `image_type must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
    }

    const VALID_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
    if (!VALID_MIME.includes(file.type)) {
      return NextResponse.json({ error: 'File must be JPG, PNG, WEBP, or HEIC' }, { status: 400 })
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 20MB' }, { status: 400 })
    }

    const ext        = file.name.split('.').pop() || 'jpg'
    const folder     = offerId ? `offer-images/${offerId}` : `offer-images/${session.user.id}/temp`
    const path       = `${folder}/${imageType}.${ext}`
    const buffer     = await file.arrayBuffer()
    const serviceClient = createServiceClient()

    const { error: uploadError } = await serviceClient.storage
      .from('documents')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = serviceClient.storage
      .from('documents')
      .getPublicUrl(path)

    return NextResponse.json({
      success:    true,
      image_type: imageType,
      url:        urlData.publicUrl,
      path,
    })

  } catch (error: any) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
