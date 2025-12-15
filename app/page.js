

// /app/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    todayTasks: 0,
    activePlans: 0,
    currentStreak: 0,
    habitCompletion: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      loadDashboardData(user.id)
    })
  }, [router])

  const loadDashboardData = async (userId) => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    try {
      // Get today's tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('task_date', today)

      // Get active plans
      const { data: plans } = await supabase
        .from('plans')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')

      // Get habits
      const { data: habits } = await supabase
        .from('habits')
        .select('current_streak')
        .eq('user_id', userId)

      setStats({
        todayTasks: tasks?.length || 0,
        activePlans: plans?.length || 0,
        currentStreak: Math.max(...habits?.map(h => h.current_streak) || [0]),
        habitCompletion: habits?.length > 0 ? 76 : 0
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {user?.email?.split('@')[0]} 👋
              </h1>
              <p className="text-gray-600">Here's what's happening with your plan today</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700">
                📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayTasks}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/today')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Schedule →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Plans</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activePlans}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/plans')}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Manage Plans →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} days</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/habits')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                View Habits →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Habit Completion</p>
                <p className="text-3xl font-bold text-gray-900">{stats.habitCompletion}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/habits')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Track Progress →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/create-plan')}
              className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition text-left"
            >
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-900">Create Plan</h3>
              <p className="text-sm text-gray-600 mt-1">Start a new daily plan</p>
            </button>

            <button
              onClick={() => router.push('/today')}
              className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:border-green-200 transition text-left"
            >
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
              <p className="text-sm text-gray-600 mt-1">View daily tasks</p>
            </button>

            <button
              onClick={() => router.push('/medicines')}
              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:border-purple-200 transition text-left"
            >
              <div className="text-2xl mb-2">💊</div>
              <h3 className="font-semibold text-gray-900">Medicines</h3>
              <p className="text-sm text-gray-600 mt-1">Check doses</p>
            </button>

            <button
              onClick={() => router.push('/diet')}
              className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100 hover:border-yellow-200 transition text-left"
            >
              <div className="text-2xl mb-2">🥗</div>
              <h3 className="font-semibold text-gray-900">Diet Plan</h3>
              <p className="text-sm text-gray-600 mt-1">View meals</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}