

// app/api/plans/create/route.js
import { createAdminClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  let planId = null;
  const insertedTaskIds = [];
  
  try {
    console.log('📝 Plans create API called');
    
    const body = await request.json();
    console.log('Received data:', body);
    
    const { title, description, start_date, duration_days, tasks, user_id } = body;
    
    // Validation
    if (!title || !user_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: title and user_id are required' },
        { status: 400 }
      );
    }
    
    // Validate duration_days
    const validDurations = [30, 90, 180, 360]; // 1, 3, 6, 12 months
    const actualDuration = duration_days || 30;
    
    // If not a standard duration, round to nearest valid duration
    const validatedDuration = validDurations.includes(actualDuration) 
      ? actualDuration 
      : validDurations.reduce((prev, curr) => {
          return (Math.abs(curr - actualDuration) < Math.abs(prev - actualDuration) ? curr : prev);
        });
    
    const supabaseAdmin = createAdminClient();
    
    // Start transaction - Insert plan first
    console.log('Inserting plan...');
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .insert({
        user_id,
        title,
        description: description || '',
        start_date: start_date || new Date().toISOString().split('T')[0],
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
    
    const today = new Date().toISOString().split('T')[0];
    
    // Insert tasks if provided
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      console.log(`Inserting ${tasks.length} tasks...`);
      
      for (const taskData of tasks) {
        const taskDate = start_date || today;
        
        // Validate required task fields
        if (!taskData.title || !taskData.start_time || !taskData.end_time) {
          throw new Error('Task is missing required fields: title, start_time, or end_time');
        }
        
        // Insert task
        const { data: task, error: taskError } = await supabaseAdmin
          .from('tasks')
          .insert({
            plan_id: planId,
            user_id,
            title: taskData.title,
            description: taskData.description || '',
            start_time: taskData.start_time,
            end_time: taskData.end_time,
            task_date: taskDate,
            category: taskData.category || 'other',
            telegram_reminder: taskData.telegram_reminder || false,
            reminder_minutes_before: taskData.reminder_minutes_before || 15,
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
      details: error.message
    }, { status: 500 });
  }
}