// ============================================================
// TOPAZBUILDER — Supabase Database Types
//
// IMPORTANT: This is a placeholder stub.
// After deploying to Supabase, regenerate with:
//
//   npx supabase gen types typescript \
//     --project-id your-project-id \
//     --schema public > src/lib/database.types.ts
//
// Or install Supabase CLI and run:
//   supabase gen types typescript --local > src/lib/database.types.ts
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          email: string
          full_name: string
          display_name: string | null
          role: 'agent' | 'senior_agent' | 'admin' | 'super_admin'
          rera_number: string | null
          rera_expiry: string | null
          phone: string | null
          whatsapp: string | null
          photo_url: string | null
          title: string
          office_address: string
          active: boolean
          onboarded_at: string
          last_login_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['agents']['Row']>
        Update: Partial<Database['public']['Tables']['agents']['Row']>
      }
      developers: {
        Row: {
          id: string
          name: string
          short_name: string | null
          tier: 'tier_1_gov' | 'tier_1_private' | 'tier_2_private' | 'tier_3_boutique'
          mortgage_rule: 'emaar' | 'dubai_holdings' | 'standard_uae' | 'freehold_only' | 'tbc'
          logo_url: string | null
          website: string | null
          headquarters: string
          active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['developers']['Row']>
        Update: Partial<Database['public']['Tables']['developers']['Row']>
      }
      communities: {
        Row: {
          id: string
          name: string
          city: string
          emirate: string
          master_developer: string | null
          zone: string | null
          latitude: number | null
          longitude: number | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['communities']['Row']>
        Update: Partial<Database['public']['Tables']['communities']['Row']>
      }
      projects: {
        Row: {
          id: string
          developer_id: string
          community_id: string
          name: string
          full_name: string | null
          market_type: 'off_plan' | 'ready' | 'resale'
          property_types: string[]
          total_units: number | null
          completion_date: string | null
          completion_date_label: string | null
          service_charge_psf: number | null
          brochure_url: string | null
          active: boolean
          is_sold_out: boolean
          notes: string | null
          dld_waiver_type: 'none' | 'full_4pct' | 'half_2pct' | 'custom'
          dld_waiver_pct: number
          dld_waiver_label: string | null
          dld_waiver_valid_until: string | null
          dld_waiver_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['projects']['Row']>
        Update: Partial<Database['public']['Tables']['projects']['Row']>
      }
      offers: {
        Row: {
          id: string
          reference_number: string
          agent_id: string
          client_id: string | null
          project_id: string | null
          template: 'T1_portrait' | 'T2_editorial' | 'T3_landscape'
          status: 'draft' | 'generated' | 'sent' | 'accepted' | 'rejected' | 'expired'
          market_type: 'off_plan' | 'ready' | 'resale'
          developer_name_snapshot: string
          community_name_snapshot: string
          project_name_snapshot: string
          unit_reference: string
          asking_price_aed: number
          bua_sqft: number
          image_hero: string | null
          image_lifestyle: string | null
          image_map: string | null
          image_masterplan: string | null
          pdf_url: string | null
          share_token: string | null
          share_url: string | null
          share_view_count: number
          created_at: string
          updated_at: string
          [key: string]: unknown
        }
        Insert: Partial<Database['public']['Tables']['offers']['Row']>
        Update: Partial<Database['public']['Tables']['offers']['Row']>
      }
      clients: {
        Row: {
          id: string
          agent_id: string
          full_name: string
          email: string | null
          phone: string | null
          whatsapp: string | null
          nationality: string | null
          budget_min_aed: number | null
          budget_max_aed: number | null
          notes: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['clients']['Row']>
        Update: Partial<Database['public']['Tables']['clients']['Row']>
      }
      market_data: {
        Row: {
          id: string
          project_id: string
          bedrooms: number | null
          bedroom_label: string | null
          psf_aed: number
          psf_source: string | null
          psf_status: 'fresh' | 'stale' | 'expired'
          valid_from: string
          updated_at: string
          updated_by: string | null
        }
        Insert: Partial<Database['public']['Tables']['market_data']['Row']>
        Update: Partial<Database['public']['Tables']['market_data']['Row']>
      }
    }
    Views: {
      v_offer_full: {
        Row: Record<string, unknown>
      }
      v_agent_offer_stats: {
        Row: Record<string, unknown>
      }
      v_market_data_health: {
        Row: Record<string, unknown>
      }
    }
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
