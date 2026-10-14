// Purpose: Verify alert rule storage and the rules that decide when an alert fires, using a fake localStorage and offline fallback prices.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type Service = typeof import("./userAlertsService")

function fakeLocalStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
  }
}

let svc: Service

beforeEach(async () => {
  vi.stubGlobal("window", { localStorage: fakeLocalStorage() })
  vi.stubEnv("VITE_FINNHUB_API_KEY", "")
  vi.resetModules()
  svc = await import("./userAlertsService")
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

const make = (symbol: string, condition: Parameters<Service["createAlertRule"]>[0]["condition"], threshold: number) =>
  svc.createAlertRule({ symbol, condition, threshold })

describe("alert rule storage", () => {
  it("normalises the symbol and starts enabled", () => {
    const rule = make("  aapl ", "price_above", 200)

    expect(rule.symbol).toBe("AAPL")
    expect(rule.isEnabled).toBe(true)
  })

  it("stores the threshold as a number", () => {
    expect(make("AAPL", "price_above", "150" as unknown as number).threshold).toBe(150)
  })

  it("saves rules so they can be read back", () => {
    const rule = make("AAPL", "price_above", 200)

    expect(svc.getAlertRules().map((r) => r.id)).toEqual([rule.id])
  })

  it("lists the newest rule first", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    const older = make("AAPL", "price_above", 200)
    vi.setSystemTime(new Date("2026-02-01T00:00:00Z"))
    const newer = make("MSFT", "price_below", 300)

    expect(svc.getAlertRules().map((r) => r.id)).toEqual([newer.id, older.id])
  })

  it("gives every rule a unique id", () => {
    const a = make("AAPL", "price_above", 1)
    const b = make("AAPL", "price_above", 1)

    expect(a.id).not.toBe(b.id)
  })

  it("can disable and re-enable a rule", () => {
    const rule = make("AAPL", "price_above", 200)
    svc.updateRuleEnabled(rule.id, false)
    expect(svc.getAlertRules()[0].isEnabled).toBe(false)

    svc.updateRuleEnabled(rule.id, true)
    expect(svc.getAlertRules()[0].isEnabled).toBe(true)
  })

  it("deletes a rule and leaves the others", () => {
    const keep = make("AAPL", "price_above", 200)
    const drop = make("MSFT", "price_below", 300)
    svc.deleteRule(drop.id)

    expect(svc.getAlertRules().map((r) => r.id)).toEqual([keep.id])
  })

  it("returns an empty list when nothing is stored", () => {
    expect(svc.getAlertRules()).toEqual([])
    expect(svc.getTriggeredAlerts()).toEqual([])
  })
})

describe("market snapshots without an API key", () => {
  it("uses built-in fallback prices for known symbols", async () => {
    const snapshot = await svc.getMarketSnapshot("aapl")

    expect(snapshot).toMatchObject({ symbol: "AAPL", currentPrice: 190.15, source: "fallback" })
  })

  it("uses neutral defaults for unknown symbols", async () => {
    const snapshot = await svc.getMarketSnapshot("ZZZZ")

    expect(snapshot).toMatchObject({ currentPrice: 100, dayChangePercent: 0, week52High: 120, week52Low: 80 })
  })
})

describe("when an alert fires", () => {
  // Fallback prices: AAPL 190.15 (+1.4%, high 204.2, low 162.8), TSLA 186.2 (-3.2%, high 278.9, low 138.8).
  const fires = async (symbol: string, condition: Parameters<typeof make>[1], threshold: number) => {
    const result = await svc.evaluateAndTriggerAlerts([make(symbol, condition, threshold)])
    return result.newTriggeredCount === 1
  }

  it("price_above fires at or over the threshold only", async () => {
    expect(await fires("AAPL", "price_above", 190)).toBe(true)
    expect(await fires("MSFT", "price_above", 500)).toBe(false)
  })

  it("price_below fires at or under the threshold only", async () => {
    expect(await fires("AAPL", "price_below", 200)).toBe(true)
    expect(await fires("MSFT", "price_below", 100)).toBe(false)
  })

  it("day_change_up fires when the gain reaches the threshold", async () => {
    expect(await fires("AAPL", "day_change_up", 1)).toBe(true)
    expect(await fires("AAPL", "day_change_up", 2)).toBe(false)
  })

  it("day_change_down fires when the drop reaches the threshold", async () => {
    expect(await fires("TSLA", "day_change_down", 3)).toBe(true)
    expect(await fires("TSLA", "day_change_down", 4)).toBe(false)
  })

  it("day_change_down never fires for a stock that is up", async () => {
    expect(await fires("AAPL", "day_change_down", 1)).toBe(false)
  })

  it("near_52w_high fires when the price is close enough to its high", async () => {
    expect(await fires("AAPL", "near_52w_high", 10)).toBe(true)
    expect(await fires("TSLA", "near_52w_high", 10)).toBe(false)
  })

  it("near_52w_low fires when the price is close enough to its low", async () => {
    expect(await fires("AAPL", "near_52w_low", 20)).toBe(true)
    expect(await fires("AAPL", "near_52w_low", 5)).toBe(false)
  })

  it.each([0, -5])("never fires for an invalid threshold of %s", async (threshold) => {
    expect(await fires("AAPL", "price_above", threshold)).toBe(false)
  })
})

describe("evaluateAndTriggerAlerts", () => {
  it("skips disabled rules", async () => {
    const rule = make("AAPL", "price_above", 100)
    svc.updateRuleEnabled(rule.id, false)

    const result = await svc.evaluateAndTriggerAlerts()

    expect(result.newTriggeredCount).toBe(0)
  })

  it("stores the triggered alert as unread with a readable message", async () => {
    make("AAPL", "price_above", 100)
    await svc.evaluateAndTriggerAlerts()

    const [alert] = svc.getTriggeredAlerts()
    expect(alert.isRead).toBe(false)
    expect(alert.message).toContain("AAPL is above 100.00")
  })

  it("records when a rule last fired", async () => {
    make("AAPL", "price_above", 100)
    const { rules } = await svc.evaluateAndTriggerAlerts()

    expect(rules[0].lastTriggeredAt).toBeTruthy()
  })

  it("does not fire the same rule again while an unread alert exists", async () => {
    make("AAPL", "price_above", 100)
    await svc.evaluateAndTriggerAlerts()
    const rules = svc.getAlertRules().map((r) => ({ ...r, lastTriggeredAt: undefined }))

    const second = await svc.evaluateAndTriggerAlerts(rules)

    expect(second.newTriggeredCount).toBe(0)
    expect(svc.getTriggeredAlerts()).toHaveLength(1)
  })

  it("respects the 30 minute cooldown after a rule fires", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-03-01T12:00:00Z"))
    make("AAPL", "price_above", 100)
    await svc.evaluateAndTriggerAlerts()
    svc.markTriggeredAlertRead(svc.getTriggeredAlerts()[0].id)

    vi.setSystemTime(new Date("2026-03-01T12:20:00Z"))
    expect((await svc.evaluateAndTriggerAlerts()).newTriggeredCount).toBe(0)

    vi.setSystemTime(new Date("2026-03-01T12:31:00Z"))
    expect((await svc.evaluateAndTriggerAlerts()).newTriggeredCount).toBe(1)
  })

  it("fetches each symbol only once when several rules share it", async () => {
    make("AAPL", "price_above", 100)
    make("AAPL", "price_below", 300)
    const result = await svc.evaluateAndTriggerAlerts()

    expect(Object.keys(result.snapshotsBySymbol)).toEqual(["AAPL"])
    expect(result.newTriggeredCount).toBe(2)
  })

  it("marks an alert as read", async () => {
    make("AAPL", "price_above", 100)
    await svc.evaluateAndTriggerAlerts()
    svc.markTriggeredAlertRead(svc.getTriggeredAlerts()[0].id)

    expect(svc.getTriggeredAlerts()[0].isRead).toBe(true)
  })

  it("clears all triggered alerts", async () => {
    make("AAPL", "price_above", 100)
    await svc.evaluateAndTriggerAlerts()
    svc.clearTriggeredAlerts()

    expect(svc.getTriggeredAlerts()).toEqual([])
  })

  it("removes a rule's triggered alerts when the rule is deleted", async () => {
    const rule = make("AAPL", "price_above", 100)
    await svc.evaluateAndTriggerAlerts()
    svc.deleteRule(rule.id)

    expect(svc.getTriggeredAlerts()).toEqual([])
  })
})
