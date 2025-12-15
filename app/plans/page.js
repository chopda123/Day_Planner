// /app/plans/page.js
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPlans(data)
    }
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Plans</h1>
          <a 
            href="/create-plan" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create New Plan
          </a>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No plans yet</h3>
            <p className="text-gray-500 mb-6">Create your first plan to get started</p>
            <a 
              href="/create-plan" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Plan
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl shadow p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{plan.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    plan.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📅 Start: {new Date(plan.start_date).toLocaleDateString()}</p>
                  <p>⏱️ Duration: {plan.duration_days} days</p>
                  <p>📝 Type: {plan.plan_type}</p>
                </div>
                <div className="mt-6 flex justify-between">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Edit
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