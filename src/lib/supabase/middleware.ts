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
  const protectedRoutes = ['/booking', '/dashboard', '/barber', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

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
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and accessing protected routes, check role-based access
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'customer'

    // Admin route protection - only admins
    if (pathname.startsWith('/admin') && role !== 'admin') {
      const redirectUrl = role === 'barber' ? '/barber' : '/dashboard'
      const response = NextResponse.redirect(new URL(redirectUrl, request.url))
      response.cookies.set('access-denied', 'true', { maxAge: 5 })
      return response
    }

    // Barber route protection - barbers and admins only
    if (pathname.startsWith('/barber') && role !== 'barber' && role !== 'admin') {
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      response.cookies.set('access-denied', 'true', { maxAge: 5 })
      return response
    }

    // Customer dashboard - redirect admins and barbers to their dashboards
    if (pathname.startsWith('/dashboard') && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (pathname.startsWith('/dashboard') && role === 'barber') {
      return NextResponse.redirect(new URL('/barber', request.url))
    }
  }

  return supabaseResponse
}
