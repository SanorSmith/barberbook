import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  // Get admin stats with error handling
  const [
    bookingsResult,
    usersResult,
    servicesResult,
    barbersResult
  ] = await Promise.allSettled([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('barbers').select('*', { count: 'exact', head: true })
  ])

  const totalBookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value.count : 0
  const totalUsers = usersResult.status === 'fulfilled' ? usersResult.value.count : 0
  const totalServices = servicesResult.status === 'fulfilled' ? servicesResult.value.count : 0
  const totalBarbers = barbersResult.status === 'fulfilled' ? barbersResult.value.count : 0

  // Get recent bookings with error handling
  const { data: recentBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      *,
      services (name),
      barbers (name),
      profiles (email, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('Admin dashboard data:', { totalBookings, totalUsers, totalServices, totalBarbers, recentBookings: recentBookings?.length, bookingsError })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl text-cream mb-8">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-silver text-sm">Total Bookings</span>
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-3xl text-cream font-bold">{totalBookings || 0}</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-silver text-sm">Total Users</span>
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-3xl text-cream font-bold">{totalUsers || 0}</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-silver text-sm">Services</span>
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-3xl text-cream font-bold">{totalServices || 0}</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-silver text-sm">Barbers</span>
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-3xl text-cream font-bold">{totalBarbers || 0}</div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-charcoal border border-slate rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-cream font-semibold">Recent Bookings</h2>
          <Link href="/dashboard/admin/bookings" className="text-gold hover:underline text-sm">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate">
                <th className="text-left py-3 px-4 text-silver">Customer</th>
                <th className="text-left py-3 px-4 text-silver">Service</th>
                <th className="text-left py-3 px-4 text-silver">Barber</th>
                <th className="text-left py-3 px-4 text-silver">Date</th>
                <th className="text-left py-3 px-4 text-silver">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings?.map((booking: any) => (
                <tr key={booking.id} className="border-b border-slate/50">
                  <td className="py-3 px-4 text-cream">
                    {(booking.profiles as any)?.full_name || (booking.profiles as any)?.email || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-cream">{(booking.services as any)?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-cream">{(booking.barbers as any)?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-cream">
                    {new Date(booking.booking_date).toLocaleDateString()} {booking.booking_time}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                      booking.status === 'pending' ? 'bg-warning/10 text-warning' :
                      booking.status === 'cancelled' ? 'bg-error/10 text-error' :
                      'bg-silver/10 text-silver'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link href="/dashboard/admin/services" className="bg-charcoal border border-slate rounded-xl p-6 hover:border-gold transition-colors">
          <h3 className="text-lg text-cream font-semibold mb-2">Manage Services</h3>
          <p className="text-silver text-sm">Add, edit, or remove services</p>
        </Link>
        
        <Link href="/dashboard/admin/barbers" className="bg-charcoal border border-slate rounded-xl p-6 hover:border-gold transition-colors">
          <h3 className="text-lg text-cream font-semibold mb-2">Manage Barbers</h3>
          <p className="text-silver text-sm">Add barbers and manage schedules</p>
        </Link>
        
        <Link href="/dashboard/admin/users" className="bg-charcoal border border-slate rounded-xl p-6 hover:border-gold transition-colors">
          <h3 className="text-lg text-cream font-semibold mb-2">Manage Users</h3>
          <p className="text-silver text-sm">View and manage user accounts</p>
        </Link>
      </div>
    </div>
  )
}
