

// supabase/functions/telegram-bot/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Environment variables
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const WEB_APP_URL = Deno.env.get('WEB_APP_URL') || 'http://localhost:3000';

// Validate environment
if (!TELEGRAM_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  throw new Error('Environment variables not configured');
}

// Initialize Supabase with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// ==================== HELPER FUNCTIONS ====================

async function sendTelegramMessage(chatId: number, text: string, options: any = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...options
      })
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error('Telegram API error:', result);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return { ok: false, error: error.message };
  }
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== COMMAND HANDLERS ====================

async function handleStartCommand(chatId: number, from: any) {
  console.log(`🚀 /start from ${from.id} (${from.username || from.first_name})`);
  
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  try {
    // Check if user already has a session in bot_sessions
    const { data: existingSession, error: checkError } = await supabase
      .from('bot_sessions')
      .select('*')
      .eq('chat_id', chatId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing session:', checkError);
    }
    
    if (existingSession) {
      // Update existing session
      const { error } = await supabase
        .from('bot_sessions')
        .update({
          otp_code: otp,
          otp_expires_at: expiresAt.toISOString(),
          telegram_username: from.username || from.first_name,
          updated_at: new Date().toISOString()
        })
        .eq('chat_id', chatId);
      
      if (error) {
        console.error('Error updating OTP:', error);
        await sendTelegramMessage(chatId, '❌ Error generating OTP. Please try again.');
        return;
      }
    } else {
      // Create new session - use YOUR column names
      const { error } = await supabase
        .from('bot_sessions')
        .insert({
          chat_id: chatId,
          otp_code: otp,
          otp_expires_at: expiresAt.toISOString(),
          telegram_username: from.username || from.first_name,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error storing OTP:', error);
        await sendTelegramMessage(chatId, '❌ Error generating OTP. Please try again.');
        return;
      }
    }
    
    const message = `🤖 <b>Welcome to Life Planner Bot!</b>\n\n` +
                   `Your verification code is:\n` +
                   `<code>${otp}</code>\n\n` +
                   `Go to ${WEB_APP_URL} and enter this code to link your account.\n` +
                   `⚠️ Code expires in 10 minutes.`;
    
    await sendTelegramMessage(chatId, message);
    
  } catch (error) {
    console.error('Error in handleStartCommand:', error);
    await sendTelegramMessage(chatId, '❌ Error generating OTP. Please try again.');
  }
}

async function handleTodayCommand(chatId: number, userId: string) {
  console.log(`📅 /today command for user ${userId}`);
  
  try {
    // Get user's promises
    const [{ data: dontPromises }, { data: doPromises }] = await Promise.all([
      supabase
        .from('user_promises_dont')
        .select('title')
        .eq('user_id', userId)
        .eq('is_active', true),
      
      supabase
        .from('user_promises_do')
        .select('title')
        .eq('user_id', userId)
        .eq('is_active', true)
    ]);
    
    // Get today's date and day of week
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Get today's timetable
    const { data: timetable } = await supabase
      .from('daily_timetable')
      .select('*')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
      .order('start_time');
    
    // Build message
    let message = `📅 <b>Today's Schedule</b>\n\n`;
    
    if (dontPromises && dontPromises.length > 0) {
      message += `🚫 <b>Avoid:</b>\n`;
      dontPromises.forEach(p => message += `• ${p.title}\n`);
      message += `\n`;
    }
    
    if (doPromises && doPromises.length > 0) {
      message += `✅ <b>Must Do:</b>\n`;
      doPromises.forEach(p => message += `• ${p.title}\n`);
      message += `\n`;
    }
    
    if (timetable && timetable.length > 0) {
      message += `⏰ <b>Timetable:</b>\n`;
      timetable.forEach(item => {
        const start = item.start_time.substring(0, 5);
        const end = item.end_time.substring(0, 5);
        message += `${start}-${end}: ${item.title}\n`;
      });
    }
    
    if (!dontPromises?.length && !doPromises?.length && !timetable?.length) {
      message += `No schedule found. Set up your discipline system at ${WEB_APP_URL}`;
    }
    
    await sendTelegramMessage(chatId, message);
    
  } catch (error) {
    console.error('Error fetching today schedule:', error);
    await sendTelegramMessage(chatId, '❌ Error fetching your schedule. Please try again later.');
  }
}

async function handleHelpCommand(chatId: number) {
  const message = `🤖 <b>Life Discipline Bot Commands</b>\n\n` +
                 `<b>/start</b> - Link your account\n` +
                 `<b>/today</b> - View today's schedule\n` +
                 `<b>/help</b> - Show this message\n\n` +
                 `You'll receive:\n` +
                 `• Task reminders before they start\n` +
                 `• Daily discipline check-ins`;
  
  await sendTelegramMessage(chatId, message);
}

// ==================== OTP VERIFICATION HANDLER ====================

async function handleOTPVerification(otp: string, userId: string) {
  console.log('🔐 Verifying OTP:', otp, 'for user:', userId);
  
  try {
    // Query bot_sessions with YOUR column names
    const { data: session, error } = await supabase
      .from('bot_sessions')
      .select('*')
      .eq('otp_code', otp)
      .gt('otp_expires_at', new Date().toISOString())
      .single();
    
    if (error || !session) {
      return { success: false, message: 'Invalid or expired OTP' };
    }
    
    // Link Telegram account - use YOUR table structure
    const { error: linkError } = await supabase
      .from('telegram_links')
      .upsert({
        user_id: userId,
        chat_id: session.chat_id,
        telegram_username: session.telegram_username,
        verification_code: otp,
        verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id' 
      });
    
    if (linkError) {
      console.error('Link error:', linkError);
      return { success: false, message: 'Failed to link account' };
    }
    
    // Clear OTP - use YOUR column name
    await supabase
      .from('bot_sessions')
      .delete()
      .eq('otp_code', otp);
    
    // Send confirmation
    await sendTelegramMessage(
      session.chat_id,
      '✅ <b>Account Linked Successfully!</b>\n\n' +
      'You will now receive:\n' +
      '• Task reminders 15 minutes before scheduled time\n' +
      '• Daily discipline notifications\n\n' +
      'Try these commands:\n' +
      '/today - View today\'s schedule\n' +
      '/help - Show all commands'
    );
    
    return { 
      success: true, 
      message: 'Account linked successfully',
      chat_id: session.chat_id 
    };
    
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, message: 'Internal server error during verification' };
  }
}

// ==================== MAIN SERVE FUNCTION ====================

Deno.serve(async (req) => {
  console.log('\n=== TELEGRAM BOT REQUEST ===');
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
  
  try {
    const url = new URL(req.url);
    
    // Handle OTP verification from web app
    if (url.pathname.includes('/verify') && req.method === 'POST') {
      console.log('🔐 Handling OTP verification');
      
      try {
        const { otp, user_id } = await req.json();
        console.log('Received OTP data:', { otp, user_id });
        
        const result = await handleOTPVerification(otp, user_id);
        console.log('OTP verification result:', result);
        
        return new Response(
          JSON.stringify(result),
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*' 
            }
          }
        );
      } catch (error) {
        console.error('Error parsing verification request:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Invalid request format' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Handle Telegram webhook
    console.log('📱 Handling Telegram webhook');
    
    let update;
    try {
      update = await req.json();
      console.log('📱 Telegram update received:', update.update_id);
    } catch (error) {
      console.error('❌ Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle messages
    if (update.message) {
      const { chat, text, from } = update.message;
      console.log(`💬 Message from ${from.id} (@${from.username || 'no-username'}):`, text);
      
      // Check if user is already linked
      const { data: link } = await supabase
        .from('telegram_links')
        .select('user_id')
        .eq('chat_id', chat.id)
        .single();
      
      if (text === '/start') {
        await handleStartCommand(chat.id, from);
      } else if (text === '/help') {
        await handleHelpCommand(chat.id);
      } else if (text === '/today') {
        if (link?.user_id) {
          await handleTodayCommand(chat.id, link.user_id);
        } else {
          await sendTelegramMessage(chat.id, '❌ Please link your account first with /start');
        }
      } else if (text && text.startsWith('/')) {
        await sendTelegramMessage(chat.id, '❓ Unknown command. Use /help to see available commands.');
      } else {
        await sendTelegramMessage(chat.id, '🤖 Send /start to begin or /help for commands.');
      }
    }
    
    console.log('✅ Request handled successfully');
    
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('💥 UNHANDLED ERROR:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});