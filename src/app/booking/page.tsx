'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAllServices, type Service } from '@/lib/services'
import { getAllBarbers, type Barber } from '@/lib/barbers'
import { getAvailableSlots, type TimeSlot } from '@/lib/availability'
import { createBooking } from '@/lib/bookings'

export default function BookingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [notes, setNotes] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadServices()
    }
  }, [isAuthenticated])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to login with return URL
        router.push(`/login?redirect=/booking`)
        return
      }
      
      setIsAuthenticated(true)
      setLoading(false)
    } catch (err) {
      console.error('Auth check failed:', err)
      router.push(`/login?redirect=/booking`)
    }
  }

  useEffect(() => {
    if (step === 2) {
      loadBarbers()
    }
  }, [step])

  useEffect(() => {
    if (step === 3 && selectedBarber && selectedService && selectedDate) {
      console.log('Loading slots for:', { barberId: selectedBarber.id, date: selectedDate, duration: selectedService.duration })
      loadAvailableSlots()
    }
  }, [step, selectedBarber, selectedService, selectedDate])

  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await getAllServices()
      console.log('Loaded services for booking:', data)
      setServices(data)
      if (data.length === 0) {
        setError('No services available. Please contact support.')
      }
    } catch (err) {
      console.error('Failed to load services:', err)
      setError('Failed to load services. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const loadBarbers = async () => {
    try {
      const data = await getAllBarbers()
      setBarbers(data)
    } catch (err) {
      console.error('Failed to load barbers:', err)
    }
  }

  const loadAvailableSlots = async () => {
    if (!selectedBarber || !selectedService || !selectedDate) {
      console.log('Missing required data for slots:', { barber: !!selectedBarber, service: !!selectedService, date: !!selectedDate })
      return
    }
    
    setLoading(true)
    try {
      console.log('Calling getAvailableSlots...')
      const slots = await getAvailableSlots(
        selectedBarber.id,
        selectedDate,
        selectedService.duration
      )
      console.log('Received slots:', slots)
      setAvailableSlots(slots)
      
      if (slots.length === 0) {
        setError('No available time slots for this date. Please try another date.')
      } else {
        setError(null)
      }
    } catch (err) {
      console.error('Failed to load slots:', err)
      setError('Failed to load available times. Please try again.')
    }
    setLoading(false)
  }

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      setError('Please complete all booking details')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Creating booking with data:', {
        service_id: selectedService.id,
        barber_id: selectedBarber.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        notes: notes || undefined
      })

      const booking = await createBooking({
        service_id: selectedService.id,
        barber_id: selectedBarber.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        notes: notes || undefined
      })

      console.log('Booking created successfully:', booking)
      router.push('/booking/success')
    } catch (err: any) {
      console.error('Booking creation failed:', err)
      setError(err.message || 'Failed to create booking. Please try again or contact support.')
      setLoading(false)
    }
  }

  const getNextWeekDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Show loading screen while checking authentication
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cream">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render booking form if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-obsidian py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="relative flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s, index) => (
              <div key={s} className="flex flex-col items-center" style={{ width: index === 0 || index === 3 ? 'auto' : '100%' }}>
                <div className="relative z-10 flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                    step >= s ? 'bg-gold text-obsidian' : 'bg-charcoal text-silver border-2 border-slate'
                  }`}>
                    {s}
                  </div>
                </div>
                <span className={`mt-3 text-sm whitespace-nowrap ${step >= s ? 'text-gold font-medium' : 'text-silver'}`}>
                  {s === 1 && 'Service'}
                  {s === 2 && 'Barber'}
                  {s === 3 && 'Date & Time'}
                  {s === 4 && 'Confirm'}
                </span>
              </div>
            ))}
            {/* Connecting lines */}
            <div className="absolute top-6 left-0 right-0 flex items-center px-6" style={{ zIndex: 0 }}>
              <div className={`h-0.5 flex-1 ${step > 1 ? 'bg-gold' : 'bg-slate'}`} style={{ marginLeft: '24px', marginRight: '12px' }} />
              <div className={`h-0.5 flex-1 ${step > 2 ? 'bg-gold' : 'bg-slate'}`} style={{ marginLeft: '12px', marginRight: '12px' }} />
              <div className={`h-0.5 flex-1 ${step > 3 ? 'bg-gold' : 'bg-slate'}`} style={{ marginLeft: '12px', marginRight: '24px' }} />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-3xl text-cream mb-6">Select a Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    setStep(2)
                  }}
                  className="bg-charcoal border border-slate hover:border-gold rounded-lg p-6 text-left transition-colors"
                >
                  <h3 className="text-cream font-semibold text-lg mb-2">{service.name}</h3>
                  <p className="text-silver text-sm mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gold font-semibold">€{service.price}</span>
                    <span className="text-silver text-sm">{service.duration} min</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Barber */}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-3xl text-cream mb-6">Choose Your Barber</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  if (barbers.length > 0) {
                    setSelectedBarber(barbers[0])
                    setStep(3)
                  }
                }}
                className="bg-charcoal border border-slate hover:border-gold rounded-lg p-6 text-left transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-cream font-semibold text-lg">Any Available</h3>
                    <p className="text-silver text-sm">First available barber</p>
                  </div>
                </div>
              </button>

              {barbers.map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => {
                    setSelectedBarber(barber)
                    setStep(3)
                  }}
                  className="bg-charcoal border border-slate hover:border-gold rounded-lg p-6 text-left transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {barber.image_url ? (
                      <img
                        src={barber.image_url}
                        alt={barber.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate flex items-center justify-center">
                        <span className="text-2xl text-silver">{barber.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-cream font-semibold text-lg">{barber.name}</h3>
                      <p className="text-silver text-sm">{barber.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-gold">★</span>
                        <span className="text-silver text-sm">{barber.rating} ({barber.review_count})</span>
                      </div>
                    </div>
                  </div>
                  {barber.specialties && barber.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {barber.specialties.slice(0, 3).map((specialty, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate rounded text-silver text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-6 px-6 py-3 text-silver hover:text-cream transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-3xl text-cream mb-6">Choose Date & Time</h2>
            
            {/* Date Selection */}
            <div className="mb-8">
              <h3 className="text-cream font-semibold mb-4">Select Date</h3>
              <div className="grid grid-cols-7 gap-2">
                {getNextWeekDates().map((date) => {
                  const dateString = date.toISOString().split('T')[0]
                  const isSelected = selectedDate === dateString
                  return (
                    <button
                      key={dateString}
                      onClick={() => {
                        setSelectedDate(dateString)
                        setSelectedTime('')
                      }}
                      className={`p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-gold text-obsidian border-gold'
                          : 'bg-charcoal text-cream border-slate hover:border-gold'
                      }`}
                    >
                      <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-lg font-semibold">{date.getDate()}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="text-cream font-semibold mb-4">Select Time</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedTime === slot.time
                            ? 'bg-gold text-obsidian border-gold'
                            : slot.available
                            ? 'bg-charcoal text-cream border-slate hover:border-gold'
                            : 'bg-charcoal/50 text-silver/50 border-slate/50 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-silver text-center py-8">No available slots for this date</p>
                )}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 text-silver hover:text-cream transition-colors"
              >
                ← Back
              </button>
              {selectedTime && (
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedService && selectedBarber && (
          <div>
            <h2 className="font-serif text-3xl text-cream mb-6">Confirm Your Booking</h2>
            
            <div className="bg-charcoal border border-slate rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-silver">Service:</span>
                  <span className="text-cream font-semibold">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Barber:</span>
                  <span className="text-cream font-semibold">{selectedBarber.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Date:</span>
                  <span className="text-cream font-semibold">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Time:</span>
                  <span className="text-cream font-semibold">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Duration:</span>
                  <span className="text-cream font-semibold">{selectedService.duration} minutes</span>
                </div>
                <div className="border-t border-slate pt-4 flex justify-between">
                  <span className="text-silver">Total:</span>
                  <span className="text-gold font-semibold text-xl">€{selectedService.price}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-silver mb-2">Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-charcoal border border-slate rounded-lg p-4 text-cream focus:border-gold outline-none transition-colors"
                rows={3}
                placeholder="Any special requests or notes..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 text-silver hover:text-cream transition-colors"
                disabled={loading}
              >
                ← Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
