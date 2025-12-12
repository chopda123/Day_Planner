


'use client'

import React, { useState, useEffect, useRef } from 'react'

const TelegramConnect = ({ onClose, userId, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [botConnected, setBotConnected] = useState(false)
  const [polling, setPolling] = useState(false)
  const [pollingCount, setPollingCount] = useState(0)
  const [autoRedirectDone, setAutoRedirectDone] = useState(false)
  
  const telegramBotUsername = 'improve_your_life_bot'
  const telegramBotLink = `https://t.me/${telegramBotUsername}`
  const pollingIntervalRef = useRef(null)
  
  const steps = [
    {
      number: 1,
      title: 'Start the Bot',
      description: 'Click below to open our Life Planner bot in Telegram',
      icon: '🤖'
    },
    {
      number: 2,
      title: 'Get Verification Code',
      description: 'Send /start to the bot and copy the 6-digit code',
      icon: '🔢'
    },
    {
      number: 3,
      title: 'Enter Code Here',
      description: 'Paste the code below to link your account',
      icon: '🔗'
    },
    {
      number: 4,
      title: 'Setup Complete',
      description: 'You will now receive reminders in Telegram',
      icon: '✅'
    }
  ]

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const handleAutoRedirect = () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || telegramBotUsername
    const botUrl = `https://t.me/${botUsername}?start=web_${userId}`
    
    window.open(botUrl, '_blank', 'noopener,noreferrer')
    setAutoRedirectDone(true)
    
    // Start polling for link status
    startOTPPolling()
    
    // Show success message after opening Telegram
    setTimeout(() => {
      setStep(2)
    }, 1000)
  }

  const startOTPPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    
    setPolling(true)
    setPollingCount(0)
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        setPollingCount(prev => prev + 1)
        
        // Check if Telegram is linked
        const response = await fetch('/api/telegram/check-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
        
        const data = await response.json()
        
        if (data.linked) {
          // Success! Stop polling and update state
          clearInterval(pollingIntervalRef.current)
          setPolling(false)
          setBotConnected(true)
          setStep(4)
          
          if (onSuccess) {
            onSuccess()
          }
          
          alert('✅ Account linked successfully via auto-detect!')
        }
        
        // Stop polling after 30 attempts (90 seconds)
        if (pollingCount > 30) {
          clearInterval(pollingIntervalRef.current)
          setPolling(false)
          console.log('Polling timeout - user can enter OTP manually')
        }
      } catch (error) {
        console.error('Polling error:', error)
        // Continue polling on error
      }
    }, 3000) // Check every 3 seconds
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setPolling(false)
  }

  const handleConnect = async () => {
    if (step === 1) {
      handleAutoRedirect()
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      await verifyOTP()
    } else {
      onClose()
    }
  }

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    try {
      console.log('Sending verification:', { otp: otpCode, userId })
      
      const response = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          otp: otpCode, 
          userId: userId
        })
      })

      const data = await response.json()
      console.log('Verification response:', data)
      
      if (data.success) {
        // Stop any ongoing polling
        stopPolling()
        
        setBotConnected(true)
        setStep(4)
        if (onSuccess) {
          onSuccess()
        }
        alert('✅ Account linked successfully!')
      } else {
        alert(data.message || 'Failed to verify code. Please try again.')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      alert('Error connecting to server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (step < 4) {
      // Stop polling when skipping
      if (polling) {
        stopPolling()
      }
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">Connect Telegram</h2>
                <p className="text-blue-100 mt-1">Get reminders and notifications</p>
              </div>
              <button
                onClick={() => {
                  stopPolling()
                  onClose()
                }}
                className="text-white hover:text-blue-200 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {steps.map((s) => (
                  <div
                    key={s.number}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.number <= step
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {s.number}
                  </div>
                ))}
              </div>
              <div className="h-1 bg-gray-200 relative">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{steps[step - 1].icon}</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Step {step}: {steps[step - 1].title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {steps[step - 1].description}
                  </p>
                </div>
              </div>
              
              {/* Step 1: Auto Redirect & Polling */}
              {step === 1 && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <button
                      onClick={handleAutoRedirect}
                      className="w-full py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition flex items-center justify-center"
                      disabled={polling}
                    >
                      {polling ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Detecting link...
                        </span>
                      ) : (
                        <>
                          <span className="mr-2">Open @{telegramBotUsername}</span>
                          <span>➡️</span>
                        </>
                      )}
                    </button>
                    
                    {polling && (
                      <div className="mt-3 text-center">
                        <p className="text-sm text-blue-600">
                          Waiting for you to start the bot in Telegram...
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          (Auto-detecting for {pollingCount * 3} seconds)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Alternative: Manual Setup</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      If auto-detect doesn't work, you can manually:
                    </p>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Open @{telegramBotUsername} in Telegram</li>
                      <li>Send <code className="bg-gray-200 px-1 rounded">/start</code> command</li>
                      <li>Copy the 6-digit code</li>
                      <li>Paste it in the next step</li>
                    </ol>
                  </div>
                </div>
              )}
              
              {/* Step 2: Instructions */}
              {step === 2 && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800">Open Telegram</h4>
                        <p className="text-sm text-blue-600">Go to @{telegramBotUsername}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800">Send Command</h4>
                        <p className="text-sm text-blue-600">Type <code className="bg-white px-2 py-1 rounded border">/start</code></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800">Copy Code</h4>
                        <p className="text-sm text-blue-600">Save the 6-digit verification code</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Note:</span> The code expires in 10 minutes
                    </p>
                  </div>
                </div>
              )}
              
              {/* OTP Input for Step 3 */}
              {step === 3 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit code from Telegram
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    The code expires in 10 minutes
                  </p>
                  
                  {/* Debug info */}
                  <div className="mt-3 text-xs text-gray-400">
                    <p>User ID: {userId?.substring(0, 8)}...</p>
                    <p>Bot: @{telegramBotUsername}</p>
                  </div>
                </div>
              )}
              
              {/* Success Message for Step 4 */}
              {step === 4 && botConnected && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl text-green-500 mr-3">✅</span>
                    <div>
                      <h4 className="font-bold text-green-800">Successfully Connected!</h4>
                      <p className="text-green-600 text-sm mt-1">
                        Your Telegram account is now linked. You'll receive:
                      </p>
                      <ul className="text-green-600 text-sm mt-2 space-y-1">
                        <li>• Morning messages at 6 AM</li>
                        <li>• Night checklists at 10 PM</li>
                        <li>• Weekly reports on Sunday</li>
                        <li>• Task reminders 15 minutes before</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Benefits of Connecting:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Get 15-minute before task reminders
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Mark tasks complete from Telegram
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Snooze or skip tasks
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  View today's tasks with /today command
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Get weekly discipline reports
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSkip}
                disabled={loading || polling}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {step === 1 ? 'Skip to Manual' : 
                 step === 2 ? 'Skip to Code Entry' : 
                 step === 3 ? 'Go Back' : 
                 'Close'}
              </button>
              <button
                onClick={handleConnect}
                disabled={loading || polling || (step === 3 && otpCode.length !== 6)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : step === 1 ? (
                  <>
                    <span className="mr-2">Open Telegram</span>
                    <span>➡️</span>
                  </>
                ) : step === 2 ? (
                  'Next: Enter Code'
                ) : step === 3 ? (
                  'Verify & Connect'
                ) : (
                  'Finish'
                )}
              </button>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 text-center mt-4">
              You can connect Telegram anytime from Settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TelegramConnect