'use client'

import { useState } from 'react'

export default function PromiseBuilder({ config, onChange }) {
  const [newDoPromise, setNewDoPromise] = useState('')
  const [newDontPromise, setNewDontPromise] = useState('')

  const addDoPromise = () => {
    if (!newDoPromise.trim()) return
    onChange({
      ...config,
      promisesDo: [...config.promisesDo, { title: newDoPromise }]
    })
    setNewDoPromise('')
  }

  const addDontPromise = () => {
    if (!newDontPromise.trim()) return
    onChange({
      ...config,
      promisesDont: [...config.promisesDont, { title: newDontPromise }]
    })
    setNewDontPromise('')
  }

  const removePromise = (type, index) => {
    if (type === 'do') {
      onChange({
        ...config,
        promisesDo: config.promisesDo.filter((_, i) => i !== index)
      })
    } else {
      onChange({
        ...config,
        promisesDont: config.promisesDont.filter((_, i) => i !== index)
      })
    }
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-gray-800">Define Your Promises</h3>

      {/* Things I WILL Do */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-green-700">✅ Things I WILL Do Daily</h4>
          <span className="text-sm text-gray-500">{config.promisesDo.length} added</span>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newDoPromise}
            onChange={(e) => setNewDoPromise(e.target.value)}
            placeholder="e.g., Exercise for 30 minutes"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addDoPromise()}
          />
          <button
            onClick={addDoPromise}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {config.promisesDo.map((promise, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">{promise.title}</span>
              <button
                onClick={() => removePromise('do', index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Things I WON'T Do */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-red-700">🚫 Things I WON'T Do</h4>
          <span className="text-sm text-gray-500">{config.promisesDont.length} added</span>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newDontPromise}
            onChange={(e) => setNewDontPromise(e.target.value)}
            placeholder="e.g., Don't check phone first hour after waking"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addDontPromise()}
          />
          <button
            onClick={addDontPromise}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Add
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {config.promisesDont.map((promise, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-red-800">{promise.title}</span>
              <button
                onClick={() => removePromise('dont', index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}