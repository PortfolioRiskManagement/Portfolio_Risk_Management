import { describe, expect, it } from "vitest"
import { buildMoveAlert, DEFAULT_SETTINGS, type HoldingMove } from "./holdingAlertsService"
import { isCryptoTicker } from "./alertsService"

const move = (changePercent: number | null): HoldingMove => ({ symbol: "AAPL", name: "Apple Inc.", price: 100, changePercent })

describe("buildMoveAlert", () => {
  it("ignores moves smaller than the threshold", () => {
    expect(buildMoveAlert(move(-1.5), DEFAULT_SETTINGS)).toBeNull()
  })

  it("alerts on a drop past the threshold", () => {
    const alert = buildMoveAlert(move(-2.3), DEFAULT_SETTINGS)
    expect(alert?.direction).toBe("down")
    expect(alert?.title).toBe("AAPL is down 2.30% today")
  })

  it("uses a new id once the move crosses the next threshold step", () => {
    const first = buildMoveAlert(move(-2.3), DEFAULT_SETTINGS)
    const worse = buildMoveAlert(move(-4.1), DEFAULT_SETTINGS)
    const same = buildMoveAlert(move(-3.9), DEFAULT_SETTINGS)
    expect(worse?.id).not.toBe(first?.id)
    expect(same?.id).toBe(first?.id)
  })

  it("skips gains when includeGains is off", () => {
    expect(buildMoveAlert(move(3), { ...DEFAULT_SETTINGS, includeGains: false })).toBeNull()
    expect(buildMoveAlert(move(3), DEFAULT_SETTINGS)?.direction).toBe("up")
  })

  it("ignores quotes without a daily change", () => {
    expect(buildMoveAlert(move(null), DEFAULT_SETTINGS)).toBeNull()
  })
})

describe("isCryptoTicker", () => {
  it("detects crypto symbols", () => {
    expect(isCryptoTicker("BTC")).toBe(true)
    expect(isCryptoTicker("doge-usd")).toBe(true)
    expect(isCryptoTicker("AAPL")).toBe(false)
  })
})
