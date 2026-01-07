import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Supabase clients
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const serviceRoleSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Create profile record using service role to bypass RLS
    if (authData.user && authData.user.id) {
      // Wait a bit for the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Try direct SQL insert to bypass any RLS issues
      const { error: profileError } = await serviceRoleSupabase
        .rpc('insert_profile', {
          p_id: authData.user.id,
          p_email: authData.user.email || email,
          p_full_name: fullName,
          p_role: 'customer'
        })

      if (profileError) {
        // Fallback to regular insert if RPC doesn't exist
        console.log('RPC failed, trying direct insert...')
        const { error: insertError } = await serviceRoleSupabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email || email,
            full_name: fullName,
            role: 'customer'
          })

        if (insertError) {
          console.error('Profile creation error:', insertError)
          console.error('Error details:', insertError.details)
          console.error('Error hint:', insertError.hint)
          // Delete the auth user if profile creation fails
          try {
            await supabase.auth.admin.deleteUser(authData.user.id)
          } catch (deleteError) {
            console.error('Failed to delete auth user:', deleteError)
          }
          return NextResponse.json(
            { 
              error: `Database error: ${insertError.message}`,
              details: insertError.details,
              hint: insertError.hint
            },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json(
      { message: 'Account created! Please check your email to confirm.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
