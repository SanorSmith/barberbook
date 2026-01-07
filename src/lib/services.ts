import { createClient } from '@/lib/supabase/client'

export interface Service {
  id: number
  name: string
  description: string
  price: number
  duration: number
  category: string
  icon: string
  image_url?: string
  is_active: boolean
  display_order: number
}

export async function getAllServices(): Promise<Service[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error in getAllServices:', error)
    throw error
  }
  return data || []
}

export async function getServiceById(id: number): Promise<Service | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getServicesByCategory(category: string): Promise<Service[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error in getServicesByCategory:', error)
    throw error
  }
  return data || []
}
