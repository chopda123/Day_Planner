


// app/api/telegram/check-link/route.js
import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabaseAdmin = createAdminClient();
    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }
    
    // Check if user has verified Telegram link
    const { data: link, error } = await supabaseAdmin
      .from('telegram_links')
      .select('*')
      .eq('user_id', user_id)
      .eq('verified', true)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return NextResponse.json({
      linked: !!link,
      telegram_username: link?.telegram_username,
      chat_id: link?.chat_id
    });
    
  } catch (error) {
    console.error('Error checking Telegram link:', error);
    return NextResponse.json(
      { error: 'Failed to check Telegram link' },
      { status: 500 }
    );
  }
}