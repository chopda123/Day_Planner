// /app/today/page.js
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function TodayPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodayTasks()
  }, [])

  const fetchTodayTasks = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_date', today)
      .order('start_time', { ascending: true })

    if (!error && data) {
      setTasks(data)
    }
    setLoading(false)
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Today's Schedule</h1>
          <p className="text-gray-600">{today}</p>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks scheduled for today</h3>
            <p className="text-gray-500">Enjoy your free day or create a plan!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow p-6 border-l-4" style={{ borderLeftColor: task.color_code || '#3B82F6' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                    <p className="text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {task.category}
                      </span>
                      <span className="text-gray-500">
                        ⏰ {formatTime(task.start_time)} - {formatTime(task.end_time)}
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}