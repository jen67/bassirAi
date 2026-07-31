'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    // Clear mock session cookie
    document.cookie = "sb-mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    
    // Clear Supabase session
    await supabase.auth.signOut()

    router.refresh()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative text-white overflow-hidden font-sans">
      {/* Decorative Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl z-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center shadow-lg shadow-[#D4AF37]/15 mx-auto mb-6">
          <svg className="w-8 h-8 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Authentication Successful</h1>
        <p className="text-slate-400 text-xs mb-8">
          You are securely logged into the **Zuri Aesthetic Clinic** Admin Panel (Authenticated Session).
        </p>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-8 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Security Gate:</span>
            <span className="text-emerald-400 font-mono">Next.js Proxy Router Guard</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Active Tenant:</span>
            <span className="text-white font-semibold">Zuri Lekki Office</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Authentication Protocol:</span>
            <span className="text-[#D4AF37] font-mono">Supabase SSR Cookies</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSignOut}
            className="flex-1 border border-slate-800 hover:bg-slate-800/50 text-slate-300 font-semibold text-xs rounded-lg py-3 transition-colors"
          >
            Sign Out
          </button>
          
          <button
            onClick={() => router.push('/dashboard/onboarding')}
            className="flex-1 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-slate-950 font-bold text-xs rounded-lg py-3 shadow-lg shadow-[#D4AF37]/5 transition-all duration-300 transform active:scale-[0.98]"
          >
            Start Setup Wizard
          </button>
        </div>
      </div>
    </main>
  )
}
