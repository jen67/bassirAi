'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    document.cookie = "sb-mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    document.cookie = "sb-mock-onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      name: 'Unified Inbox',
      path: '/inbox',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 flex justify-between items-center z-30 w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center shadow-md shadow-[#D4AF37]/15">
            <span className="text-slate-950 font-bold text-sm">Z</span>
          </div>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Zuri Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900/40 backdrop-blur-xl border-r border-slate-900/60 p-6 z-20 shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center shadow-lg shadow-[#D4AF37]/15">
            <span className="text-slate-950 font-extrabold text-lg">Z</span>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Zuri Aesthetic</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Lekki, Lagos</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.path
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  active
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shadow-lg shadow-[#D4AF37]/5'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-white border border-transparent'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            )
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="border-t border-slate-850 pt-5 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
              BB
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Babajide Benson</p>
              <p className="text-[10px] text-slate-500">Clinic Admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 border border-slate-800/80 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-slate-400 text-xs font-bold py-2.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-slate-950/95 flex flex-col p-6 pt-24 space-y-4">
          {navItems.map((item) => {
            const active = pathname === item.path
            return (
              <button
                key={item.name}
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push(item.path)
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-sm font-bold ${
                  active ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-slate-400'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            )
          })}
          <div className="border-t border-slate-800 pt-6 mt-auto">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold py-3 rounded-xl"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen z-10 w-full">
        {children}
      </main>
    </div>
  )
}
