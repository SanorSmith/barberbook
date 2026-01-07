'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function BarberSchedulePage() {
  const [workingHours, setWorkingHours] = useState<any[]>([])
  const [timeOff, setTimeOff] = useState<any[]>([])
  const [barberId, setBarberId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTimeOffModal, setShowTimeOffModal] = useState(false)
  const [timeOffForm, setTimeOffForm] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  })
  const supabase = createClient()

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: barber } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!barber) return
    setBarberId(barber.id)

    const { data: hours } = await supabase
      .from('working_hours')
      .select('*')
      .eq('barber_id', barber.id)
      .order('day_of_week', { ascending: true })

    const { data: off } = await supabase
      .from('time_off')
      .select('*')
      .eq('barber_id', barber.id)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })

    setWorkingHours(hours || [])
    setTimeOff(off || [])
    setLoading(false)
  }

  const updateWorkingHours = async (dayOfWeek: number, field: string, value: any) => {
    if (!barberId) return

    const existing = workingHours.find(wh => wh.day_of_week === dayOfWeek)

    if (existing) {
      await supabase
        .from('working_hours')
        .update({ [field]: value })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('working_hours')
        .insert({
          barber_id: barberId,
          day_of_week: dayOfWeek,
          [field]: value,
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        })
    }

    loadSchedule()
  }

  const requestTimeOff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barberId) return

    await supabase
      .from('time_off')
      .insert({
        barber_id: barberId,
        start_date: timeOffForm.start_date,
        end_date: timeOffForm.end_date,
        reason: timeOffForm.reason
      })

    setShowTimeOffModal(false)
    setTimeOffForm({ start_date: '', end_date: '', reason: '' })
    loadSchedule()
  }

  const deleteTimeOff = async (id: number) => {
    if (!confirm('Delete this time off request?')) return

    await supabase
      .from('time_off')
      .delete()
      .eq('id', id)

    loadSchedule()
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
        <h1 className="font-serif text-3xl text-cream">My Schedule</h1>
        <button
          onClick={() => setShowTimeOffModal(true)}
          className="px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors"
        >
          Request Time Off
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-6">Working Hours</h2>
          
          <div className="space-y-4">
            {DAYS.map((day, index) => {
              const hours = workingHours.find(wh => wh.day_of_week === index)
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hours?.is_available || false}
                        onChange={(e) => updateWorkingHours(index, 'is_available', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-cream font-medium">{day}</span>
                    </label>
                  </div>
                  
                  {hours?.is_available && (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="time"
                        value={hours.start_time || '09:00'}
                        onChange={(e) => updateWorkingHours(index, 'start_time', e.target.value)}
                        className="bg-obsidian border border-slate rounded px-3 py-2 text-cream focus:border-gold outline-none"
                      />
                      <span className="text-silver self-center">to</span>
                      <input
                        type="time"
                        value={hours.end_time || '17:00'}
                        onChange={(e) => updateWorkingHours(index, 'end_time', e.target.value)}
                        className="bg-obsidian border border-slate rounded px-3 py-2 text-cream focus:border-gold outline-none"
                      />
                    </div>
                  )}
                  
                  {!hours?.is_available && (
                    <span className="text-silver text-sm">Unavailable</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-charcoal border border-slate rounded-lg p-6">
          <h2 className="text-cream font-semibold text-xl mb-6">Time Off Requests</h2>
          
          {timeOff.length > 0 ? (
            <div className="space-y-3">
              {timeOff.map((off) => (
                <div key={off.id} className="bg-obsidian border border-slate rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-cream font-medium mb-1">
                        {new Date(off.start_date).toLocaleDateString()} - {new Date(off.end_date).toLocaleDateString()}
                      </div>
                      {off.reason && (
                        <div className="text-silver text-sm">{off.reason}</div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTimeOff(off.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-silver text-center py-8">No time off requests</p>
          )}
        </div>
      </div>

      {showTimeOffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-slate rounded-lg max-w-md w-full p-6">
            <h2 className="text-cream font-serif text-2xl mb-6">Request Time Off</h2>
            
            <form onSubmit={requestTimeOff} className="space-y-4">
              <div>
                <label className="block text-silver text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={timeOffForm.start_date}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, start_date: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={timeOffForm.end_date}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, end_date: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2">Reason (Optional)</label>
                <textarea
                  value={timeOffForm.reason}
                  onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                  className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
                  rows={3}
                  placeholder="Vacation, personal, etc."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTimeOffModal(false)}
                  className="flex-1 px-6 py-3 text-silver hover:text-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
