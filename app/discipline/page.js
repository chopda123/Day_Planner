



'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DisciplineDashboard() {
  const [activeTab, setActiveTab] = useState('promises')
  const [user, setUser] = useState(null)
  const [dontPromises, setDontPromises] = useState([])
  const [doPromises, setDoPromises] = useState([])
  const [timetable, setTimetable] = useState([])
  const [medicines, setMedicines] = useState([])
  const [checkins, setCheckins] = useState([])
  const [partners, setPartners] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [newDontTitle, setNewDontTitle] = useState('')
  const [newDoTitle, setNewDoTitle] = useState('')
  const [newPartner, setNewPartner] = useState({ name: '', method: 'telegram', info: '' })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      // Load all data in parallel
      await Promise.all([
        loadDontPromises(user.id),
        loadDoPromises(user.id),
        loadTimetable(user.id),
        loadMedicines(user.id),
        loadCheckins(user.id),
        loadPartners(user.id),
        loadReports(user.id)
      ])
    }
    
    setLoading(false)
  }

  const loadDontPromises = async (userId) => {
    const { data } = await supabase
      .from('user_promises_dont')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setDontPromises(data || [])
  }

  const loadDoPromises = async (userId) => {
    const { data } = await supabase
      .from('user_promises_do')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setDoPromises(data || [])
  }

  const loadTimetable = async (userId) => {
    const dayOfWeek = new Date().getDay()
    const { data } = await supabase
      .from('daily_timetable')
      .select('*')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
      .order('start_time')
    setTimetable(data || [])
  }

  const loadMedicines = async (userId) => {
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
    setMedicines(data || [])
  }

  const loadCheckins = async (userId) => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('checkin_date', today)
    setCheckins(data || [])
  }

  const loadPartners = async (userId) => {
    const { data } = await supabase
      .from('accountability_partners')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
    setPartners(data || [])
  }

  const loadReports = async (userId) => {
    const { data } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(5)
    setReports(data || [])
  }

  const addDontPromise = async () => {
    if (!newDontTitle.trim() || !user) return
    
    const { error } = await supabase
      .from('user_promises_dont')
      .insert({
        user_id: user.id,
        title: newDontTitle,
        severity: 'medium'
      })
    
    if (!error) {
      setNewDontTitle('')
      await loadDontPromises(user.id)
    }
  }

  const addDoPromise = async () => {
    if (!newDoTitle.trim() || !user) return
    
    const { error } = await supabase
      .from('user_promises_do')
      .insert({
        user_id: user.id,
        title: newDoTitle,
        frequency: 'daily'
      })
    
    if (!error) {
      setNewDoTitle('')
      await loadDoPromises(user.id)
    }
  }

  const addPartner = async () => {
    if (!newPartner.name.trim() || !newPartner.info.trim() || !user) return
    
    const { error } = await supabase
      .from('accountability_partners')
      .insert({
        user_id: user.id,
        partner_name: newPartner.name,
        contact_method: newPartner.method,
        contact_info: newPartner.info
      })
    
    if (!error) {
      setNewPartner({ name: '', method: 'telegram', info: '' })
      await loadPartners(user.id)
    }
  }

  const handleCheckinResponse = async (questionNum, response) => {
    if (!user) return
    
    const today = new Date().toISOString().split('T')[0]
    
    // Check if checkin exists
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .single()
    
    const updateData = {
      user_id: user.id,
      checkin_date: today,
      [`question_${questionNum}_response`]: response
    }
    
    if (existing) {
      await supabase
        .from('daily_checkins')
        .update(updateData)
        .eq('id', existing.id)
    } else {
      await supabase
        .from('daily_checkins')
        .insert(updateData)
    }
    
    await loadCheckins(user.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your discipline system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Life Discipline System
              </h1>
              <p className="text-gray-400 mt-1">Rebuild yourself with daily commitment</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-2 mt-6 overflow-x-auto">
            {['promises', 'timetable', 'medicines', 'checklist', 'partners', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${activeTab === tab 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Promises Tab */}
        {activeTab === 'promises' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Things I Will NOT Do */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-red-500/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-red-400">🚫 Things I Will NOT Do</h2>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={newDontTitle}
                  onChange={(e) => setNewDontTitle(e.target.value)}
                  placeholder="Add a new 'I will not...' promise"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && addDontPromise()}
                />
                <button
                  onClick={addDontPromise}
                  className="mt-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
                >
                  Add Promise
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dontPromises.map((promise) => (
                  <div key={promise.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{promise.title}</h3>
                        {promise.description && (
                          <p className="text-gray-400 text-sm mt-1">{promise.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Things I MUST Do */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400">✅ Things I MUST Do</h2>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={newDoTitle}
                  onChange={(e) => setNewDoTitle(e.target.value)}
                  placeholder="Add a new 'I must...' promise"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && addDoPromise()}
                />
                <button
                  onClick={addDoPromise}
                  className="mt-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                >
                  Add Promise
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {doPromises.map((promise) => (
                  <div key={promise.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{promise.title}</h3>
                        {promise.description && (
                          <p className="text-gray-400 text-sm mt-1">{promise.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">📋 Daily Check-in</h2>
            
            <div className="space-y-4">
              {[
                'Did you follow your timetable today?',
                'Did you avoid all bad habits?',
                'Did you follow all good habits?',
                'Did you take your medicines?',
                'Did you study as per plan?',
                'Did you eat according to diet?',
                'Did you read today?',
                'Did you work out?'
              ].map((question, index) => {
                const checkin = checkins[0]
                const response = checkin?.[`question_${index + 1}_response`]
                
                return (
                  <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <p className="mb-3">{question}</p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleCheckinResponse(index + 1, true)}
                        className={`px-4 py-2 rounded-lg ${response === true ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                      >
                        ✅ Yes
                      </button>
                      <button
                        onClick={() => handleCheckinResponse(index + 1, false)}
                        className={`px-4 py-2 rounded-lg ${response === false ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                      >
                        ❌ No
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-yellow-500/30 p-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">👥 Accountability Partners</h2>
            
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
              <h3 className="font-semibold mb-3">Add New Partner</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                  placeholder="Partner Name"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                />
                <select
                  value={newPartner.method}
                  onChange={(e) => setNewPartner({...newPartner, method: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <option value="telegram">Telegram</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
                <input
                  type="text"
                  value={newPartner.info}
                  onChange={(e) => setNewPartner({...newPartner, info: e.target.value})}
                  placeholder={newPartner.method === 'telegram' ? 'Telegram username or chat ID' : 
                             newPartner.method === 'email' ? 'Email address' : 'Phone number'}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                />
                <button
                  onClick={addPartner}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium"
                >
                  Add Partner
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {partners.map((partner) => (
                <div key={partner.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{partner.partner_name}</h3>
                      <p className="text-gray-400 text-sm">
                        {partner.contact_method}: {partner.contact_info}
                      </p>
                      {partner.receives_weekly_reports && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                          Receives weekly reports
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-blue-500/30 p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">📊 Weekly Reports</h2>
            
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">
                      Week of {new Date(report.week_start_date).toLocaleDateString()}
                    </h3>
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                      {report.timetable_adherence_percent}% adherence
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{report.good_habits_completed}/7</div>
                      <div className="text-sm text-gray-400">Good Habits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{report.medicine_adherence_percent}%</div>
                      <div className="text-sm text-gray-400">Medicine</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{report.diet_followed_percent}%</div>
                      <div className="text-sm text-gray-400">Diet</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{report.completed_tasks}/{report.total_tasks}</div>
                      <div className="text-sm text-gray-400">Tasks</div>
                    </div>
                  </div>
                  
                  {report.summary_text && (
                    <p className="text-gray-300 text-sm">{report.summary_text}</p>
                  )}
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No reports yet</h3>
                  <p className="text-gray-400">Weekly reports are generated every Sunday</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}