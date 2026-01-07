import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 bg-black/50 z-0">
          <Image
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200"
            alt="About background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl text-cream font-semibold mb-6">About BarberBook</h1>
          <p className="text-silver max-w-2xl mx-auto text-lg">
            Where tradition meets modern excellence in men's grooming
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-20 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold text-sm font-bold tracking-[0.2em] uppercase mb-4">Our Story</p>
              <h2 className="font-serif text-4xl text-cream font-medium mb-6">Crafting Excellence Since 2024</h2>
              <p className="text-silver mb-4 leading-relaxed">
                BarberBook was founded with a simple mission: to provide the modern gentleman with an exceptional grooming experience that honors traditional barbering techniques while embracing contemporary style.
              </p>
              <p className="text-silver mb-4 leading-relaxed">
                Our team of master barbers brings decades of combined experience, ensuring every client receives personalized attention and leaves looking their absolute best.
              </p>
              <p className="text-silver leading-relaxed">
                We believe that a great haircut is more than just a service—it's an art form, a confidence boost, and a moment of self-care in your busy day.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800"
                alt="Barber shop interior"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold text-sm font-bold tracking-[0.2em] uppercase mb-4">Our Values</p>
            <h2 className="font-serif text-4xl text-cream font-medium">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-obsidian border border-slate rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-cream text-xl font-semibold mb-3">Quality First</h3>
              <p className="text-silver text-sm">
                We never compromise on the quality of our services, products, or customer experience.
              </p>
            </div>
            <div className="bg-obsidian border border-slate rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-cream text-xl font-semibold mb-3">Expert Team</h3>
              <p className="text-silver text-sm">
                Our barbers are highly trained professionals passionate about their craft.
              </p>
            </div>
            <div className="bg-obsidian border border-slate rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-cream text-xl font-semibold mb-3">Client Satisfaction</h3>
              <p className="text-silver text-sm">
                Your satisfaction is our top priority. We're not happy until you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-obsidian">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl text-cream font-medium mb-6">
            Experience the Difference
          </h2>
          <p className="text-silver mb-8 text-lg">
            Book your appointment today and discover why we're the preferred choice for discerning gentlemen.
          </p>
          <Link
            href="/booking"
            className="inline-block bg-gold hover:bg-gold-hover text-obsidian px-8 py-4 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </>
  )
}
