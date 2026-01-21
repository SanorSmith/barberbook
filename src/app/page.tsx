import Link from 'next/link'
import Image from 'next/image'
import { services, barbers } from '@/lib/data'
import ServiceCard from '@/components/ServiceCard'
import BarberCard from '@/components/BarberCard'

// Animated Hero Background Component
function AnimatedHeroBackground() {
  const sliceCount = 12
  const slices = Array.from({ length: sliceCount }, (_, i) => i)

  return (
    <div className="absolute inset-0 flex">
      {slices.map((index) => (
        <div
          key={index}
          className="relative flex-1 overflow-hidden animate-gpu"
          style={{
            animation: `sliceReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            animationDelay: `${index * 0.06}s`,
            animationFillMode: 'both',
            transform: 'translateY(-100%)',
            opacity: 0
          }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1920)',
              backgroundPosition: `${(index / (sliceCount - 1)) * 100}% center`,
              backgroundSize: `${sliceCount * 100}% 100%`
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative h-screen -mt-20">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <AnimatedHeroBackground />
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
          <p className="text-gold tracking-[0.2em] text-sm font-semibold mb-4">ESTABLISHED 2024</p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-cream mb-6 tracking-tight">
            The Art of the Perfect Cut
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-10 font-light">
            Premium grooming experience for the modern gentleman
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/booking" 
              className="bg-gold hover:bg-gold-hover text-obsidian px-8 py-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-transform hover:scale-105"
            >
              Book Appointment
            </Link>
            <Link 
              href="/services" 
              className="bg-transparent border border-gold text-gold hover:bg-gold/10 px-8 py-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-transform hover:scale-105"
            >
              Explore Services
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Services Preview */}
      <section className="py-24 bg-obsidian px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-xs font-bold tracking-[0.2em] uppercase mb-3">What We Offer</p>
          <h2 className="font-serif text-4xl text-cream font-medium tracking-tight">Premium Services</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Barbers Section */}
      <section className="py-24 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="text-gold text-xs font-bold tracking-[0.2em] uppercase mb-3">The Team</p>
            <h2 className="font-serif text-4xl text-cream font-medium tracking-tight">Master Barbers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {barbers.map((barber) => (
              <BarberCard key={barber.id} barber={barber} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-obsidian border-t border-slate">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center font-serif text-3xl text-cream font-medium mb-16">Book in 60 Seconds</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-slate -z-0"></div>
            {[
              { icon: 'list', title: 'Choose Service', desc: 'Select from our premium offerings' },
              { icon: 'user', title: 'Pick Barber', desc: 'Choose your preferred stylist' },
              { icon: 'calendar', title: 'Select Time', desc: 'Find your perfect slot' },
              { icon: 'check', title: 'Confirm', desc: "You're all set" }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center bg-obsidian p-4">
                <div className="w-16 h-16 rounded-full bg-charcoal border border-gold flex items-center justify-center text-gold mb-6 shadow-[0_0_15px_rgba(201,162,39,0.2)]">
                  <StepIcon icon={step.icon} />
                </div>
                <h4 className="text-cream font-semibold mb-2">{step.title}</h4>
                <p className="text-silver text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function StepIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'list':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    case 'user':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'check':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      )
    default:
      return null
  }
}
