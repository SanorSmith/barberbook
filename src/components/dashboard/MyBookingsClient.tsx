'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import ReviewModal from '@/components/ReviewModal'

type Booking = {
  id: string
  booking_date: string
  booking_time: string
  status: string
  total_price: number
  notes: string | null
  barber_id: number
  services: { name: string; duration: number } | null | any
  barbers: { id: number; name: string; image_url: string } | null | any
}

export default function MyBookingsClient() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadBookings()
  }, [activeTab])

  const loadBookings = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        booking_time,
        status,
        total_price,
        notes,
        barber_id,
        services (name, duration),
        barbers (id, name, image_url)
      `)
      .eq('user_id', user.id)

    const today = new Date().toISOString().split('T')[0]

    if (activeTab === 'upcoming') {
      query = query
        .gte('booking_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('booking_date', { ascending: true })
    } else if (activeTab === 'past') {
      query = query
        .or(`booking_date.lt.${today},status.eq.completed`)
        .order('booking_date', { ascending: false })
    } else {
      query = query
        .eq('status', 'cancelled')
        .order('booking_date', { ascending: false })
    }

    const { data } = await query
    setBookings(data || [])
    setLoading(false)
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (!error) {
      loadBookings()
    }
  }

  const tabs = [
    { key: 'upcoming' as const, label: 'Upcoming' },
    { key: 'past' as const, label: 'Past' },
    { key: 'cancelled' as const, label: 'Cancelled' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-cream">My Bookings</h1>
        <Link
          href="/booking"
          className="bg-gold hover:bg-gold-hover text-obsidian px-6 py-2.5 rounded-lg font-semibold transition-colors"
        >
          New Booking
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 border-b-2 font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-gold text-gold'
                : 'border-transparent text-silver hover:text-cream'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-charcoal border border-slate rounded-lg p-6 hover:border-gold/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate flex items-center justify-center">
                    {booking.barbers?.image_url ? (
                      <img
                        src={booking.barbers.image_url}
                        alt={booking.barbers.name || 'Barber'}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-cream font-semibold text-lg mb-1">
                      {booking.services?.name || 'Service'}
                    </h3>
                    <p className="text-silver text-sm mb-2">
                      with {booking.barbers?.name || 'Barber'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-silver">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.booking_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.services?.duration || 30} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gold font-semibold text-lg mb-2">
                    €{booking.total_price?.toFixed(2) || '0.00'}
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-400'
                        : booking.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : booking.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {activeTab === 'upcoming' && (
                <div className="mt-4 pt-4 border-t border-slate flex gap-3">
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Cancel Booking
                  </button>
                  <Link
                    href={`/booking?reschedule=${booking.id}`}
                    className="px-4 py-2 text-sm text-gold hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    Reschedule
                  </Link>
                </div>
              )}

              {activeTab === 'past' && booking.status === 'completed' && (
                <div className="mt-4 pt-4 border-t border-slate flex gap-3">
                  <Link
                    href={`/booking?service=${booking.services?.name}`}
                    className="px-4 py-2 text-sm text-gold hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    Book Again
                  </Link>
                  <button 
                    onClick={() => {
                      setSelectedBooking(booking)
                      setShowReviewModal(true)
                    }}
                    className="px-4 py-2 text-sm text-silver hover:bg-slate rounded-lg transition-colors"
                  >
                    Leave Review
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
          <h3 className="text-cream text-lg font-medium mb-2">No {activeTab} bookings</h3>
          <p className="text-silver mb-6">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming appointments"
              : activeTab === 'past'
              ? "You haven't completed any appointments yet"
              : "You don't have any cancelled bookings"}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/booking"
              className="inline-block bg-gold hover:bg-gold-hover text-obsidian px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Book Your First Appointment
            </Link>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          bookingId={selectedBooking.id}
          barberId={selectedBooking.barber_id}
          barberName={selectedBooking.barbers?.name || 'Barber'}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedBooking(null)
          }}
          onSuccess={() => {
            loadBookings()
          }}
        />
      )}
    </div>
  )
}
