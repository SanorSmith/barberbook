'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BarberEarningsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today')
  const [earnings, setEarnings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEarnings()
  }, [period])

  const fetchEarnings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get barber info
    const { data: barber } = await supabase
      .from('barbers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!barber) return

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Get completed bookings in period
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        *,
        services (*)
      `)
      .eq('barber_id', barber.id)
      .eq('status', 'completed')
      .gte('booking_date', startDate.toISOString().split('T')[0])
      .lte('booking_date', endDate.toISOString().split('T')[0])

    if (!bookings) return

    // Calculate earnings
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
    const serviceBreakdown = bookings.reduce((acc: any, b) => {
      const serviceName = (b.services as any)?.name || 'Unknown'
      const price = b.total_price || 0
      if (!acc[serviceName]) {
        acc[serviceName] = { quantity: 0, unitPrice: price, total: 0 }
      }
      acc[serviceName].quantity += 1
      acc[serviceName].total += price
      return acc
    }, {})

    // Get different period stats
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [todayBookings, weekBookings, monthBookings] = await Promise.all([
      supabase
        .from('bookings')
        .select('total_price')
        .eq('barber_id', barber.id)
        .eq('status', 'completed')
        .gte('booking_date', todayStart.toISOString().split('T')[0]),
      supabase
        .from('bookings')
        .select('total_price')
        .eq('barber_id', barber.id)
        .eq('status', 'completed')
        .gte('booking_date', weekStart.toISOString().split('T')[0]),
      supabase
        .from('bookings')
        .select('total_price')
        .eq('barber_id', barber.id)
        .eq('status', 'completed')
        .gte('booking_date', monthStart.toISOString().split('T')[0])
    ])

    const todayEarnings = todayBookings.data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
    const weekEarnings = weekBookings.data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
    const monthEarnings = monthBookings.data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    setEarnings({
      today: {
        amount: todayEarnings,
        count: todayBookings.data?.length || 0
      },
      week: {
        amount: weekEarnings,
        count: weekBookings.data?.length || 0
      },
      month: {
        amount: monthEarnings,
        count: monthBookings.data?.length || 0
      },
      currentPeriod: {
        amount: totalEarnings,
        count: bookings.length,
        serviceBreakdown
      }
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-silver">Loading earnings...</div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-silver">No earnings data available</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-cream mb-4">My Earnings</h1>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'today' 
                ? 'bg-gold text-obsidian' 
                : 'bg-charcoal text-silver hover:text-cream'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'week' 
                ? 'bg-gold text-obsidian' 
                : 'bg-charcoal text-silver hover:text-cream'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'month' 
                ? 'bg-gold text-obsidian' 
                : 'bg-charcoal text-silver hover:text-cream'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'custom' 
                ? 'bg-gold text-obsidian' 
                : 'bg-charcoal text-silver hover:text-cream'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="text-silver text-sm mb-2">Today</div>
          <div className="text-3xl text-cream font-bold">${earnings.today.amount.toFixed(2)}</div>
          <div className="text-silver text-xs mt-1">{earnings.today.count} cuts</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="text-silver text-sm mb-2">This Week</div>
          <div className="text-3xl text-cream font-bold">${earnings.week.amount.toFixed(2)}</div>
          <div className="text-silver text-xs mt-1">{earnings.week.count} cuts</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="text-silver text-sm mb-2">This Month</div>
          <div className="text-3xl text-cream font-bold">${earnings.month.amount.toFixed(2)}</div>
          <div className="text-silver text-xs mt-1">{earnings.month.count} cuts</div>
        </div>
        
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <div className="text-silver text-sm mb-2">Completed</div>
          <div className="text-3xl text-cream font-bold">{earnings.week.count}</div>
          <div className="text-silver text-xs mt-1">This Week</div>
        </div>
      </div>

      {/* Earnings Chart Placeholder */}
      <div className="bg-charcoal border border-slate rounded-xl p-6 mb-8">
        <h2 className="text-xl text-cream font-semibold mb-4">Earnings Trend</h2>
        <div className="h-64 flex items-center justify-center text-silver">
          Chart visualization would go here
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="bg-charcoal border border-slate rounded-xl p-6">
        <h2 className="text-xl text-cream font-semibold mb-4">Earnings by Service</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate">
                <th className="text-left py-3 px-4 text-silver">Service</th>
                <th className="text-left py-3 px-4 text-silver">Quantity</th>
                <th className="text-left py-3 px-4 text-silver">Unit Price</th>
                <th className="text-left py-3 px-4 text-silver">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(earnings.currentPeriod.serviceBreakdown).map(([serviceName, data]: any) => (
                <tr key={serviceName} className="border-b border-slate/50">
                  <td className="py-3 px-4 text-cream">{serviceName}</td>
                  <td className="py-3 px-4 text-cream">{data.quantity}</td>
                  <td className="py-3 px-4 text-cream">${data.unitPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-cream">${data.total.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t border-slate font-semibold">
                <td className="py-3 px-4 text-cream">TOTAL</td>
                <td className="py-3 px-4 text-cream">{earnings.currentPeriod.count}</td>
                <td className="py-3 px-4 text-cream">-</td>
                <td className="py-3 px-4 text-cream">${earnings.currentPeriod.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tips/Commission Section */}
        <div className="mt-6 pt-6 border-t border-slate">
          <h3 className="text-lg text-cream font-semibold mb-4">Payout Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-silver">Service Total:</span>
              <span className="text-cream">${earnings.currentPeriod.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver">Tips:</span>
              <span className="text-cream">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver">Commission (60%):</span>
              <span className="text-cream">${(earnings.currentPeriod.amount * 0.6).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate font-semibold">
              <span className="text-cream">Total Payout:</span>
              <span className="text-gold">${(earnings.currentPeriod.amount * 0.6).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
