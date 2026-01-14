'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const IDLE_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds

export default function SessionManager() {
  const supabase = createClient()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitialized = useRef(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const resetIdleTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, IDLE_TIMEOUT)
  }

  useEffect(() => {
    // Auto-logout on first page load (only once per session)
    const initializeSession = async () => {
      if (!hasInitialized.current) {
        hasInitialized.current = true
        const hasLoggedOutBefore = sessionStorage.getItem('initial_logout_done')
        
        if (!hasLoggedOutBefore) {
          await supabase.auth.signOut()
          sessionStorage.setItem('initial_logout_done', 'true')
        }
      }
    }

    initializeSession()

    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // User is logged in, start idle timer
        resetIdleTimer()

        // Listen for user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
        
        events.forEach(event => {
          window.addEventListener(event, resetIdleTimer)
        })

        return () => {
          events.forEach(event => {
            window.removeEventListener(event, resetIdleTimer)
          })
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
        }
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        resetIdleTimer()
      } else if (event === 'SIGNED_OUT') {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return null // This component doesn't render anything
}
