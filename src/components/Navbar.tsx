'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setUserRole(profile?.role || null)
      }
      
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setUserRole(profile?.role || null)
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-obsidian/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-serif text-2xl font-semibold tracking-tight text-gold">BARBERBOOK</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/services" className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide">
                Services
              </Link>
              <Link href="/barbers" className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide">
                Barbers
              </Link>
              <Link href="#about" className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide">
                About
              </Link>
              <Link href="#contact" className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide">
                Contact
              </Link>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {!loading && (
              user ? (
                <>
                  <Link 
                    href={
                      userRole === 'admin' ? '/dashboard/admin' :
                      userRole === 'barber' ? '/dashboard/barber' :
                      '/dashboard'
                    } 
                    className="text-sm font-medium hover:text-gold transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-medium hover:text-gold transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-sm font-medium hover:text-gold transition-colors">
                  Login
                </Link>
              )
            )}
            <Link 
              href="/booking" 
              className="bg-gold hover:bg-gold-hover text-obsidian px-6 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wider transition-transform hover:scale-105"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-cream hover:text-gold p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-charcoal border-b border-slate">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link href="/services" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
              Services
            </Link>
            <Link href="/barbers" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
              Barbers
            </Link>
            {!loading && (
              user ? (
                <>
                  <Link 
                    href={
                      userRole === 'admin' ? '/dashboard/admin' :
                      userRole === 'barber' ? '/dashboard/barber' :
                      '/dashboard'
                    } 
                    className="block px-3 py-3 text-base font-medium hover:text-gold" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-3 text-base font-medium hover:text-gold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              )
            )}
            <Link 
              href="/booking" 
              className="block w-full mt-4 bg-gold text-obsidian py-3 rounded-lg font-medium uppercase text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
