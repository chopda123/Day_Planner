import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Get due reminders (within next 5 minutes)
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    
    const { data: dueReminders, error } = await supabaseAdmin
      .from('reminders')
      .select(`
        id,
        remind_at,
        sent,
        tasks (
          id,
          title,
          description,
          start_time,
          end_time,
          user_id,
          telegram_reminder
        ),
        telegram_links (
          chat_id
        )
      `)
      .eq('sent', false)
      .lte('remind_at', fiveMinutesFromNow.toISOString())
      .gte('remind_at', now.toISOString())
      .order('remind_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching due reminders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch due reminders' },
        { status: 500 }
      );
    }
    
    // Format for scheduler
    const formattedReminders = dueReminders?.map(reminder => ({
      reminder_id: reminder.id,
      task_id: reminder.tasks.id,
      user_id: reminder.tasks.user_id,
      chat_id: reminder.telegram_links?.chat_id,
      task_title: reminder.tasks.title,
      task_description: reminder.tasks.description,
      start_time: reminder.tasks.start_time,
      remind_at: reminder.remind_at,
      send_telegram: reminder.tasks.telegram_reminder && reminder.telegram_links?.chat_id
    })) || [];
    
    return NextResponse.json({
      success: true,
      count: formattedReminders.length,
      reminders: formattedReminders,
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    console.error('Error in notifications/due:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    
    const { reminder_id, sent = true, sent_at = new Date().toISOString() } = body;
    
    if (!reminder_id) {
      return NextResponse.json(
        { error: 'reminder_id is required' },
        { status: 400 }
      );
    }
    
    // Mark reminder as sent
    const { error } = await supabaseAdmin
      .from('reminders')
      .update({ sent, sent_at })
      .eq('id', reminder_id);
    
    if (error) {
      console.error('Error updating reminder:', error);
      return NextResponse.json(
        { error: 'Failed to update reminder' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reminder marked as sent'
    });
    
  } catch (error) {
    console.error('Error in notifications/due POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}