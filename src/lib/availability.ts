import { createClient } from '@/lib/supabase/client'

export interface TimeSlot {
  time: string
  available: boolean
}

export interface WorkingHours {
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export async function getAvailableSlots(
  barberId: number,
  date: string,
  serviceDuration: number
): Promise<TimeSlot[]> {
  const supabase = createClient()
  
  // Get day of week (0 = Sunday, 6 = Saturday)
  const selectedDate = new Date(date)
  const dayOfWeek = selectedDate.getDay()

  // Get barber's working hours for this day
  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('barber_id', barberId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .single()

  if (!workingHours) {
    return []
  }

  // Check if barber has time off on this date
  const { data: timeOff } = await supabase
    .from('time_off')
    .select('*')
    .eq('barber_id', barberId)
    .lte('start_date', date)
    .gte('end_date', date)

  if (timeOff && timeOff.length > 0) {
    return []
  }

  // Get existing bookings for this barber on this date
  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_time, services(duration)')
    .eq('barber_id', barberId)
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed'])

  // Generate time slots
  const slots: TimeSlot[] = []
  const startTime = parseTime(workingHours.start_time)
  const endTime = parseTime(workingHours.end_time)
  const slotInterval = 15 // 15-minute intervals

  let currentTime = startTime

  while (currentTime + serviceDuration <= endTime) {
    const timeString = formatTime(currentTime)
    
    // Check if this slot conflicts with existing bookings
    const isAvailable = !bookings?.some((booking: any) => {
      const bookingStart = parseTime(booking.booking_time)
      const bookingDuration = booking.services?.duration || 30
      const bookingEnd = bookingStart + bookingDuration
      
      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (currentTime + serviceDuration > bookingStart && currentTime + serviceDuration <= bookingEnd) ||
        (currentTime <= bookingStart && currentTime + serviceDuration >= bookingEnd)
      )
    })

    slots.push({
      time: timeString,
      available: isAvailable
    })

    currentTime += slotInterval
  }

  return slots
}

export async function getAvailableDates(
  barberId: number,
  startDate: string,
  endDate: string
): Promise<string[]> {
  const supabase = createClient()
  
  // Get barber's working hours
  const { data: workingHours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('barber_id', barberId)
    .eq('is_available', true)

  if (!workingHours || workingHours.length === 0) {
    return []
  }

  const workingDays = workingHours.map((wh: WorkingHours) => wh.day_of_week)

  // Get time off periods
  const { data: timeOff } = await supabase
    .from('time_off')
    .select('*')
    .eq('barber_id', barberId)
    .gte('end_date', startDate)
    .lte('start_date', endDate)

  const timeOffDates = new Set<string>()
  timeOff?.forEach((to: any) => {
    const start = new Date(to.start_date)
    const end = new Date(to.end_date)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      timeOffDates.add(d.toISOString().split('T')[0])
    }
  })

  // Generate available dates
  const availableDates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split('T')[0]
    const dayOfWeek = d.getDay()
    
    if (workingDays.includes(dayOfWeek) && !timeOffDates.has(dateString)) {
      availableDates.push(dateString)
    }
  }

  return availableDates
}

// Helper functions
function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
