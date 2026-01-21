import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Generate username from first and last name
function generateUsername(firstName: string, lastName: string): string {
  // Convert to lowercase and remove special characters
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${cleanFirst}.${cleanLast}`
}

// Check if username exists and add number suffix if needed
async function getUniqueUsername(supabase: any, baseUsername: string): Promise<string> {
  let username = baseUsername
  let counter = 2
  
  while (true) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()
    
    if (!data) {
      // Username is available
      return username
    }
    
    // Username exists, try with number suffix
    username = `${baseUsername}${counter}`
    counter++
  }
}

// Generate secure temporary password
function generatePassword(firstName: string): string {
  // Format: Barber@FirstName + 4 random digits
  const capitalizedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
  const randomDigits = Math.floor(1000 + Math.random() * 9000) // 4 random digits
  return `Barber@${capitalizedFirst}${randomDigits}`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }
    
    // Parse request body
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      bio, 
      specialties, 
      yearsExperience, 
      imageUrl 
    } = body
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ 
        error: 'Missing required fields: firstName, lastName, email' 
      }, { status: 400 })
    }
    
    // Generate username and password
    const baseUsername = generateUsername(firstName, lastName)
    const username = await getUniqueUsername(supabase, baseUsername)
    const password = generatePassword(firstName)
    const fullName = `${firstName} ${lastName}`
    
    // Create admin client for user creation (requires service role)
    const adminClient = createAdminClient()
    
    // Create user in Supabase Auth using admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: fullName,
        role: 'barber'
      }
    })
    
    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({ 
        error: `Failed to create auth user: ${authError?.message}` 
      }, { status: 500 })
    }
    
    const userId = authData.user.id
    
    // Update profile (trigger already created it, so we update with additional fields)
    // Using upsert to handle both cases: if trigger created it or if it doesn't exist
    // Use adminClient to bypass RLS policies
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: userId,
        user_id: userId,
        email: email,
        full_name: fullName,
        role: 'barber',
        username: username,
        phone: phone || null,
        municipality: 'Helsinki',
        password_changed: false
      }, {
        onConflict: 'id'
      })
    
    if (profileError) {
      console.error('Profile update error:', profileError)
      // Cleanup: delete auth user if profile update fails
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json({ 
        error: `Failed to update profile: ${profileError.message}` 
      }, { status: 500 })
    }
    
    // Create barber record - use adminClient to bypass RLS
    const { data: barberData, error: barberError } = await adminClient
      .from('barbers')
      .insert({
        user_id: userId,
        name: fullName,
        bio: bio || null,
        specialties: specialties || [],
        image_url: imageUrl || null,
        is_active: true,
        rating: 0,
        review_count: 0
      })
      .select()
      .single()
    
    if (barberError) {
      console.error('Barber creation error:', barberError)
      // Cleanup: delete profile and auth user - use adminClient
      await adminClient.from('profiles').delete().eq('id', userId)
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json({ 
        error: `Failed to create barber record: ${barberError.message}` 
      }, { status: 500 })
    }
    
    // Create default working hours (Monday-Sunday)
    const workingHoursData = [
      { day_of_week: 1, start_time: '09:00', end_time: '19:00', is_available: true }, // Monday
      { day_of_week: 2, start_time: '09:00', end_time: '19:00', is_available: true }, // Tuesday
      { day_of_week: 3, start_time: '09:00', end_time: '19:00', is_available: true }, // Wednesday
      { day_of_week: 4, start_time: '09:00', end_time: '19:00', is_available: true }, // Thursday
      { day_of_week: 5, start_time: '09:00', end_time: '19:00', is_available: true }, // Friday
      { day_of_week: 6, start_time: '09:00', end_time: '17:00', is_available: true }, // Saturday
      { day_of_week: 0, start_time: '09:00', end_time: '17:00', is_available: false }, // Sunday
    ].map(hours => ({
      ...hours,
      barber_id: barberData.id
    }))
    
    const { error: hoursError } = await adminClient
      .from('working_hours')
      .insert(workingHoursData)
    
    if (hoursError) {
      console.error('Working hours creation error:', hoursError)
      // Don't fail the entire operation, just log the error
    }
    
    // Return success with credentials
    return NextResponse.json({
      success: true,
      barber: {
        id: barberData.id,
        name: fullName,
        email: email,
        username: username,
        password: password // Return password to show to admin
      }
    })
    
  } catch (error: any) {
    console.error('Create barber error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
