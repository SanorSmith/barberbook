import Link from 'next/link'

export default function BookingSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-cream font-semibold mb-2">Booking Confirmed!</h1>
        <p className="text-silver mb-8">We look forward to seeing you</p>
        
        <div className="bg-charcoal border border-slate rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-12 -mt-12"></div>
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate">
            <div>
              <p className="text-xs text-silver uppercase tracking-wider mb-1">Confirmation</p>
              <p className="text-gold font-mono">#BB-2024-0142</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg opacity-80"></div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-silver">Service</span>
              <span className="text-cream font-medium">Classic Haircut</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver">Barber</span>
              <span className="text-cream font-medium">Marcus Williams</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver">Date</span>
              <span className="text-cream font-medium">Fri, Jan 15, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver">Time</span>
              <span className="text-cream font-medium">3:30 PM</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link 
            href="/dashboard" 
            className="w-full bg-slate hover:bg-gold hover:text-obsidian text-cream py-3 rounded-lg text-sm font-medium transition-colors text-center"
          >
            View My Bookings
          </Link>
          <Link href="/" className="text-silver hover:text-white text-sm">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
