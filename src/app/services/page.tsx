'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [activeCategory, services])

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true })

    setServices(data || [])
    setLoading(false)
  }

  const filterServices = () => {
    if (activeCategory === 'all') {
      setFilteredServices(services)
    } else {
      setFilteredServices(services.filter(s => s.category === activeCategory.toUpperCase()))
    }
  }
  return (
    <>
      {/* Hero */}
      <div className="relative py-24 bg-charcoal">
        <div className="absolute inset-0 bg-black/50 z-0">
          <Image
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200"
            alt="Services background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <p className="text-silver text-sm mb-4">Home &gt; Services</p>
          <h1 className="font-serif text-5xl text-cream font-semibold mb-4">Our Services</h1>
          <p className="text-silver max-w-xl mx-auto">Crafted experiences for the distinguished gentleman</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-8">
          <div className="bg-charcoal border border-slate p-6 rounded-2xl">
            <h3 className="text-cream font-semibold mb-4">Need Guidance?</h3>
            <p className="text-silver text-sm mb-6">Not sure what you need? Call us for a free consultation.</p>
            <button className="w-full border border-gold text-gold py-2 rounded-lg text-sm uppercase hover:bg-gold hover:text-obsidian transition-colors">
              Call Us
            </button>
          </div>
          <div className="bg-charcoal border border-slate p-6 rounded-2xl">
            <h3 className="text-cream font-semibold mb-4">Hours</h3>
            <ul className="text-sm text-silver space-y-2">
              <li className="flex justify-between"><span>Mon-Fri</span> <span>9am - 7pm</span></li>
              <li className="flex justify-between"><span>Saturday</span> <span>9am - 5pm</span></li>
              <li className="flex justify-between"><span>Sunday</span> <span>Closed</span></li>
            </ul>
          </div>
        </div>

        {/* Services Grid */}
        <div className="lg:col-span-3">
          <div className="flex space-x-6 border-b border-slate mb-8 overflow-x-auto">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`pb-3 border-b-2 font-medium whitespace-nowrap ${activeCategory === 'all' ? 'border-gold text-gold' : 'border-transparent text-silver hover:text-cream'}`}
            >
              All Services
            </button>
            <button 
              onClick={() => setActiveCategory('haircut')}
              className={`pb-3 border-b-2 font-medium whitespace-nowrap ${activeCategory === 'haircut' ? 'border-gold text-gold' : 'border-transparent text-silver hover:text-cream'}`}
            >
              Haircuts
            </button>
            <button 
              onClick={() => setActiveCategory('beard')}
              className={`pb-3 border-b-2 font-medium whitespace-nowrap ${activeCategory === 'beard' ? 'border-gold text-gold' : 'border-transparent text-silver hover:text-cream'}`}
            >
              Beard
            </button>
            <button 
              onClick={() => setActiveCategory('package')}
              className={`pb-3 border-b-2 font-medium whitespace-nowrap ${activeCategory === 'package' ? 'border-gold text-gold' : 'border-transparent text-silver hover:text-cream'}`}
            >
              Packages
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
              <div key={service.id} className="bg-charcoal border border-slate rounded-2xl p-6 flex flex-col hover:border-gold transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-gold/10 text-gold text-xs px-2 py-1 rounded-full font-medium tracking-wider">
                    {service.category}
                  </span>
                  <span className="text-2xl text-gold font-serif font-semibold">${service.price}</span>
                </div>
                <h3 className="text-cream text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-silver text-sm mb-6 flex-grow">
                  {service.description}. Detailed attention to hair texture and face shape.
                </p>
                <div className="flex items-center text-sm text-silver mb-6">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.duration} minutes
                </div>
                <Link 
                  href="/booking" 
                  className="w-full bg-gold hover:bg-gold-hover text-obsidian py-3 rounded-lg text-sm font-semibold uppercase tracking-wider text-center"
                >
                  Book This Service
                </Link>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
