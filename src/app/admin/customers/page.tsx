'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [customerBookings, setCustomerBookings] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    setCustomers(data || [])
    setLoading(false)
  }

  const loadCustomerBookings = async (customerId: string) => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        services (name),
        barbers (name)
      `)
      .eq('user_id', customerId)
      .order('booking_date', { ascending: false })

    setCustomerBookings(data || [])
  }

  const handleViewDetails = async (customer: any) => {
    setSelectedCustomer(customer)
    await loadCustomerBookings(customer.id)
    setShowDetailsModal(true)
  }

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-cream">Customers</h1>
        <div className="text-silver">
          Total: <span className="text-cream font-semibold">{customers.length}</span> customers
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-charcoal border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-charcoal border border-slate rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-obsidian">
            <tr>
              <th className="text-left text-silver text-sm font-medium p-4">Customer</th>
              <th className="text-left text-silver text-sm font-medium p-4">Email</th>
              <th className="text-left text-silver text-sm font-medium p-4">Phone</th>
              <th className="text-left text-silver text-sm font-medium p-4">Joined</th>
              <th className="text-right text-silver text-sm font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="border-t border-slate hover:bg-slate/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-gold font-semibold">
                        {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'C'}
                      </span>
                    </div>
                    <div>
                      <div className="text-cream font-medium">{customer.full_name || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-silver">{customer.email}</td>
                <td className="p-4 text-silver">{customer.phone || 'N/A'}</td>
                <td className="p-4 text-silver">
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleViewDetails(customer)}
                    className="px-4 py-2 text-gold hover:bg-gold/10 rounded transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-silver">
            No customers found
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-slate rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-cream font-serif text-2xl mb-2">Customer Details</h2>
                <p className="text-silver">{selectedCustomer.email}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-silver hover:text-cream"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-obsidian border border-slate rounded-lg p-6 mb-6">
              <h3 className="text-cream font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-silver text-sm mb-1">Full Name</div>
                  <div className="text-cream">{selectedCustomer.full_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-silver text-sm mb-1">Phone</div>
                  <div className="text-cream">{selectedCustomer.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-silver text-sm mb-1">Email</div>
                  <div className="text-cream">{selectedCustomer.email}</div>
                </div>
                <div>
                  <div className="text-silver text-sm mb-1">Language</div>
                  <div className="text-cream">{selectedCustomer.language_preference || 'en'}</div>
                </div>
                <div>
                  <div className="text-silver text-sm mb-1">Member Since</div>
                  <div className="text-cream">
                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking History */}
            <div className="bg-obsidian border border-slate rounded-lg p-6">
              <h3 className="text-cream font-semibold mb-4">
                Booking History ({customerBookings.length})
              </h3>
              
              {customerBookings.length > 0 ? (
                <div className="space-y-3">
                  {customerBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-charcoal border border-slate rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-cream font-medium mb-1">
                            {booking.services?.name || 'Service'}
                          </div>
                          <div className="text-silver text-sm">
                            with {booking.barbers?.name || 'Barber'}
                          </div>
                          <div className="text-silver text-sm mt-2">
                            {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gold font-semibold mb-2">
                            €{booking.total_price?.toFixed(2)}
                          </div>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : booking.status === 'confirmed'
                                ? 'bg-blue-500/20 text-blue-400'
                                : booking.status === 'cancelled'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-silver text-center py-8">No bookings yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
