import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables missing:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
      urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
      keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING'
    })
    throw new Error('Supabase environment variables are not configured')
  }
  
  console.log('✅ Supabase client initialized with URL:', supabaseUrl)
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
