import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/booking', '/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Barber dashboard routes (separate check to avoid catching /barbers)
  const isBarberDashboard = pathname === '/barber' || pathname.startsWith('/barber/')

  // Auth routes that logged-in users shouldn't access
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If user is logged in and trying to access auth pages, redirect to their dashboard
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'customer'
    const dashboardUrl = role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/dashboard'
    
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  // If accessing protected route without authentication, redirect to login
  if (!user && (isProtectedRoute || isBarberDashboard)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and accessing protected routes, check role-based access
  if (user && (isProtectedRoute || isBarberDashboard)) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('=== MIDDLEWARE DEBUG ===')
    console.log('Path:', pathname)
    console.log('User ID:', user.id)
    console.log('Profile error:', profileError)
    console.log('Profile data:', profile)
    console.log('Role:', profile?.role)

    const role = profile?.role || 'customer'
    console.log('Final role (with fallback):', role)

    // Admin route protection - only admins
    if (pathname.startsWith('/admin') && role !== 'admin') {
      console.log('BLOCKING: Non-admin trying to access admin route')
      const redirectUrl = role === 'barber' ? '/barber' : '/dashboard'
      const response = NextResponse.redirect(new URL(redirectUrl, request.url))
      response.cookies.set('access-denied', 'true', { maxAge: 5 })
      return response
    }

    // Barber dashboard protection - barbers and admins only (excludes /barbers page)
    if (isBarberDashboard && role !== 'barber' && role !== 'admin') {
      console.log('BLOCKING: Non-barber trying to access barber dashboard')
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.set('access-denied', 'true', { maxAge: 5 })
      return response
    }

    // Customer dashboard - redirect admins and barbers to their dashboards
    if (pathname.startsWith('/dashboard') && role === 'admin') {
      console.log('REDIRECTING: Admin from /dashboard to /admin')
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (pathname.startsWith('/dashboard') && role === 'barber') {
      console.log('REDIRECTING: Barber from /dashboard to /barber')
      return NextResponse.redirect(new URL('/barber', request.url))
    }

    console.log('ALLOWING: Access to', pathname)
    console.log('=== END MIDDLEWARE DEBUG ===')
  }

  return supabaseResponse
}
