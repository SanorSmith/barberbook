import { createClient } from '@/lib/supabase/client'

export interface Barber {
  id: number
  user_id: string | null
  name: string
  role: string
  bio: string
  experience: string
  image_url: string
  rating: number
  review_count: number
  specialties: string[]
  is_active: boolean
}

export async function getAllBarbers(): Promise<Barber[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getBarberById(id: number): Promise<Barber | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getBarbersForService(serviceId: number): Promise<Barber[]> {
  const supabase = createClient()
  
  // Get all active barbers (in future, filter by barber_services junction table)
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })

  if (error) throw error
  return data || []
}
