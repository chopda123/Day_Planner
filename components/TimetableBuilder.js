// components/TimetableBuilder.js
'use client'

import { useState } from 'react'

export default function TimetableBuilder({ config, onChange }) {
  const [newEntry, setNewEntry] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'work',
    days: []
  })

  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ]

  const categories = [
    { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800' },
    { value: 'personal', label: 'Personal', color: 'bg-green-100 text-green-800' },
    { value: 'health', label: 'Health', color: 'bg-red-100 text-red-800' },
    { value: 'learning', label: 'Learning', color: 'bg-purple-100 text-purple-800' },
    { value: 'leisure', label: 'Leisure', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ]

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`
        options.push(time)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const toggleDay = (dayId) => {
    setNewEntry(prev => ({
      ...prev,
      days: prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId)
        : [...prev.days, dayId]
    }))
  }

  const addEntry = () => {
    if (!newEntry.title.trim() || newEntry.days.length === 0) {
      alert('Please enter a title and select at least one day')
      return
    }

    if (newEntry.startTime >= newEntry.endTime) {
      alert('End time must be after start time')
      return
    }

    onChange({
      ...config,
      timetable: [...config.timetable, { ...newEntry }]
    })

    // Reset form
    setNewEntry({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      days: []
    })
  }

  const removeEntry = (index) => {
    onChange({
      ...config,
      timetable: config.timetable.filter((_, i) => i !== index)
    })
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-gray-800">Create Your Weekly Schedule</h3>

      {/* Add New Entry Form */}
      <div className="bg-gray-50 p-6 rounded-xl space-y-4">
        <h4 className="font-semibold text-gray-800">Add New Schedule Entry</h4>
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Title *
          </label>
          <input
            type="text"
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            placeholder="e.g., Morning Workout, Study Session"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <select
              value={newEntry.startTime}
              onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>{formatTime(time)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <select
              value={newEntry.endTime}
              onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {timeOptions.map(time => (
                <option key={time} value={time}>{formatTime(time)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                type="button"
                onClick={() => setNewEntry({ ...newEntry, category: category.value })}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${newEntry.category === category.value
                    ? `${category.color} border-2 border-gray-800`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Days of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repeat on Days *
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${newEntry.days.includes(day.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Selected: {newEntry.days.length} day{newEntry.days.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={addEntry}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Add to Schedule
        </button>
      </div>

      {/* Current Schedule */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800">Your Weekly Schedule</h4>
          <span className="text-sm text-gray-500">
            {config.timetable.length} entr{config.timetable.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {config.timetable.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-600">No schedule entries yet</p>
            <p className="text-sm text-gray-500 mt-1">Add your first entry above</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {config.timetable.map((entry, index) => {
              const category = categories.find(c => c.value === entry.category)
              return (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${category?.color || 'bg-gray-100 text-gray-800'}`}>
                          {category?.label || 'Other'}
                        </span>
                        <h5 className="font-semibold text-gray-800">{entry.title}</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.days.map(dayId => {
                          const day = daysOfWeek.find(d => d.id === dayId)
                          return (
                            <span key={dayId} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {day?.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => removeEntry(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}