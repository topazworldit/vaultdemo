import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Download, FileText, Calendar, Building2 } from 'lucide-react'

export default async function ClientPortalPage({
  params
}: { params: { token: string } }) {
  const serviceClient = createServiceClient()

  // Look up client by portal token
  const { data: client } = await serviceClient
    .from('clients')
    .select(`
      *,
      agent:agents(full_name, display_name, title, phone, email, photo_url, company_name)
    `)
    .eq('portal_token', params.token)
    .single()

  if (!client) notFound()

  // Get all offers for this client
  const { data: offers } = await serviceClient
    .from('offers')
    .select('*')
    .eq('client_id', client.id)
    .in('status', ['generated', 'sent', 'accepted'])
    .order('created_at', { ascending: false })

  const agent = client.agent as any

  return (
    <div className="min-h-screen bg-dark-950" style={{ background: '#0F0E0C' }}>

      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
              <span className="text-xs font-bold text-dark-900">TW</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Topaz World Group</p>
              <p className="text-xs text-white/40">topazworldgroup.com</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Your advisor</p>
            <p className="text-sm text-white font-medium">{agent?.display_name || agent?.full_name || 'Topaz Agent'}</p>
          </div>
        </div>
      </div>

      {/* Client greeting */}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-2">Your property offers</p>
        <h1 className="text-3xl font-bold text-white mb-1">
          {client.full_name}
        </h1>
        <p className="text-white/50">
          {offers?.length || 0} offer{(offers?.length || 0) !== 1 ? 's' : ''} prepared for you
        </p>
      </div>

      {/* Offers */}
      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-4">
        {offers && offers.length > 0 ? offers.map((offer: any) => (
          <div
            key={offer.id}
            className="rounded-2xl border border-white/8 overflow-hidden"
            style={{ background: '#1A1916' }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                    {offer.market_type === 'off_plan' ? 'Off-Plan' :
                     offer.market_type === 'resale' ? 'Resale' : 'Ready'}
                  </p>
                  <h2 className="text-lg font-semibold text-white">
                    {offer.project_name_snapshot}
                  </h2>
                  <p className="text-white/50 text-sm">
                    {offer.community_name_snapshot} · {offer.unit_reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gold-400">
                    AED {Number(offer.asking_price_aed).toLocaleString()}
                  </p>
                  {offer.price_psf_aed && (
                    <p className="text-xs text-white/40">
                      AED {Number(offer.price_psf_aed).toLocaleString()} per sq.ft
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-white/40 mb-5">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {offer.developer_name_snapshot}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(offer.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {offer.bua_sqft && (
                  <span>{Number(offer.bua_sqft).toLocaleString()} sq.ft</span>
                )}
              </div>

              {/* DLD waiver */}
              {offer.dld_waiver_type && offer.dld_waiver_type !== 'none' && (
                <div className="rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2"
                     style={{ background: '#2C2518', border: '1px solid #B8975A40' }}>
                  <span className="text-gold-400 text-sm">★</span>
                  <p className="text-sm text-gold-300 font-medium">
                    {offer.dld_waiver_label || '4% DLD Fee Waiver Included'}
                  </p>
                  {offer.dld_waiver_saving_aed && (
                    <p className="text-xs text-gold-400/60 ml-auto">
                      Saving: AED {Number(offer.dld_waiver_saving_aed).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {offer.pdf_url && (
                  <a
                    href={offer.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: '#B8975A', color: '#1A1916' }}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
                {offer.share_url && (
                  <a
                    href={offer.share_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View offer
                  </a>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No offers yet — your advisor will share properties here</p>
          </div>
        )}
      </div>

      {/* Agent footer */}
      <div className="border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
              <span className="text-sm font-medium text-gold-400">
                {(agent?.full_name || 'TW').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{agent?.full_name || 'Topaz Advisor'}</p>
              <p className="text-white/40 text-sm">{agent?.title || 'Investment Advisor'} · Topaz World Group</p>
              {agent?.phone && <p className="text-gold-400 text-sm">{agent.phone}</p>}
            </div>
            {agent?.phone && (
              <a
                href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
