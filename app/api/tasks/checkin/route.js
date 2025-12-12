// app/api/tasks/checkin/route.js
import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    
    const { task_id, action, chat_id } = body;
    
    if (!task_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: task_id and action are required' },
        { status: 400 }
      );
    }
    
    // Get task details first
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .single();
    
    if (taskError) throw taskError;
    
    let newStatus;
    switch (action) {
      case 'done':
        newStatus = 'completed';
        break;
      case 'snooze':
        newStatus = 'pending';
        // Optional: reschedule for later
        break;
      case 'skip':
        newStatus = 'cancelled';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "done", "snooze", or "skip"' },
          { status: 400 }
        );
    }
    
    // Update task status
    const { error: updateError } = await supabaseAdmin
      .from('tasks')
      .update({
        status: newStatus,
        completed_at: action === 'done' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', task_id);
    
    if (updateError) throw updateError;
    
    // Mark reminder as sent if task is done
    if (action === 'done') {
      await supabaseAdmin
        .from('reminders')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('task_id', task_id)
        .eq('sent', false);
    }
    
    // Log the activity
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: task.user_id,
        task_id,
        action_type: `task_${action === 'done' ? 'completed' : 'updated'}`,
        action_details: {
          previous_status: task.status,
          new_status: newStatus,
          action,
          chat_id,
          timestamp: new Date().toISOString()
        }
      });
    
    return NextResponse.json({
      success: true,
      task_id,
      new_status: newStatus,
      message: `Task marked as ${action}`
    });
    
  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in', details: error.message },
      { status: 500 }
    );
  }
}