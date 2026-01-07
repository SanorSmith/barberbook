'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function BarberProfilePage() {
  const params = useParams()
  const [barber, setBarber] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadBarber()
    }
  }, [params.id])

  const loadBarber = async () => {
    const { data } = await supabase
      .from('barbers')
      .select('*')
      .eq('id', params.id)
      .single()

    setBarber(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!barber) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-cream text-2xl mb-4">Barber not found</h1>
          <Link href="/barbers" className="text-gold hover:underline">
            Back to Barbers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Hero Section */}
      <div className="relative h-96 bg-charcoal">
        <div className="absolute inset-0">
          <Image
            src={barber.image_url || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200'}
            alt={barber.name}
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
            <div className="flex items-end gap-8">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-gold shadow-2xl">
                <Image
                  src={barber.image_url || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400'}
                  alt={barber.name}
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 pb-4">
                <h1 className="font-serif text-4xl text-cream font-semibold mb-2">{barber.name}</h1>
                <p className="text-silver text-lg mb-4">{barber.role || 'Master Barber'}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-gold">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="font-semibold">{barber.rating || '5.0'}</span>
                  </div>
                  <div className="text-silver">
                    {barber.years_experience || '10'}+ years experience
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-charcoal border border-slate rounded-2xl p-8">
              <h2 className="text-cream text-2xl font-semibold mb-4">About {barber.name}</h2>
              <p className="text-silver leading-relaxed">
                {barber.bio || `${barber.name} is a highly skilled barber with years of experience in the industry. Specializing in modern cuts and traditional techniques, ${barber.name} ensures every client leaves looking their best.`}
              </p>
            </div>

            {/* Specialties */}
            <div className="bg-charcoal border border-slate rounded-2xl p-8">
              <h2 className="text-cream text-2xl font-semibold mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-3">
                {barber.specialties && Array.isArray(barber.specialties) ? (
                  barber.specialties.map((specialty: string) => (
                    <span key={specialty} className="bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium">
                      {specialty}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium">Fades</span>
                    <span className="bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium">Beard Styling</span>
                    <span className="bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium">Classic Cuts</span>
                  </>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-charcoal border border-slate rounded-2xl p-8">
              <h2 className="text-cream text-2xl font-semibold mb-6">Client Reviews</h2>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-slate pb-6 last:border-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold">
                        JD
                      </div>
                      <div>
                        <div className="text-cream font-semibold">John Doe</div>
                        <div className="flex text-gold text-sm">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                    </div>
                    <p className="text-silver text-sm">
                      Excellent service! {barber.name} really knows their craft. Highly recommended!
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Book Now Card */}
            <div className="bg-charcoal border border-gold rounded-2xl p-6 sticky top-24">
              <h3 className="text-cream text-xl font-semibold mb-4">Book with {barber.name}</h3>
              <p className="text-silver text-sm mb-6">
                Available for appointments. Choose your preferred service and time.
              </p>
              <Link
                href="/booking"
                className="block w-full bg-gold hover:bg-gold-hover text-obsidian py-3 rounded-lg text-center font-semibold uppercase tracking-wider transition-colors"
              >
                Book Now
              </Link>
            </div>

            {/* Availability */}
            <div className="bg-charcoal border border-slate rounded-2xl p-6">
              <h3 className="text-cream font-semibold mb-4">Availability</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-silver">
                  <span>Monday - Friday</span>
                  <span className="text-success">Available</span>
                </div>
                <div className="flex justify-between text-silver">
                  <span>Saturday</span>
                  <span className="text-success">Available</span>
                </div>
                <div className="flex justify-between text-silver">
                  <span>Sunday</span>
                  <span className="text-slate">Closed</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-charcoal border border-slate rounded-2xl p-6">
              <h3 className="text-cream font-semibold mb-4">Contact</h3>
              <div className="space-y-3 text-sm text-silver">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{barber.email || 'info@barberbook.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+358 40 123 4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
