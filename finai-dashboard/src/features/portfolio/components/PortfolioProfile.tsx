import { useEffect, useState } from 'react'
import type { UserProfile } from '../types/portfolio.types'
import Card from '../../../components/ui/Card'

interface Props {
  profile: UserProfile
  onUpdate: (profile: UserProfile) => void
}

export default function PortfolioProfile({ profile, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false)

  const profileCompleteness = calculateCompleteness(profile)

  const handleChange = (field: keyof UserProfile, value: any) => {
    onUpdate({ ...profile, [field]: value })
  }

  useEffect(() => {
    if (!isEditing) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isEditing])

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Customize Your Profile</h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tell us more about your goals and investment style for better personalized recommendations
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="ml-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile Completeness Card */}
      <Card className="mb-6 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Profile Completeness</span>
              <span className={`text-2xl font-bold ${profileCompleteness === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
                {profileCompleteness}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full border border-zinc-200 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:border-zinc-800/50 dark:from-zinc-800 dark:to-zinc-900">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  profileCompleteness === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
              {profileCompleteness === 100
                ? '✓ Complete! You\'re receiving the best possible recommendations.'
                : `${100 - profileCompleteness} fields remaining to unlock full personalization`}
            </p>
          </div>
          <div className="text-4xl">
            {profileCompleteness === 100 ? '🎉' : '📋'}
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          />
          <div className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
              <div>
                <h3 className="text-xl font-bold text-zinc-950 dark:text-white">Edit Investment Profile</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Update the same profile fields in a focused popup.</p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-132px)]">
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Investor Profile */}
          <Card className="border-blue-600/30">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-zinc-950 dark:text-white">
              <span className="inline-block w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                👤
              </span>
              Investor Profile
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Annual Income (before tax)</label>
                <input
                  type="number"
                  value={profile.annualIncome || ''}
                  onChange={(e) => handleChange('annualIncome', Number(e.target.value))}
                  placeholder="e.g., 75000"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-950 placeholder-zinc-400 transition-colors hover:border-blue-300 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:hover:border-blue-600/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Age</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                    placeholder="e.g., 32"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-950 placeholder-zinc-400 transition-colors hover:border-blue-300 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:hover:border-blue-600/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Province</label>
                  <select
                    value={profile.province || ''}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-950 transition-colors hover:border-blue-300 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-zinc-900 dark:text-white dark:hover:border-blue-600/30"
                  >
                    <option value="">Select province</option>
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="MB">Manitoba</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="PE">Prince Edward Island</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Risk Tolerance</label>
                <div className="flex gap-3">
                  {[
                    { value: 'conservative', icon: '🛡️', label: 'Conservative' },
                    { value: 'moderate', icon: '⚖️', label: 'Moderate' },
                    { value: 'aggressive', icon: '🚀', label: 'Aggressive' },
                  ].map((risk) => (
                    <button
                      key={risk.value}
                      onClick={() => handleChange('riskTolerance', risk.value)}
                        className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1.5 ${
                        profile.riskTolerance === risk.value
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/30'
                          : 'border border-zinc-200 bg-zinc-100 text-zinc-700 hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-600/50'
                      }`}
                    >
                      <span className="text-lg">{risk.icon}</span>
                      {risk.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Investing Experience</label>
                <div className="flex gap-3">
                  {[
                    { value: 'beginner', level: '1' },
                    { value: 'intermediate', level: '2' },
                    { value: 'advanced', level: '3' },
                  ].map((exp) => (
                    <button
                      key={exp.value}
                      onClick={() => handleChange('investingExperience', exp.value)}
                        className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        profile.investingExperience === exp.value
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/30'
                          : 'border border-zinc-200 bg-zinc-100 text-zinc-700 hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-blue-600/50'
                      }`}
                    >
                      {exp.value.charAt(0).toUpperCase() + exp.value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Goals & Priorities */}
          <Card className="border-emerald-600/30">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-zinc-950 dark:text-white">
              <span className="inline-block w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                🎯
              </span>
              Goals & Priorities
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Investment Goal</label>
                <select
                  value={profile.investmentGoal || ''}
                  onChange={(e) => handleChange('investmentGoal', e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-950 transition-colors hover:border-emerald-300 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-zinc-900 dark:text-white dark:hover:border-emerald-600/30"
                >
                  <option value="">Select goal</option>
                  <option value="growth">📈 Growth (maximize returns)</option>
                  <option value="balanced">⚖️ Balanced (growth with stability)</option>
                  <option value="income">💰 Income (regular cash flow)</option>
                  <option value="preservation">🛡️ Preservation (protect capital)</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Time Horizon</label>
                <div className="flex gap-3">
                  {[
                    { value: 'short', label: '< 5 years' },
                    { value: 'medium', label: '5-15 years' },
                    { value: 'long', label: '15+ years' },
                  ].map((horizon) => (
                    <button
                      key={horizon.value}
                      onClick={() => handleChange('timeHorizon', horizon.value)}
                        className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        profile.timeHorizon === horizon.value
                          ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/30'
                          : 'border border-zinc-200 bg-zinc-100 text-zinc-700 hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-emerald-600/50'
                      }`}
                    >
                      {horizon.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Target Retirement Age</label>
                <input
                  type="number"
                  value={profile.targetRetirementAge || ''}
                  onChange={(e) => handleChange('targetRetirementAge', Number(e.target.value))}
                  placeholder="e.g., 65"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-950 placeholder-zinc-400 transition-colors hover:border-emerald-300 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:hover:border-emerald-600/30"
                />
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'hasHomePurchaseGoal',
                    label: 'Planning to buy first home?',
                    icon: '🏡',
                  },
                  {
                    key: 'hasDebtPriority',
                    label: 'Debt reduction is a priority?',
                    icon: '💳',
                  },
                ].map((toggle) => (
                  <button
                    key={toggle.key}
                    onClick={() => handleChange(toggle.key as keyof UserProfile, !profile[toggle.key as keyof UserProfile])}
                    className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-gradient-to-r from-white to-zinc-50 p-3.5 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950 dark:hover:border-zinc-700 dark:hover:from-zinc-800 dark:hover:to-zinc-900"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <span className="text-lg">{toggle.icon}</span>
                      {toggle.label}
                    </span>
                    <div
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        profile[toggle.key as keyof UserProfile] ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                          profile[toggle.key as keyof UserProfile] ? 'translate-x-9' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Liquidity Needs</label>
                <div className="flex gap-3">
                  {[
                    { value: 'low', icon: '🔐' },
                    { value: 'medium', icon: '📊' },
                    { value: 'high', icon: '⚡' },
                  ].map((liquidity) => (
                    <button
                      key={liquidity.value}
                      onClick={() => handleChange('liquidityNeed', liquidity.value)}
                        className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        profile.liquidityNeed === liquidity.value
                          ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/30'
                          : 'border border-zinc-200 bg-zinc-100 text-zinc-700 hover:border-purple-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-purple-600/50'
                      }`}
                    >
                      {liquidity.icon} {liquidity.value.charAt(0).toUpperCase() + liquidity.value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Contribution Capacity */}
          <Card className="border-amber-600/30">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-zinc-950 dark:text-white">
              <span className="inline-block w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                💵
              </span>
              Contribution Capacity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Monthly Contribution Budget</label>
                <input
                  type="number"
                  value={profile.monthlyContributionBudget || ''}
                  onChange={(e) => handleChange('monthlyContributionBudget', Number(e.target.value))}
                  placeholder="e.g., 1000"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-950 placeholder-zinc-400 transition-colors hover:border-amber-300 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:hover:border-amber-600/30"
                />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">Amount you can invest monthly</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Lump Sum Available</label>
                <input
                  type="number"
                  value={profile.lumpSumAvailable || ''}
                  onChange={(e) => handleChange('lumpSumAvailable', Number(e.target.value))}
                  placeholder="e.g., 5000"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-zinc-950 placeholder-zinc-400 transition-colors hover:border-amber-300 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-zinc-900 dark:text-white dark:placeholder-zinc-600 dark:hover:border-amber-600/30"
                />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">One-time amount ready to invest</p>
              </div>
            </div>
          </Card>

              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end border-t border-zinc-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg bg-zinc-100 px-5 py-2.5 font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function calculateCompleteness(profile: UserProfile): number {
  const fields = [
    'annualIncome',
    'age',
    'province',
    'riskTolerance',
    'investingExperience',
    'monthlyContributionBudget',
    'investmentGoal',
    'timeHorizon',
    'targetRetirementAge',
    'liquidityNeed',
  ]

  const completedFields = fields.filter((field) => {
    const value = profile[field as keyof UserProfile]
    return value !== undefined && value !== null && value !== ''
  }).length

  return Math.round((completedFields / fields.length) * 100)
}
