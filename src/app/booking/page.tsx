'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { services, barbers } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

type Step = 1 | 2 | 3 | 4

export default function BookingPage() {
  const [step, setStep] = useState<Step>(1)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<number>(15)
  const [selectedTime, setSelectedTime] = useState<string>('3:30 PM')
  const [notes, setNotes] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const times = ['9:00 AM', '9:30 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '3:30 PM', '4:00 PM', '5:30 PM']

  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ')
    let [hours, minutes] = time.split(':')
    if (hours === '12') hours = '00'
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12)
    return `${hours.padStart(2, '0')}:${minutes}:00`
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?redirect=/booking')
      return
    }

    // Ensure user profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Create profile if it doesn't exist
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null
      })
    }

    // Format date as YYYY-MM-DD
    const year = new Date().getFullYear()
    const bookingDate = `${year}-01-${selectedDate.toString().padStart(2, '0')}`
    const bookingTime = convertTo24Hour(selectedTime)

    // Get the service price
    const service = services.find(s => s.id === selectedService)

    const { error: insertError, data } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        service_id: selectedService,
        barber_id: selectedBarber === 0 ? 1 : selectedBarber, // Default to first barber if "Any"
        booking_date: bookingDate,
        booking_time: bookingTime,
        status: 'confirmed',
        notes: notes || null,
        total_price: service?.price || 0
      })
      .select()

    if (insertError) {
      console.error('Booking error:', insertError.message, insertError.details, insertError.hint)
      setError(`Failed to create booking: ${insertError.message}`)
      setIsLoading(false)
      return
    }

    router.push('/booking/success')
  }

  const getSelectedService = () => services.find(s => s.id === selectedService)
  const getSelectedBarber = () => barbers.find(b => b.id === selectedBarber)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate -z-10"></div>
        {['Service', 'Barber', 'Time', 'Confirm'].map((label, i) => (
          <div 
            key={label}
            className={`bg-obsidian px-4 py-2 border rounded-full text-sm font-medium transition-colors duration-300 ${
              i + 1 < step ? 'text-gold border-gold' : 
              i + 1 === step ? 'text-cream border-gold' : 
              'text-silver border-slate'
            }`}
          >
            <span className="mr-2">{i + 1}</span>{label}
          </div>
        ))}
      </div>

      {/* Step 1: Services */}
      {step === 1 && (
        <div>
          <h2 className="font-serif text-3xl text-cream mb-8">Choose Your Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {services.slice(0, 4).map((service) => (
              <div 
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`bg-charcoal border ${selectedService === service.id ? 'border-gold' : 'border-slate'} p-6 rounded-xl cursor-pointer hover:border-gold transition-all relative`}
              >
                {selectedService === service.id && (
                  <div className="absolute top-4 right-4 text-gold">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
                <h3 className="text-cream font-medium text-lg">{service.name}</h3>
                <p className="text-silver text-sm mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gold font-semibold">${service.price}</span>
                  <span className="text-xs text-silver flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.duration}m
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-slate pt-6">
            <button 
              onClick={() => setStep(2)}
              disabled={!selectedService}
              className="bg-gold hover:bg-gold-hover text-obsidian px-8 py-3 rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Barber */}
      {step === 2 && (
        <div>
          <h2 className="font-serif text-3xl text-cream mb-8">Choose Your Barber</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              onClick={() => setSelectedBarber(0)}
              className={`bg-charcoal border ${selectedBarber === 0 ? 'border-gold' : 'border-slate'} hover:border-gold p-6 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center h-full`}
            >
              <div className="w-16 h-16 bg-slate rounded-full flex items-center justify-center mb-4 text-gold">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-cream font-medium">Any Available</h3>
              <p className="text-xs text-silver mt-1">For the soonest slot</p>
            </div>
            {barbers.slice(0, 2).map((barber) => (
              <div 
                key={barber.id}
                onClick={() => setSelectedBarber(barber.id)}
                className={`bg-charcoal border ${selectedBarber === barber.id ? 'border-gold' : 'border-slate'} hover:border-gold p-6 rounded-xl cursor-pointer text-center group`}
              >
                <div className="relative w-20 h-20 rounded-full mx-auto mb-4 border-2 border-transparent group-hover:border-gold overflow-hidden">
                  <Image src={barber.image} alt={barber.name} fill className="object-cover" />
                </div>
                <h3 className="text-cream font-medium">{barber.name}</h3>
                <div className="flex justify-center text-gold text-xs my-2">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {barber.rating}
                </div>
                <p className="text-success text-xs">Next: Today 3:30 PM</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-slate pt-6">
            <button onClick={() => setStep(1)} className="text-silver hover:text-cream px-6 py-3 uppercase text-sm font-medium">
              Back
            </button>
            <button 
              onClick={() => setStep(3)}
              disabled={selectedBarber === null}
              className="bg-gold hover:bg-gold-hover text-obsidian px-8 py-3 rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Time */}
      {step === 3 && (
        <div>
          <h2 className="font-serif text-3xl text-cream mb-8">Select Date & Time</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Calendar */}
            <div className="bg-charcoal border border-slate rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-cream font-medium">January 2025</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:text-gold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1 hover:text-gold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-silver">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <div
                    key={day}
                    onClick={() => day >= 14 && setSelectedDate(day)}
                    className={`p-2 rounded cursor-pointer ${
                      day === selectedDate ? 'bg-gold text-obsidian font-bold shadow-lg shadow-gold/20' :
                      day < 14 ? 'text-slate cursor-not-allowed' :
                      'text-cream hover:bg-slate'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
            {/* Slots */}
            <div>
              <h3 className="text-silver text-sm uppercase tracking-wider mb-4">Available Times • Jan {selectedDate}</h3>
              <div className="grid grid-cols-3 gap-3">
                {times.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 rounded border text-sm transition-all ${
                      time === selectedTime ? 'bg-gold border-gold text-obsidian' : 'bg-charcoal border-slate text-cream hover:border-gold'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between border-t border-slate pt-6">
            <button onClick={() => setStep(2)} className="text-silver hover:text-cream px-6 py-3 uppercase text-sm font-medium">
              Back
            </button>
            <button 
              onClick={() => setStep(4)}
              className="bg-gold hover:bg-gold-hover text-obsidian px-8 py-3 rounded-lg font-semibold uppercase tracking-wider"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <h2 className="font-serif text-3xl text-cream mb-8">Confirm Booking</h2>
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          <div className="bg-charcoal border border-slate rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-6 mb-6">
              {getSelectedBarber() && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image src={getSelectedBarber()!.image} alt="" fill className="object-cover" />
                </div>
              )}
              <div>
                <h3 className="text-cream text-lg font-medium">{getSelectedService()?.name}</h3>
                <p className="text-gold">with {selectedBarber === 0 ? 'Any Available Barber' : getSelectedBarber()?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-4 text-sm border-t border-b border-slate py-6 mb-6">
              <div className="text-silver">Date</div>
              <div className="text-right text-cream">Jan {selectedDate}, 2025</div>
              <div className="text-silver">Time</div>
              <div className="text-right text-cream">{selectedTime}</div>
              <div className="text-silver">Duration</div>
              <div className="text-right text-cream">{getSelectedService()?.duration} min</div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-cream">Total</span>
              <span className="text-2xl text-gold font-serif font-bold">${getSelectedService()?.price}.00</span>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-obsidian border border-slate rounded-lg p-4 text-sm text-cream mb-4 focus:border-gold outline-none" 
              placeholder="Any special requests?"
            />
            <label className="flex items-center text-sm text-silver cursor-pointer">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mr-3 rounded border-slate bg-obsidian text-gold focus:ring-gold"
              />
              I agree to the cancellation policy (2 hour notice)
            </label>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="text-silver hover:text-cream px-6 py-3 uppercase text-sm font-medium">
              Back
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!agreed || isLoading}
              className="bg-gold hover:bg-gold-hover text-obsidian px-8 py-3 rounded-lg font-semibold uppercase tracking-wider w-full sm:w-auto disabled:opacity-50"
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
