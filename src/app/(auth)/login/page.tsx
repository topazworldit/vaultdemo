import type { Metadata } from 'next'
import LoginForm from '@/components/forms/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark-800 flex">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
           style={{ background: 'linear-gradient(135deg, #1C1C1A 0%, #2A2826 100%)' }}>

        {/* Logo */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-medium text-white tracking-tight">Topaz</span>
            <span className="text-2xl font-light text-gold-500 tracking-tight">Builder</span>
          </div>
          <p className="text-dark-400 text-sm mt-1">by Topaz World Group</p>
        </div>

        {/* Centre content */}
        <div>
          <div className="w-12 h-0.5 bg-gold-500 mb-6" />
          <h1 className="text-3xl font-light text-white leading-tight mb-4">
            Professional sales offers,<br />
            <span className="text-gold-400">generated in seconds.</span>
          </h1>
          <p className="text-dark-400 text-sm leading-relaxed max-w-sm">
            Create branded investment offers for any Dubai property —
            off-plan or resale — with accurate DLD fees, payment plans,
            and market comparables, ready to share via WhatsApp or email.
          </p>
        </div>

        {/* Footer */}
        <div>
          <p className="text-dark-500 text-xs">
            © {new Date().getFullYear()} Topaz World Group · topazworldgroup.com
          </p>
          <p className="text-dark-600 text-xs mt-1">
            RERA Registered · Dubai, UAE
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-cream-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-baseline gap-1 mb-10">
            <span className="text-xl font-medium text-dark-800">Topaz</span>
            <span className="text-xl font-light text-gold-500">Builder</span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-medium text-dark-800">Welcome back</h2>
            <p className="text-sm text-dark-400 mt-1">Sign in to your agent account</p>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-dark-400 mt-8">
            Access issues? Contact{' '}
            <a href="mailto:support@topazworldgroup.com"
               className="text-gold-600 hover:underline">
              support@topazworldgroup.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
export const dynamic = 'force-dynamic'
