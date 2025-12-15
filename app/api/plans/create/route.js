


// app/api/plans/create/route.js
import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  let planId = null;
  const insertedTaskIds = [];
  
  try {
    console.log('📝 Plans create API called');
    
    const body = await request.json();
    console.log('Received data:', JSON.stringify(body, null, 2));
    
    const { title, description, start_date, duration_days, tasks, user_id } = body;
    
    // Validation
    if (!title || !user_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title and user_id are required' },
        { status: 400 }
      );
    }
    
    // Validate user_id is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user_id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user_id format. Must be a UUID.' },
        { status: 400 }
      );
    }
    
    // Validate duration_days
    const validDurations = [30, 90, 180, 360];
    const actualDuration = duration_days || 30;
    
    const validatedDuration = validDurations.includes(actualDuration) 
      ? actualDuration 
      : validDurations.reduce((prev, curr) => {
          return (Math.abs(curr - actualDuration) < Math.abs(prev - actualDuration) ? curr : prev);
        });
    
    const supabaseAdmin = createAdminClient();
    
    // Check if user exists
    const { data: userCheck, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();
    
    if (userError || !userCheck) {
      return NextResponse.json(
        { success: false, message: 'User does not exist' },
        { status: 404 }
      );
    }
    
    // Calculate end date
    const startDate = start_date || new Date().toISOString().split('T')[0];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + validatedDuration);
    
    // Insert plan
    console.log('Inserting plan...');
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .insert({
        user_id,
        title,
        description: description || '',
        start_date: startDate,
        end_date: endDate.toISOString().split('T')[0],
        duration_days: validatedDuration,
        status: 'active',
        plan_type: 'daily'
      })
      .select('id')
      .single();
    
    if (planError) {
      console.error('Plan insert error:', planError);
      throw planError;
    }
    
    planId = plan.id;
    console.log('Plan inserted with ID:', planId);
    
    // Insert tasks if provided
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      console.log(`Inserting ${tasks.length} tasks...`);
      
      for (const taskData of tasks) {
        // Validate required task fields
        if (!taskData.title || !taskData.task_date) {
          throw new Error('Task is missing required fields: title and task_date');
        }
        
        // Prepare task data matching your database schema
        const taskToInsert = {
          plan_id: planId,
          user_id,
          title: taskData.title,
          description: taskData.description || '',
          category: taskData.category || 'other',
          task_date: taskData.task_date,
          start_time: taskData.start_time || '09:00:00',
          end_time: taskData.end_time || '10:00:00',
          all_day: taskData.all_day || false,
          repeat_rule: taskData.repeat_rule || 'none',
          repeat_until: taskData.repeat_until || null,
          repeat_days: taskData.repeat_days || [],
          status: 'pending',
          priority: taskData.priority || 3,
          telegram_reminder: taskData.telegram_reminder || false,
          reminder_minutes_before: taskData.reminder_minutes_before || 15,
          estimated_duration_minutes: taskData.estimated_duration_minutes || 60,
          location: taskData.location || '',
          color_code: taskData.color_code || '#3B82F6',
          notes: {}
        };
        
        console.log('Inserting task:', taskToInsert);
        
        // Insert task
        const { data: task, error: taskError } = await supabaseAdmin
          .from('tasks')
          .insert(taskToInsert)
          .select('id')
          .single();
        
        if (taskError) {
          console.error('Task insert error:', taskError);
          console.error('Task error details:', taskError.details, taskError.hint);
          throw taskError;
        }
        
        console.log('Task inserted with ID:', task.id);
        insertedTaskIds.push(task.id);
      }
    }
    
    console.log('✅ All operations completed successfully');
    return NextResponse.json({
      success: true,
      plan_id: planId,
      task_ids: insertedTaskIds,
      message: `Plan created with ${insertedTaskIds.length} tasks`
    });
    
  } catch (error) {
    console.error('❌ Error in plans/create:', error);
    console.error('Error details:', error.message, error.details);
    
    // Rollback: Delete plan and any inserted tasks if there was an error
    if (planId) {
      try {
        const supabaseAdmin = createAdminClient();
        
        // Delete any inserted tasks first (foreign key constraint)
        if (insertedTaskIds.length > 0) {
          await supabaseAdmin
            .from('tasks')
            .delete()
            .in('id', insertedTaskIds);
        }
        
        // Delete the plan
        await supabaseAdmin
          .from('plans')
          .delete()
          .eq('id', planId);
          
        console.log('Rolled back plan creation due to error');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create plan',
      details: error.message,
      hint: error.hint || 'Check if user exists and data format is correct'
    }, { status: 500 });
  }
}