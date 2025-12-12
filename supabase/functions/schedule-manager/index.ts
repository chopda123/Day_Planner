import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

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

// Morning messages (runs at 6 AM)
export async function sendMorningMessages() {
  console.log('🌅 Sending morning messages...');
  
  // Get all users with Telegram linked
  const { data: links, error } = await supabase
    .from('telegram_links')
    .select('user_id, chat_id')
    .eq('verified', true);
  
  if (error) {
    console.error('Error fetching Telegram links:', error);
    return;
  }
  
  for (const link of links) {
    try {
      // Get today's date
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // Get user's timetable for today
      const { data: timetable } = await supabase
        .from('daily_timetable')
        .select('*')
        .eq('user_id', link.user_id)
        .eq('day_of_week', dayOfWeek)
        .order('start_time');
      
      // Get promises
      const { data: dontPromises } = await supabase
        .from('user_promises_dont')
        .select('title')
        .eq('user_id', link.user_id)
        .eq('is_active', true);
      
      const { data: doPromises } = await supabase
        .from('user_promises_do')
        .select('title')
        .eq('user_id', link.user_id)
        .eq('is_active', true);
      
      // Build message
      let message = `🌅 <b>GOOD MORNING!</b>\n\n`;
      message += `Today's commitments:\n\n`;
      
      if (dontPromises && dontPromises.length > 0) {
        message += `🚫 <b>AVOID:</b>\n`;
        dontPromises.forEach(p => message += `• ${p.title}\n`);
        message += `\n`;
      }
      
      if (doPromises && doPromises.length > 0) {
        message += `✅ <b>MUST DO:</b>\n`;
        doPromises.forEach(p => message += `• ${p.title}\n`);
        message += `\n`;
      }
      
      if (timetable && timetable.length > 0) {
        message += `⏰ <b>SCHEDULE:</b>\n`;
        timetable.forEach(item => {
          const start = item.start_time.substring(0, 5);
          const end = item.end_time.substring(0, 5);
          message += `${start}-${end}: ${item.title}\n`;
        });
      }
      
      message += `\n💪 <i>Remember: Discipline is freedom.</i>`;
      
      // Add start button
      const keyboard = {
        inline_keyboard: [[
          { text: '✅ START MY DAY', callback_data: 'start_day' }
        ]]
      };
      
      await sendTelegramMessage(link.chat_id, message, { reply_markup: keyboard });
      
    } catch (error) {
      console.error(`Error sending to user ${link.user_id}:`, error);
    }
  }
  
  console.log(`✅ Sent morning messages to ${links.length} users`);
}

// Night checklists (runs at 10 PM)
export async function sendNightChecklists() {
  console.log('🌙 Sending night checklists...');
  
  const { data: links, error } = await supabase
    .from('telegram_links')
    .select('user_id, chat_id')
    .eq('verified', true);
  
  if (error) {
    console.error('Error fetching Telegram links:', error);
    return;
  }
  
  for (const link of links) {
    try {
      const message = `🌙 <b>NIGHT CHECK-IN TIME</b>\n\n`;
      message += `How was your day? Let's review:\n\n`;
      message += `1. Did you follow your timetable today?\n`;
      message += `2. Did you avoid all bad habits?\n`;
      message += `3. Did you follow all good habits?\n`;
      message += `4. Did you take your medicines?\n`;
      message += `5. Did you study as per plan?\n`;
      message += `6. Did you eat according to diet?\n`;
      message += `7. Did you read today?\n`;
      message += `8. Did you work out?\n\n`;
      message += `Click "Start Check-in" to begin.`;
      
      const keyboard = {
        inline_keyboard: [[
          { text: '📝 START CHECK-IN', callback_data: 'checkin_q1_yes' }
        ]]
      };
      
      await sendTelegramMessage(link.chat_id, message, { reply_markup: keyboard });
      
    } catch (error) {
      console.error(`Error sending to user ${link.user_id}:`, error);
    }
  }
  
  console.log(`✅ Sent night checklists to ${links.length} users`);
}

// Weekly reports (runs Sunday at 8 PM)
export async function sendWeeklyReports() {
  console.log('📊 Sending weekly reports...');
  
  const today = new Date();
  if (today.getDay() !== 0) { // Only on Sunday
    console.log('Not Sunday, skipping weekly reports');
    return;
  }
  
  const { data: links, error } = await supabase
    .from('telegram_links')
    .select('user_id, chat_id')
    .eq('verified', true);
  
  if (error) {
    console.error('Error fetching Telegram links:', error);
    return;
  }
  
  for (const link of links) {
    try {
      // Generate weekly summary
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      
      const { data: summary } = await supabase.rpc('generate_weekly_summary', {
        user_uuid: link.user_id,
        start_date: startDate.toISOString().split('T')[0]
      });
      
      if (!summary) continue;
      
      // Build report message
      let message = `📊 <b>WEEKLY DISCIPLINE REPORT</b>\n\n`;
      message += `Week of ${summary.week_start_date} to ${summary.week_end_date}\n\n`;
      message += `📈 <b>PERFORMANCE SCORE:</b> ${summary.timetable_adherence_percent}%\n\n`;
      message += `• Timetable Adherence: ${summary.timetable_adherence_percent}%\n`;
      message += `• Good Habits: ${summary.good_habits_completed}/7 days\n`;
      message += `• Medicine: ${summary.medicine_adherence_percent}%\n`;
      message += `• Diet: ${summary.diet_followed_percent}%\n\n`;
      message += `💭 <b>ANALYSIS:</b>\n${summary.summary_text}\n\n`;
      message += `🔮 <b>NEXT WEEK GOAL:</b> Aim for ${Math.min(100, summary.timetable_adherence_percent + 10)}% adherence!\n\n`;
      message += `Keep building momentum! 💪`;
      
      await sendTelegramMessage(link.chat_id, message);
      
      // Send to accountability partners
      const { data: partners } = await supabase
        .from('accountability_partners')
        .select('*')
        .eq('user_id', link.user_id)
        .eq('receives_weekly_reports', true)
        .eq('is_active', true);
      
      // TODO: Send to partners via email/other channels
      
    } catch (error) {
      console.error(`Error sending to user ${link.user_id}:`, error);
    }
  }
  
  console.log(`✅ Sent weekly reports to ${links.length} users`);
}

// Task reminders (runs every minute)
export async function checkTaskReminders() {
  console.log('🔔 Checking task reminders...');
  
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
  
  // Get due reminders
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select(`
      id,
      task_id,
      remind_at,
      tasks (
        title,
        description,
        start_time,
        user_id
      )
    `)
    .eq('sent', false)
    .lt('remind_at', fiveMinutesFromNow.toISOString());
  
  if (error) {
    console.error('Error fetching reminders:', error);
    return;
  }
  
  for (const reminder of reminders) {
    try {
      // Get user's Telegram chat ID
      const { data: link } = await supabase
        .from('telegram_links')
        .select('chat_id')
        .eq('user_id', reminder.tasks.user_id)
        .single();
      
      if (!link) continue;
      
      // Send reminder
      const message = `🔔 <b>TASK REMINDER</b>\n\n`;
      message += `${reminder.tasks.title}\n`;
      if (reminder.tasks.description) {
        message += `${reminder.tasks.description}\n`;
      }
      message += `\nStarting soon!`;
      
      const keyboard = {
        inline_keyboard: [[
          { text: '✅ Done', callback_data: `task:${reminder.task_id}:done` },
          { text: '⏸️ Snooze 10m', callback_data: `task:${reminder.task_id}:snooze:10` }
        ]]
      };
      
      await sendTelegramMessage(link.chat_id, message, { reply_markup: keyboard });
      
      // Mark as sent
      await supabase
        .from('reminders')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('id', reminder.id);
      
    } catch (error) {
      console.error(`Error sending reminder ${reminder.id}:`, error);
    }
  }
  
  console.log(`✅ Processed ${reminders?.length || 0} reminders`);
}

// Main function
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  
  switch (action) {
    case 'morning':
      await sendMorningMessages();
      break;
    case 'night':
      await sendNightChecklists();
      break;
    case 'weekly':
      await sendWeeklyReports();
      break;
    case 'reminders':
      await checkTaskReminders();
      break;
    default:
      // Run all scheduled tasks
      const hour = new Date().getHours();
      const day = new Date().getDay();
      
      if (hour === 6) { // 6 AM
        await sendMorningMessages();
      }
      
      if (hour === 22) { // 10 PM
        await sendNightChecklists();
      }
      
      if (day === 0 && hour === 20) { // Sunday 8 PM
        await sendWeeklyReports();
      }
      
      // Always check reminders
      await checkTaskReminders();
  }
  
  return new Response(
    JSON.stringify({ success: true, timestamp: new Date().toISOString() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});