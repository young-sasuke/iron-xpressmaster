"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback - processing...')
        console.log('Current URL:', window.location.href)
        
        // Get the current session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw sessionError
        }
        
        if (session) {
          console.log('Session found:', session.user.email)
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          setTimeout(() => {
            router.push('/review-cart')
          }, 1500)
          return
        }
        
        // If no session, check for auth code in URL
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        
        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }
        
        if (code) {
          console.log('Auth code found, exchanging for session...')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            throw exchangeError
          }
          
          console.log('Session established:', data.user.email)
          setStatus('success')
          setMessage('Authentication successful! Redirecting...')
          
          setTimeout(() => {
            router.push('/review-cart')
          }, 1500)
        } else {
          throw new Error('No authentication code found')
        }
        
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Authentication failed. Redirecting to login...')
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl sm:text-2xl">IX</span>
        </div>
        
        {status === 'loading' && (
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        )}
        
        {status === 'success' && (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {status === 'error' && (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-sm sm:text-base text-gray-600">{message}</p>
      </div>
    </div>
  )
}
