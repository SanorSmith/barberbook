'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BarberDashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    today: 0,
    completed: 0,
    pending: 0,
    revenue: 0
  })
  const supabase = createClient()

  useEffect(() => {
    loadTodayAppointments()
  }, [])

  const loadTodayAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get barber info
    const { data: barber } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!barber) return

    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        services (name, duration),
        profiles (full_name, email)
      `)
      .eq('barber_id', barber.id)
      .eq('booking_date', today)
      .order('booking_time', { ascending: true })

    setAppointments(data || [])
    
    // Calculate stats
    const todayCount = data?.length || 0
    const completed = data?.filter(a => a.status === 'completed').length || 0
    const pending = data?.filter(a => a.status === 'confirmed' || a.status === 'pending').length || 0
    const revenue = data?.reduce((sum, a) => sum + (a.total_price || 0), 0) || 0

    setStats({ today: todayCount, completed, pending, revenue })
    setLoading(false)
  }

  const updateAppointmentStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)

    if (!error) {
      loadTodayAppointments()
    }
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
      <h1 className="font-serif text-3xl text-cream mb-8">Today's Schedule</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Total Appointments</div>
          <div className="text-cream text-3xl font-bold">{stats.today}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Completed</div>
          <div className="text-green-400 text-3xl font-bold">{stats.completed}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Pending</div>
          <div className="text-yellow-400 text-3xl font-bold">{stats.pending}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <div className="text-silver text-sm mb-1">Today's Revenue</div>
          <div className="text-gold text-3xl font-bold">€{stats.revenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Appointments Timeline */}
      <div className="bg-charcoal border border-slate rounded-lg p-6">
        <h2 className="text-cream font-semibold text-xl mb-6">Appointments</h2>
        
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-obsidian border border-slate rounded-lg p-4 hover:border-gold/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="text-center min-w-[80px]">
                      <div className="text-gold font-semibold text-lg">{appointment.booking_time}</div>
                      <div className="text-silver text-xs">{appointment.services?.duration || 30} min</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-cream font-semibold mb-1">
                        {appointment.profiles?.full_name || 'Customer'}
                      </h3>
                      <p className="text-silver text-sm mb-2">{appointment.services?.name || 'Service'}</p>
                      {appointment.notes && (
                        <p className="text-silver text-xs italic">Note: {appointment.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-gold font-semibold mb-2">€{appointment.total_price?.toFixed(2)}</div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : appointment.status === 'confirmed'
                            ? 'bg-blue-500/20 text-blue-400'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                  <div className="mt-4 pt-4 border-t border-slate flex gap-2">
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'no_show')}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      No Show
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      className="px-4 py-2 bg-slate hover:bg-slate/80 text-silver rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-cream text-lg font-medium mb-2">No appointments today</h3>
            <p className="text-silver">You have a free day!</p>
          </div>
        )}
      </div>
    </div>
  )
}
