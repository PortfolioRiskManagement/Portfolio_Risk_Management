// Purpose: Verify portfolio summary maths, health score rules, recommendations, contribution plans, and insights.
import { describe, expect, it } from "vitest"

import {
  generateContributionPlan,
  generateInsights,
  generateRecommendations,
  getPortfolioSummary,
  mockAccounts,
} from "./portfolioService"
import type { Account, UserProfile } from "../types/portfolio.types"

function account(overrides: Partial<Account>): Account {
  return {
    id: "x",
    type: "TFSA",
    name: "Test account",
    balance: 1000,
    gain: 100,
    gainPercent: 10,
    contributionRoom: 0,
    contributionUsed: 0,
    contributionLimit: 0,
    purpose: "",
    taxBenefit: "",
    status: "normal",
    priority: 1,
    ...overrides,
  }
}

const byType = (type: Account["type"], overrides: Partial<Account>) => account({ type, id: type, ...overrides })
const withAccount = (type: Account["type"], overrides: Partial<Account>) =>
  mockAccounts.map((a) => (a.type === type ? { ...a, ...overrides } : a))
const ids = (items: { id: string }[]) => items.map((i) => i.id)

describe("getPortfolioSummary", () => {
  const summary = getPortfolioSummary(mockAccounts)

  it("adds up balances and gains across accounts", () => {
    expect(summary.totalValue).toBe(132622)
    expect(summary.totalGain).toBe(28118)
  })

  it("computes gain percent against the starting value, not the current value", () => {
    expect(summary.totalGainPercent).toBeCloseTo(26.906, 2)
  })

  it("splits registered and non-registered balances", () => {
    expect(summary.registeredBalance).toBe(87770)
    expect(summary.nonRegisteredBalance).toBe(44852)
    expect(summary.registeredBalance + summary.nonRegisteredBalance).toBe(summary.totalValue)
  })

  it("counts remaining room only on registered accounts", () => {
    expect(summary.contributionRoomRemaining).toBe(85230)
  })

  it("counts active accounts", () => {
    expect(summary.activeAccounts).toBe(4)
  })

  it("scores the sample portfolio at 75", () => {
    expect(summary.healthScore).toBe(75)
  })
})

describe("health score rules", () => {
  it("reaches the maximum of 100 when every bonus applies", () => {
    const accounts = ["RRSP", "TFSA", "FHSA"].map((t) =>
      byType(t as Account["type"], { balance: 1000, gain: 300, gainPercent: 25, contributionRoom: 100, contributionLimit: 1000 }),
    )
    expect(getPortfolioSummary(accounts).healthScore).toBe(100)
  })

  it("stays at the base score of 50 when no bonus applies", () => {
    const accounts = [byType("PERSONAL", { balance: 1000, gain: 50, gainPercent: 5 })]
    expect(getPortfolioSummary(accounts).healthScore).toBe(50)
  })

  it("adds 10 when registered accounts are over half the portfolio", () => {
    const accounts = [
      byType("TFSA", { balance: 600, gain: 10, gainPercent: 1, contributionRoom: 1000, contributionLimit: 1000 }),
      byType("PERSONAL", { balance: 400, gain: 10, gainPercent: 1 }),
    ]
    expect(getPortfolioSummary(accounts).healthScore).toBe(60)
  })

  it("adds 20 when registered accounts are over 70% of the portfolio", () => {
    const accounts = [
      byType("TFSA", { balance: 800, gain: 10, gainPercent: 1, contributionRoom: 1000, contributionLimit: 1000 }),
      byType("PERSONAL", { balance: 200, gain: 10, gainPercent: 1 }),
    ]
    expect(getPortfolioSummary(accounts).healthScore).toBe(70)
  })

  it("adds 10 for contribution room utilisation between 40% and 60%", () => {
    const accounts = [byType("TFSA", { balance: 1000, gain: 10, gainPercent: 1, contributionRoom: 500, contributionLimit: 1000 })]
    expect(getPortfolioSummary(accounts).healthScore).toBe(80)
  })

  it("adds 15 for contribution room utilisation above 60%", () => {
    const accounts = [byType("TFSA", { balance: 1000, gain: 10, gainPercent: 1, contributionRoom: 100, contributionLimit: 1000 })]
    expect(getPortfolioSummary(accounts).healthScore).toBe(85)
  })

  it("does not return NaN when there are no registered limits", () => {
    const accounts = [byType("PERSONAL", { balance: 500, gain: 50, gainPercent: 10 })]
    expect(Number.isNaN(getPortfolioSummary(accounts).healthScore)).toBe(false)
  })
})

describe("generateRecommendations", () => {
  it("suggests TFSA and taxable-account actions for the sample portfolio", () => {
    expect(ids(generateRecommendations(mockAccounts, {}))).toEqual(["tfsa-underused", "reduce-taxable"])
  })

  it("flags TFSA room only above 40,000", () => {
    expect(ids(generateRecommendations(withAccount("TFSA", { contributionRoom: 40000 }), {}))).not.toContain("tfsa-underused")
    expect(ids(generateRecommendations(withAccount("TFSA", { contributionRoom: 40001 }), {}))).toContain("tfsa-underused")
  })

  it("recommends the FHSA only with a home goal and room left", () => {
    const open = withAccount("FHSA", { contributionRoom: 5000 })
    expect(ids(generateRecommendations(open, { hasHomePurchaseGoal: true }))).toContain("fhsa-priority")
    expect(ids(generateRecommendations(open, { hasHomePurchaseGoal: false }))).not.toContain("fhsa-priority")
    expect(ids(generateRecommendations(mockAccounts, { hasHomePurchaseGoal: true }))).not.toContain("fhsa-priority")
  })

  it("recommends the RRSP deduction only above 70,000 income", () => {
    expect(ids(generateRecommendations(mockAccounts, { annualIncome: 70000 }))).not.toContain("rrsp-tax-benefit")
    expect(ids(generateRecommendations(mockAccounts, { annualIncome: 70001 }))).toContain("rrsp-tax-benefit")
  })

  it("needs more than 10,000 of RRSP room for the RRSP recommendation", () => {
    const accounts = withAccount("RRSP", { contributionRoom: 10000 })
    expect(ids(generateRecommendations(accounts, { annualIncome: 90000 }))).not.toContain("rrsp-tax-benefit")
  })

  it("flags taxable exposure only with a large balance and registered room", () => {
    expect(ids(generateRecommendations(withAccount("PERSONAL", { balance: 30000 }), {}))).not.toContain("reduce-taxable")
    expect(ids(generateRecommendations(withAccount("PERSONAL", { balance: 30001 }), {}))).toContain("reduce-taxable")
    const noRoom = mockAccounts.map((a) => ({ ...a, contributionRoom: 0 }))
    expect(ids(generateRecommendations(noRoom, {}))).not.toContain("reduce-taxable")
  })

  it("suggests automation only above a 500 monthly budget", () => {
    expect(ids(generateRecommendations(mockAccounts, { monthlyContributionBudget: 500 }))).not.toContain("contribution-automation")
    expect(ids(generateRecommendations(mockAccounts, { monthlyContributionBudget: 501 }))).toContain("contribution-automation")
  })

  it("returns every recommendation in priority order when all rules apply", () => {
    const accounts = withAccount("FHSA", { contributionRoom: 5000 })
    const profile: UserProfile = { hasHomePurchaseGoal: true, annualIncome: 90000, monthlyContributionBudget: 1000 }

    expect(ids(generateRecommendations(accounts, profile))).toEqual([
      "tfsa-underused",
      "fhsa-priority",
      "rrsp-tax-benefit",
      "reduce-taxable",
      "contribution-automation",
    ])
  })

  it("never returns more than six recommendations", () => {
    const profile: UserProfile = { hasHomePurchaseGoal: true, annualIncome: 90000, monthlyContributionBudget: 1000 }
    expect(generateRecommendations(withAccount("FHSA", { contributionRoom: 5000 }), profile).length).toBeLessThanOrEqual(6)
  })

  it("returns nothing for an empty account list", () => {
    expect(generateRecommendations([], { annualIncome: 100000, monthlyContributionBudget: 100 })).toEqual([])
  })
})

describe("generateContributionPlan", () => {
  it("returns no plan without a monthly budget", () => {
    expect(generateContributionPlan(mockAccounts, {})).toEqual([])
    expect(generateContributionPlan(mockAccounts, { monthlyContributionBudget: 0 })).toEqual([])
  })

  it("splits a 1,000 budget between TFSA and the personal account when income is unknown", () => {
    const plan = generateContributionPlan(mockAccounts, { monthlyContributionBudget: 1000 })

    expect(plan.map((p) => [p.accountType, p.monthlyAmount])).toEqual([
      ["TFSA", 500],
      ["PERSONAL", 500],
    ])
  })

  it("adds an RRSP step with its tax saving for incomes above 60,000", () => {
    const plan = generateContributionPlan(mockAccounts, { monthlyContributionBudget: 1000, annualIncome: 90000 })

    expect(plan.map((p) => [p.accountType, p.monthlyAmount])).toEqual([
      ["TFSA", 500],
      ["RRSP", 350],
      ["PERSONAL", 150],
    ])
    expect(plan[1].taxSavings).toBe(1470)
  })

  it("skips the RRSP at exactly 60,000 income", () => {
    const plan = generateContributionPlan(mockAccounts, { monthlyContributionBudget: 1000, annualIncome: 60000 })

    expect(plan.map((p) => p.accountType)).not.toContain("RRSP")
  })

  it("puts the FHSA first for a home goal and caps it at 40% of the budget", () => {
    const accounts = withAccount("FHSA", { contributionRoom: 12000 })
    const plan = generateContributionPlan(accounts, { monthlyContributionBudget: 1000, hasHomePurchaseGoal: true })

    expect(plan[0]).toMatchObject({ accountType: "FHSA", priority: 1, monthlyAmount: 400, taxSavings: 1440 })
  })

  it("skips the FHSA when the account has no room left", () => {
    const plan = generateContributionPlan(mockAccounts, { monthlyContributionBudget: 1000, hasHomePurchaseGoal: true })

    expect(plan.map((p) => p.accountType)).not.toContain("FHSA")
  })

  it("numbers priorities consecutively from 1", () => {
    const plan = generateContributionPlan(mockAccounts, { monthlyContributionBudget: 1000, annualIncome: 90000 })

    expect(plan.map((p) => p.priority)).toEqual([1, 2, 3])
  })

  it("does not create a personal-account step when 50 or less is left", () => {
    const plan = generateContributionPlan(mockAccounts, { monthlyContributionBudget: 40 })

    expect(plan.map((p) => p.accountType)).toEqual(["TFSA"])
  })

  it("never plans more than the monthly budget", () => {
    const budget = 1000
    const plan = generateContributionPlan(mockAccounts, { monthlyContributionBudget: budget, annualIncome: 90000 })

    expect(plan.reduce((sum, p) => sum + p.monthlyAmount, 0)).toBeLessThanOrEqual(budget)
  })
})

describe("generateInsights", () => {
  const titles = (accounts: Account[], profile: UserProfile) => generateInsights(accounts, profile).map((i) => i.title)

  it("reports unused room, a missing contribution plan, and strong performance for the sample portfolio", () => {
    expect(titles(mockAccounts, {})).toEqual([
      "Significant Unused Registered Room",
      "No Regular Contribution Plan",
      "Strong Portfolio Performance",
    ])
  })

  it("stops warning about a contribution plan once a budget is set", () => {
    expect(titles(mockAccounts, { monthlyContributionBudget: 500 })).not.toContain("No Regular Contribution Plan")
  })

  it("flags high taxable exposure above 40% when registered room is open", () => {
    const heavyPersonal = withAccount("PERSONAL", { balance: 120000 })

    expect(titles(heavyPersonal, {})).toContain("High Taxable Account Exposure")
    expect(titles(mockAccounts, {})).not.toContain("High Taxable Account Exposure")
  })

  it("celebrates a fully used FHSA only with a home goal", () => {
    expect(titles(mockAccounts, { hasHomePurchaseGoal: true })).toContain("FHSA Fully Utilized")
    expect(titles(mockAccounts, {})).not.toContain("FHSA Fully Utilized")
  })

  it("marks a missing FHSA as critical for a home buyer", () => {
    const withoutFhsa = mockAccounts.filter((a) => a.type !== "FHSA")
    const insight = generateInsights(withoutFhsa, { hasHomePurchaseGoal: true }).find((i) => i.title === "Missing FHSA Account")

    expect(insight?.severity).toBe("critical")
  })

  it("flags retirement pacing when under 20 years remain and the RRSP is small", () => {
    expect(titles(mockAccounts, { age: 50, targetRetirementAge: 60 })).toContain("Retirement Account Pacing")
    expect(titles(mockAccounts, { age: 30, targetRetirementAge: 65 })).not.toContain("Retirement Account Pacing")
  })

  it("does not flag retirement pacing once the RRSP is large", () => {
    const bigRrsp = withAccount("RRSP", { balance: 250000 })

    expect(titles(bigRrsp, { age: 55, targetRetirementAge: 62 })).not.toContain("Retirement Account Pacing")
  })

  it("drops the strong-performance insight when any account lost money", () => {
    const oneLoser = withAccount("PERSONAL", { gain: -100 })

    expect(titles(oneLoser, {})).not.toContain("Strong Portfolio Performance")
  })

  it("reports the total unused room in the metric", () => {
    const insight = generateInsights(mockAccounts, {}).find((i) => i.title === "Significant Unused Registered Room")

    expect(insight?.metric).toContain("available")
    expect(insight?.severity).toBe("warning")
  })
})
