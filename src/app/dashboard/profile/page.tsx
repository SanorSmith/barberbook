'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [language, setLanguage] = useState('en')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setEmail(profile.email || '')
      setLanguage(profile.language_preference || 'en')
    }

    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        language_preference: language,
      })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-cream mb-8">Profile Settings</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/50 text-green-400'
              : 'bg-red-500/10 border border-red-500/50 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-gold text-3xl font-semibold">
                {fullName?.charAt(0) || email?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <button
                type="button"
                className="px-4 py-2 bg-slate hover:bg-slate/80 text-cream rounded-lg text-sm font-medium transition-colors mb-2"
              >
                Upload Photo
              </button>
              <p className="text-silver text-xs">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-silver text-sm mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-silver text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-obsidian/50 border border-slate rounded-lg px-4 py-3 text-silver cursor-not-allowed"
              />
              <p className="text-silver text-xs mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-silver text-sm mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none transition-colors"
                placeholder="+358 40 123 4567"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold mb-4">Preferences</h2>
          <div>
            <label className="block text-silver text-sm mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none transition-colors"
            >
              <option value="en">🇬🇧 English</option>
              <option value="fi">🇫🇮 Suomi (Finnish)</option>
              <option value="sv">🇸🇪 Svenska (Swedish)</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 text-silver hover:text-cream transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
