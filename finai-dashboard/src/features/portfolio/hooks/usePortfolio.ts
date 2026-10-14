import { useState, useEffect, useMemo } from 'react'
import { useHoldings } from './useHoldings'
import { useLivePrices } from './useLivePrice'
import type {
  Account,
  PortfolioSummary,
  UserProfile,
  ContributionPlan,
  Recommendation,
  PortfolioInsight,
} from '../types/portfolio.types'
import {
  buildAccounts,
  getPortfolioSummary,
  generateRecommendations,
  generateContributionPlan,
  generateInsights,
} from '../services/portfolioService'

const PROFILE_STORAGE_KEY = 'finai_profile_v1'

const DEFAULT_PROFILE: UserProfile = {
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
  // TFSA/FHSA contributions default to the cost of the holdings in those accounts until entered
  fhsaYearOpened: 2025,
}

// Contribution numbers that used to be saved as sample defaults; drop them so holdings drive the numbers
const OLD_SAMPLE_DEFAULTS: Partial<UserProfile> = {
  tfsaContributions: 23438,
  fhsaContributionsBeforeThisYear: 7744,
  rrspContributionsThisYear: 4000,
}

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return DEFAULT_PROFILE
    const saved = JSON.parse(raw) as UserProfile
    for (const [key, value] of Object.entries(OLD_SAMPLE_DEFAULTS)) {
      if (saved[key as keyof UserProfile] === value) delete saved[key as keyof UserProfile]
    }
    return { ...DEFAULT_PROFILE, ...saved }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function usePortfolio() {
  const { holdings } = useHoldings()
  const prices = useLivePrices(holdings.map((h) => h.symbol))
  const positions = useMemo(
    () =>
      holdings.map((h) => ({
        account: h.account ?? 'PERSONAL',
        // entry price until the live quote loads
        value: (prices[h.symbol.toUpperCase()] ?? h.entry) * h.quantity,
        cost: h.entry * h.quantity,
      })),
    [holdings, prices]
  )
  const [accounts, setAccounts] = useState<Account[]>([])
  const [profile, setProfile] = useState<UserProfile>(loadProfile)
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [contributionPlans, setContributionPlans] = useState<ContributionPlan[]>([])
  const [insights, setInsights] = useState<PortfolioInsight[]>([])
  // Everything is computed locally; kept for callers that show a loading state
  const isLoading = false

  // Balances come from holdings; contribution room from the profile (age, income, contribution history)
  useEffect(() => {
    setAccounts(buildAccounts(profile, positions))
  }, [profile, positions])

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // ignore
    }
  }, [profile])

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
