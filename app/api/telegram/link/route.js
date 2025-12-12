

// app/api/telegram/link/route.js
import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔗 Telegram link API called');
    
    const body = await request.json();
    console.log('Received data:', body);
    
    const { user_id, chat_id, code, action } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { success: false, message: 'user_id is required' },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();
    
    if (action === 'disconnect') {
      // Disconnect Telegram
      await supabaseAdmin
        .from('telegram_links')
        .delete()
        .eq('user_id', user_id);
      
      return NextResponse.json({
        success: true,
        message: 'Telegram disconnected successfully'
      });
    }
    
    // For linking with verification code
    if (chat_id) {
      // Check if chat_id is already linked to another user
      const { data: existingLink, error: checkError } = await supabaseAdmin
        .from('telegram_links')
        .select('user_id')
        .eq('chat_id', chat_id)
        .neq('user_id', user_id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing link:', checkError);
      }
      
      if (existingLink) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'This Telegram account is already linked to another user',
            conflict: true 
          },
          { status: 409 }
        );
      }
      
      const linkData = {
        user_id,
        chat_id,
        verified: !!code,
        updated_at: new Date().toISOString()
      };
      
      if (code) {
        linkData.verification_code = code;
        linkData.verified_at = new Date().toISOString();
      }
      
      console.log('Inserting/updating link data:', linkData);
      
      const { data: link, error: linkError } = await supabaseAdmin
        .from('telegram_links')
        .upsert(linkData, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      if (linkError) {
        console.error('Telegram link error:', linkError);
        throw linkError;
      }
      
      return NextResponse.json({
        success: true,
        verified: !!code,
        telegram_link: link,
        message: code ? 'Telegram account linked successfully!' : 'Verification code required'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid request: chat_id is required for linking'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Error in telegram/link:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to link Telegram account',
      details: error.message
    }, { status: 500 });
  }
}