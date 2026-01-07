'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BarberAllAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
  }, [filter])

  const loadAppointments = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: barber } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!barber) return

    let query = supabase
      .from('bookings')
      .select(`
        *,
        services (name, duration),
        profiles (full_name, email, phone)
      `)
      .eq('barber_id', barber.id)

    const today = new Date().toISOString().split('T')[0]

    if (filter === 'upcoming') {
      query = query.gte('booking_date', today).in('status', ['pending', 'confirmed'])
    } else if (filter === 'past') {
      query = query.or(`booking_date.lt.${today},status.eq.completed`)
    }

    query = query.order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })

    const { data } = await query
    setAppointments(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)

    loadAppointments()
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
      <h1 className="font-serif text-3xl text-cream mb-8">All Appointments</h1>

      <div className="flex gap-2 mb-6">
        {['all', 'upcoming', 'past'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-gold text-obsidian'
                : 'bg-charcoal text-silver hover:text-cream border border-slate'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-charcoal border border-slate rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="text-center min-w-[100px]">
                    <div className="text-gold font-semibold text-lg">
                      {new Date(appointment.booking_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-cream font-medium">{appointment.booking_time}</div>
                    <div className="text-silver text-xs mt-1">{appointment.services?.duration || 30} min</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-cream font-semibold mb-1">
                      {appointment.profiles?.full_name || 'Customer'}
                    </h3>
                    <p className="text-silver text-sm mb-2">{appointment.services?.name || 'Service'}</p>
                    <div className="text-silver text-xs">
                      {appointment.profiles?.email}
                      {appointment.profiles?.phone && ` • ${appointment.profiles.phone}`}
                    </div>
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

              {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                <div className="mt-4 pt-4 border-t border-slate flex gap-2">
                  <button
                    onClick={() => updateStatus(appointment.id, 'completed')}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => updateStatus(appointment.id, 'no_show')}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    No Show
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto mb-4 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-cream text-lg font-medium mb-2">No appointments</h3>
          <p className="text-silver">No appointments found for this filter</p>
        </div>
      )}
    </div>
  )
}
