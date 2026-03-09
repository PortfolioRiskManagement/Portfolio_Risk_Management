import { useState } from 'react'
import type { UserProfile } from '../types/portfolio.types'
import Card from '../../../components/ui/Card'

interface Props {
  profile: UserProfile
  onUpdate: (profile: UserProfile) => void
}

export default function PortfolioProfile({ profile, onUpdate }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const profileCompleteness = calculateCompleteness(profile)

  const handleChange = (field: keyof UserProfile, value: any) => {
    onUpdate({ ...profile, [field]: value })
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-2xl font-bold text-white">Customize Your Profile</h2>
          </div>
          <p className="text-sm text-zinc-400">
            Tell us more about your goals and investment style for better personalized recommendations
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
        >
          {isExpanded ? 'Collapse' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Completeness Card */}
      <Card className={`mb-6 transition-all duration-300 ${isExpanded ? 'border-blue-600/50' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white uppercase tracking-widest">Profile Completeness</span>
              <span className={`text-2xl font-bold ${profileCompleteness === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
                {profileCompleteness}%
              </span>
            </div>
            <div className="h-2.5 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  profileCompleteness === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
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

      {/* Expandable Form */}
      {isExpanded && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Investor Profile */}
          <Card className="border-blue-600/30">
            <h3 className="text-white font-bold mb-5 text-lg flex items-center gap-2">
              <span className="inline-block w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                👤
              </span>
              Investor Profile
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Annual Income (before tax)</label>
                <input
                  type="number"
                  value={profile.annualIncome || ''}
                  onChange={(e) => handleChange('annualIncome', Number(e.target.value))}
                  placeholder="e.g., 75000"
                  className="w-full bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 hover:border-blue-600/30 focus:border-blue-500 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Age</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                    placeholder="e.g., 32"
                    className="w-full bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 hover:border-blue-600/30 focus:border-blue-500 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Province</label>
                  <select
                    value={profile.province || ''}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="w-full bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 hover:border-blue-600/30 focus:border-blue-500 rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors"
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
                <label className="block text-sm font-semibold text-zinc-300 mb-3">Risk Tolerance</label>
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
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-blue-600/50'
                      }`}
                    >
                      <span className="text-lg">{risk.icon}</span>
                      {risk.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">Investing Experience</label>
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
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-blue-600/50'
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
            <h3 className="text-white font-bold mb-5 text-lg flex items-center gap-2">
              <span className="inline-block w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                🎯
              </span>
              Goals & Priorities
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Investment Goal</label>
                <select
                  value={profile.investmentGoal || ''}
                  onChange={(e) => handleChange('investmentGoal', e.target.value)}
                  className="w-full bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 hover:border-emerald-600/30 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors"
                >
                  <option value="">Select goal</option>
                  <option value="growth">📈 Growth (maximize returns)</option>
                  <option value="balanced">⚖️ Balanced (growth with stability)</option>
                  <option value="income">💰 Income (regular cash flow)</option>
                  <option value="preservation">🛡️ Preservation (protect capital)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">Time Horizon</label>
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
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-emerald-600/50'
                      }`}
                    >
                      {horizon.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Target Retirement Age</label>
                <input
                  type="number"
                  value={profile.targetRetirementAge || ''}
                  onChange={(e) => handleChange('targetRetirementAge', Number(e.target.value))}
                  placeholder="e.g., 65"
                  className="w-full bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 hover:border-emerald-600/30 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none transition-colors"
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
                    className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-zinc-900 to-zinc-950 hover:from-zinc-800 hover:to-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
                  >
                    <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <span className="text-lg">{toggle.icon}</span>
                      {toggle.label}
                    </span>
                    <div
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        profile[toggle.key as keyof UserProfile] ? 'bg-emerald-600' : 'bg-zinc-700'
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
                <label className="block text-sm font-semibold text-zinc-300 mb-3">Liquidity Needs</label>
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
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-purple-600/50'
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
            <h3 className="text-white font-bold mb-5 text-lg flex items-center gap-2">
              <span className="inline-block w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                💵
              </span>
              Contribution Capacity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Monthly Contribution Budget</label>
                <input
                  type="number"
                  value={profile.monthlyContributionBudget || ''}
                  onChange={(e) => handleChange('monthlyContributionBudget', Number(e.target.value))}
                  placeholder="e.g., 1000"
                  className="w-full bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 hover:border-amber-600/30 focus:border-amber-500 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
                <p className="text-xs text-zinc-500 mt-2">Amount you can invest monthly</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Lump Sum Available</label>
                <input
                  type="number"
                  value={profile.lumpSumAvailable || ''}
                  onChange={(e) => handleChange('lumpSumAvailable', Number(e.target.value))}
                  placeholder="e.g., 5000"
                  className="w-full bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 hover:border-amber-600/30 focus:border-amber-500 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
                <p className="text-xs text-zinc-500 mt-2">One-time amount ready to invest</p>
              </div>
            </div>
          </Card>
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
