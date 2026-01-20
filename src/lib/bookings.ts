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
  
  console.log('[createBooking] Starting booking creation...')
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.error('[createBooking] Auth error:', authError)
    throw new Error('Authentication failed. Please log in and try again.')
  }
  if (!user) {
    console.error('[createBooking] No user found')
    throw new Error('You must be logged in to create a booking.')
  }
  
  console.log('[createBooking] User authenticated:', user.id)

  // Get service price
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('price')
    .eq('id', data.service_id)
    .single()

  if (serviceError) {
    console.error('[createBooking] Service lookup error:', serviceError)
    throw new Error('Failed to find service details. Please try again.')
  }

  console.log('[createBooking] Service found, price:', service?.price)

  const bookingData = {
    user_id: user.id,
    barber_id: data.barber_id,
    service_id: data.service_id,
    booking_date: data.booking_date,
    booking_time: data.booking_time,
    status: 'confirmed' as const,
    notes: data.notes || null,
    total_price: service?.price || 0
  }

  console.log('[createBooking] Inserting booking:', bookingData)

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) {
    console.error('[createBooking] Insert error:', error)
    
    // Provide user-friendly error messages
    if (error.code === '23505') {
      throw new Error('This time slot is already booked. Please choose another time.')
    } else if (error.code === '23503') {
      throw new Error('Invalid booking details. Please refresh and try again.')
    } else if (error.message.includes('row-level security')) {
      throw new Error('Permission denied. Please log in and try again.')
    } else {
      throw new Error(`Failed to create booking: ${error.message}`)
    }
  }

  console.log('[createBooking] Booking created successfully:', booking.id)
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
