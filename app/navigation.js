





'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Navigation() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session)
        setSession(session)
        
        // Redirect based on auth state
        if (event === 'SIGNED_IN' && !pathname?.includes('/dashboard')) {
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, pathname])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear any local state
      setSession(null)
      router.push('/auth/login')
      router.refresh() // Refresh to update server components
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out: ' + error.message)
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Self Upgrade Planner</h1>
            </div>
            <div className="flex items-center">
              <div className="text-gray-600 text-sm">Loading...</div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Self Upgrade Planner
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {session && (
                <>
                  <Link href="/create-plan" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                     Create Plan
                  </Link> 
                  <Link 
                    href="/dashboard" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${pathname === '/dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/discipline" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${pathname?.includes('/discipline') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
                  >
                    Discipline
                  </Link>
                  <Link 
                    href="/plans/create" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${pathname?.includes('/plans/create') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
                  >
                    New Plan
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="hidden md:block">
                  <span className="text-sm text-gray-600 truncate max-w-[200px]">
                    {session.user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {signingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing Out...
                    </>
                  ) : 'Sign Out'}
                </button>
              </>
            ) : (
              <>
                {pathname !== '/auth/login' && (
                  <Link href="/auth/login" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                    Sign In
                  </Link>
                )}
                {pathname !== '/auth/signup' && (
                  <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Get Started
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}