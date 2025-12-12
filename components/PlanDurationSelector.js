'use client'

export default function PlanDurationSelector({ config, onChange }) {
  const durations = [
    { months: 1, label: '1 Month', description: 'Quick discipline boost' },
    { months: 3, label: '3 Months', description: 'Build solid habits' },
    { months: 6, label: '6 Months', description: 'Transform your lifestyle' },
    { months: 12, label: '1 Year', description: 'Complete life overhaul' }
  ]

  const handleCustomDuration = (e) => {
    const months = parseInt(e.target.value) || 1
    onChange({
      ...config,
      durationMonths: Math.min(36, Math.max(1, months))
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">How long do you want to build discipline?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {durations.map((duration) => (
          <button
            key={duration.months}
            onClick={() => onChange({ ...config, durationMonths: duration.months })}
            className={`p-4 rounded-lg border-2 text-left ${config.durationMonths === duration.months ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="font-semibold text-gray-800">{duration.label}</div>
            <div className="text-sm text-gray-600 mt-1">{duration.description}</div>
          </button>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or set custom duration (months):
        </label>
        <input
          type="number"
          min="1"
          max="36"
          value={config.durationMonths}
          onChange={handleCustomDuration}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
        />
        <p className="text-sm text-gray-500 mt-2">
          Your plan will run for {config.durationMonths} month{config.durationMonths !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}