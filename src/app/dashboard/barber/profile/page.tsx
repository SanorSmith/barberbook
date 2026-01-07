'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BarberProfilePage() {
  const [barber, setBarber] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    experience: '',
    specialties: [] as string[]
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get barber info
    const { data: barber } = await supabase
      .from('barbers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setBarber(barber)
    setProfile(profile)

    if (barber) {
      setFormData({
        name: barber.name || '',
        phone: profile?.phone || '',
        bio: barber.bio || '',
        experience: barber.experience || '',
        specialties: barber.specialties || []
      })
    }

    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update barber profile
    await supabase
      .from('barbers')
      .update({
        name: formData.name,
        bio: formData.bio,
        experience: formData.experience,
        specialties: formData.specialties
      })
      .eq('user_id', user.id)

    // Update user profile
    await supabase
      .from('profiles')
      .update({
        phone: formData.phone
      })
      .eq('id', user.id)

    setSaving(false)
    fetchData()
  }

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const allSpecialties = [
    'Classic Cuts',
    'Fades & Tapers',
    'Beard Work',
    'Hot Shaves',
    'Kids Cuts',
    'Hair Designs'
  ]

  const experienceOptions = []
  for (let i = 1; i <= 30; i++) {
    experienceOptions.push(`${i} year${i > 1 ? 's' : ''}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-silver">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-cream mb-2">My Profile</h1>
        <p className="text-silver">How customers see you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-charcoal border border-slate rounded-xl p-6">
            <h2 className="text-lg text-cream font-semibold mb-4">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-slate flex items-center justify-center text-gold font-serif text-4xl">
                {formData.name?.charAt(0) || 'B'}
              </div>
              <div>
                <button className="bg-gold hover:bg-gold-hover text-obsidian px-4 py-2 rounded-lg font-medium mb-2">
                  Change Photo
                </button>
                <p className="text-silver text-xs">
                  Recommended: Square image, min 400x400px
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-charcoal border border-slate rounded-xl p-6">
            <h2 className="text-lg text-cream font-semibold mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-silver mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-obsidian border border-slate text-cream px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-silver mb-2">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full bg-obsidian border border-slate text-silver px-4 py-2 rounded-lg opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-silver mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-obsidian border border-slate text-cream px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-silver mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value.slice(0, 500) }))}
                  className="w-full bg-obsidian border border-slate text-cream px-4 py-2 rounded-lg"
                  rows={4}
                  placeholder="Tell customers about yourself, your experience, and your style..."
                />
                <p className="text-silver text-xs mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm text-silver mb-2">Years of Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full bg-obsidian border border-slate text-cream px-4 py-2 rounded-lg"
                >
                  <option value="">Select experience...</option>
                  {experienceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-charcoal border border-slate rounded-xl p-6">
            <h2 className="text-lg text-cream font-semibold mb-4">Specialties</h2>
            <div className="grid grid-cols-2 gap-3">
              {allSpecialties.map(specialty => (
                <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => toggleSpecialty(specialty)}
                    className="w-4 h-4 rounded border-slate bg-obsidian text-gold focus:ring-gold"
                  />
                  <span className="text-cream text-sm">{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gold hover:bg-gold-hover text-obsidian px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-charcoal border border-slate rounded-xl p-6">
            <h2 className="text-lg text-cream font-semibold mb-6">Profile Preview</h2>
            
            {/* Preview Card */}
            <div className="bg-obsidian border border-slate rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="w-24 h-24 rounded-full bg-slate flex items-center justify-center text-gold font-serif text-3xl mx-auto mb-3">
                  {formData.name?.charAt(0) || 'B'}
                </div>
                <h3 className="text-xl text-cream font-semibold">{formData.name || 'Your Name'}</h3>
                <p className="text-silver text-sm">Senior Barber</p>
              </div>

              <div className="text-center mb-4">
                <div className="flex justify-center items-center gap-1 text-gold mb-2">
                  <span className="text-lg">★★★★★</span>
                  <span className="text-sm">4.9 (127 reviews)</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-silver text-sm mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map(specialty => (
                    <span key={specialty} className="bg-slate text-gold text-xs px-2 py-1 rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-silver text-sm">{formData.experience || '0 years'} experience</p>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-slate hover:bg-gold hover:text-obsidian text-cream py-2 rounded-lg text-sm font-medium transition-colors">
                  View Full Profile
                </button>
                <button className="w-full bg-gold hover:bg-gold-hover text-obsidian py-2 rounded-lg text-sm font-medium">
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="bg-charcoal border border-slate rounded-xl p-6 mt-6">
            <h2 className="text-lg text-cream font-semibold mb-4">Portfolio Images</h2>
            <p className="text-silver text-sm mb-4">Show off your best work</p>
            
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-obsidian border border-slate rounded-lg flex items-center justify-center text-silver hover:border-gold transition-colors cursor-pointer">
                  <span className="text-2xl">+</span>
                </div>
              ))}
            </div>
            
            <p className="text-silver text-xs mt-3">
              Drag and drop or click to upload
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
