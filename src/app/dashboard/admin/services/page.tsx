'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('name')
    
    setServices(data || [])
    setLoading(false)
  }

  const handleSave = async (formData: any) => {
    if (editingService) {
      // Update existing service
      await supabase
        .from('services')
        .update(formData)
        .eq('id', editingService.id)
    } else {
      // Add new service
      await supabase
        .from('services')
        .insert(formData)
    }
    
    setShowAddModal(false)
    setEditingService(null)
    fetchServices()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await supabase
        .from('services')
        .delete()
        .eq('id', id)
      fetchServices()
    }
  }

  const toggleServiceStatus = async (id: number, isActive: boolean) => {
    await supabase
      .from('services')
      .update({ is_active: isActive })
      .eq('id', id)
    fetchServices()
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-cream">Manage Services</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gold hover:bg-gold-hover text-obsidian px-4 py-2 rounded-lg font-medium"
        >
          + Add Service
        </button>
      </div>

      <div className="bg-charcoal border border-slate rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate">
              <th className="text-left py-3 px-4 text-silver">Service</th>
              <th className="text-left py-3 px-4 text-silver">Category</th>
              <th className="text-left py-3 px-4 text-silver">Price</th>
              <th className="text-left py-3 px-4 text-silver">Duration</th>
              <th className="text-left py-3 px-4 text-silver">Status</th>
              <th className="text-left py-3 px-4 text-silver">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-slate/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <div className="text-cream font-medium">{service.name}</div>
                      <div className="text-silver text-sm">{service.description}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-cream">{service.category}</td>
                <td className="py-3 px-4 text-cream">${service.price}</td>
                <td className="py-3 px-4 text-cream">{service.duration} min</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleServiceStatus(service.id, !service.is_active)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      service.is_active 
                        ? 'bg-success/10 text-success hover:bg-success/20' 
                        : 'bg-error/10 text-error hover:bg-error/20'
                    }`}
                  >
                    {service.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingService(service)}
                      className="text-gold hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-error hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingService) && (
        <ServiceModal
          service={editingService}
          onSave={handleSave}
          onCancel={() => {
            setShowAddModal(false)
            setEditingService(null)
          }}
        />
      )}
    </div>
  )
}

function ServiceModal({ service, onSave, onCancel }: {
  service: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration: service?.duration || 30,
    category: service?.category || 'HAIRCUT',
    icon: service?.icon || 'scissors',
    is_active: service?.is_active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const categories = ['HAIRCUT', 'BEARD', 'SHAVE', 'PACKAGE']
  const icons = ['scissors', 'layers', 'user', 'wind', 'crown', 'smile']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-charcoal border border-slate rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl text-cream font-semibold mb-4">
          {service ? 'Edit Service' : 'Add Service'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-silver mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-silver mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-silver mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-silver mb-1">Duration (min)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-silver mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-silver mb-1">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
              >
                {icons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 rounded border-slate bg-obsidian text-gold"
              />
              <span className="text-cream text-sm">Active</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-charcoal border border-slate text-cream py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gold hover:bg-gold-hover text-obsidian py-2 rounded-lg font-medium"
            >
              {service ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
