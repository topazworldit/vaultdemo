import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const EXTRACTION_SYSTEM_PROMPT = `You are a specialist in extracting UAE real estate property data from documents, images, and text.

Your task is to extract property details with EXACT precision — never round, abbreviate, or interpret numbers.
RERA compliance requires exact figures. A BUA of 785.35 sq ft must be extracted as 785.35, never 785 or 786.

Extract the following fields if present:
- developer_name: Official developer name (e.g. "Emaar Properties PJSC")
- community_name: Community/area name (e.g. "Dubai Hills Estate")
- project_name: Project name (e.g. "Park Gate 2")
- unit_reference: Exact unit reference (e.g. "DE Park Gate 2-V-1")
- unit_type_label: Unit type (e.g. "4-Bedroom Villa, Type 4B")
- bedrooms: Number of bedrooms (integer)
- bathrooms: Number of bathrooms (number, can be decimal e.g. 4.5)
- bua_sqft: Built-up area in square feet — EXACT, no rounding
- plot_sqft: Plot area in square feet — EXACT, no rounding (villas only)
- floor_number: Floor number (integer, apartments only)
- view_description: View description (e.g. "Golf course and park view")
- asking_price_aed: Asking price in AED (integer, no decimals)
- completion_date_label: Completion date as written (e.g. "28 February 2027" or "Q4 2027")
- completion_date: Completion date in ISO format YYYY-MM-DD if determinable
- payment_plan_name: Payment plan name if present (e.g. "80/20")
- payment_plan_instalments: Array of instalments if present, each with:
  - instalment_number, milestone_label, percentage, due_date_label, due_date

For each field, assign a confidence level:
- "high": Clearly stated in a table, header, or prominent section
- "medium": Present but requires some interpretation
- "low": Inferred or partially visible

Return ONLY valid JSON in this exact format, nothing else:
{
  "developer_name": "...",
  "community_name": "...",
  "project_name": "...",
  "unit_reference": "...",
  "unit_type_label": "...",
  "bedrooms": 4,
  "bathrooms": 4.5,
  "bua_sqft": 5146.35,
  "plot_sqft": 5119.0,
  "floor_number": null,
  "view_description": "...",
  "asking_price_aed": 14574888,
  "completion_date_label": "28 February 2027",
  "completion_date": "2027-02-28",
  "payment_plan_name": "80/20",
  "payment_plan_instalments": [],
  "confidence": {
    "developer_name": "high",
    "community_name": "high",
    "project_name": "high",
    "unit_reference": "medium",
    "unit_type_label": "high",
    "bedrooms": "high",
    "bathrooms": "high",
    "bua_sqft": "high",
    "plot_sqft": "high",
    "asking_price_aed": "high",
    "completion_date_label": "medium",
    "completion_date": "medium"
  },
  "notes": ["Note about any ambiguity or issues found"]
}`

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Auth check
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const formData = await request.formData()
    const inputMethod = formData.get('input_method') as string
    const file        = formData.get('file') as File | null
    const text        = formData.get('text') as string | null

    // Build message content for Claude
    const messageContent: Anthropic.MessageParam['content'] = []
    let rawText: string | null = null
    let fileName: string | null = null
    let fileSize: number | null = null
    let mimeType: string | null = null
    let fileUrl: string | null = null

    if (file && (inputMethod === 'pdf_upload' || inputMethod === 'image_upload')) {
      fileName = file.name
      fileSize = file.size
      mimeType = file.type

      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      if (mimeType === 'application/pdf') {
        // Upload PDF to Supabase storage for audit trail
        const storagePath = `source-docs/${session.user.id}/${Date.now()}_${fileName}`
        const serviceClient = createServiceClient()
        const { data: uploadData } = await serviceClient.storage
          .from('documents')
          .upload(storagePath, arrayBuffer, { contentType: mimeType })

        if (uploadData) {
          const { data: urlData } = serviceClient.storage
            .from('documents')
            .getPublicUrl(storagePath)
          fileUrl = urlData.publicUrl
        }

        // Claude can read PDFs as base64
        messageContent.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64,
          },
        } as any)
      } else {
        // Image (JPG, PNG, WEBP, etc.)
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        const claudeMimeType = validImageTypes.includes(mimeType)
          ? mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
          : 'image/jpeg'

        // Upload image to storage
        const storagePath = `source-docs/${session.user.id}/${Date.now()}_${fileName}`
        const serviceClient = createServiceClient()
        const { data: uploadData } = await serviceClient.storage
          .from('documents')
          .upload(storagePath, arrayBuffer, { contentType: mimeType })

        if (uploadData) {
          const { data: urlData } = serviceClient.storage
            .from('documents')
            .getPublicUrl(storagePath)
          fileUrl = urlData.publicUrl
        }

        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: claudeMimeType,
            data: base64,
          },
        })
      }

      messageContent.push({
        type: 'text',
        text: 'Please extract all property details from this document/image. Return ONLY the JSON object.',
      })

    } else if (text && inputMethod === 'text_paste') {
      rawText = text
      messageContent.push({
        type: 'text',
        text: `Please extract all property details from this text. Return ONLY the JSON object.\n\nText:\n${text}`,
      })
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 })
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: messageContent }],
    })

    const responseText = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('')

    // Parse JSON — strip any markdown fences if present
    const cleanJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let extractedData: Record<string, any>
    try {
      extractedData = JSON.parse(cleanJson)
    } catch {
      console.error('Claude returned invalid JSON:', responseText)
      return NextResponse.json({
        error: 'Could not parse property data from the document. Please try manual entry.',
      }, { status: 422 })
    }

    const processingMs = Date.now() - startTime

    // Save source document to database
    const { data: sourceDoc, error: docError } = await supabase
      .from('source_documents')
      .insert({
        agent_id:         session.user.id,
        input_method:     inputMethod,
        file_name:        fileName,
        file_url:         fileUrl,
        file_size_bytes:  fileSize,
        mime_type:        mimeType,
        raw_text:         rawText || responseText,
        ai_raw_response:  { response: responseText, model: 'claude-sonnet-4-20250514' },
        status:           'completed',
        processing_ms:    processingMs,
      })
      .select()
      .single()

    if (docError) {
      console.error('Failed to save source document:', docError)
    }

    // Save extracted fields
    if (sourceDoc && extractedData.confidence) {
      const fieldInserts = Object.entries(extractedData.confidence).map(([field, conf]) => ({
        source_document_id:    sourceDoc.id,
        field_name:            field,
        extracted_value:       extractedData[field] !== null
          ? String(extractedData[field])
          : null,
        extracted_confidence:  conf as string,
        extraction_note:       extractedData.notes?.[0] || null,
      }))

      await supabase.from('ai_extracted_fields').insert(fieldInserts)
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      source_document_id: sourceDoc?.id || null,
      processing_ms: processingMs,
    })

  } catch (error: any) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: error.message || 'Extraction failed. Please try manual entry.' },
      { status: 500 }
    )
  }
}
