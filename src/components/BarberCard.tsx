import Link from 'next/link'
import Image from 'next/image'
import { Barber } from '@/lib/types'

interface BarberCardProps {
  barber: Barber
}

export default function BarberCard({ barber }: BarberCardProps) {
  return (
    <div className="bg-obsidian border border-slate rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="h-64 overflow-hidden relative">
        <Image
          src={barber.image}
          alt={barber.name}
          fill
          className="object-cover hover:scale-110 transition-transform duration-700"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-cream text-xl font-semibold">{barber.name}</h3>
          <span className="flex items-center text-gold text-sm font-semibold">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {barber.rating}
          </span>
        </div>
        <p className="text-gold text-xs font-medium uppercase tracking-wider mb-4">{barber.role}</p>
        <p className="text-silver text-sm mb-4">
          {barber.specialties.join(', ')} • {barber.experience}
        </p>
        <Link 
          href={`/barbers/${barber.id}`}
          className="block w-full bg-slate hover:bg-gold hover:text-obsidian text-cream py-3 rounded-lg text-sm font-medium uppercase transition-colors text-center"
        >
          Book with {barber.name.split(' ')[0]}
        </Link>
      </div>
    </div>
  )
}
