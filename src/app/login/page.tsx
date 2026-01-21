'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const emailToUse = email.toLowerCase().trim()

      // Validate email format
      if (!emailToUse.includes('@')) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        console.log('=== LOGIN DEBUG ===')
        console.log('User ID:', data.user.id)
        console.log('User Email:', data.user.email)
        
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        console.log('Profile query error:', profileError)
        console.log('Profile data:', profile)
        console.log('Role from profile:', profile?.role)

        const role = profile?.role || 'customer'
        console.log('Final role (with fallback):', role)
        
        // Check for redirect parameter
        const redirectTo = searchParams.get('redirect')
        console.log('Redirect parameter:', redirectTo)
        
        if (redirectTo && redirectTo.startsWith('/')) {
          console.log('Using redirect parameter, going to:', redirectTo)
          router.push(redirectTo)
        } else {
          // Role-based redirect
          const dashboardPath = role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/dashboard'
          console.log('Role-based redirect, going to:', dashboardPath)
          console.log('Role check: role === "admin"?', role === 'admin')
          console.log('Role check: role === "barber"?', role === 'barber')
          router.push(dashboardPath)
        }
        console.log('=== END LOGIN DEBUG ===')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex -mt-20">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[40%] bg-black relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200"
          alt="Barber shop"
          fill
          className="object-cover"
        />
        <div className="relative z-20 text-center">
          <h1 className="font-serif text-4xl text-gold mb-2">BARBERBOOK</h1>
          <p className="text-cream font-light tracking-wide">Where Style Meets Precision</p>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="w-full lg:w-[60%] bg-obsidian flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h2 className="font-serif text-3xl text-cream mb-2">Welcome Back</h2>
          <p className="text-silver mb-8">Sign in to manage your appointments</p>
          
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-silver uppercase tracking-wider mb-1">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-charcoal border border-slate rounded-lg p-3 pl-10 text-cream focus:border-gold outline-none transition-colors"
                  placeholder="email@example.com"
                  required
                />
                <svg className="absolute left-3 top-3.5 w-4 h-4 text-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-xs text-silver uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-charcoal border border-slate rounded-lg p-3 pl-10 text-cream focus:border-gold outline-none transition-colors"
                  required
                />
                <svg className="absolute left-3 top-3.5 w-4 h-4 text-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center text-silver cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-slate bg-charcoal text-gold focus:ring-0" /> 
                Remember me
              </label>
              <Link href="/forgot-password" className="text-gold hover:underline">Forgot password?</Link>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-hover text-obsidian py-3 rounded-lg font-semibold uppercase tracking-wider transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate"></div></div>
            <span className="relative bg-obsidian px-2 text-silver text-sm">or</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-900 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-silver text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-gold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian flex items-center justify-center"><div className="text-cream">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}
