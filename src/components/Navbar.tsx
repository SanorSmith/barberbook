'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'customer' | 'barber' | 'admin'
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const navRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUser = async () => {
    setLoading(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', authUser.id)
        .single()
      
      setUser(profile)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const getDashboardPath = (role: string) => {
    return role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/dashboard'
  }

  const updateIndicator = (targetElement?: HTMLElement) => {
    if (!navRef.current) return

    const navLinks = navRef.current.querySelectorAll('a[data-nav-link]')
    let activeLink: HTMLElement | null = null

    if (targetElement) {
      activeLink = targetElement
    } else {
      // Find active link based on current pathname
      navLinks.forEach((link) => {
        const href = link.getAttribute('href')
        if (href && (href === pathname || (href !== '/' && pathname.startsWith(href)))) {
          activeLink = link as HTMLElement
        }
      })
    }

    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      
      setIndicatorStyle({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        opacity: 1
      })
    } else {
      setIndicatorStyle({ left: 0, width: 0, opacity: 0 })
    }
  }

  useEffect(() => {
    // Update indicator when pathname changes
    const timer = setTimeout(() => {
      updateIndicator()
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, user])

  useEffect(() => {
    // Update indicator on window resize
    const handleResize = () => updateIndicator()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pathname, user])

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-obsidian/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-serif text-2xl font-semibold tracking-tight text-gold inline-flex" style={{ perspective: '1000px' }}>
              {'BARBERBOOK'.split('').map((char, index) => (
                <span
                  key={index}
                  className="inline-block opacity-0"
                  style={{
                    animation: 'zoomFlipIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
                    animationDelay: `${index * 0.08}s`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div ref={navRef} className="ml-10 flex items-baseline space-x-8 relative">
              {/* Show public pages for guests and customers */}
              {(!user || user.role === 'customer') && (
                <>
                  <Link 
                    href="/services" 
                    data-nav-link
                    onMouseEnter={(e) => updateIndicator(e.currentTarget)}
                    onMouseLeave={() => updateIndicator()}
                    className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide opacity-0"
                    style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '0ms' }}
                  >
                    Services
                  </Link>
                  <Link 
                    href="/barbers" 
                    data-nav-link
                    onMouseEnter={(e) => updateIndicator(e.currentTarget)}
                    onMouseLeave={() => updateIndicator()}
                    className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide opacity-0"
                    style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '80ms' }}
                  >
                    Barbers
                  </Link>
                  <Link 
                    href="/about" 
                    data-nav-link
                    onMouseEnter={(e) => updateIndicator(e.currentTarget)}
                    onMouseLeave={() => updateIndicator()}
                    className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide opacity-0"
                    style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '160ms' }}
                  >
                    About
                  </Link>
                  <Link 
                    href="/contact" 
                    data-nav-link
                    onMouseEnter={(e) => updateIndicator(e.currentTarget)}
                    onMouseLeave={() => updateIndicator()}
                    className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide opacity-0"
                    style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '240ms' }}
                  >
                    Contact
                  </Link>
                </>
              )}
              
              {/* Customer-specific links */}
              {user && user.role === 'customer' && (
                <Link 
                  href="/dashboard" 
                  data-nav-link
                  onMouseEnter={(e) => updateIndicator(e.currentTarget)}
                  onMouseLeave={() => updateIndicator()}
                  className="hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide opacity-0"
                  style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '320ms' }}
                >
                  My Bookings
                </Link>
              )}
              
              {/* Sliding Indicator */}
              <div
                className="absolute bottom-0 h-0.5 bg-gold transition-all duration-300 ease-out"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity
                }}
              />
            </div>
          </div>

          {/* Right Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="opacity-0" style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '320ms' }}>
              <LanguageSwitcher />
            </div>
            {!loading && (
              user ? (
                <div className="relative opacity-0" style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '400ms' }}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 text-sm font-medium hover:text-gold transition-colors"
                  >
                    <span>{user.full_name || user.email}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-charcoal border border-slate rounded-lg shadow-lg py-1">
                      {user.role === 'customer' && (
                        <>
                          <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Dashboard
                          </Link>
                          <Link href="/dashboard/profile" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Profile
                          </Link>
                        </>
                      )}
                      
                      {user.role === 'barber' && (
                        <>
                          <Link href="/barber" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Today
                          </Link>
                          <Link href="/barber/appointments" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Appointments
                          </Link>
                          <Link href="/barber/schedule" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Schedule
                          </Link>
                          <Link href="/barber/profile" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Profile
                          </Link>
                        </>
                      )}
                      
                      {user.role === 'admin' && (
                        <>
                          <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Dashboard
                          </Link>
                          <Link href="/admin/services" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Services
                          </Link>
                          <Link href="/admin/barbers" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Barbers
                          </Link>
                          <Link href="/admin/customers" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Customers
                          </Link>
                          <Link href="/admin/settings" className="block px-4 py-2 text-sm hover:bg-slate hover:text-gold" onClick={() => setUserDropdownOpen(false)}>
                            Settings
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-slate my-1"></div>
                      <button 
                        onClick={() => { handleLogout(); setUserDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-slate hover:text-gold"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="text-sm font-medium hover:text-gold transition-colors opacity-0" style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '400ms' }}>
                  Login
                </Link>
              )
            )}
            {/* Book Now button - only show for guests and customers */}
            {(!user || user.role === 'customer') && (
              <Link 
                href="/booking" 
                className="bg-gold hover:bg-gold-hover text-obsidian px-6 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wider transition-transform hover:scale-105 opacity-0"
                style={{ animation: 'slideInFromRight 0.4s ease-out forwards', animationDelay: '480ms' }}
              >
                Book Now
              </Link>
            )}
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
            {/* Show public pages for guests and customers */}
            {(!user || user.role === 'customer') && (
              <>
                <Link href="/services" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                  Services
                </Link>
                <Link href="/barbers" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                  Barbers
                </Link>
                <Link href="/about" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <Link href="/contact" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
              </>
            )}
            
            {!loading && (
              user ? (
                <>
                  {user.role === 'customer' && (
                    <>
                      <Link href="/dashboard" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        My Bookings
                      </Link>
                      <Link href="/dashboard/profile" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Profile
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'barber' && (
                    <>
                      <Link href="/barber" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Today
                      </Link>
                      <Link href="/barber/appointments" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Appointments
                      </Link>
                      <Link href="/barber/schedule" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Schedule
                      </Link>
                      <Link href="/barber/profile" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Profile
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <>
                      <Link href="/admin" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <Link href="/admin/services" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Services
                      </Link>
                      <Link href="/admin/barbers" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Barbers
                      </Link>
                      <Link href="/admin/customers" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Customers
                      </Link>
                      <Link href="/admin/settings" className="block px-3 py-3 text-base font-medium hover:text-gold" onClick={() => setMobileMenuOpen(false)}>
                        Settings
                      </Link>
                    </>
                  )}
                  
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
            
            {/* Book Now button - only show for guests and customers */}
            {(!user || user.role === 'customer') && (
              <Link 
                href="/booking" 
                className="block w-full mt-4 bg-gold text-obsidian py-3 rounded-lg font-medium uppercase text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
