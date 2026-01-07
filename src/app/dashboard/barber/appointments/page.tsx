'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Booking, Service, Barber } from '@/lib/types'

export default function BarberAppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get barber info
    const { data: barber } = await supabase
      .from('barbers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!barber) return

    // Get bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        *,
        services (*),
        profiles (*)
      `)
      .eq('barber_id', barber.id)
      .order('booking_date', { ascending: true })

    // Get services
    const { data: services } = await supabase
      .from('services')
      .select('*')

    setBookings((bookings || []) as Booking[])
    setServices(services || [])
    setLoading(false)
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)

    if (!error) {
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: status as Booking['status'] } : b
      ))
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter
    const matchesSearch = search === '' || 
      (booking.profiles as any)?.full_name?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getBookingsForDay = (day: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return bookings.filter(b => b.booking_date === dateStr)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-silver">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-cream mb-4">All Appointments</h1>
        
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'calendar' 
                ? 'bg-gold text-obsidian' 
                : 'bg-charcoal text-silver hover:text-cream'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'list' 
                ? 'bg-gold text-obsidian' 
                : 'bg-charcoal text-silver hover:text-cream'
            }`}
          >
            List
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-charcoal border border-slate text-cream px-4 py-2 rounded-lg"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-Show</option>
          </select>
          
          <input
            type="text"
            placeholder="Search customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-charcoal border border-slate text-cream px-4 py-2 rounded-lg flex-1"
          />
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div>
          {/* Month Navigation */}
          <div className="bg-charcoal border border-slate rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                className="text-silver hover:text-cream"
              >
                ←
              </button>
              <h2 className="text-xl text-cream font-medium">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                className="text-silver hover:text-cream"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-silver">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(selectedDate).map((day, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    day ? 'bg-obsidian hover:bg-charcoal text-cream' : ''
                  }`}
                >
                  {day && (
                    <>
                      <div>{day}</div>
                      <div className="text-xs text-gold">
                        {getBookingsForDay(day).length > 0 && '•'.repeat(Math.min(getBookingsForDay(day).length, 4))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Day's Appointments */}
          <div className="bg-charcoal border border-slate rounded-xl p-6">
            <h3 className="text-lg text-cream font-semibold mb-4">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            
            <div className="space-y-2">
              {filteredBookings
                .filter(b => b.booking_date === selectedDate.toISOString().split('T')[0])
                .map((booking) => (
                  <div key={booking.id} className="bg-obsidian border border-slate rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-cream font-medium">
                          {(booking.profiles as any)?.full_name || 'Customer'}
                        </div>
                        <div className="text-silver text-sm">
                          {(booking.services as any)?.name} • {booking.booking_time}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                          booking.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                          booking.status === 'completed' ? 'bg-success/10 text-success' :
                          booking.status === 'cancelled' ? 'bg-error/10 text-error' :
                          'bg-silver/10 text-silver'
                        }`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <button className="text-gold hover:underline text-sm">View</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate">
                  <th className="text-left py-3 px-4 text-silver">Date/Time</th>
                  <th className="text-left py-3 px-4 text-silver">Customer</th>
                  <th className="text-left py-3 px-4 text-silver">Service</th>
                  <th className="text-left py-3 px-4 text-silver">Duration</th>
                  <th className="text-left py-3 px-4 text-silver">Status</th>
                  <th className="text-left py-3 px-4 text-silver">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate/50">
                    <td className="py-3 px-4 text-cream">
                      {new Date(booking.booking_date).toLocaleDateString()} {booking.booking_time}
                    </td>
                    <td className="py-3 px-4 text-cream">
                      {(booking.profiles as any)?.full_name || 'Customer'}
                    </td>
                    <td className="py-3 px-4 text-cream">
                      {(booking.services as any)?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-cream">
                      {(booking.services as any)?.duration || 30} min
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                        booking.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                        booking.status === 'completed' ? 'bg-success/10 text-success' :
                        booking.status === 'cancelled' ? 'bg-error/10 text-error' :
                        'bg-silver/10 text-silver'
                      }`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className="bg-obsidian border border-slate text-cream px-2 py-1 rounded text-xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No-Show</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
