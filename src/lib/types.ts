export interface Service {
  id: number
  name: string
  price: number
  duration: number
  icon: string
  description: string
  category: string
}

export interface Barber {
  id: number
  name: string
  role: string
  rating: number
  reviews: number
  experience: string
  image: string
  specialties: string[]
}

export interface Booking {
  id: string
  user_id: string
  service_id: number
  barber_id: number
  booking_date: string
  booking_time: string
  notes?: string
  created_at: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  total_price?: number
  confirmation_code?: string
  services?: Service
  barbers?: Barber
  profiles?: any // For customer profile
}

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'customer' | 'barber' | 'admin'
  avatar_url?: string
  created_at: string
}
