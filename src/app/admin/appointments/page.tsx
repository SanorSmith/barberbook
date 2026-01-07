'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
  }, [filter, statusFilter])

  const loadAppointments = async () => {
    setLoading(true)
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        services (name, duration),
        barbers (name),
        profiles (full_name, email)
      `)

    const today = new Date().toISOString().split('T')[0]

    if (filter === 'today') {
      query = query.eq('booking_date', today)
    } else if (filter === 'upcoming') {
      query = query.gte('booking_date', today)
    } else if (filter === 'past') {
      query = query.lt('booking_date', today)
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
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

  const deleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    await supabase
      .from('bookings')
      .delete()
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
      <h1 className="font-serif text-3xl text-cream mb-8">Appointments Management</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {['all', 'today', 'upcoming', 'past'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-gold text-obsidian'
                  : 'bg-charcoal text-silver hover:text-cream'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-charcoal border border-slate rounded-lg px-4 py-2 text-cream focus:border-gold outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Total</div>
          <div className="text-cream text-2xl font-bold">{appointments.length}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Pending</div>
          <div className="text-yellow-400 text-2xl font-bold">
            {appointments.filter(a => a.status === 'pending').length}
          </div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Confirmed</div>
          <div className="text-blue-400 text-2xl font-bold">
            {appointments.filter(a => a.status === 'confirmed').length}
          </div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Completed</div>
          <div className="text-green-400 text-2xl font-bold">
            {appointments.filter(a => a.status === 'completed').length}
          </div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Revenue</div>
          <div className="text-gold text-2xl font-bold">
            €{appointments
              .filter(a => a.status === 'completed')
              .reduce((sum, a) => sum + (a.total_price || 0), 0)
              .toFixed(0)}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-charcoal border border-slate rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-obsidian">
            <tr>
              <th className="text-left text-silver text-sm font-medium p-4">Date & Time</th>
              <th className="text-left text-silver text-sm font-medium p-4">Customer</th>
              <th className="text-left text-silver text-sm font-medium p-4">Service</th>
              <th className="text-left text-silver text-sm font-medium p-4">Barber</th>
              <th className="text-left text-silver text-sm font-medium p-4">Status</th>
              <th className="text-right text-silver text-sm font-medium p-4">Price</th>
              <th className="text-right text-silver text-sm font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-slate hover:bg-slate/20">
                <td className="p-4">
                  <div className="text-cream font-medium">
                    {new Date(appointment.booking_date).toLocaleDateString()}
                  </div>
                  <div className="text-silver text-sm">{appointment.booking_time}</div>
                </td>
                <td className="p-4">
                  <div className="text-cream">{appointment.profiles?.full_name || 'N/A'}</div>
                  <div className="text-silver text-sm">{appointment.profiles?.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-cream">{appointment.services?.name || 'N/A'}</div>
                  <div className="text-silver text-sm">{appointment.services?.duration || 0} min</div>
                </td>
                <td className="p-4 text-silver">{appointment.barbers?.name || 'N/A'}</td>
                <td className="p-4">
                  <select
                    value={appointment.status}
                    onChange={(e) => updateStatus(appointment.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 outline-none cursor-pointer ${
                      appointment.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : appointment.status === 'confirmed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : appointment.status === 'no_show'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </td>
                <td className="p-4 text-right text-gold font-semibold">
                  €{appointment.total_price?.toFixed(2)}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => deleteAppointment(appointment.id)}
                    className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <div className="text-center py-12 text-silver">
            No appointments found
          </div>
        )}
      </div>
    </div>
  )
}
