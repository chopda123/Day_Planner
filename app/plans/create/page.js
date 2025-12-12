'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PlanDurationSelector from '@/components/PlanDurationSelector'
import PromiseBuilder from '@/components/PromiseBuilder'
import TimetableBuilder from '@/components/TimetableBuilder'

export default function CreatePlanPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  // Plan configuration
  const [planConfig, setPlanConfig] = useState({
    title: 'My Self-Build Plan',
    description: '',
    durationMonths: 1,
    startDate: new Date().toISOString().split('T')[0],
    promisesDo: [],
    promisesDont: [],
    timetable: []
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const handleCreatePlan = async () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      // 1. Create the plan
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          title: planConfig.title,
          description: planConfig.description,
          start_date: planConfig.startDate,
          duration_days: planConfig.durationMonths * 30,
          status: 'active'
        })
        .select()
        .single()

      if (planError) throw planError

      // 2. Create promises
      const promises = [
        ...planConfig.promisesDo.map(p => ({
          user_id: user.id,
          title: p.title,
          description: p.description,
          frequency: 'daily',
          is_active: true
        })),
        ...planConfig.promisesDont.map(p => ({
          user_id: user.id,
          title: p.title,
          description: p.description,
          severity: 'medium',
          is_active: true
        }))
      ]

      if (promises.length > 0) {
        const { error: promisesError } = await supabase
          .from('user_promises_do')
          .insert(promises.filter(p => !p.severity))

        if (promisesError) throw promisesError

        const { error: dontError } = await supabase
          .from('user_promises_dont')
          .insert(promises.filter(p => p.severity))

        if (dontError) throw dontError
      }

      // 3. Create timetable entries
      if (planConfig.timetable.length > 0) {
        const timetableEntries = planConfig.timetable.flatMap(item => 
          item.days.map(day => ({
            user_id: user.id,
            day_of_week: day,
            start_time: item.startTime,
            end_time: item.endTime,
            title: item.title,
            category: item.category || 'other'
          }))
        )

        const { error: timetableError } = await supabase
          .from('daily_timetable')
          .insert(timetableEntries)

        if (timetableError) throw timetableError
      }

      alert('✅ Plan created successfully!')
      router.push('/dashboard')

    } catch (error) {
      console.error('Error creating plan:', error)
      alert('Failed to create plan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Plan Duration', description: 'Set how long you want to build discipline' },
    { number: 2, title: 'Promises', description: 'Define what you will and won\'t do' },
    { number: 3, title: 'Schedule', description: 'Create your daily timetable' },
    { number: 4, title: 'Review', description: 'Finalize and start your plan' }
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Self-Build Plan</h1>
          <p className="text-gray-600 mt-2">Build discipline step by step</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((s) => (
              <div key={s.number} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s.number}
                </div>
                <p className="text-xs mt-1 text-center">{s.title}</p>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {step === 1 && (
            <PlanDurationSelector
              config={planConfig}
              onChange={setPlanConfig}
            />
          )}

          {step === 2 && (
            <PromiseBuilder
              config={planConfig}
              onChange={setPlanConfig}
            />
          )}

          {step === 3 && (
            <TimetableBuilder
              config={planConfig}
              onChange={setPlanConfig}
            />
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Review Your Plan</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700">Plan Details</h4>
                  <p className="text-sm text-gray-600">Duration: {planConfig.durationMonths} month(s)</p>
                  <p className="text-sm text-gray-600">Start Date: {new Date(planConfig.startDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700">Promises</h4>
                  <p className="text-sm text-gray-600">Will Do: {planConfig.promisesDo.length}</p>
                  <p className="text-sm text-gray-600">Won't Do: {planConfig.promisesDont.length}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700">Weekly Schedule</h4>
                <p className="text-sm text-gray-600">Scheduled items: {planConfig.timetable.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          
          {step < 4 ? (
            <button
              onClick={() => setStep(Math.min(4, step + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreatePlan}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Start My Plan!'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}