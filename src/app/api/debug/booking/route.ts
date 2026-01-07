import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const serviceRoleSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check services
    const { data: services, error: servicesError } = await serviceRoleSupabase
      .from('services')
      .select('*')
      .limit(5)

    // Check barbers
    const { data: barbers, error: barbersError } = await serviceRoleSupabase
      .from('barbers')
      .select('*')
      .limit(5)

    // Check recent bookings
    const { data: bookings, error: bookingsError } = await serviceRoleSupabase
      .from('bookings')
      .select('*')
      .limit(5)

    return NextResponse.json({
      services: services || servicesError,
      barbers: barbers || barbersError,
      bookings: bookings || bookingsError
    })
  } catch (error) {
    return NextResponse.json({ error: error })
  }
}
