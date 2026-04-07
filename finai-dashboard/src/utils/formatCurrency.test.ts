// Purpose: Verify number/currency formatting helpers used across dashboard cards and charts.
import { describe, expect, it } from "vitest"

import {
  formatCompactNumber,
  formatCurrency,
  formatCurrencyDetailed,
  formatPercent,
} from "./formatCurrency"

describe("formatCurrency", () => {
  it("formats CAD currency without decimals", () => {
    expect(formatCurrency(12345)).toBe("$12,345")
  })

  it("formats CAD currency with two decimals", () => {
    expect(formatCurrencyDetailed(12345.5)).toBe("$12,345.50")
  })
})

describe("formatPercent", () => {
  it("adds + for positive values", () => {
    expect(formatPercent(2.345, 2)).toBe("+2.35%")
  })

  it("does not add + for negative values", () => {
    expect(formatPercent(-1.2, 1)).toBe("-1.2%")
  })
})

describe("formatCompactNumber", () => {
  it("formats values to K/M suffixes", () => {
    expect(formatCompactNumber(1500)).toBe("1.5K")
    expect(formatCompactNumber(1200000)).toBe("1.2M")
  })

  it("formats small values as whole numbers", () => {
    expect(formatCompactNumber(999.4)).toBe("999")
  })
})
