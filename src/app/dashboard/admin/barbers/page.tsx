'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBarber, setEditingBarber] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBarbers()
  }, [])

  const fetchBarbers = async () => {
    const { data } = await supabase
      .from('barbers')
      .select('*')
      .order('name')
    
    setBarbers(data || [])
    setLoading(false)
  }

  const handleSave = async (formData: any) => {
    if (editingBarber) {
      // Update existing barber
      await supabase
        .from('barbers')
        .update(formData)
        .eq('id', editingBarber.id)
    } else {
      // Add new barber
      await supabase
        .from('barbers')
        .insert(formData)
    }
    
    setShowAddModal(false)
    setEditingBarber(null)
    fetchBarbers()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this barber?')) {
      await supabase
        .from('barbers')
        .delete()
        .eq('id', id)
      fetchBarbers()
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-cream">Manage Barbers</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gold hover:bg-gold-hover text-obsidian px-4 py-2 rounded-lg font-medium"
        >
          + Add Barber
        </button>
      </div>

      <div className="bg-charcoal border border-slate rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate">
              <th className="text-left py-3 px-4 text-silver">Name</th>
              <th className="text-left py-3 px-4 text-silver">Role</th>
              <th className="text-left py-3 px-4 text-silver">Rating</th>
              <th className="text-left py-3 px-4 text-silver">Experience</th>
              <th className="text-left py-3 px-4 text-silver">Status</th>
              <th className="text-left py-3 px-4 text-silver">Actions</th>
            </tr>
          </thead>
          <tbody>
            {barbers.map((barber) => (
              <tr key={barber.id} className="border-b border-slate/50">
                <td className="py-3 px-4 text-cream">{barber.name}</td>
                <td className="py-3 px-4 text-cream">{barber.role}</td>
                <td className="py-3 px-4 text-cream">
                  <div className="flex items-center gap-1">
                    <span>{barber.rating}</span>
                    <span className="text-silver text-sm">({barber.reviews})</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-cream">{barber.experience}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    barber.is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {barber.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingBarber(barber)}
                      className="text-gold hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(barber.id)}
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
      {(showAddModal || editingBarber) && (
        <BarberModal
          barber={editingBarber}
          onSave={handleSave}
          onCancel={() => {
            setShowAddModal(false)
            setEditingBarber(null)
          }}
        />
      )}
    </div>
  )
}

function BarberModal({ barber, onSave, onCancel }: {
  barber: any
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: barber?.name || '',
    role: barber?.role || 'Barber',
    rating: barber?.rating || 4.5,
    reviews: barber?.reviews || 0,
    experience: barber?.experience || '',
    image: barber?.image || '',
    specialties: barber?.specialties || [],
    is_active: barber?.is_active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const specialties = ['Fades', 'Classic', 'Beards', 'Hot Shaves', 'Modern', 'Textures']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-charcoal border border-slate rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl text-cream font-semibold mb-4">
          {barber ? 'Edit Barber' : 'Add Barber'}
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
            <label className="block text-sm text-silver mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
            >
              <option value="Barber">Barber</option>
              <option value="Senior Barber">Senior Barber</option>
              <option value="Master Barber">Master Barber</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-silver mb-1">Experience</label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
              placeholder="e.g., 8 years"
            />
          </div>

          <div>
            <label className="block text-sm text-silver mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm text-silver mb-2">Specialties</label>
            <div className="space-y-2">
              {specialties.map(specialty => (
                <label key={specialty} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, specialties: [...prev.specialties, specialty] }))
                      } else {
                        setFormData(prev => ({ ...prev, specialties: prev.specialties.filter((s: string) => s !== specialty) }))
                      }
                    }}
                    className="w-4 h-4 rounded border-slate bg-obsidian text-gold"
                  />
                  <span className="text-cream text-sm">{specialty}</span>
                </label>
              ))}
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
              {barber ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
