// Purpose: Verify human-readable labels for every alert condition type.
import { describe, expect, it } from "vitest"

import { getConditionLabel, type AlertConditionType } from "./userAlertsService"

describe("getConditionLabel", () => {
  const cases: [AlertConditionType, string][] = [
    ["price_above", "Price Above"],
    ["price_below", "Price Below"],
    ["day_change_up", "Daily Gain >= X%"],
    ["day_change_down", "Daily Drop >= X%"],
    ["near_52w_high", "Near 52-Week High"],
    ["near_52w_low", "Near 52-Week Low"],
  ]

  it.each(cases)("labels %s as %s", (condition, label) => {
    expect(getConditionLabel(condition)).toBe(label)
  })
})
