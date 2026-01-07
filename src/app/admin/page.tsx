'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    activeBarbers: 0,
    todayBookings: 0,
    pendingBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    // Get all bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, services(name), barbers(name), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(10)

    setRecentBookings(bookings || [])

    // Get stats
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    const { data: revenue } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('status', 'completed')

    const totalRevenue = revenue?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    const { count: activeBarbers } = await supabase
      .from('barbers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const today = new Date().toISOString().split('T')[0]
    const { count: todayBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('booking_date', today)

    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    setStats({
      totalBookings: totalBookings || 0,
      totalRevenue,
      totalCustomers: totalCustomers || 0,
      activeBarbers: activeBarbers || 0,
      todayBookings: todayBookings || 0,
      pendingBookings: pendingBookings || 0
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-cream mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Total Bookings</div>
          <div className="text-cream text-3xl font-bold">{stats.totalBookings}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Revenue</div>
          <div className="text-gold text-3xl font-bold">€{stats.totalRevenue.toFixed(0)}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Customers</div>
          <div className="text-cream text-3xl font-bold">{stats.totalCustomers}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Active Barbers</div>
          <div className="text-cream text-3xl font-bold">{stats.activeBarbers}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Today</div>
          <div className="text-blue-400 text-3xl font-bold">{stats.todayBookings}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Pending</div>
          <div className="text-yellow-400 text-3xl font-bold">{stats.pendingBookings}</div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-charcoal border border-slate rounded-lg p-6">
        <h2 className="text-cream font-semibold text-xl mb-6">Recent Bookings</h2>
        
        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate">
                  <th className="text-left text-silver text-sm font-medium pb-3">Customer</th>
                  <th className="text-left text-silver text-sm font-medium pb-3">Service</th>
                  <th className="text-left text-silver text-sm font-medium pb-3">Barber</th>
                  <th className="text-left text-silver text-sm font-medium pb-3">Date</th>
                  <th className="text-left text-silver text-sm font-medium pb-3">Time</th>
                  <th className="text-left text-silver text-sm font-medium pb-3">Status</th>
                  <th className="text-right text-silver text-sm font-medium pb-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate/50">
                    <td className="py-3 text-cream">{booking.profiles?.full_name || 'N/A'}</td>
                    <td className="py-3 text-silver">{booking.services?.name || 'N/A'}</td>
                    <td className="py-3 text-silver">{booking.barbers?.name || 'N/A'}</td>
                    <td className="py-3 text-silver">{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td className="py-3 text-silver">{booking.booking_time}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : booking.status === 'confirmed'
                            ? 'bg-blue-500/20 text-blue-400'
                            : booking.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gold font-semibold">€{booking.total_price?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-silver text-center py-8">No bookings yet</p>
        )}
      </div>
    </div>
  )
}
