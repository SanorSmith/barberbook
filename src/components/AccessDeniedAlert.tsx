'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccessDeniedAlert() {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for access-denied cookie
    const cookies = document.cookie.split(';')
    const accessDeniedCookie = cookies.find(c => c.trim().startsWith('access-denied='))
    
    if (accessDeniedCookie) {
      setShow(true)
      // Remove the cookie
      document.cookie = 'access-denied=; max-age=0; path=/'
      
      // Auto-hide after 5 seconds
      setTimeout(() => setShow(false), 5000)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-24 right-4 z-50 max-w-md">
      <div className="bg-error/10 border border-error text-error px-6 py-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-semibold mb-1">Access Denied</h3>
            <p className="text-sm">You don't have permission to access that page.</p>
          </div>
          <button 
            onClick={() => setShow(false)}
            className="ml-4 text-error hover:text-error/80"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
