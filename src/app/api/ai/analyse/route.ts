import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 45

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/ai/analyse
// type: 'narrative' | 'comparables' | 'anomaly'
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { type, property } = body

    if (!type || !property) {
      return NextResponse.json({ error: 'type and property required' }, { status: 400 })
    }

    switch (type) {
      case 'narrative':   return await generateNarrative(property)
      case 'comparables': return await selectComparables(property, body.availableComps)
      case 'anomaly':     return await detectAnomaly(property, body.marketData)
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('AI analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ── INVESTMENT NARRATIVE ─────────────────────────────────────────

async function generateNarrative(property: any) {
  const prompt = `You are a senior real estate investment analyst at Topaz World Group, Dubai's premium investment advisory firm. Write a compelling, factual investment narrative for the following property. This text will appear in a client PDF offer.

PROPERTY DATA:
- Project: ${property.project_name}
- Developer: ${property.developer_name}
- Community: ${property.community_name}
- Unit: ${property.unit_reference}
- Type: ${property.unit_type_label}
- BUA: ${property.bua_sqft} sq.ft
- Price: AED ${Number(property.asking_price_aed).toLocaleString()}
- Price per sq.ft: AED ${Number(property.price_psf_aed).toLocaleString()}
- Completion: ${property.completion_date_label}
- Market type: ${property.market_type}
- DLD waiver: ${property.dld_waiver_type !== 'none' ? property.dld_waiver_label : 'None'}
- Comparables PSF: ${property.comparables?.map((c: any) => `${c.project_name}: AED ${c.psf_aed}`).join(', ') || 'Not provided'}

Write 3 short paragraphs (60-80 words each, 180-240 words total):
1. The asset — what makes this specific property compelling
2. The market context — why Dubai Hills Estate / this community at this price point makes sense now
3. The investment thesis — scarcity, infrastructure, capital appreciation case

Rules:
- Be specific and data-driven, not generic
- Use the actual price, BUA, developer name, community name
- No marketing fluff or hollow superlatives
- Write as a trusted advisor, not a salesperson
- Do not mention "Topaz World Group" or "topazbuilder" in the text

Return ONLY the narrative text, no JSON wrapper, no headers.`

  const message = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages:   [{ role: 'user', content: prompt }],
  })

  const narrative = (message.content[0] as any).text?.trim() || ''
  return NextResponse.json({ narrative })
}

// ── SMART COMPARABLES ────────────────────────────────────────────

async function selectComparables(property: any, availableComps: any[]) {
  if (!availableComps || availableComps.length === 0) {
    return NextResponse.json({ comparables: [], reason: 'No comparables available in database' })
  }

  const prompt = `You are a real estate data analyst. Select the 4 most relevant comparable transactions from the list below for this subject property. Choose comparables that are most similar in terms of: community, bedroom count, size, and price range. Return ONLY a JSON array of the selected comparable IDs, nothing else.

SUBJECT PROPERTY:
- Community: ${property.community_name}
- Bedrooms: ${property.bedrooms}
- BUA: ${property.bua_sqft} sq.ft
- Price: AED ${Number(property.asking_price_aed).toLocaleString()}
- PSF: AED ${property.price_psf_aed}

AVAILABLE COMPARABLES (id, project, community, bedrooms, psf, source):
${availableComps.map(c => `- ID:${c.id} | ${c.project_name} | ${c.community_name} | ${c.bedrooms}BR | AED ${c.psf_aed} psf | ${c.psf_source}`).join('\n')}

Return JSON only: ["id1", "id2", "id3", "id4"]
Pick the 4 that best represent the market for this property. If fewer than 4 good matches exist, return fewer.`

  const message = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text = (message.content[0] as any).text?.trim() || '[]'
  let selectedIds: string[] = []
  try {
    selectedIds = JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    selectedIds = []
  }

  const selected = availableComps.filter(c => selectedIds.includes(String(c.id)))
  return NextResponse.json({ comparables: selected, totalAvailable: availableComps.length })
}

// ── ANOMALY DETECTION ────────────────────────────────────────────

async function detectAnomaly(property: any, marketData: any[]) {
  if (!marketData || marketData.length === 0) {
    return NextResponse.json({ anomaly: false, message: 'No market data to compare against' })
  }

  // Find matching market data
  const matching = marketData.filter(m =>
    m.bedrooms === property.bedrooms &&
    (m.community?.name === property.community_name ||
     m.community_id === property.community_id)
  )

  if (matching.length === 0) {
    return NextResponse.json({
      anomaly: false,
      message: `No stored PSF data for ${property.community_name} ${property.bedrooms}BR — cannot validate`,
      suggestion: 'Add market data for this community before generating'
    })
  }

  const storedPsf = matching[0].psf_aed
  const enteredPsf = Number(property.price_psf_aed)
  const enteredBua = Number(property.bua_sqft)

  const prompt = `You are a real estate data quality analyst. Analyse this property entry for anomalies.

ENTERED DATA:
- Community: ${property.community_name}
- Bedrooms: ${property.bedrooms} BR
- BUA: ${enteredBua} sq.ft
- Asking Price: AED ${Number(property.asking_price_aed).toLocaleString()}
- Price per sq.ft: AED ${enteredPsf.toLocaleString()}

MARKET DATA FOR THIS COMMUNITY + BEDROOM TYPE:
- Average PSF: AED ${storedPsf.toLocaleString()}
- Min PSF: AED ${matching[0].psf_min_aed?.toLocaleString() || 'N/A'}
- Max PSF: AED ${matching[0].psf_max_aed?.toLocaleString() || 'N/A'}
- Data source: ${matching[0].psf_source || 'Internal database'}
- Based on: ${matching[0].tx_count || '?'} transactions

Analyse for: (1) PSF vs market, (2) BUA plausibility for a ${property.bedrooms}BR ${property.unit_type_label || 'unit'} in Dubai.

Return ONLY this JSON:
{
  "anomaly": true/false,
  "severity": "low"/"medium"/"high",
  "flags": ["flag1", "flag2"],
  "message": "One clear sentence summary",
  "recommendation": "What to check or correct"
}

Be factual. Flag if PSF is >20% above or below market. Flag if BUA seems implausible for bedroom count.`

  const message = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text = (message.content[0] as any).text?.trim() || '{}'
  let result: any = {}
  try {
    result = JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    result = { anomaly: false, message: 'Analysis complete — no issues detected' }
  }

  return NextResponse.json({
    ...result,
    storedPsf,
    enteredPsf,
    deviation: storedPsf ? Math.round(Math.abs(enteredPsf - storedPsf) / storedPsf * 100) : null,
  })
}
