'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_email: '',
    shop_phone: '',
    shop_address: '',
    opening_time: '09:00',
    closing_time: '18:00',
    booking_advance_days: 14,
    booking_buffer_minutes: 15,
    cancellation_hours: 24,
    currency: 'EUR',
    timezone: 'Europe/Helsinki'
  })
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase
      .from('shop_settings')
      .select('*')
      .single()

    if (data) {
      setSettings(data)
      setFormData({
        shop_name: data.shop_name || '',
        shop_email: data.shop_email || '',
        shop_phone: data.shop_phone || '',
        shop_address: data.shop_address || '',
        opening_time: data.opening_time || '09:00',
        closing_time: data.closing_time || '18:00',
        booking_advance_days: data.booking_advance_days || 14,
        booking_buffer_minutes: data.booking_buffer_minutes || 15,
        cancellation_hours: data.cancellation_hours || 24,
        currency: data.currency || 'EUR',
        timezone: data.timezone || 'Europe/Helsinki'
      })
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (settings) {
      await supabase
        .from('shop_settings')
        .update(formData)
        .eq('id', settings.id)
    } else {
      await supabase
        .from('shop_settings')
        .insert(formData)
    }

    setSaving(false)
    loadSettings()
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
      <h1 className="font-serif text-3xl text-cream mb-8">Shop Settings</h1>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-6">Business Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-silver text-sm mb-2">Shop Name</label>
              <input
                type="text"
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                placeholder="BarberBook"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-silver text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={formData.shop_email}
                  onChange={(e) => setFormData({ ...formData, shop_email: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="info@barberbook.com"
                />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.shop_phone}
                  onChange={(e) => setFormData({ ...formData, shop_phone: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  placeholder="+358 40 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-silver text-sm mb-2">Address</label>
              <textarea
                value={formData.shop_address}
                onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                rows={2}
                placeholder="123 Main Street, Helsinki, Finland"
              />
            </div>
          </div>
        </div>

        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-6">Operating Hours</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-silver text-sm mb-2">Opening Time</label>
              <input
                type="time"
                value={formData.opening_time}
                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-silver text-sm mb-2">Closing Time</label>
              <input
                type="time"
                value={formData.closing_time}
                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-6">Booking Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-silver text-sm mb-2">Advance Booking Days</label>
              <input
                type="number"
                value={formData.booking_advance_days}
                onChange={(e) => setFormData({ ...formData, booking_advance_days: parseInt(e.target.value) })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                min="1"
                max="90"
              />
              <p className="text-silver text-xs mt-1">How many days in advance customers can book</p>
            </div>

            <div>
              <label className="block text-silver text-sm mb-2">Buffer Time (minutes)</label>
              <input
                type="number"
                value={formData.booking_buffer_minutes}
                onChange={(e) => setFormData({ ...formData, booking_buffer_minutes: parseInt(e.target.value) })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                min="0"
                max="60"
                step="5"
              />
              <p className="text-silver text-xs mt-1">Buffer time between appointments</p>
            </div>

            <div>
              <label className="block text-silver text-sm mb-2">Cancellation Notice (hours)</label>
              <input
                type="number"
                value={formData.cancellation_hours}
                onChange={(e) => setFormData({ ...formData, cancellation_hours: parseInt(e.target.value) })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                min="0"
                max="72"
              />
              <p className="text-silver text-xs mt-1">Minimum hours before appointment to allow cancellation</p>
            </div>
          </div>
        </div>

        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-6">Regional Settings</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-silver text-sm mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-silver text-sm mb-2">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
              >
                <option value="Europe/Helsinki">Europe/Helsinki</option>
                <option value="Europe/Stockholm">Europe/Stockholm</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
