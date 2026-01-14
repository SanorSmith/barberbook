'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Booking {
  id: string
  booking_date: string
  booking_time: string
  status: string
  notes: string | null
  created_at: string
  user: {
    id: string
    full_name: string
    email: string
    phone: string | null
  } | null
  barber: {
    id: number
    name: string
  } | null
  service: {
    id: number
    name: string
    price: number
    duration: number
  } | null
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadBookings()
  }, [filter])

  const loadBookings = async () => {
    setLoading(true)
    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        booking_time,
        status,
        notes,
        created_at,
        user:profiles!bookings_user_id_fkey (
          id,
          full_name,
          email,
          phone
        ),
        barber:barbers!bookings_barber_id_fkey (
          id,
          name
        ),
        service:services!bookings_service_id_fkey (
          id,
          name,
          price,
          duration
        )
      `)
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading bookings:', error)
    } else {
      setBookings((data as any) || [])
    }
    setLoading(false)
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (error) {
      console.error('Error updating status:', error)
      alert('Failed to update booking status')
    } else {
      loadBookings()
    }
  }

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
    } else {
      loadBookings()
    }
  }

  const handleEditNotes = async () => {
    if (!editingBooking) return

    const { error } = await supabase
      .from('bookings')
      .update({ notes: editingBooking.notes })
      .eq('id', editingBooking.id)

    if (error) {
      console.error('Error updating notes:', error)
      alert('Failed to update notes')
    } else {
      setShowEditModal(false)
      setEditingBooking(null)
      loadBookings()
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      booking.user?.full_name?.toLowerCase().includes(search) ||
      booking.user?.email?.toLowerCase().includes(search) ||
      booking.barber?.name?.toLowerCase().includes(search) ||
      booking.service?.name?.toLowerCase().includes(search)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate/20 text-silver border-slate/30'
    }
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-obsidian text-cream p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-gold mb-2">Bookings Management</h1>
          <p className="text-silver">Manage all customer bookings and appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-charcoal border border-slate rounded-lg p-4">
            <div className="text-2xl font-bold text-gold">{stats.total}</div>
            <div className="text-sm text-silver">Total Bookings</div>
          </div>
          <div className="bg-charcoal border border-slate rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-silver">Pending</div>
          </div>
          <div className="bg-charcoal border border-slate rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{stats.confirmed}</div>
            <div className="text-sm text-silver">Confirmed</div>
          </div>
          <div className="bg-charcoal border border-slate rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.completed}</div>
            <div className="text-sm text-silver">Completed</div>
          </div>
          <div className="bg-charcoal border border-slate rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{stats.cancelled}</div>
            <div className="text-sm text-silver">Cancelled</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-charcoal border border-slate rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    filter === status
                      ? 'bg-gold text-obsidian'
                      : 'bg-slate/30 text-silver hover:bg-slate/50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by customer, barber, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-2 text-cream focus:border-gold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="text-center py-12 text-silver">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-silver">No bookings found</div>
        ) : (
          <div className="bg-charcoal border border-slate rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-obsidian border-b border-slate">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-silver uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-silver uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-silver uppercase tracking-wider">Barber</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-silver uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-silver uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-silver uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-cream">{booking.booking_date}</div>
                        <div className="text-sm text-silver">{booking.booking_time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-cream">{booking.user?.full_name || 'N/A'}</div>
                        <div className="text-sm text-silver">{booking.user?.email || 'N/A'}</div>
                        {booking.user?.phone && (
                          <div className="text-xs text-silver">{booking.user.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-cream">{booking.barber?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-cream">{booking.service?.name || 'N/A'}</div>
                        <div className="text-sm text-silver">
                          ${booking.service?.price} • {booking.service?.duration}min
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)} bg-transparent cursor-pointer`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingBooking(booking)
                              setShowEditModal(true)
                            }}
                            className="text-gold hover:text-gold-hover transition-colors"
                            title="Edit Notes"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Notes Modal */}
        {showEditModal && editingBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-charcoal border border-slate rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-serif text-gold mb-4">Edit Booking Notes</h3>
              <textarea
                value={editingBooking.notes || ''}
                onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                className="w-full bg-obsidian border border-slate rounded-lg p-3 text-cream focus:border-gold outline-none min-h-[120px]"
                placeholder="Add notes about this booking..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleEditNotes}
                  className="flex-1 bg-gold hover:bg-gold-hover text-obsidian py-2 rounded-lg font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingBooking(null)
                  }}
                  className="flex-1 bg-slate/30 hover:bg-slate/50 text-cream py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
