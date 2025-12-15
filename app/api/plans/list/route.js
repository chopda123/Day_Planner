// /app/api/plans/list/route.js
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

    const { data: plans, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      plans: plans || []
    })

  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch plans',
      details: error.message
    }, { status: 500 })
  }
}