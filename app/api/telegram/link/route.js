


// app/api/telegram/link/route.js - Updated for new flow
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
        { error: 'user_id is required' },
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
    
    // For regular linking, we now use OTP flow instead
    // This endpoint is kept for backward compatibility
    if (chat_id) {
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
      
      console.log('Inserting link data:', linkData);
      
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
      
      // Log activity
      await supabaseAdmin
        .from('activity_logs')
        .insert({
          user_id,
          action_type: code ? 'telegram_connected' : 'telegram_verification_attempt',
          action_details: {
            chat_id,
            verified: !!code,
            timestamp: new Date().toISOString()
          }
        });
      
      return NextResponse.json({
        success: true,
        verified: !!code,
        telegram_link: link,
        message: code ? 'Telegram account linked successfully!' : 'Verification code required'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid request'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Error in telegram/link:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to link Telegram account',
      details: error.message
    }, { status: 500 });
  }
}