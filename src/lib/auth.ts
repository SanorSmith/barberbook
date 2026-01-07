import { createClient } from '@/lib/supabase/client'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  role: 'customer' | 'barber' | 'admin'
  avatar_url?: string
  phone?: string
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch profile to get role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: user.id,
    email: user.email!,
    full_name: profile.full_name,
    role: profile.role,
    avatar_url: profile.avatar_url,
    phone: profile.phone,
  }
}

export async function getUserRole(): Promise<'customer' | 'barber' | 'admin' | null> {
  const user = await getCurrentUser()
  return user?.role || null
}

export function getDashboardPath(role: 'customer' | 'barber' | 'admin'): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'barber':
      return '/barber'
    case 'customer':
    default:
      return '/dashboard'
  }
}
