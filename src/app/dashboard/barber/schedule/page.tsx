'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BarberSchedulePage() {
  const [activeTab, setActiveTab] = useState<'hours' | 'timeoff'>('hours')
  const [schedules, setSchedules] = useState<any[]>([])
  const [timeOffRequests, setTimeOffRequests] = useState<any[]>([])
  const [showTimeOffModal, setShowTimeOffModal] = useState(false)
  const [loading, setLoading] = useState(true)
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

    if (!barber) return

    // Get schedules
    const { data: schedules } = await supabase
      .from('barber_schedules')
      .select('*')
      .eq('barber_id', barber.id)

    // Get time off requests
    const { data: timeOff } = await supabase
      .from('time_off_requests')
      .select('*')
      .eq('barber_id', barber.id)
      .order('start_date', { ascending: true })

    setSchedules(schedules || [])
    setTimeOffRequests(timeOff || [])
    setLoading(false)
  }

  const updateSchedule = async (dayOfWeek: number, isAvailable: boolean, startTime: string, endTime: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: barber } = await supabase
      .from('barbers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!barber) return

    if (isAvailable) {
      // Upsert schedule
      await supabase
        .from('barber_schedules')
        .upsert({
          barber_id: barber.id,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: true
        })
    } else {
      // Delete schedule
      await supabase
        .from('barber_schedules')
        .delete()
        .eq('barber_id', barber.id)
        .eq('day_of_week', dayOfWeek)
    }

    fetchData()
  }

  const submitTimeOffRequest = async (startDate: string, endDate: string, reason: string, notes: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: barber } = await supabase
      .from('barbers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!barber) return

    await supabase
      .from('time_off_requests')
      .insert({
        barber_id: barber.id,
        start_date: startDate,
        end_date: endDate,
        reason,
        notes,
        status: 'pending'
      })

    setShowTimeOffModal(false)
    fetchData()
  }

  const days = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
  ]

  const timeOptions: { value: string; display: string }[] = []
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const display = hour > 12 ? `${hour - 12}:${minute.toString().padStart(2, '0')} PM` : `${hour}:${minute.toString().padStart(2, '0')} AM`
      timeOptions.push({ value: time, display })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-silver">Loading schedule...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-cream mb-2">My Schedule</h1>
        <p className="text-silver">Manage your working hours and time off</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'hours' 
              ? 'bg-gold text-obsidian' 
              : 'bg-charcoal text-silver hover:text-cream'
          }`}
        >
          Working Hours
        </button>
        <button
          onClick={() => setActiveTab('timeoff')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'timeoff' 
              ? 'bg-gold text-obsidian' 
              : 'bg-charcoal text-silver hover:text-cream'
          }`}
        >
          Time Off
        </button>
      </div>

      {/* Working Hours Tab */}
      {activeTab === 'hours' && (
        <div className="bg-charcoal border border-slate rounded-xl p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate">
                <th className="text-left py-3 px-4 text-silver">Day</th>
                <th className="text-left py-3 px-4 text-silver">Available</th>
                <th className="text-left py-3 px-4 text-silver">Start Time</th>
                <th className="text-left py-3 px-4 text-silver">End Time</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const schedule = schedules.find(s => s.day_of_week === day.id)
                const isAvailable = schedule?.is_available || false

                return (
                  <tr key={day.id} className="border-b border-slate/50">
                    <td className="py-3 px-4 text-cream">{day.name}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateSchedule(
                          day.id, 
                          !isAvailable, 
                          schedule?.start_time || '09:00',
                          schedule?.end_time || '17:00'
                        )}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isAvailable 
                            ? 'bg-success/10 text-success' 
                            : 'bg-silver/10 text-silver'
                        }`}
                      >
                        {isAvailable ? '✓ ON' : 'OFF'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={schedule?.start_time || '09:00'}
                        onChange={(e) => updateSchedule(day.id, true, e.target.value, schedule?.end_time || '17:00')}
                        disabled={!isAvailable}
                        className="bg-obsidian border border-slate text-cream px-2 py-1 rounded text-sm disabled:opacity-50"
                      >
                        {timeOptions.map(time => (
                          <option key={time.value} value={time.value}>
                            {time.display}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={schedule?.end_time || '17:00'}
                        onChange={(e) => updateSchedule(day.id, true, schedule?.start_time || '09:00', e.target.value)}
                        disabled={!isAvailable}
                        className="bg-obsidian border border-slate text-cream px-2 py-1 rounded text-sm disabled:opacity-50"
                      >
                        {timeOptions.map(time => (
                          <option key={time.value} value={time.value}>
                            {time.display}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="mt-6">
            <button className="bg-gold hover:bg-gold-hover text-obsidian px-6 py-2 rounded-lg font-medium">
              Save Working Hours
            </button>
          </div>
        </div>
      )}

      {/* Time Off Tab */}
      {activeTab === 'timeoff' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-cream font-semibold">Upcoming Time Off</h2>
            <button
              onClick={() => setShowTimeOffModal(true)}
              className="bg-gold hover:bg-gold-hover text-obsidian px-4 py-2 rounded-lg font-medium"
            >
              + Request Time Off
            </button>
          </div>

          <div className="bg-charcoal border border-slate rounded-xl p-6">
            {timeOffRequests.length > 0 ? (
              <div className="space-y-4">
                {timeOffRequests.map((request) => (
                  <div key={request.id} className="flex justify-between items-center p-4 bg-obsidian border border-slate rounded-lg">
                    <div>
                      <div className="text-cream font-medium">
                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-silver text-sm capitalize">{request.reason}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'approved' ? 'bg-success/10 text-success' :
                        request.status === 'pending' ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        {request.status}
                      </span>
                      <button className="text-error hover:text-red-400">
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-silver">
                <p>No upcoming time off scheduled</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Off Modal */}
      {showTimeOffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-charcoal border border-slate rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-cream font-semibold">Request Time Off</h2>
              <button
                onClick={() => setShowTimeOffModal(false)}
                className="text-silver hover:text-cream"
              >
                ✕
              </button>
            </div>

            <TimeOffForm
              onSubmit={submitTimeOffRequest}
              onCancel={() => setShowTimeOffModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function TimeOffForm({ onSubmit, onCancel }: {
  onSubmit: (startDate: string, endDate: string, reason: string, notes: string) => void
  onCancel: () => void
}) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(startDate, endDate, reason, notes)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-silver mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-silver mb-1">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-silver mb-1">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
          required
        >
          <option value="">Select reason...</option>
          <option value="vacation">Vacation</option>
          <option value="personal">Personal</option>
          <option value="sick">Sick</option>
          <option value="training">Training</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-silver mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-obsidian border border-slate text-cream px-3 py-2 rounded-lg"
          rows={3}
        />
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
          Submit Request
        </button>
      </div>
    </form>
  )
}
