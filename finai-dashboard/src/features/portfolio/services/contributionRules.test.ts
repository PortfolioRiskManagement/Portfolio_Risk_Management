// Purpose: Check contribution room math against CRA's published limits and examples.
import { describe, expect, it } from "vitest"
import { calculateFhsaRoom, calculateRrspRoom, calculateTfsaRoom } from "./contributionRules"

describe("calculateTfsaRoom", () => {
  it("gives $109,000 to someone eligible since 2009 in 2026", () => {
    const r = calculateTfsaRoom({ age: 40, year: 2026, totalContributions: 0, withdrawalsBeforeThisYear: 0 })
    expect(r.limit).toBe(109000)
  })

  it("starts room the year you turn 18", () => {
    // turned 18 in 2012: 5,000 + 11,000 + 10,000 + 16,500 + 24,000 + 6,500 + 21,000
    const r = calculateTfsaRoom({ age: 32, year: 2026, totalContributions: 25000, withdrawalsBeforeThisYear: 0 })
    expect(r.limit).toBe(94000)
    expect(r.remaining).toBe(69000)
  })

  it("adds past withdrawals back as room", () => {
    const r = calculateTfsaRoom({ age: 20, year: 2026, totalContributions: 10000, withdrawalsBeforeThisYear: 3000 })
    // turned 18 in 2024: 7,000 x 3
    expect(r.limit).toBe(24000)
    expect(r.remaining).toBe(14000)
  })

  it("gives no room under 18", () => {
    expect(calculateTfsaRoom({ age: 17, year: 2026, totalContributions: 0, withdrawalsBeforeThisYear: 0 }).limit).toBe(0)
  })
})

describe("calculateFhsaRoom", () => {
  it("gives $8,000 in the year it's opened", () => {
    const r = calculateFhsaRoom({ age: 30, year: 2026, yearOpened: 2026, contributionsBeforeThisYear: 0, contributionsThisYear: 0 })
    expect(r.limit).toBe(8000)
  })

  it("carries forward unused room, capped at $8,000", () => {
    // CRA example: contributed 5,000 the first year -> 11,000 the next
    expect(calculateFhsaRoom({ age: 30, year: 2026, yearOpened: 2025, contributionsBeforeThisYear: 5000, contributionsThisYear: 0 }).limit).toBe(11000)
    // nothing contributed for 3 years still only carries $8,000
    expect(calculateFhsaRoom({ age: 30, year: 2026, yearOpened: 2023, contributionsBeforeThisYear: 0, contributionsThisYear: 0 }).limit).toBe(16000)
  })

  it("never exceeds the $40,000 lifetime limit", () => {
    const r = calculateFhsaRoom({ age: 30, year: 2026, yearOpened: 2023, contributionsBeforeThisYear: 32000, contributionsThisYear: 0 })
    expect(r.limit).toBe(8000)
    expect(calculateFhsaRoom({ age: 30, year: 2027, yearOpened: 2023, contributionsBeforeThisYear: 40000, contributionsThisYear: 0 }).limit).toBe(0)
  })

  it("has no room until an account is opened", () => {
    expect(calculateFhsaRoom({ age: 30, year: 2026, yearOpened: undefined, contributionsBeforeThisYear: 0, contributionsThisYear: 0 }).limit).toBe(0)
  })
})

describe("calculateRrspRoom", () => {
  it("estimates 18% of income", () => {
    expect(calculateRrspRoom({ year: 2026, annualIncome: 75000, contributionsThisYear: 0 }).limit).toBe(13500)
  })

  it("caps at the year's dollar limit", () => {
    expect(calculateRrspRoom({ year: 2026, annualIncome: 500000, contributionsThisYear: 0 }).limit).toBe(33810)
  })

  it("prefers the Notice of Assessment figure when given", () => {
    const r = calculateRrspRoom({ year: 2026, annualIncome: 75000, deductionLimitFromNoa: 41000, contributionsThisYear: 5000 })
    expect(r.limit).toBe(41000)
    expect(r.remaining).toBe(36000)
  })
})

describe("buildAccounts", () => {
  it("over-contribution shows as negative room and an over-limit status", async () => {
    const { buildAccounts } = await import("./portfolioService")
    const tfsa = buildAccounts({ age: 20, tfsaContributions: 30000 }, [], 2026).find((a) => a.type === "TFSA")!
    expect(tfsa.contributionRoom).toBe(-9000)
    expect(tfsa.status).toBe("overused")
  })
})

describe("buildAccounts balances", () => {
  it("sums the holdings in each account and uses their cost until contributions are entered", async () => {
    const { buildAccounts } = await import("./portfolioService")
    const accounts = buildAccounts({ age: 20 }, [
      { account: "TFSA", value: 12000, cost: 10000 },
      { account: "TFSA", value: 3000, cost: 4000 },
      { account: "PERSONAL", value: 500, cost: 500 },
    ], 2026)
    const tfsa = accounts.find((a) => a.type === "TFSA")!
    expect(tfsa.balance).toBe(15000)
    expect(tfsa.gain).toBe(1000)
    expect(tfsa.contributionUsed).toBe(14000)
    expect(accounts.find((a) => a.type === "PERSONAL")!.balance).toBe(500)
  })
})
