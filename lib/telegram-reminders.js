

// lib/telegram-reminders.js

/**
 * Send a reminder to Telegram with retry logic
 * @param {Object} task - The task object
 * @param {Object} user - The user object
 * @param {Object} telegramLink - The telegram link object
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 */
export async function sendTelegramReminder(task, user, telegramLink, maxRetries = 3) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not configured');
    return { success: false, error: 'Telegram bot token not configured' };
  }
  
  if (!telegramLink || !telegramLink.chat_id) {
    console.error('No valid Telegram chat ID found');
    return { success: false, error: 'No Telegram chat ID available' };
  }
  
  // Format message with timezone-aware formatting
  const message = `🔔 *Task Reminder*\n\n` +
                 `*${task.title}*\n` +
                 `📝 ${task.description || 'No description'}\n` +
                 `⏰ ${formatTimeWithTimezone(task.start_time)} - ${formatTimeWithTimezone(task.end_time)}\n` +
                 `📂 ${task.category}\n\n` +
                 `[View in Planner](${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/dashboard)`;
  
  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Done', callback_data: `task:${task.id}:done` },
        { text: '⏸️ Snooze 10m', callback_data: `task:${task.id}:snooze:10` },
        { text: '⏭️ Skip', callback_data: `task:${task.id}:skip` }
      ]
    ]
  };
  
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      console.log(`Sending Telegram reminder (attempt ${attempt + 1}/${maxRetries})`);
      
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
        return { 
          success: true, 
          messageId: data.result.message_id,
          attempts: attempt + 1 
        };
      } else {
        console.error(`Telegram API error (attempt ${attempt + 1}):`, data);
        
        // If it's a rate limit error, wait before retrying
        if (data.error_code === 429) {
          const retryAfter = data.parameters?.retry_after || 10;
          console.log(`Rate limited, waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          attempt++;
          continue;
        }
        
        // For other errors, check if we should retry
        const shouldRetry = shouldRetryTelegramError(data);
        if (!shouldRetry || attempt === maxRetries - 1) {
          return { 
            success: false, 
            error: data.description || 'Unknown Telegram API error',
            details: data 
          };
        }
      }
    } catch (error) {
      console.error(`Network error (attempt ${attempt + 1}):`, error);
      
      if (attempt === maxRetries - 1) {
        return { 
          success: false, 
          error: error.message || 'Network error sending reminder'
        };
      }
      
      // Wait with exponential backoff before retrying
      const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, etc.
      console.log(`Waiting ${waitTime/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    attempt++;
  }
  
  return { 
    success: false, 
    error: `Failed after ${maxRetries} attempts` 
  };
}

/**
 * Check if a Telegram error should be retried
 * @param {Object} error - Telegram API error response
 */
function shouldRetryTelegramError(error) {
  const retriableErrors = [
    'ETELEGRAM',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN'
  ];
  
  const errorCode = error.error_code;
  const description = error.description?.toLowerCase() || '';
  
  // Don't retry client errors (4xx)
  if (errorCode >= 400 && errorCode < 500) {
    // Except for rate limiting
    if (errorCode === 429) return true;
    return false;
  }
  
  // Retry server errors (5xx)
  if (errorCode >= 500) return true;
  
  // Retry network-related errors
  if (retriableErrors.some(err => description.includes(err.toLowerCase()))) {
    return true;
  }
  
  return false;
}

/**
 * Format time with timezone awareness
 * @param {string} timeStr - Time string in HH:MM format
 * @param {string} timezone - Optional timezone (default: local)
 */
function formatTimeWithTimezone(timeStr, timezone = null) {
  if (!timeStr) return '';
  
  try {
    const [hours, minutes] = timeStr.split(':');
    const now = new Date();
    const dateWithTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(hours),
      parseInt(minutes),
      0
    );
    
    if (timezone) {
      return dateWithTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone,
        hour12: true
      });
    } else {
      // Use user's local timezone
      return dateWithTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    // Fallback to simple formatting
    return formatTimeSimple(timeStr);
  }
}

/**
 * Simple time formatting fallback
 * @param {string} timeStr - Time string in HH:MM format
 */
function formatTimeSimple(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Send a test message to verify Telegram connection
 * @param {string} chatId - Telegram chat ID
 * @param {string} message - Optional custom message
 */
export async function sendTestTelegramMessage(chatId, message = '✅ Test message from Life Planner') {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN not configured' };
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      return { success: true, messageId: data.result.message_id };
    } else {
      return { success: false, error: data.description };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}