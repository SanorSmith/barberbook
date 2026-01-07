import { createClient } from '@/lib/supabase/client'

export interface Booking {
  id: string
  user_id: string
  barber_id: number
  service_id: number
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  total_price: number
  confirmation_code: string
  created_at: string
}

export interface CreateBookingData {
  service_id: number
  barber_id: number
  booking_date: string
  booking_time: string
  notes?: string
}

export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Get service price
  const { data: service } = await supabase
    .from('services')
    .select('price')
    .eq('id', data.service_id)
    .single()

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      barber_id: data.barber_id,
      service_id: data.service_id,
      booking_date: data.booking_date,
      booking_time: data.booking_time,
      status: 'confirmed',
      notes: data.notes || null,
      total_price: service?.price || 0
    })
    .select()
    .single()

  if (error) throw error
  return booking
}

export async function getUserBookings(userId: string, status?: string): Promise<Booking[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

export async function cancelBooking(id: string): Promise<void> {
  await updateBookingStatus(id, 'cancelled')
}

export async function rescheduleBooking(
  id: string,
  newDate: string,
  newTime: string
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('bookings')
    .update({
      booking_date: newDate,
      booking_time: newTime
    })
    .eq('id', id)

  if (error) throw error
}
