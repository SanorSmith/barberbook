import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookingCard from '@/components/BookingCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's bookings from database
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_date,
      booking_time,
      status,
      services (name),
      barbers (name)
    `)
    .eq('user_id', user.id)
    .neq('status', 'cancelled')
    .order('booking_date', { ascending: true })

  // Transform bookings data
  const formattedBookings = bookings?.map(b => ({
    id: b.id,
    service_name: (b.services as any)?.name || 'Service',
    barber_name: (b.barbers as any)?.name || 'Barber',
    booking_date: b.booking_date,
    booking_time: b.booking_time,
    status: b.status
  })) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-2">
          <div className="bg-charcoal border border-slate rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif text-xl">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-cream font-medium">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-silver text-xs">{user.email}</p>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-gold/10 text-gold rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              My Bookings
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-silver hover:text-cream hover:bg-charcoal rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            <Link href="/dashboard/favorites" className="flex items-center gap-3 px-4 py-3 text-silver hover:text-cream hover:bg-charcoal rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Favorites
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h2 className="font-serif text-3xl text-cream mb-8">My Bookings</h2>
          
          <div className="flex space-x-6 border-b border-slate mb-8">
            <button className="pb-3 border-b-2 border-gold text-gold font-medium">Upcoming</button>
            <button className="pb-3 border-b-2 border-transparent text-silver hover:text-cream">Past</button>
            <button className="pb-3 border-b-2 border-transparent text-silver hover:text-cream">Cancelled</button>
          </div>
          
          <div className="space-y-4">
            {formattedBookings.length > 0 ? (
              formattedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="text-center py-12 text-silver">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mb-4">No upcoming bookings</p>
                <Link href="/booking" className="text-gold hover:underline">Book your first appointment</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
