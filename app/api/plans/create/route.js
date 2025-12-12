
// app/api/plans/create/route.js - FULL VERSION
import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('📝 Plans create API called');
    
    // Parse the request
    const body = await request.json();
    console.log('Received data:', body);
    
    const { title, description, start_date, duration_days, tasks, user_id } = body;
    
    // Validation
    if (!title || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title and user_id are required' },
        { status: 400 }
      );
    }
    
    // Check if we have env vars
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
    }
    
    // Create admin client
    const supabaseAdmin = createAdminClient();
    console.log('Supabase admin client created');
    
    // Start transaction - Insert plan first
    console.log('Inserting plan...');
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .insert({
        user_id,
        title,
        description: description || '',
        start_date: start_date || new Date().toISOString().split('T')[0],
        duration_days: duration_days || 1,
        status: 'active',
        plan_type: 'daily'
      })
      .select('id')
      .single();
    
    if (planError) {
      console.error('Plan insert error:', planError);
      throw planError;
    }
    
    console.log('Plan inserted with ID:', plan.id);
    
    const insertedTaskIds = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Insert tasks if provided
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      console.log(`Inserting ${tasks.length} tasks...`);
      
      for (const taskData of tasks) {
        const taskDate = start_date || today;
        
        // Insert task
        const { data: task, error: taskError } = await supabaseAdmin
          .from('tasks')
          .insert({
            plan_id: plan.id,
            user_id,
            title: taskData.title,
            description: taskData.description || '',
            start_time: taskData.start_time,
            end_time: taskData.end_time,
            task_date: taskDate,
            category: taskData.category || 'other',
            telegram_reminder: taskData.reminder_on || false,
            reminder_minutes_before: taskData.reminder_minutes || 15,
            status: 'pending',
            priority: taskData.priority || 3
          })
          .select('id')
          .single();
        
        if (taskError) {
          console.error('Task insert error:', taskError);
          throw taskError;
        }
        
        console.log('Task inserted with ID:', task.id);
        insertedTaskIds.push(task.id);
        
        // Create reminder if enabled
        if (taskData.reminder_on) {
          // Calculate reminder time (15 minutes before task by default)
          const reminderMinutes = taskData.reminder_minutes || 15;
          const taskDateTime = new Date(`${taskDate}T${taskData.start_time}`);
          const remindAt = new Date(taskDateTime.getTime() - reminderMinutes * 60000);
          
          console.log(`Creating reminder for task ${task.id} at ${remindAt.toISOString()}`);
          
          const { error: reminderError } = await supabaseAdmin
            .from('reminders')
            .insert({
              task_id: task.id,
              user_id,
              remind_at: remindAt.toISOString(),
              original_remind_at: remindAt.toISOString(),
              reminder_type: 'telegram',
              sent: false
            });
          
          if (reminderError) {
            console.error('Reminder insert error:', reminderError);
            // Don't throw - continue with other tasks
          }
        }
      }
    }
    
    console.log('✅ All operations completed successfully');
    return NextResponse.json({
      success: true,
      plan_id: plan.id,
      task_ids: insertedTaskIds,
      message: `Plan created with ${insertedTaskIds.length} tasks`
    });
    
  } catch (error) {
    console.error('❌ Error in plans/create:', error);
    return NextResponse.json({
      error: 'Failed to create plan',
      details: error.message,
      // Include more info in development
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
    }, { status: 500 });
  }
}