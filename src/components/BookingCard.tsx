'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BookingCardProps {
  booking: {
    id: string
    service_name: string
    barber_name: string
    booking_date: string
    booking_time: string
    status: string
  }
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCancel = async () => {
    setIsLoading(true)
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)

    if (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking. Please try again.')
    } else {
      router.refresh()
    }
    
    setIsLoading(false)
    setShowConfirm(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' })
    }
  }

  const { day, month } = formatDate(booking.booking_date)

  return (
    <div className="bg-charcoal border border-slate rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 relative">
      {/* Cancel Confirmation Modal */}
      {showConfirm && (
        <div className="absolute inset-0 bg-obsidian/90 rounded-xl flex items-center justify-center z-10">
          <div className="text-center p-6">
            <p className="text-cream mb-4">Are you sure you want to cancel this appointment?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-slate text-silver hover:text-cream rounded-lg text-sm"
                disabled={isLoading}
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 bg-error text-white rounded-lg text-sm disabled:opacity-50"
              >
                {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-obsidian border border-slate rounded-lg p-4 text-center min-w-[100px]">
        <div className="text-3xl text-gold font-serif font-bold">{day}</div>
        <div className="text-xs text-silver uppercase">{month}</div>
      </div>
      <div className="flex-grow">
        <h3 className="text-cream text-lg font-medium">{booking.service_name}</h3>
        <p className="text-silver text-sm mb-2">with {booking.barber_name}</p>
        <div className="flex items-center gap-4">
          <span className="text-cream text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {booking.booking_time}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            booking.status === 'confirmed' ? 'bg-success/10 text-success' :
            booking.status === 'pending' ? 'bg-warning/10 text-warning' :
            booking.status === 'cancelled' ? 'bg-error/10 text-error' :
            'bg-silver/10 text-silver'
          }`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <button className="border border-slate hover:border-gold text-cream hover:text-gold px-4 py-2 rounded-lg text-sm transition-colors">
          Reschedule
        </button>
        <button 
          onClick={() => setShowConfirm(true)}
          className="text-silver hover:text-error text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
