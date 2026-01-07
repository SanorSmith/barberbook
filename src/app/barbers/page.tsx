'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadBarbers()
  }, [])

  const loadBarbers = async () => {
    const { data } = await supabase
      .from('barbers')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })

    setBarbers(data || [])
    setLoading(false)
  }
  return (
    <>
      <div className="bg-charcoal py-16 border-b border-slate">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl text-cream font-semibold mb-4">Our Barbers</h1>
          <p className="text-silver">Skilled craftsmen dedicated to their art</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 bg-charcoal p-4 rounded-xl border border-slate">
          <select className="bg-obsidian border border-slate text-silver text-sm rounded-lg p-2.5 focus:border-gold outline-none">
            <option>Sort by Rating</option>
            <option>Sort by Experience</option>
          </select>
          <select className="bg-obsidian border border-slate text-silver text-sm rounded-lg p-2.5 focus:border-gold outline-none hidden md:block">
            <option>All Specialties</option>
            <option>Fades</option>
            <option>Beards</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {barbers.map((barber) => (
            <div key={barber.id} className="bg-charcoal border border-slate rounded-2xl overflow-hidden group">
              <div className="h-80 overflow-hidden relative">
                <Image
                  src={barber.image}
                  alt={barber.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 rounded-full flex items-center text-gold text-sm font-semibold backdrop-blur-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {barber.rating}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-cream text-xl font-semibold">{barber.name}</h3>
                  <div className="w-2 h-2 bg-success rounded-full" title="Available Today"></div>
                </div>
                <p className="text-silver text-sm mb-4">{barber.role}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {barber.specialties && Array.isArray(barber.specialties) && barber.specialties.map((specialty: string) => (
                    <span key={specialty} className="bg-slate text-gold text-xs px-2 py-1 rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
                <p className="text-success text-xs font-medium mb-6 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next available: Today, 3:30 PM
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    href={`/barbers/${barber.id}`}
                    className="border border-slate text-cream hover:border-gold hover:text-gold py-2 rounded-lg text-sm font-medium transition-colors text-center"
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/booking"
                    className="bg-gold hover:bg-gold-hover text-obsidian py-2 rounded-lg text-sm font-medium transition-colors text-center"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
