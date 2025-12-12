// lib/telegram-reminders.js

/**
 * Send a reminder to Telegram
 * @param {Object} task - The task object
 * @param {Object} user - The user object
 * @param {Object} telegramLink - The telegram link object
 */
export async function sendTelegramReminder(task, user, telegramLink) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not configured');
      return;
    }
    
    const message = `🔔 *Task Reminder*\n\n` +
                   `*${task.title}*\n` +
                   `📝 ${task.description || 'No description'}\n` +
                   `⏰ ${formatTime(task.start_time)} - ${formatTime(task.end_time)}\n` +
                   `📂 ${task.category}\n\n` +
                   `[View in Planner](${process.env.NEXT_PUBLIC_APP_URL}/dashboard)`;
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Done', callback_data: `task:${task.id}:done` },
          { text: '⏸️ Snooze 10m', callback_data: `task:${task.id}:snooze:10` },
          { text: '⏭️ Skip', callback_data: `task:${task.id}:skip` }
        ]
      ]
    };
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramLink.chat_id,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ Reminder sent for task: ${task.title}`);
      return { success: true, messageId: data.result.message_id };
    } else {
      console.error('Failed to send reminder:', data);
      return { success: false, error: data.description };
    }
    
  } catch (error) {
    console.error('Error sending Telegram reminder:', error);
    return { success: false, error: error.message };
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}