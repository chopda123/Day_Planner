

// /app/create-plan/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PromiseBuilder from '@/components/PromiseBuilder'
import TimetableBuilder from '@/components/TimetableBuilder'
import { createClient } from '@/lib/supabaseClient'

export default function CreatePlanPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [userId, setUserId] = useState(null)
  
  // This is the main configuration state
  const [config, setConfig] = useState({
    title: '',
    description: '',
    duration_days: 30,
    promisesDo: [],
    promisesDont: [],
    timetable: []
  })

  // Get current user
  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Get user ID from users table
      supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setUserId(data.id)
          } else if (error) {
            console.error('Error fetching user:', error)
            // Create user if doesn't exist
            createUserInDatabase(user)
          }
        })
    })
  }, [router])

  const createUserInDatabase = async (authUser) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        auth_user_id: authUser.id
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating user:', error)
    } else if (data) {
      setUserId(data.id)
    }
  }

  const handleSubmit = async () => {
    if (!userId) {
      alert('Please wait for user information to load')
      return
    }

    // Basic validation
    if (!config.title.trim()) {
      alert('Please enter a plan title')
      return
    }

    setIsLoading(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const startDate = today
      
      // Create tasks from timetable
      const timetableTasks = config.timetable.map(entry => {
        // Format time properly for the database
        const startTime = `${entry.startTime}:00`
        const endTime = `${entry.endTime}:00`
        
        // Get day numbers (0-6) from entry.days array
        const repeatDays = entry.days || []
        
        return {
          title: entry.title,
          start_time: startTime,
          end_time: endTime,
          category: entry.category || 'other',
          description: `Schedule: ${entry.title}`,
          task_date: startDate,
          priority: 2,
          all_day: false,
          repeat_rule: repeatDays.length > 0 ? 'weekly' : 'none',
          repeat_until: null,
          repeat_days: repeatDays,
          telegram_reminder: false,
          reminder_minutes_before: 15,
          estimated_duration_minutes: 60,
          color_code: getColorForCategory(entry.category)
        }
      })

      // Convert promises to tasks
      const promiseTasks = [
        // "Do" promises as morning tasks
        ...config.promisesDo.map((promise) => ({
          title: promise.title,
          start_time: '09:00:00',
          end_time: '09:30:00',
          category: 'personal',
          description: `Daily promise: ${promise.title}`,
          task_date: startDate,
          priority: 1,
          all_day: false,
          repeat_rule: 'daily',
          repeat_until: null,
          repeat_days: [],
          telegram_reminder: true,
          reminder_minutes_before: 15,
          estimated_duration_minutes: 30,
          color_code: '#10B981'
        })),
        // "Don't" promises as evening reminder tasks
        ...config.promisesDont.map((promise) => ({
          title: `Avoid: ${promise.title}`,
          start_time: '20:00:00',
          end_time: '20:15:00',
          category: 'personal',
          description: `Daily rule: ${promise.title}`,
          task_date: startDate,
          priority: 3,
          all_day: false,
          repeat_rule: 'daily',
          repeat_until: null,
          repeat_days: [],
          telegram_reminder: true,
          reminder_minutes_before: 30,
          estimated_duration_minutes: 15,
          color_code: '#EF4444'
        }))
      ]

      // Combine all tasks
      const allTasks = [...timetableTasks, ...promiseTasks]

      // If no tasks, create a default task
      if (allTasks.length === 0) {
        allTasks.push({
          title: 'Plan Task',
          start_time: '09:00:00',
          end_time: '10:00:00',
          category: 'other',
          description: 'Default task for plan',
          task_date: startDate,
          priority: 3,
          all_day: false,
          repeat_rule: 'none',
          repeat_until: null,
          repeat_days: [],
          telegram_reminder: false,
          reminder_minutes_before: 15,
          estimated_duration_minutes: 60,
          color_code: '#3B82F6'
        })
      }

      console.log('Creating plan for user:', userId)

      // Call your API route
      const response = await fetch('/api/plans/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          title: config.title,
          description: config.description || 'No description',
          start_date: startDate,
          duration_days: config.duration_days,
          tasks: allTasks
        })
      })

      const result = await response.json()

      console.log('API Response:', result)

      if (result.success) {
        // Redirect to success page with plan ID
        router.push(`/plan-created/${result.plan_id}`)
      } else {
        alert(`❌ Error: ${result.message}\n${result.details ? `Details: ${result.details}` : ''}`)
      }
    } catch (error) {
      console.error('Failed to create plan:', error)
      alert(`Failed to create plan: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function for category colors
  const getColorForCategory = (category) => {
    const colors = {
      work: '#3B82F6', // Blue
      personal: '#10B981', // Green
      health: '#EF4444', // Red
      learning: '#8B5CF6', // Purple
      leisure: '#F59E0B', // Amber
      other: '#6B7280' // Gray
    }
    return colors[category] || '#3B82F6'
  }

  // Get total tasks count
  const totalTasks = config.timetable.length + config.promisesDo.length + config.promisesDont.length

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Create Your Daily Plan</h1>
          <p className="text-gray-600">Build your perfect daily routine with schedules and promises</p>
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              Creating plan for <span className="font-semibold">{user?.email?.split('@')[0]}</span>
            </span>
          </div>
        </div>

        {/* ... rest of the component remains the same ... */}
      </div>
    </div>
  )
}