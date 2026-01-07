import Image from 'next/image'
import Link from 'next/link'
import { services } from '@/lib/data'

export default function ServicesPage() {
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
            <button className="pb-3 border-b-2 border-gold text-gold font-medium whitespace-nowrap">All Services</button>
            <button className="pb-3 border-b-2 border-transparent text-silver hover:text-cream whitespace-nowrap">Haircuts</button>
            <button className="pb-3 border-b-2 border-transparent text-silver hover:text-cream whitespace-nowrap">Beard</button>
            <button className="pb-3 border-b-2 border-transparent text-silver hover:text-cream whitespace-nowrap">Packages</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
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
        </div>
      </div>
    </>
  )
}
