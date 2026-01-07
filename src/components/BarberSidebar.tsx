'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

export default function BarberSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [barber, setBarber] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: barber } = await supabase
          .from('barbers')
          .select('*')
          .eq('user_id', user.id)
          .single()
        setBarber(barber)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const menuItems = [
    { href: '/dashboard/barber', label: 'Today', icon: '📅' },
    { href: '/dashboard/barber/appointments', label: 'All Appointments', icon: '📋' },
    { href: '/dashboard/barber/schedule', label: 'My Schedule', icon: '⏰' },
    { href: '/dashboard/barber/earnings', label: 'Earnings', icon: '💰' },
    { href: '/dashboard/barber/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="w-64 bg-obsidian border-r border-slate h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate">
        <Link href="/dashboard/barber" className="flex-shrink-0">
          <span className="font-serif text-2xl font-semibold tracking-tight text-gold">BARBERBOOK</span>
        </Link>
      </div>

      {/* Barber Info */}
      {barber && (
        <div className="p-6 border-b border-slate">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate flex items-center justify-center text-gold font-serif text-xl">
              {barber.name?.charAt(0) || 'B'}
            </div>
            <div>
              <p className="text-cream font-medium">{barber.name}</p>
              <span className="text-xs text-silver bg-slate px-2 py-1 rounded-full">Barber</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-gold/10 text-gold'
                    : 'text-silver hover:text-cream hover:bg-charcoal'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-silver hover:text-error hover:bg-charcoal rounded-lg transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
