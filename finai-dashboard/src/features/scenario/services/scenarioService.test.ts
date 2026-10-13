// Purpose: Verify scenario requests, the built-in fallback when the backend is down, asset search, and asset class detection.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../../../services/apiClient", () => ({ default: { get: vi.fn(), post: vi.fn() } }))

import apiClient from "../../../services/apiClient"
import scenarioService from "./scenarioService"
import type { PortfolioHolding, ScenarioImpact } from "../types/scenario.types"

const post = vi.mocked(apiClient.post)
const get = vi.mocked(apiClient.get)

const stock = (value = 1000): PortfolioHolding => ({ symbol: "AAPL", quantity: 1, currentValue: value, assetClass: "stock" })

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {})
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})
  post.mockReset()
  get.mockReset()
})

afterEach(() => vi.restoreAllMocks())

describe("calculateScenario", () => {
  it("returns the backend result when the call succeeds", async () => {
    const impact = { scenarioId: "2008-financial-crisis", totalReturn: -12.5, maxDrawdown: -20 } as ScenarioImpact
    post.mockResolvedValue({ status: 200, data: { success: true, data: impact } })

    const result = await scenarioService.calculateScenario({ holdings: [stock()], scenarioId: "2008-financial-crisis" })

    expect(result).toBe(impact)
    expect(post).toHaveBeenCalledWith("/api/scenario/calculate", expect.objectContaining({ scenarioId: "2008-financial-crisis" }))
  })

  it("falls back to built-in estimates when the backend says it failed", async () => {
    post.mockResolvedValue({ status: 200, data: { success: false, data: null } })

    const result = await scenarioService.calculateScenario({ holdings: [stock()], scenarioId: "covid-2020-crash" })

    expect(result.scenarioId).toBe("covid-2020-crash")
    expect(result.totalReturn).toBeCloseTo(-34, 5)
  })

  it("falls back to built-in estimates when the backend is unreachable", async () => {
    post.mockRejectedValue(new Error("HTTP 500: Server Error"))

    const result = await scenarioService.calculateScenario({ holdings: [stock()], scenarioId: "2008-financial-crisis" })

    expect(result.totalReturn).toBeCloseTo(-57, 5)
  })
})

describe("fallback estimates", () => {
  const impactFor = async (scenarioId: string, holdings: PortfolioHolding[] = [stock()]) => {
    post.mockRejectedValue(new Error("offline"))
    return scenarioService.calculateScenario({ holdings, scenarioId })
  }

  it.each([
    ["2008-financial-crisis", -57],
    ["covid-2020-crash", -34],
    ["covid-recovery-2020", 120],
    ["crypto-winter-2022", -18],
    ["post-2008-recovery", 400],
    ["dot-com-bubble", -49],
    ["black-monday-1987", -22.6],
    ["2022-bear-market", -25],
  ])("%s moves a stock by %s%%", async (scenarioId, expected) => {
    expect((await impactFor(scenarioId)).totalReturn).toBeCloseTo(expected, 5)
  })

  it("applies a default 20% loss to an unknown scenario", async () => {
    expect((await impactFor("made-up")).totalReturn).toBeCloseTo(-20, 5)
  })

  it("treats each asset class separately", async () => {
    const holdings: PortfolioHolding[] = [
      { symbol: "AAPL", quantity: 1, currentValue: 1000, assetClass: "stock" },
      { symbol: "TLT", quantity: 1, currentValue: 1000, assetClass: "bond" },
    ]
    const result = await impactFor("2008-financial-crisis", holdings)

    expect(result.affectedAssets[0].percentChange).toBeCloseTo(-57, 5)
    expect(result.affectedAssets[1].percentChange).toBeCloseTo(5, 5)
    expect(result.totalReturn).toBeCloseTo(-26, 5)
  })

  it("computes each asset's contribution to the total", async () => {
    const result = await impactFor("2008-financial-crisis", [stock(1000), stock(3000)])

    expect(result.affectedAssets[0].contribution).toBeCloseTo((-570 / 4000) * 100, 5)
  })

  it("derives recovery days and volatility from the total return", async () => {
    const result = await impactFor("2008-financial-crisis")

    expect(result.recoveryDays).toBe(285)
    expect(result.volatility).toBeCloseTo(28.5, 5)
  })

  it("builds a 181-point timeline that starts near the starting value", async () => {
    const result = await impactFor("2008-financial-crisis")

    expect(result.timeline).toHaveLength(181)
    expect(Math.abs(result.timeline[0].percentChange)).toBeLessThan(1)
  })

  it("ends the timeline near the final value", async () => {
    const result = await impactFor("2008-financial-crisis")

    // The timeline adds random noise of at most 1% of the total change (570 here), so allow 6.
    expect(Math.abs(result.timeline[180].portfolioValue - 430)).toBeLessThanOrEqual(6)
  })

  it("reports a drawdown that is not positive for a crash", async () => {
    expect((await impactFor("2008-financial-crisis")).maxDrawdown).toBeLessThan(0)
  })

  it.each([
    ["dot-com-bubble", "crypto"],
    ["black-monday-1987", "crypto"],
    ["made-up", "bond"],
  ] as const)("keeps a 0%% multiplier flat for %s %s instead of falling back to -20%%", async (scenarioId, assetClass) => {
    const holding: PortfolioHolding = { symbol: "X", quantity: 1, currentValue: 1000, assetClass }
    const result = await impactFor(scenarioId, [holding])

    expect(result.totalReturn).toBe(0)
    expect(result.affectedAssets[0].finalValue).toBe(1000)
  })

  it("still applies the default 20% loss to an unrecognised asset class", async () => {
    const holding = { symbol: "X", quantity: 1, currentValue: 1000, assetClass: "unknown" } as unknown as PortfolioHolding

    expect((await impactFor("2008-financial-crisis", [holding])).totalReturn).toBeCloseTo(-20, 5)
  })
})

describe("searchAssets", () => {
  it("returns nothing for a blank query without calling the backend", async () => {
    expect(await scenarioService.searchAssets("   ")).toEqual([])
    expect(get).not.toHaveBeenCalled()
  })

  it("returns the backend results", async () => {
    const results = [{ symbol: "AAPL", name: "Apple", type: "stock" }]
    get.mockResolvedValue({ status: 200, data: { success: true, results } })

    expect(await scenarioService.searchAssets("apple")).toEqual(results)
  })

  it("trims and URL-encodes the query", async () => {
    get.mockResolvedValue({ status: 200, data: { success: true, results: [] } })
    await scenarioService.searchAssets("  hello world ")

    expect(get).toHaveBeenCalledWith("/api/search?q=hello%20world")
  })

  it("returns nothing when the backend reports failure", async () => {
    get.mockResolvedValue({ status: 200, data: { success: false, results: [] } })

    expect(await scenarioService.searchAssets("apple")).toEqual([])
  })

  it("returns nothing when the request throws", async () => {
    get.mockRejectedValue(new Error("offline"))

    expect(await scenarioService.searchAssets("apple")).toEqual([])
  })
})

describe("convertPortfolioToHoldings", () => {
  const holdingsFor = (symbol: string) =>
    scenarioService.convertPortfolioToHoldings({ accounts: [{ positions: [{ symbol, quantity: 1, marketValue: 100 }] }] })[0]

  it("returns an empty list when there is no portfolio", () => {
    expect(scenarioService.convertPortfolioToHoldings(null)).toEqual([])
    expect(scenarioService.convertPortfolioToHoldings({})).toEqual([])
  })

  it("flattens positions across accounts", () => {
    const portfolio = {
      accounts: [
        { positions: [{ symbol: "AAPL", quantity: 2, marketValue: 300 }] },
        { positions: [{ symbol: "VTI", quantity: 1, marketValue: 200 }, { symbol: "BTC", quantity: 1, marketValue: 50 }] },
      ],
    }

    expect(scenarioService.convertPortfolioToHoldings(portfolio)).toHaveLength(3)
  })

  it("accepts the alternative field names ticker, shares and value", () => {
    const [holding] = scenarioService.convertPortfolioToHoldings({
      accounts: [{ positions: [{ ticker: "MSFT", shares: 4, value: 1600 }] }],
    })

    expect(holding).toEqual({ symbol: "MSFT", quantity: 4, currentValue: 1600, assetClass: "stock" })
  })

  it("skips accounts that have no positions", () => {
    expect(scenarioService.convertPortfolioToHoldings({ accounts: [{}] })).toEqual([])
  })

  it.each([
    ["BTC", "crypto"],
    ["ETH", "crypto"],
    ["bitcoin", "crypto"],
    ["SPY", "etf"],
    ["vti", "etf"],
    ["TLT", "bond"],
    ["GLD", "commodity"],
    ["AAPL", "stock"],
    ["UNKNOWN", "stock"],
  ])("classifies %s as %s", (symbol, assetClass) => {
    expect(holdingsFor(symbol).assetClass).toBe(assetClass)
  })
})
