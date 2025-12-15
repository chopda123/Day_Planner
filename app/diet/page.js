// /app/diet/page.js
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Plus, Apple, Flame, Clock, Calendar } from 'lucide-react'

export default function DietPage() {
  const [dietPlans, setDietPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newMeal, setNewMeal] = useState({
    meal_type: 'breakfast',
    name: '',
    description: '',
    calories: 0,
    time_of_day: '08:00',
    days_of_week: []
  })

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🍎' }
  ]

  const daysOfWeek = [
    { id: 0, label: 'Sunday', short: 'Sun' },
    { id: 1, label: 'Monday', short: 'Mon' },
    { id: 2, label: 'Tuesday', short: 'Tue' },
    { id: 3, label: 'Wednesday', short: 'Wed' },
    { id: 4, label: 'Thursday', short: 'Thu' },
    { id: 5, label: 'Friday', short: 'Fri' },
    { id: 6, label: 'Saturday', short: 'Sat' }
  ]

  useEffect(() => {
    fetchDietPlans()
  }, [])

  const fetchDietPlans = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('time_of_day', { ascending: true })

    if (!error && data) {
      setDietPlans(data)
    }
    setLoading(false)
  }

  const handleCreateMeal = async (e) => {
    e.preventDefault()
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('diet_plans')
      .insert({
        user_id: user.id,
        ...newMeal
      })
      .select()
      .single()

    if (!error && data) {
      setDietPlans([...dietPlans, data].sort((a, b) => a.time_of_day.localeCompare(b.time_of_day)))
      setNewMeal({
        meal_type: 'breakfast',
        name: '',
        description: '',
        calories: 0,
        time_of_day: '08:00',
        days_of_week: []
      })
      setShowForm(false)
    }
  }

  const toggleDayOfWeek = (dayId) => {
    setNewMeal(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayId)
        ? prev.days_of_week.filter(d => d !== dayId)
        : [...prev.days_of_week, dayId]
    }))
  }

  const calculateTotalCalories = () => {
    return dietPlans.reduce((total, meal) => total + (meal.calories || 0), 0)
  }

  const getMealsByType = (type) => {
    return dietPlans.filter(meal => meal.meal_type === type)
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
              <h1 className="text-3xl font-bold text-gray-900">Diet Planner</h1>
              <p className="text-gray-600">Plan your meals and track nutrition</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Meal</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Meals</p>
                  <p className="text-2xl font-bold text-gray-900">{dietPlans.length}</p>
                </div>
                <Apple className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Daily Calories</p>
                  <p className="text-2xl font-bold text-gray-900">{calculateTotalCalories()}</p>
                </div>
                <Flame className="text-orange-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Next Meal</p>
                  <p className="text-2xl font-bold text-gray-900">2 hrs</p>
                </div>
                <Clock className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Adherence</p>
                  <p className="text-2xl font-bold text-gray-900">88%</p>
                </div>
                <Calendar className="text-purple-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Create Meal Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Meal</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateMeal} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {mealTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewMeal({...newMeal, meal_type: type.value})}
                      className={`p-4 rounded-lg text-center transition ${
                        newMeal.meal_type === type.value
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Name *
                </label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                  placeholder="e.g., Oatmeal with Fruits"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newMeal.description}
                  onChange={(e) => setNewMeal({...newMeal, description: e.target.value})}
                  placeholder="Describe the meal..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({...newMeal, calories: parseInt(e.target.value) || 0})}
                    placeholder="300"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time of Day
                  </label>
                  <select
                    value={newMeal.time_of_day}
                    onChange={(e) => setNewMeal({...newMeal, time_of_day: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return [`${hour}:00`, `${hour}:30`]
                    }).flat().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Week (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDayOfWeek(day.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        newMeal.days_of_week.includes(day.id)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {newMeal.days_of_week.length === 0 
                    ? 'Will appear every day' 
                    : `Selected: ${newMeal.days_of_week.length} days`}
                </p>
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
                  Add Meal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Diet Plan by Meal Type */}
        <div className="space-y-8">
          {mealTypes.map(type => {
            const meals = getMealsByType(type.value)
            if (meals.length === 0) return null

            return (
              <div key={type.value} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <h2 className="text-xl font-bold text-gray-900">{type.label}</h2>
                    <span className="px-3 py-1 bg-white text-green-700 text-sm font-medium rounded-full">
                      {meals.length} meals
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {meals.map(meal => (
                      <div key={meal.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div>
                          <h3 className="font-semibold text-gray-900">{meal.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              ⏰ {meal.time_of_day}
                            </span>
                            <span className="text-sm text-gray-500">
                              🔥 {meal.calories || 0} cal
                            </span>
                            {meal.days_of_week && meal.days_of_week.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="text-sm text-gray-500">📅</span>
                                {meal.days_of_week.map(dayId => {
                                  const day = daysOfWeek.find(d => d.id === dayId)
                                  return (
                                    <span key={dayId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {day?.short}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-500 hover:text-gray-700">
                            ✏️
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-600">
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          {dietPlans.length === 0 && !showForm && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                <span className="text-4xl">🥗</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No diet plans yet</h3>
              <p className="text-gray-500 mb-6">Plan your meals to maintain a healthy diet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700"
              >
                Plan Your First Meal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}