

'use client'

import { useState, useEffect, useRef } from 'react'
import Timeline from '@/components/Timeline'
import TaskForm from '@/components/TaskForm'
import TelegramConnect from '@/components/TelegramConnect'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [showTelegramModal, setShowTelegramModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTask, setActiveTask] = useState(null)
  const [viewMode, setViewMode] = useState('timeline')
  const [user, setUser] = useState(null)
  const [userId, setUserId] = useState(null)
  const [telegramLinked, setTelegramLinked] = useState(false)
  const timelineRef = useRef(null)
  const router = useRouter()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth error:', error)
          router.push('/auth/login')
          return
        }
        
        if (user) {
          setUser(user)
          setUserId(user.id)
          await checkTelegramLink(user.id)
          await loadUserTasks(user.id)
          
          // Ensure user has a profile before adding tasks
          await ensureUserProfile(user.id, user.email)
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Error getting user:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }
    getUser()
  }, [router])

  // Ensure user has a profile in the database
  const ensureUserProfile = async (userId, email) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      // If profile doesn't exist, create one
      if (error && error.code === 'PGRST116') { // PGRST116 = no rows returned
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        } else {
          console.log('User profile created successfully')
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  const checkTelegramLink = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('telegram_links')
        .select('chat_id')
        .eq('user_id', userId)
        .eq('verified', true)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking Telegram link:', error)
      }
      
      setTelegramLinked(!!data)
    } catch (error) {
      console.error('Error in checkTelegramLink:', error)
    }
  }

  const loadUserTasks = async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      console.log('Loading tasks for user:', userId, 'date:', today)
      
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('task_date', today)
        .order('start_time')
      
      if (error) {
        console.error('Supabase error loading tasks:', error)
        throw error
      }
      
      // Format tasks for Timeline component
      const formattedTasks = (tasksData || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        startTime: task.start_time,
        endTime: task.end_time,
        category: task.category || 'other',
        telegramReminder: task.telegram_reminder,
        completed: task.status === 'completed'
      }))
      
      console.log('Loaded tasks:', formattedTasks.length)
      setTasks(formattedTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
      alert('Failed to load tasks: ' + error.message)
    }
  }

  const handleAddTask = async (newTask) => {
    if (!userId) {
      alert('Please sign in to add tasks')
      router.push('/auth/login')
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      
      console.log('Adding task:', {
        userId,
        title: newTask.title,
        startTime: newTask.startTime,
        endTime: newTask.endTime,
        date: today
      })
      
      // Validate times
      if (newTask.startTime >= newTask.endTime) {
        alert('End time must be after start time')
        return
      }

      // Prepare task data
      const taskData = {
        user_id: userId,
        title: newTask.title,
        description: newTask.description || '',
        start_time: newTask.startTime + ':00', // Ensure HH:MM:SS format
        end_time: newTask.endTime + ':00',
        task_date: today,
        category: newTask.category || 'other',
        telegram_reminder: Boolean(newTask.telegramReminder),
        status: 'pending',
        created_at: new Date().toISOString()
      }

      console.log('Task data to insert:', taskData)

      // Insert task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (taskError) {
        console.error('Supabase task insert error:', taskError)
        throw new Error(`Failed to create task: ${taskError.message}`)
      }

      console.log('Task created successfully:', task)

      // Create reminder if enabled
      if (newTask.telegramReminder && task.id) {
        try {
          const remindAt = calculateReminderTime(today, newTask.startTime, 15)
          console.log('Creating reminder for task:', task.id, 'at:', remindAt)
          
          const reminderData = {
            task_id: task.id,
            user_id: userId,
            remind_at: remindAt,
            original_remind_at: remindAt,
            reminder_type: 'telegram',
            sent: false
          }

          const { error: reminderError } = await supabase
            .from('reminders')
            .insert(reminderData)

          if (reminderError) {
            console.error('Failed to create reminder:', reminderError)
            // Continue even if reminder fails
          } else {
            console.log('Reminder created successfully')
          }
        } catch (reminderErr) {
          console.error('Error creating reminder:', reminderErr)
          // Don't fail the whole task if reminder fails
        }
      }

      // Reload tasks
      await loadUserTasks(userId)
      
      // Scroll to show new task
      setTimeout(() => {
        if (timelineRef.current) {
          const taskElement = document.getElementById(`task-${task.id}`)
          if (taskElement) {
            taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }, 100)

      alert('✅ Task added successfully!')
      
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Failed to add task: ' + (error.message || 'Unknown error'))
    }
  }

  const calculateReminderTime = (date, time, minutesBefore = 15) => {
    const [hours, minutes] = time.split(':').map(Number)
    const taskDateTime = new Date(date)
    taskDateTime.setHours(hours, minutes, 0, 0)
    
    const remindAt = new Date(taskDateTime.getTime() - minutesBefore * 60000)
    return remindAt.toISOString()
  }

  const handleTaskClick = (task) => {
    setActiveTask(task)
    // Show task details in a modal (simplified for now)
    alert(`Task Details:\n\n📝 ${task.title}\n🕒 ${formatTime(task.startTime)} - ${formatTime(task.endTime)}`)
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleToggleComplete = async (taskId) => {
    if (!userId) {
      alert('Please sign in to update tasks')
      return
    }

    try {
      const task = tasks.find(t => t.id === taskId)
      const newStatus = task?.completed ? 'pending' : 'completed'
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId)
        .eq('user_id', userId) // Security check
      
      if (error) throw error
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: newStatus === 'completed' } : task
      ))
      
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task: ' + error.message)
    }
  }

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const tasksWithReminder = tasks.filter(task => task.telegramReminder).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Life Discipline Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {user ? `Welcome back, ${user.email}` : 'Plan your perfect day'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {viewMode === 'timeline' ? '📋 List View' : '📅 Timeline View'}
              </button>
              <button
                onClick={() => setShowTelegramModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <span className="mr-2">{telegramLinked ? '✅' : '🔔'}</span>
                {telegramLinked ? 'Telegram Connected' : 'Connect Telegram'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Task Form & Controls */}
          <div className="lg:w-1/3 space-y-6">
            <TaskForm onTaskAdded={handleAddTask} />
            
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-3">Today's Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-medium">{totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">{completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium">{totalTasks - completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telegram Reminders</span>
                  <span className="font-medium text-blue-600">{tasksWithReminder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:w-2/3" ref={timelineRef}>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewMode === 'timeline' ? 'Today\'s Timeline' : 'Task List'}
              </h2>
              <div className="text-sm text-gray-600">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} scheduled
              </div>
            </div>

            {viewMode === 'timeline' ? (
              <Timeline tasks={tasks} onTaskClick={handleTaskClick} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">📅</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks yet</h3>
                      <p className="text-gray-600">Add your first task using the form on the left!</p>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div 
                        key={task.id}
                        className={`p-4 rounded-lg border ${task.completed ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'} hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleComplete(task.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
                            >
                              {task.completed && '✓'}
                            </button>
                            <div>
                              <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {task.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatTime(task.startTime)} - {formatTime(task.endTime)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {task.telegramReminder && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                🔔 Reminder
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Telegram Connect Modal */}
      {showTelegramModal && (
        <TelegramConnect 
          onClose={() => setShowTelegramModal(false)} 
          userId={userId}
          onSuccess={() => {
            setTelegramLinked(true)
            setShowTelegramModal(false)
          }}
        />
      )}
    </div>
  )
}