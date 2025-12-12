

import { createAdminClient } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    console.log('Auth callback received with code:', !!code)

    if (code) {
      const supabaseAdmin = createAdminClient()
      
      // Exchange the code for a session
      const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url))
      }
      
      console.log('Session exchange successful for user:', data.session?.user?.email)
      
      // Create user profile if it doesn't exist
      if (data.session?.user) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: data.session.user.id,
            email: data.session.user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }
    }
    
    // Redirect to dashboard with success message
    const redirectUrl = new URL('/dashboard', request.url)
    redirectUrl.searchParams.set('verified', 'true')
    
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/auth/login?error=callback_failed', request.url))
  }
}