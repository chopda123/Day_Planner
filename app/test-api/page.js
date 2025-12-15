// /app/test-api/page.js
'use client'

export default function TestApiPage() {
  const testApi = async () => {
    const testData = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Plan API',
      description: 'Testing the API',
      start_date: new Date().toISOString().split('T')[0],
      duration_days: 30,
      tasks: [{
        title: 'Test Task',
        start_time: '09:00:00',
        end_time: '10:00:00',
        category: 'work',
        description: 'Test task from API',
        task_date: new Date().toISOString().split('T')[0]
      }]
    }
    
    console.log('Testing API with:', testData)
    
    try {
      const response = await fetch('/api/plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      const result = await response.json()
      console.log('API Test Result:', result)
      alert(`API Test: ${result.success ? 'SUCCESS' : 'FAILED'}\n${result.message}`)
    } catch (error) {
      console.error('API Test Error:', error)
      alert(`API Test Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <button 
        onClick={testApi}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
      >
        Test API Directly
      </button>
    </div>
  )
}