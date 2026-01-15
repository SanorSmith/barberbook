'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [formData, setFormData] = useState({
    user_id: '',
    barber_id: '',
    service_id: '',
    booking_date: '',
    booking_time: '',
    status: 'pending',
    notes: ''
  })
  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
    loadCustomers()
    loadBarbers()
    loadServices()
  }, [filter, statusFilter])

  const loadCustomers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'customer')
      .order('full_name')
    setCustomers(data || [])
  }

  const loadBarbers = async () => {
    const { data } = await supabase
      .from('barbers')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    setBarbers(data || [])
  }

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('id, name, price, duration')
      .eq('is_active', true)
      .order('name')
    setServices(data || [])
  }

  const loadAppointments = async () => {
    setLoading(true)
    console.log('Loading appointments...')
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        services (name, duration, price),
        barbers (name),
        profiles (full_name, email)
      `)

    const today = new Date().toISOString().split('T')[0]

    if (filter === 'today') {
      query = query.eq('booking_date', today)
    } else if (filter === 'upcoming') {
      query = query.gte('booking_date', today)
    } else if (filter === 'past') {
      query = query.lt('booking_date', today)
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    query = query.order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })

    const { data, error } = await query
    
    if (error) {
      console.error('Error loading appointments:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert(`Error loading appointments: ${error.message}`)
    } else {
      console.log('Appointments loaded:', data)
      console.log('Number of appointments:', data?.length || 0)
    }
    
    setAppointments(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)

    loadAppointments()
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    loadAppointments()
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating appointment with data:', formData)

    const appointmentData = {
      user_id: formData.user_id,
      barber_id: parseInt(formData.barber_id),
      service_id: parseInt(formData.service_id),
      booking_date: formData.booking_date,
      booking_time: formData.booking_time,
      status: formData.status,
      notes: formData.notes || null
    }

    console.log('Inserting appointment:', appointmentData)

    const { data, error } = await supabase
      .from('bookings')
      .insert(appointmentData)
      .select()

    if (error) {
      console.error('Error creating appointment:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert(`Failed to create appointment: ${error.message}`)
    } else {
      console.log('Appointment created successfully:', data)
      alert('Appointment created successfully!')
      setShowCreateModal(false)
      setFormData({
        user_id: '',
        barber_id: '',
        service_id: '',
        booking_date: '',
        booking_time: '',
        status: 'pending',
        notes: ''
      })
      loadAppointments()
    }
  }

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment)
    setFormData({
      user_id: appointment.user_id,
      barber_id: appointment.barber_id?.toString() || '',
      service_id: appointment.service_id?.toString() || '',
      booking_date: appointment.booking_date,
      booking_time: appointment.booking_time,
      status: appointment.status,
      notes: appointment.notes || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAppointment) return

    console.log('Updating appointment:', editingAppointment.id, 'with data:', formData)

    const { data, error } = await supabase
      .from('bookings')
      .update({
        user_id: formData.user_id,
        barber_id: parseInt(formData.barber_id),
        service_id: parseInt(formData.service_id),
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        status: formData.status,
        notes: formData.notes || null
      })
      .eq('id', editingAppointment.id)
      .select()

    if (error) {
      console.error('Error updating appointment:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert(`Failed to update appointment: ${error.message}`)
    } else {
      console.log('Appointment updated successfully:', data)
      alert('Appointment updated successfully!')
      setShowEditModal(false)
      setEditingAppointment(null)
      setFormData({
        user_id: '',
        barber_id: '',
        service_id: '',
        booking_date: '',
        booking_time: '',
        status: 'pending',
        notes: ''
      })
      loadAppointments()
    }
  }

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
        <h1 className="font-serif text-3xl text-cream">Appointments Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors"
        >
          + Create Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          {['all', 'today', 'upcoming', 'past'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-gold text-obsidian'
                  : 'bg-charcoal text-silver hover:text-cream'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-charcoal border border-slate rounded-lg px-4 py-2 text-cream focus:border-gold outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Total</div>
          <div className="text-cream text-2xl font-bold">{appointments.length}</div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Pending</div>
          <div className="text-yellow-400 text-2xl font-bold">
            {appointments.filter(a => a.status === 'pending').length}
          </div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Confirmed</div>
          <div className="text-blue-400 text-2xl font-bold">
            {appointments.filter(a => a.status === 'confirmed').length}
          </div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Completed</div>
          <div className="text-green-400 text-2xl font-bold">
            {appointments.filter(a => a.status === 'completed').length}
          </div>
        </div>
        <div className="bg-charcoal border border-slate rounded-lg p-4">
          <div className="text-silver text-sm mb-1">Revenue</div>
          <div className="text-gold text-2xl font-bold">
            €{appointments
              .filter(a => a.status === 'completed')
              .reduce((sum, a) => sum + (a.total_price || 0), 0)
              .toFixed(0)}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-charcoal border border-slate rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-obsidian">
            <tr>
              <th className="text-left text-silver text-sm font-medium p-4">Date & Time</th>
              <th className="text-left text-silver text-sm font-medium p-4">Customer</th>
              <th className="text-left text-silver text-sm font-medium p-4">Service</th>
              <th className="text-left text-silver text-sm font-medium p-4">Barber</th>
              <th className="text-left text-silver text-sm font-medium p-4">Status</th>
              <th className="text-right text-silver text-sm font-medium p-4">Price</th>
              <th className="text-right text-silver text-sm font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-slate hover:bg-slate/20">
                <td className="p-4">
                  <div className="text-cream font-medium">
                    {new Date(appointment.booking_date).toLocaleDateString()}
                  </div>
                  <div className="text-silver text-sm">{appointment.booking_time}</div>
                </td>
                <td className="p-4">
                  <div className="text-cream">{appointment.profiles?.full_name || 'N/A'}</div>
                  <div className="text-silver text-sm">{appointment.profiles?.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-cream">{appointment.services?.name || 'N/A'}</div>
                  <div className="text-silver text-sm">{appointment.services?.duration || 0} min</div>
                </td>
                <td className="p-4 text-silver">{appointment.barbers?.name || 'N/A'}</td>
                <td className="p-4">
                  <select
                    value={appointment.status}
                    onChange={(e) => updateStatus(appointment.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 outline-none cursor-pointer ${
                      appointment.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : appointment.status === 'confirmed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : appointment.status === 'no_show'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </td>
                <td className="p-4 text-right text-gold font-semibold">
                  €{appointment.total_price?.toFixed(2)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="px-3 py-1 text-gold hover:bg-gold/10 rounded transition-colors"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <div className="text-center py-12 text-silver">
            No appointments found
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-slate rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-serif text-gold mb-4">Create New Appointment</h3>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-silver text-sm mb-2">Customer</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Barber</label>
                <select
                  value={formData.barber_id}
                  onChange={(e) => setFormData({ ...formData, barber_id: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                >
                  <option value="">Select barber</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Service</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - €{service.price} ({service.duration}min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-silver text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-silver text-sm mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.booking_time}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg p-3 text-cream focus:border-gold outline-none min-h-[100px]"
                  placeholder="Add any notes about this appointment..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate/30 hover:bg-slate/50 text-cream py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold-hover text-obsidian py-2 rounded-lg font-medium transition-colors"
                >
                  Create Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-slate rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-serif text-gold mb-4">Edit Appointment</h3>
            <form onSubmit={handleUpdateAppointment} className="space-y-4">
              <div>
                <label className="block text-silver text-sm mb-2">Customer</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Barber</label>
                <select
                  value={formData.barber_id}
                  onChange={(e) => setFormData({ ...formData, barber_id: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                >
                  <option value="">Select barber</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Service</label>
                <select
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                >
                  <option value="">Select service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - €{service.price} ({service.duration}min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-silver text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-silver text-sm mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.booking_time}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg p-3 text-cream focus:border-gold outline-none min-h-[100px]"
                  placeholder="Add any notes about this appointment..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingAppointment(null)
                  }}
                  className="flex-1 bg-slate/30 hover:bg-slate/50 text-cream py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold hover:bg-gold-hover text-obsidian py-2 rounded-lg font-medium transition-colors"
                >
                  Update Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
