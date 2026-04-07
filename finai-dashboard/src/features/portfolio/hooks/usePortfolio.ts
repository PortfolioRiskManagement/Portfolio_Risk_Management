import { useState, useEffect } from 'react'
import type {
  Account,
  PortfolioSummary,
  UserProfile,
  ContributionPlan,
  Recommendation,
  PortfolioInsight,
} from '../types/portfolio.types'
import {
  mockAccounts,
  getPortfolioSummary,
  generateRecommendations,
  generateContributionPlan,
  generateInsights,
} from '../services/portfolioService'

export function usePortfolio() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [profile, setProfile] = useState<UserProfile>({
    annualIncome: 75000,
    age: 32,
    province: 'ON',
    riskTolerance: 'moderate',
    investingExperience: 'intermediate',
    monthlyContributionBudget: 1200,
    lumpSumAvailable: 5000,
    hasHomePurchaseGoal: true,
    targetRetirementAge: 65,
    liquidityNeed: 'medium',
    timeHorizon: 'long',
    investmentGoal: 'growth',
    hasDebtPriority: false,
  })
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [contributionPlans, setContributionPlans] = useState<ContributionPlan[]>([])
  const [insights, setInsights] = useState<PortfolioInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAccounts(mockAccounts)
      setIsLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    if (accounts.length > 0) {
      setSummary(getPortfolioSummary(accounts))
      setRecommendations(generateRecommendations(accounts, profile))
      setContributionPlans(generateContributionPlan(accounts, profile))
      setInsights(generateInsights(accounts, profile))
    }
  }, [accounts, profile])

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile)
  }

  return {
    accounts,
    profile,
    summary,
    recommendations,
    contributionPlans,
    insights,
    isLoading,
    updateProfile,
  }
}
