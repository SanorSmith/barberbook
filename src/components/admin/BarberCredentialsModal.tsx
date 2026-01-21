'use client'

import { useState } from 'react'

interface BarberCredentials {
  name: string
  email: string
  username: string
  password: string
}

interface BarberCredentialsModalProps {
  credentials: BarberCredentials
  onClose: () => void
}

export default function BarberCredentialsModal({ credentials, onClose }: BarberCredentialsModalProps) {
  const [copied, setCopied] = useState(false)

  const copyCredentials = () => {
    const text = `Barber Login Credentials\n\nName: ${credentials.name}\nEmail: ${credentials.email}\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\nPlease change your password after first login.`
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const sendEmail = () => {
    const subject = encodeURIComponent('Your BarberBook Login Credentials')
    const body = encodeURIComponent(
      `Hello ${credentials.name},\n\n` +
      `Your BarberBook account has been created. Here are your login credentials:\n\n` +
      `Email: ${credentials.email}\n` +
      `Username: ${credentials.username}\n` +
      `Password: ${credentials.password}\n\n` +
      `Please login at: ${window.location.origin}/login\n\n` +
      `IMPORTANT: Please change your password after your first login.\n\n` +
      `Best regards,\nBarberBook Admin`
    )
    window.location.href = `mailto:${credentials.email}?subject=${subject}&body=${body}`
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-obsidian border-2 border-gold rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* Success Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-gold">Barber Account Created Successfully!</h2>
            <p className="text-slate text-sm">The barber can now login to their account</p>
          </div>
        </div>

        {/* Barber Info */}
        <div className="bg-charcoal rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate text-sm">Barber Name</p>
              <p className="text-cream font-medium">{credentials.name}</p>
            </div>
            <div>
              <p className="text-slate text-sm">Email Address</p>
              <p className="text-cream font-medium">{credentials.email}</p>
            </div>
          </div>
        </div>

        {/* Credentials Section */}
        <div className="border-2 border-gold/30 rounded-lg p-6 mb-6 bg-gold/5">
          <h3 className="text-gold font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            LOGIN CREDENTIALS (Share with barber)
          </h3>
          
          <div className="space-y-4">
            <div className="bg-obsidian rounded-lg p-4">
              <p className="text-slate text-sm mb-1">Username</p>
              <p className="text-cream font-mono text-lg font-semibold">{credentials.username}</p>
            </div>
            
            <div className="bg-obsidian rounded-lg p-4">
              <p className="text-slate text-sm mb-1">Temporary Password</p>
              <p className="text-cream font-mono text-lg font-semibold">{credentials.password}</p>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 flex items-start space-x-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-amber-500 text-sm font-medium">Important</p>
              <p className="text-amber-200 text-sm">Please save these credentials and share them with the barber. The barber should change their password after first login.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyCredentials}
            className="flex-1 bg-gold hover:bg-gold-hover text-obsidian px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-center space-x-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Credentials</span>
              </>
            )}
          </button>
          
          <button
            onClick={sendEmail}
            className="flex-1 bg-charcoal hover:bg-slate text-cream px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Send via Email</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-lg font-medium transition-colors border-2 border-slate hover:border-gold text-cream hover:text-gold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
