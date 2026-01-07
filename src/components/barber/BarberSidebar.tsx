'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'

interface BarberSidebarProps {
  user: any
  barber: any
}

export default function BarberSidebar({ user, barber }: BarberSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navItems = [
    {
      name: "Today's Schedule",
      href: '/barber',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'All Appointments',
      href: '/barber/appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'My Schedule',
      href: '/barber/schedule',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Profile',
      href: '/barber/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="w-64 bg-charcoal min-h-screen border-r border-slate">
      {/* Barber Info */}
      <div className="p-6 border-b border-slate">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
            {barber?.image_url ? (
              <img src={barber.image_url} alt={barber.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-gold text-xl font-semibold">
                {barber?.name?.charAt(0) || user?.full_name?.charAt(0) || 'B'}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-cream font-medium">{barber?.name || user?.full_name || 'Barber'}</h3>
            <p className="text-silver text-sm">{barber?.role || 'Barber'}</p>
          </div>
        </div>
        {barber?.rating && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gold">★</span>
            <span className="text-cream font-semibold">{barber.rating}</span>
            <span className="text-silver">({barber.review_count || 0} reviews)</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gold text-obsidian'
                      : 'text-silver hover:bg-slate hover:text-cream'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-slate">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-silver hover:text-cream transition-colors w-full px-4 py-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
