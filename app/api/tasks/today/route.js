// /app/api/tasks/today/route.js
import { createAdminClient } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_date', today)
      .order('start_time', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || []
    })

  } catch (error) {
    console.error('Error fetching today\'s tasks:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch tasks',
      details: error.message
    }, { status: 500 })
  }
}