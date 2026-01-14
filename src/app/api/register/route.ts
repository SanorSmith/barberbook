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

    // Normalize email to lowercase to prevent case-sensitive duplicates
    const normalizedEmail = email.toLowerCase().trim()

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
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

    // Check if email already exists in profiles table
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', profileCheckError)
      return NextResponse.json(
        { error: 'Error checking email availability' },
        { status: 500 }
      )
    }

    if (existingProfile) {
      return NextResponse.json(
        { error: 'This email is already registered. Please login instead.' },
        { status: 400 }
      )
    }

    // Check if email exists in Supabase auth using service role
    const { data: authUsers, error: authCheckError } = await serviceRoleSupabase.auth.admin.listUsers()
    
    if (authCheckError) {
      console.error('Error checking existing auth users:', authCheckError)
    } else if (authUsers?.users) {
      const emailExists = authUsers.users.some(
        user => user.email?.toLowerCase() === normalizedEmail
      )
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'This email is already registered. Please login instead.' },
          { status: 400 }
        )
      }
    }

    // Create auth user with normalized email
    // Note: Only 'customer' role can be created via UI registration
    // Admin users must be created via Supabase SQL Editor
    // Barber users must be created by admin through dashboard
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer', // Force customer role for UI registration
        },
      },
    })

    if (authError) {
      // Handle specific Supabase auth errors
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please login instead.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Profile is automatically created by database trigger with 'customer' role
    // Admin role can ONLY be set via Supabase SQL Editor
    // Barber role can ONLY be set by admin through dashboard

    return NextResponse.json(
      { message: 'Account created successfully!' },
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
