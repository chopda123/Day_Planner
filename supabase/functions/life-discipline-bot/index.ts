import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Environment variables
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const WEB_APP_URL = Deno.env.get('WEB_APP_URL') || 'http://localhost:3000';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// ============================================
// TELEGRAM HELPER FUNCTIONS
// ============================================

async function sendTelegramMessage(chatId: number, text: string, options: any = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
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
  
  return await response.json();
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// MORNING MESSAGE GENERATOR (6 AM)
// ============================================

async function generateMorningMessage(userId: string, chatId: number) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get user promises
  const { data: dontPromises } = await supabase
    .from('user_promises_dont')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  const { data: doPromises } = await supabase
    .from('user_promises_do')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  // Get today's timetable
  const dayOfWeek = new Date().getDay();
  const { data: timetable } = await supabase
    .from('daily_timetable')
    .select('*')
    .eq('user_id', userId)
    .eq('day_of_week', dayOfWeek)
    .order('start_time');
  
  // Get today's medicines
  const { data: medicines } = await supabase
    .from('medicines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  // Get date-specific events
  const { data: dateEvents } = await supabase
    .from('date_events')
    .select('*')
    .eq('user_id', userId)
    .eq('event_date', today);
  
  // Motivational quotes
  const quotes = [
    "Discipline is choosing between what you want now and what you want most.",
    "The pain of discipline is far less than the pain of regret.",
    "Small daily improvements are the key to staggering long-term results.",
    "You don't have to be great to start, but you have to start to be great.",
    "The only bad workout is the one that didn't happen."
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Build message
  let message = `🌅 <b>GOOD MORNING, DISCIPLINE WARRIOR!</b>\n\n`;
  message += `📅 <b>Today's Date:</b> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
  
  // Daily commitments
  message += `🚫 <b>THINGS I WILL NOT DO TODAY:</b>\n`;
  dontPromises?.forEach((promise, index) => {
    message += `${index + 1}. ${promise.title}\n`;
  });
  
  message += `\n✅ <b>THINGS I MUST DO TODAY:</b>\n`;
  doPromises?.forEach((promise, index) => {
    message += `${index + 1}. ${promise.title}\n`;
  });
  
  // Timetable
  message += `\n⏰ <b>TODAY'S TIMETABLE:</b>\n`;
  timetable?.forEach((item, index) => {
    const startTime = item.start_time.substring(0, 5);
    const endTime = item.end_time.substring(0, 5);
    message += `${startTime}-${endTime}: ${item.title}\n`;
  });
  
  // Medicines
  if (medicines?.length > 0) {
    message += `\n💊 <b>MEDICINE SCHEDULE:</b>\n`;
    medicines.forEach((med, index) => {
      const times = med.time_of_day?.map((t: string) => t.substring(0, 5)).join(', ') || '';
      message += `${med.name}: ${times}\n`;
    });
  }
  
  // Date events
  if (dateEvents?.length > 0) {
    message += `\n📌 <b>SPECIAL EVENTS TODAY:</b>\n`;
    dateEvents.forEach((event, index) => {
      const time = event.start_time ? ` at ${event.start_time.substring(0, 5)}` : '';
      message += `${event.title}${time}\n`;
    });
  }
  
  message += `\n💪 <b>MOTIVATION:</b>\n"${randomQuote}"\n\n`;
  
  // Add start day button
  const keyboard = {
    inline_keyboard: [[
      { text: '✅ START MY DAY', callback_data: 'start_day' },
      { text: '📊 View Progress', callback_data: 'view_progress' }
    ]]
  };
  
  await sendTelegramMessage(chatId, message, { reply_markup: keyboard });
}

// ============================================
// NIGHT CHECKLIST (10 PM)
// ============================================

async function sendNightChecklist(userId: string, chatId: number) {
  const message = `🌙 <b>NIGHT CHECKLIST - TIME FOR REFLECTION</b>\n\n`;
  message += `How did your day go? Let's review:\n\n`;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Yes', callback_data: 'checkin_q1_yes' },
        { text: '❌ No', callback_data: 'checkin_q1_no' }
      ],
      [{ text: '📝 Notes', callback_data: 'checkin_notes' }]
    ]
  };
  
  await sendTelegramMessage(
    chatId,
    message + '1. Did you follow your timetable today?',
    { reply_markup: keyboard }
  );
}

async function handleNightCheckinResponse(chatId: number, data: string, userId: string) {
  const parts = data.split('_');
  const question = parts[1]; // q1, q2, etc.
  const response = parts[2]; // yes, no
  
  // Store response in database
  const checkinDate = new Date().toISOString().split('T')[0];
  
  // Check if checkin exists
  const { data: existingCheckin } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', checkinDate)
    .eq('checkin_type', 'night')
    .single();
  
  const updateData: any = {
    [`question_${question.substring(1)}_response`]: response === 'yes'
  };
  
  if (existingCheckin) {
    await supabase
      .from('daily_checkins')
      .update(updateData)
      .eq('id', existingCheckin.id);
  } else {
    await supabase
      .from('daily_checkins')
      .insert({
        user_id: userId,
        checkin_date: checkinDate,
        checkin_type: 'night',
        ...updateData
      });
  }
  
  // Send next question
  const questions = [
    '2. Did you avoid all bad habits?',
    '3. Did you follow all good habits?',
    '4. Did you take your medicines?',
    '5. Did you study as per plan?',
    '6. Did you eat according to diet?',
    '7. Did you read today?',
    '8. Did you work out?'
  ];
  
  const currentQ = parseInt(question.substring(1));
  if (currentQ < 8) {
    const nextQ = currentQ + 1;
    const keyboard = {
      inline_keyboard: [[
        { text: '✅ Yes', callback_data: `checkin_q${nextQ}_yes` },
        { text: '❌ No', callback_data: `checkin_q${nextQ}_no` }
      ]]
    };
    
    await sendTelegramMessage(chatId, questions[nextQ - 1], { reply_markup: keyboard });
  } else {
    // All questions answered
    await supabase
      .from('daily_checkins')
      .update({ completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('checkin_date', checkinDate)
      .eq('checkin_type', 'night');
    
    await sendTelegramMessage(chatId, '✅ Night check-in complete! Thank you for your honesty. Rest well for tomorrow! 💪');
  }
}

// ============================================
// WEEKLY REPORT GENERATOR
// ============================================

async function generateWeeklyReport(userId: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  
  // Get weekly summary from function
  const { data: summary, error } = await supabase.rpc('generate_weekly_summary', {
    user_uuid: userId,
    start_date: startDate.toISOString().split('T')[0]
  });
  
  if (error) {
    console.error('Error generating weekly report:', error);
    return null;
  }
  
  return summary;
}

async function sendWeeklyReport(userId: string, chatId: number) {
  const summary = await generateWeeklyReport(userId);
  
  if (!summary) {
    await sendTelegramMessage(chatId, '⚠️ Could not generate weekly report. Check your activity data.');
    return;
  }
  
  // Get accountability partners
  const { data: partners } = await supabase
    .from('accountability_partners')
    .select('*')
    .eq('user_id', userId)
    .eq('receives_weekly_reports', true)
    .eq('is_active', true);
  
  // Message for user
  let message = `📊 <b>WEEKLY DISCIPLINE REPORT</b>\n\n`;
  message += `Period: ${summary.week_start_date} to ${summary.week_end_date}\n\n`;
  message += `📈 <b>PERFORMANCE METRICS:</b>\n`;
  message += `• Timetable Adherence: ${summary.timetable_adherence_percent}%\n`;
  message += `• Good Habits Completed: ${summary.good_habits_completed}/7 days\n`;
  message += `• Medicine Adherence: ${summary.medicine_adherence_percent}%\n`;
  message += `• Diet Followed: ${summary.diet_followed_percent}%\n\n`;
  message += `💭 <b>SUMMARY:</b>\n${summary.summary_text}\n\n`;
  message += `Keep pushing! Consistency is key to transformation. 🔥`;
  
  await sendTelegramMessage(chatId, message);
  
  // Send to accountability partners
  if (partners && partners.length > 0) {
    const partnerMessage = `👥 <b>ACCOUNTABILITY REPORT</b>\n\n`;
    partnerMessage += `Your accountability partner's weekly report:\n\n`;
    partnerMessage += `Performance: ${summary.timetable_adherence_percent}% timetable adherence\n`;
    partnerMessage += `Habits: ${summary.good_habits_completed}/7 days completed\n`;
    partnerMessage += `Overall: ${summary.summary_text}\n\n`;
    partnerMessage += `Consider sending a motivational message! 💪`;
    
    // TODO: Send to partners via their contact method
    // This would need email/phone integration
  }
}

// ============================================
// MAIN BOT HANDLERS
// ============================================

async function handleStartCommand(chatId: number, from: any) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  // Store OTP
  await supabase
    .from('bot_sessions')
    .upsert({
      chat_id: chatId,
      telegram_username: from.username || from.first_name,
      otp_code: otp,
      otp_expires_at: expiresAt.toISOString()
    }, { onConflict: 'chat_id' });
  
  const message = `🤖 <b>LIFE DISCIPLINE BOT</b>\n\n`;
  message += `Welcome to your personal discipline coach!\n\n`;
  message += `Your verification code is:\n`;
  message += `<code>${otp}</code>\n\n`;
  message += `Go to ${WEB_APP_URL} and enter this code to link your account.\n`;
  message += `⚠️ Code expires in 10 minutes.`;
  
  await sendTelegramMessage(chatId, message);
}

async function handleTodayCommand(chatId: number, userId: string) {
  await generateMorningMessage(userId, chatId);
}

async function handleSummaryCommand(chatId: number, userId: string) {
  await sendWeeklyReport(userId, chatId);
}

async function handleOTPVerification(otp: string, userId: string) {
  console.log('🔐 Verifying OTP:', otp, 'for user:', userId);
  
  const { data: session, error } = await supabase
    .from('bot_sessions')
    .select('*')
    .eq('otp_code', otp)
    .gt('otp_expires_at', new Date().toISOString())
    .single();
  
  if (error || !session) {
    return { success: false, message: 'Invalid or expired OTP' };
  }
  
  // Link Telegram account
  await supabase
    .from('telegram_links')
    .upsert({
      user_id: userId,
      chat_id: session.chat_id,
      telegram_username: session.telegram_username,
      verified: true,
      verified_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  
  // Clear OTP
  await supabase
    .from('bot_sessions')
    .update({ otp_code: null, otp_expires_at: null })
    .eq('id', session.id);
  
  // Send welcome message
  await sendTelegramMessage(
    session.chat_id,
    '✅ <b>ACCOUNT LINKED SUCCESSFULLY!</b>\n\n' +
    'You will now receive:\n' +
    '• Daily morning messages at 6 AM\n' +
    '• Night checklists at 10 PM\n' +
    '• Weekly reports on Sunday\n' +
    '• Task reminders\n\n' +
    'Commands:\n' +
    '/today - View today\'s schedule\n' +
    '/summary - Get weekly report\n' +
    '/partner - Manage accountability partners'
  );
  
  return { success: true, message: 'Account linked successfully' };
}

// ============================================
// MAIN SERVE FUNCTION
// ============================================

Deno.serve(async (req) => {
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
  
  const url = new URL(req.url);
  
  // Handle OTP verification from web app
  if (url.pathname.endsWith('/verify') && req.method === 'POST') {
    try {
      const { otp, userId } = await req.json();
      const result = await handleOTPVerification(otp, userId);
      
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
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // Handle Telegram webhook
  try {
    const update = await req.json();
    
    // Handle callback queries
    if (update.callback_query) {
      const { id, from, data } = update.callback_query;
      
      // Answer callback
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: id })
      });
      
      // Get user from telegram_links
      const { data: link } = await supabase
        .from('telegram_links')
        .select('user_id')
        .eq('chat_id', from.id)
        .single();
      
      if (link) {
        if (data.startsWith('checkin_')) {
          await handleNightCheckinResponse(from.id, data, link.user_id);
        } else if (data === 'start_day') {
          await sendTelegramMessage(from.id, '✅ Day started! Remember your commitments. You got this! 💪');
        } else if (data === 'view_progress') {
          await sendWeeklyReport(link.user_id, from.id);
        }
      }
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle messages
    if (update.message) {
      const { chat, text, from } = update.message;
      
      // Get user from telegram_links
      const { data: link } = await supabase
        .from('telegram_links')
        .select('user_id')
        .eq('chat_id', chat.id)
        .single();
      
      if (text === '/start') {
        await handleStartCommand(chat.id, from);
      } else if (text === '/today' && link) {
        await handleTodayCommand(chat.id, link.user_id);
      } else if (text === '/summary' && link) {
        await handleSummaryCommand(chat.id, link.user_id);
      } else if (text === '/help') {
        const helpMessage = `🤖 <b>LIFE DISCIPLINE BOT COMMANDS</b>\n\n` +
                          `/start - Link your account\n` +
                          `/today - View today's schedule & commitments\n` +
                          `/summary - Get weekly performance report\n` +
                          `/partner - Manage accountability partners\n` +
                          `/help - Show this message\n\n` +
                          `You'll receive automatic:\n` +
                          `• Morning messages at 6 AM\n` +
                          `• Night checklists at 10 PM\n` +
                          `• Weekly reports on Sundays`;
        await sendTelegramMessage(chat.id, helpMessage);
      } else {
        await sendTelegramMessage(chat.id, 'Send /start to begin or /help for commands.');
      }
    }
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});