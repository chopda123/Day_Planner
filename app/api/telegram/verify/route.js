


// app/api/telegram/verify/route.js
import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔐 Telegram OTP verification API called');
    
    const body = await request.json();
    const { otp, user_id } = body;
    
    console.log('Received verification request:', { otp, user_id });
    
    if (!otp || !user_id) {
      return NextResponse.json(
        { success: false, message: 'otp and user_id are required' },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();
    
    // Query bot_sessions table - use YOUR column name otp_code
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('bot_sessions')
      .select('*')
      .eq('otp_code', otp)
      .gte('otp_expires_at', new Date().toISOString())
      .single();
    
    if (sessionError) {
      console.error('Error querying bot_sessions:', sessionError);
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }
      throw sessionError;
    }
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }
    
    // Verify that the OTP belongs to the requesting user
    if (session.user_id && session.user_id !== user_id) {
      return NextResponse.json({
        success: false,
        message: 'Verification code does not match user'
      });
    }
    
    // Get chat_id from session
    const chatId = session.chat_id;
    
    // Update telegram_links table
    const { data: link, error: linkError } = await supabaseAdmin
      .from('telegram_links')
      .upsert({
        user_id,
        chat_id: chatId,
        telegram_username: session.telegram_username,
        verification_code: otp,
        verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    if (linkError) {
      console.error('Error updating telegram_links:', linkError);
      throw linkError;
    }
    
    // Clean up the used OTP - use otp_code column
    await supabaseAdmin
      .from('bot_sessions')
      .delete()
      .eq('otp_code', otp);
    
    console.log('✅ OTP verification successful for user:', user_id);
    
    return NextResponse.json({
      success: true,
      message: 'Telegram account verified and linked successfully',
      telegram_link: link
    });
    
  } catch (error) {
    console.error('❌ Error in telegram/verify:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}