// Purpose: Check that portfolio value history combines holdings and fills non-trading days.
import { describe, expect, it } from "vitest"
import { combineHistories } from "./usePortfolioHistory"

const DAY = 24 * 60 * 60 * 1000

describe("combineHistories", () => {
  it("sums quantity x close across holdings", () => {
    const points = combineHistories(
      [{ symbol: "AAA", quantity: 2 }, { symbol: "BBB", quantity: 1 }],
      {
        AAA: { times: [0, DAY], prices: [10, 11] },
        BBB: { times: [0, DAY], prices: [100, 90] },
      },
      DAY
    )
    expect(points.map((p) => p.value)).toEqual([120, 112])
  })

  it("carries the last close forward over days a market was closed", () => {
    const points = combineHistories(
      [{ symbol: "STOCK", quantity: 1 }, { symbol: "BTC", quantity: 1 }],
      {
        STOCK: { times: [0, 3 * DAY], prices: [50, 60] },
        BTC: { times: [0, DAY, 2 * DAY, 3 * DAY], prices: [1, 2, 3, 4] },
      },
      DAY
    )
    expect(points.map((p) => p.value)).toEqual([51, 52, 53, 64])
  })

  it("returns nothing when no history loaded", () => {
    expect(combineHistories([{ symbol: "X", quantity: 1 }], {})).toEqual([])
  })
})
