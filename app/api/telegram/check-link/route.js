import { createAdminClient } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabaseAdmin = createAdminClient()
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // Check if user has verified Telegram link
    const { data: link, error } = await supabaseAdmin
      .from('telegram_links')
      .select('*')
      .eq('user_id', userId)
      .eq('verified', true)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return NextResponse.json({
      linked: !!link,
      telegram_username: link?.telegram_username
    })
    
  } catch (error) {
    console.error('Error checking Telegram link:', error)
    return NextResponse.json(
      { error: 'Failed to check Telegram link' },
      { status: 500 }
    )
  }
}