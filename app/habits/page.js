// /app/habits/page.js
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Plus, Trophy, Flame, Calendar, Target } from 'lucide-react'

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'health',
    target_frequency: 'daily'
  })

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setHabits(data)
    }
    setLoading(false)
  }

  const handleCreateHabit = async (e) => {
    e.preventDefault()
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: newHabit.name,
        description: newHabit.description,
        category: newHabit.category,
        target_frequency: newHabit.target_frequency
      })
      .select()
      .single()

    if (!error && data) {
      setHabits([data, ...habits])
      setNewHabit({ name: '', description: '', category: 'health', target_frequency: 'daily' })
      setShowForm(false)
    }
  }

  const markHabitComplete = async (habitId) => {
    // Implement habit completion logic
    console.log('Mark habit complete:', habitId)
  }

  const getCategoryColor = (category) => {
    const colors = {
      health: 'bg-red-100 text-red-800',
      learning: 'bg-purple-100 text-purple-800',
      productivity: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      financial: 'bg-yellow-100 text-yellow-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
              <p className="text-gray-600">Build positive habits and break bad ones</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>New Habit</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Habits</p>
                  <p className="text-2xl font-bold text-gray-900">{habits.length}</p>
                </div>
                <Target className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...habits.map(h => h.current_streak), 0)} days
                  </p>
                </div>
                <Flame className="text-orange-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Best Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...habits.map(h => h.best_streak), 0)} days
                  </p>
                </div>
                <Trophy className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">76%</p>
                </div>
                <Calendar className="text-green-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Create Habit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Habit</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateHabit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  placeholder="e.g., Morning Meditation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  placeholder="Describe your habit..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="productivity">Productivity</option>
                    <option value="personal">Personal</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Frequency
                  </label>
                  <select
                    value={newHabit.target_frequency}
                    onChange={(e) => setNewHabit({...newHabit, target_frequency: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Habits List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${getCategoryColor(habit.category)}`}>
                  {habit.category}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Current Streak</span>
                    <span className="font-semibold text-gray-700">{habit.current_streak} days</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                      style={{ width: `${Math.min(habit.current_streak * 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500">Best: </span>
                    <span className="font-semibold text-gray-700">{habit.best_streak} days</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Target: </span>
                    <span className="font-semibold text-gray-700 capitalize">{habit.target_frequency}</span>
                  </div>
                </div>

                <button
                  onClick={() => markHabitComplete(habit.id)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700"
                >
                  Mark Complete Today
                </button>
              </div>
            </div>
          ))}

          {habits.length === 0 && !showForm && (
            <div className="col-span-full text-center py-12">
              <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                <span className="text-4xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No habits yet</h3>
              <p className="text-gray-500 mb-6">Start building your first habit to see it here</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700"
              >
                Create Your First Habit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}