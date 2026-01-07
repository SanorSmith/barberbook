'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'HAIRCUT',
    icon: 'scissors',
    is_active: true
  })
  const supabase = createClient()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error loading services:', error)
    }

    console.log('Loaded services:', data)
    setServices(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Submitting service with data:', formData)
    
    const serviceData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      category: formData.category,
      icon: formData.icon,
      is_active: formData.is_active
    }

    console.log('Parsed service data:', serviceData)

    let result
    if (editingService) {
      console.log('Updating service:', editingService.id)
      result = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingService.id)
    } else {
      console.log('Inserting new service')
      result = await supabase
        .from('services')
        .insert(serviceData)
    }

    console.log('Result:', result)

    if (result.error) {
      console.error('Error saving service:', result.error)
      alert(`Error: ${result.error.message}\n\nDetails: ${JSON.stringify(result.error, null, 2)}`)
      return
    }

    console.log('Service saved successfully')
    alert('Service saved successfully!')

    setShowModal(false)
    setEditingService(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: 'HAIRCUT',
      icon: 'scissors',
      is_active: true
    })
    loadServices()
  }

  const handleEdit = (service: any) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      icon: service.icon,
      is_active: service.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting service:', error)
      alert(`Error: ${error.message}`)
      return
    }

    loadServices()
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error toggling service status:', error)
      alert(`Error: ${error.message}`)
      return
    }

    loadServices()
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
        <h1 className="font-serif text-3xl text-cream">Manage Services</h1>
        <button
          onClick={() => {
            setEditingService(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              duration: '',
              category: 'HAIRCUT',
              icon: 'scissors',
              is_active: true
            })
            setShowModal(true)
          }}
          className="px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors"
        >
          + Add Service
        </button>
      </div>

      <div className="bg-charcoal border border-slate rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-obsidian">
            <tr>
              <th className="text-left text-silver text-sm font-medium p-4">Name</th>
              <th className="text-left text-silver text-sm font-medium p-4">Category</th>
              <th className="text-left text-silver text-sm font-medium p-4">Duration</th>
              <th className="text-left text-silver text-sm font-medium p-4">Price</th>
              <th className="text-left text-silver text-sm font-medium p-4">Status</th>
              <th className="text-right text-silver text-sm font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t border-slate">
                <td className="p-4">
                  <div className="text-cream font-medium">{service.name}</div>
                  <div className="text-silver text-sm">{service.description}</div>
                </td>
                <td className="p-4 text-silver">{service.category}</td>
                <td className="p-4 text-silver">{service.duration} min</td>
                <td className="p-4 text-gold font-semibold">€{service.price}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(service.id, service.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {service.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(service)}
                    className="px-3 py-1 text-gold hover:bg-gold/10 rounded transition-colors mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-slate rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-cream font-serif text-2xl mb-6">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-silver text-sm mb-2">Service Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-silver text-sm mb-2">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-silver text-sm mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                >
                  <option value="HAIRCUT">Haircut</option>
                  <option value="BEARD">Beard</option>
                  <option value="SHAVE">Shave</option>
                  <option value="PACKAGE">Package</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-silver text-sm">Active</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 text-silver hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors"
                >
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
