import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const serviceRoleSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if profiles table exists
    const { data: tables, error: tablesError } = await serviceRoleSupabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (tablesError) {
      return NextResponse.json({
        error: 'Profiles table error',
        details: tablesError.message,
        hint: tablesError.hint
      })
    }

    // Check RLS policies
    const { data: policies, error: policiesError } = await serviceRoleSupabase
      .rpc('get_policies_for_table', { table_name: 'profiles' })

    return NextResponse.json({
      message: 'Database connection successful',
      profilesTable: 'exists',
      sampleData: tables
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug error',
      details: error
    })
  }
}
