'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BarberDashboardPage() {
  const [barber, setBarber] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
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

    // Get barber's bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        *,
        services (name, duration),
        profiles (full_name, email)
      `)
      .eq('barber_id', barber.id)
      .order('booking_date', { ascending: true })

    setBarber(barber)
    setBookings(bookings || [])
    setLoading(false)
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)

    if (!error) {
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status } : b
      ))
    }
  }

  const today = currentTime.toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.booking_date === today)
  const upcomingBookings = bookings.filter(b => b.booking_date >= today)

  // Generate timeline slots
  const generateTimeline = () => {
    const slots = []
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const display = hour > 12 ? `${hour - 12}:${minute.toString().padStart(2, '0')} PM` : `${hour}:${minute.toString().padStart(2, '0')} AM`
        slots.push({ time, display })
      }
    }
    return slots
  }

  const timelineSlots = generateTimeline()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-silver">Loading dashboard...</div>
      </div>
    )
  }

  if (!barber) {
    return (
      <div className="p-6">
        <div className="bg-charcoal border border-slate rounded-xl p-8 text-center">
          <h2 className="text-2xl text-cream mb-4">Barber Profile Not Found</h2>
          <p className="text-silver mb-6">Your account is not linked to a barber profile.</p>
          <p className="text-silver">Please contact an administrator to set up your barber profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-cream mb-2">Today's Schedule</h1>
          <p className="text-silver">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-silver text-sm">Current Time</div>
          <div className="text-cream text-xl font-semibold">
            {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="text-silver text-sm mb-1">Appointments</div>
          <div className="text-3xl text-cream font-bold">{todayBookings.length}</div>
          <div className="text-silver text-xs">Today</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="text-silver text-sm mb-1">Next Up</div>
          <div className="text-xl text-cream font-bold">
            {(() => {
              const nextBooking = todayBookings.find(b => {
                const [hour, minute] = b.booking_time.split(':').map(Number)
                const bookingHour = hour > 12 ? hour - 12 : hour
                const bookingMinute = minute
                const nowHour = currentHour > 12 ? currentHour - 12 : currentHour
                return (bookingHour > nowHour || (bookingHour === nowHour && bookingMinute > currentMinute))
              })
              return nextBooking ? (nextBooking.profiles as any)?.full_name?.split(' ')[0] || 'Customer' : 'None'
            })()}
          </div>
          <div className="text-silver text-xs">in 15 min</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="text-silver text-sm mb-1">Earned</div>
          <div className="text-3xl text-cream font-bold">
            ${todayBookings
              .filter(b => b.status === 'completed')
              .reduce((sum, b) => sum + (b.total_price || 0), 0)
              .toFixed(0)}
          </div>
          <div className="text-silver text-xs">Today</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="text-silver text-sm mb-1">Waiting</div>
          <div className="text-3xl text-cream font-bold">2</div>
          <div className="text-silver text-xs">Walk-ins</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-charcoal border border-slate rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-cream font-semibold">Timeline</h2>
          <div className="text-silver text-sm">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="space-y-1">
          {timelineSlots.map((slot, index) => {
            const booking = todayBookings.find(b => b.booking_time === slot.time)
            const isCurrent = currentHour === parseInt(slot.time.split(':')[0]) && 
                             currentMinute >= parseInt(slot.time.split(':')[1]) &&
                             currentMinute < parseInt(slot.time.split(':')[1]) + 30

            return (
              <div key={index} className="flex items-center gap-4 py-2">
                <div className="w-20 text-silver text-sm text-right">
                  {slot.display}
                </div>
                
                {/* Current time indicator */}
                {isCurrent && (
                  <div className="w-full h-0.5 bg-gold relative">
                    <span className="absolute -top-2 left-0 text-xs text-gold font-semibold">NOW</span>
                  </div>
                )}

                <div className="flex-1">
                  {booking ? (
                    <div className={`bg-obsidian border rounded-lg p-3 ${
                      booking.status === 'in_progress' ? 'border-gold' :
                      booking.status === 'completed' ? 'border-success' :
                      'border-slate'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-cream font-medium">
                            {(booking.profiles as any)?.full_name || 'Customer'}
                          </div>
                          <div className="text-silver text-sm">
                            {(booking.services as any)?.name} • {(booking.services as any)?.duration} min
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === 'completed' ? 'bg-success/10 text-success' :
                            booking.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                            booking.status === 'confirmed' ? 'bg-slate/10 text-silver' :
                            'bg-slate/10 text-silver'
                          }`}>
                            {booking.status === 'completed' ? 'COMPLETED ✓' :
                             booking.status === 'in_progress' ? 'IN PROGRESS' :
                             booking.status === 'confirmed' ? 'UPCOMING' :
                             booking.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {booking.status === 'confirmed' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                            className="text-xs bg-gold hover:bg-gold-hover text-obsidian px-2 py-1 rounded"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="text-xs text-silver hover:text-error"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      
                      {booking.status === 'in_progress' && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="text-xs bg-success hover:bg-success/80 text-white px-2 py-1 rounded"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'no_show')}
                            className="text-xs bg-warning hover:bg-warning/80 text-white px-2 py-1 rounded"
                          >
                            No-Show
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-silver text-sm py-3 px-4">
                      ░░░░ AVAILABLE ░░░░
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
