// /app/medicines/page.js
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Plus, Pill, Clock, Calendar, Bell } from 'lucide-react'

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    schedule_type: 'daily',
    time_of_day: [],
    days_of_week: [],
    reminder_minutes_before: 5,
    is_active: true
  })

  const timeOptions = [
    'Morning (8:00 AM)',
    'Afternoon (1:00 PM)', 
    'Evening (6:00 PM)',
    'Night (10:00 PM)'
  ]

  const daysOfWeek = [
    { id: 0, label: 'Sunday' },
    { id: 1, label: 'Monday' },
    { id: 2, label: 'Tuesday' },
    { id: 3, label: 'Wednesday' },
    { id: 4, label: 'Thursday' },
    { id: 5, label: 'Friday' },
    { id: 6, label: 'Saturday' }
  ]

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMedicines(data)
    }
    setLoading(false)
  }

  const handleCreateMedicine = async (e) => {
    e.preventDefault()
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('medicines')
      .insert({
        user_id: user.id,
        ...newMedicine
      })
      .select()
      .single()

    if (!error && data) {
      setMedicines([data, ...medicines])
      setNewMedicine({
        name: '',
        dosage: '',
        schedule_type: 'daily',
        time_of_day: [],
        days_of_week: [],
        reminder_minutes_before: 5,
        is_active: true
      })
      setShowForm(false)
    }
  }

  const toggleTimeOfDay = (time) => {
    setNewMedicine(prev => ({
      ...prev,
      time_of_day: prev.time_of_day.includes(time)
        ? prev.time_of_day.filter(t => t !== time)
        : [...prev.time_of_day, time]
    }))
  }

  const toggleDayOfWeek = (dayId) => {
    setNewMedicine(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayId)
        ? prev.days_of_week.filter(d => d !== dayId)
        : [...prev.days_of_week, dayId]
    }))
  }

  const getNextDoseTime = (medicine) => {
    // Implement logic to calculate next dose time
    return '8:00 AM tomorrow'
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
              <h1 className="text-3xl font-bold text-gray-900">Medicine Tracker</h1>
              <p className="text-gray-600">Never miss a dose with smart reminders</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Medicine</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Medicines</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {medicines.filter(m => m.is_active).length}
                  </p>
                </div>
                <Pill className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Daily Doses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {medicines.reduce((total, med) => total + (med.time_of_day?.length || 0), 0)}
                  </p>
                </div>
                <Clock className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Adherence Rate</p>
                  <p className="text-2xl font-bold text-gray-900">94%</p>
                </div>
                <Calendar className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Next Dose</p>
                  <p className="text-2xl font-bold text-gray-900">2 hrs</p>
                </div>
                <Bell className="text-orange-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Create Medicine Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Medicine</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateMedicine} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    placeholder="e.g., Aspirin"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                    placeholder="e.g., 500mg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Type
                </label>
                <select
                  value={newMedicine.schedule_type}
                  onChange={(e) => setNewMedicine({...newMedicine, schedule_type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="specific">Specific Days</option>
                </select>
              </div>

              {newMedicine.schedule_type === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDayOfWeek(day.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          newMedicine.days_of_week.includes(day.id)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {day.label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Day *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeOptions.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => toggleTimeOfDay(time)}
                      className={`p-3 rounded-lg text-center transition ${
                        newMedicine.time_of_day.includes(time)
                          ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Before
                </label>
                <select
                  value={newMedicine.reminder_minutes_before}
                  onChange={(e) => setNewMedicine({...newMedicine, reminder_minutes_before: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="5">5 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newMedicine.is_active}
                  onChange={(e) => setNewMedicine({...newMedicine, is_active: e.target.checked})}
                  className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Activate reminders immediately
                </label>
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
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Medicines List */}
        <div className="space-y-4">
          {medicines.map((medicine) => (
            <div key={medicine.id} className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-gray-900">{medicine.name}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      medicine.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {medicine.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 mt-1">Dosage: {medicine.dosage}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Next: {getNextDoseTime(medicine)}
                  </span>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    ⚙️
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Schedule</p>
                  <p className="font-medium text-gray-900 capitalize">{medicine.schedule_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Times</p>
                  <div className="flex flex-wrap gap-1">
                    {medicine.time_of_day?.map((time, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reminder</p>
                  <p className="font-medium text-gray-900">
                    {medicine.reminder_minutes_before} minutes before
                  </p>
                </div>
              </div>
            </div>
          ))}

          {medicines.length === 0 && !showForm && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                <span className="text-4xl">💊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No medicines added</h3>
              <p className="text-gray-500 mb-6">Add your first medicine to get started with reminders</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700"
              >
                Add Your First Medicine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}