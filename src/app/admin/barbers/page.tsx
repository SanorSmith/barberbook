'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import BarberCredentialsModal from '@/components/admin/BarberCredentialsModal'

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBarber, setEditingBarber] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Senior Barber',
    bio: '',
    yearsExperience: '',
    image_url: '',
    specialties: '',
    is_active: true
  })
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadBarbers()
  }, [])

  const loadBarbers = async () => {
    const { data, error } = await supabase
      .from('barbers')
      .select(`
        *,
        profiles!barbers_user_id_fkey(username)
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading barbers:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
    
    console.log('Barbers data:', data)
    setBarbers(data || [])
    setLoading(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `barbers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('barber-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('barber-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError(null)
    
    try {
      let imageUrl = formData.image_url

      // Upload image if a new file was selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      if (editingBarber) {
        // Update existing barber
        const barberData = {
          name: `${formData.firstName} ${formData.lastName}`,
          role: formData.role,
          bio: formData.bio,
          years_experience: parseInt(formData.yearsExperience) || 0,
          image_url: imageUrl || null,
          specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
          is_active: formData.is_active
        }

        await supabase
          .from('barbers')
          .update(barberData)
          .eq('id', editingBarber.id)
      } else {
        // Create new barber with auto-generated credentials
        const response = await fetch('/api/admin/create-barber', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
            yearsExperience: parseInt(formData.yearsExperience) || 0,
            imageUrl: imageUrl || null
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create barber')
        }

        // Show credentials modal
        setCredentials(data.barber)
      }

      setShowModal(false)
      setEditingBarber(null)
      setImageFile(null)
      setImagePreview(null)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Senior Barber',
        bio: '',
        yearsExperience: '',
        image_url: '',
        specialties: '',
        is_active: true
      })
      setUploading(false)
      loadBarbers()
    } catch (error: any) {
      console.error('Error creating/updating barber:', error)
      setError(error.message || 'Failed to save barber')
      setUploading(false)
    }
  }

  const handleEdit = (barber: any) => {
    setEditingBarber(barber)
    const [firstName, ...lastNameParts] = barber.name.split(' ')
    const lastName = lastNameParts.join(' ')
    
    setFormData({
      firstName: firstName || '',
      lastName: lastName || '',
      email: barber.email || '',
      phone: barber.phone || '',
      role: barber.role || 'Senior Barber',
      bio: barber.bio || '',
      yearsExperience: barber.years_experience?.toString() || '',
      image_url: barber.image_url || '',
      specialties: Array.isArray(barber.specialties) ? barber.specialties.join(', ') : '',
      is_active: barber.is_active !== undefined ? barber.is_active : true
    })
    setImageFile(null)
    setImagePreview(barber.image_url || null)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this barber?')) return

    await supabase
      .from('barbers')
      .delete()
      .eq('id', id)

    loadBarbers()
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    await supabase
      .from('barbers')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    loadBarbers()
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
        <h1 className="font-serif text-3xl text-cream">Manage Barbers</h1>
        <button
          onClick={() => {
            setEditingBarber(null)
            setImageFile(null)
            setImagePreview(null)
            setError(null)
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              role: 'Senior Barber',
              bio: '',
              yearsExperience: '',
              image_url: '',
              specialties: '',
              is_active: true
            })
            setShowModal(true)
          }}
          className="px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors"
        >
          + Add Barber
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbers.map((barber) => (
          <div key={barber.id} className="bg-charcoal border border-slate rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              {barber.image_url ? (
                <img
                  src={barber.image_url}
                  alt={barber.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate flex items-center justify-center">
                  <span className="text-3xl text-silver">{barber.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-cream font-semibold text-lg">{barber.name}</h3>
                <p className="text-silver text-sm">{barber.role}</p>
                {barber.profiles?.username && (
                  <p className="text-gold text-xs font-mono mt-1">@{barber.profiles.username}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gold">★</span>
                  <span className="text-silver text-sm">{barber.rating || 0} ({barber.review_count || 0})</span>
                </div>
              </div>
            </div>

            {barber.bio && (
              <p className="text-silver text-sm mb-4 line-clamp-2">{barber.bio}</p>
            )}

            {barber.specialties && barber.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {barber.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-slate rounded text-silver text-xs">
                    {specialty}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate">
              <button
                onClick={() => toggleActive(barber.id, barber.is_active)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  barber.is_active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {barber.is_active ? 'Active' : 'Inactive'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(barber)}
                  className="px-3 py-1 text-gold hover:bg-gold/10 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(barber.id)}
                  className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-slate rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-cream font-serif text-2xl mb-6">
              {editingBarber ? 'Edit Barber' : 'Add New Barber'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                  {error}
                </div>
              )}

              {/* First Name and Last Name - Only for new barbers */}
              {!editingBarber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-silver text-sm mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-silver text-sm mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email - Only for new barbers */}
              {!editingBarber && (
                <div>
                  <label className="block text-silver text-sm mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                    required
                  />
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-silver text-sm mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="+358 40 123 4567"
                />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Role/Title</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="e.g. Senior Barber, Master Barber"
                />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  rows={3}
                  placeholder="Brief description about the barber..."
                />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="e.g. 10"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Barber Image</label>
                
                {/* Image Preview */}
                {(imagePreview || formData.image_url) && (
                  <div className="mb-4">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-2 border-slate"
                    />
                  </div>
                )}

                {/* File Upload */}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-obsidian hover:file:bg-gold-hover"
                  />
                  <p className="text-silver text-xs">Upload a new image or use the URL below</p>
                </div>

                {/* URL Input (optional) */}
                <div className="mt-3">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                    placeholder="Or paste image URL here"
                  />
                </div>
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="e.g. Fades, Beard Styling, Classic Cuts"
                />
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
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingBarber ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {credentials && (
        <BarberCredentialsModal
          credentials={credentials}
          onClose={() => {
            setCredentials(null)
            loadBarbers()
          }}
        />
      )}
    </div>
  )
}
