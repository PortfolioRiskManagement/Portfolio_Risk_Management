// Purpose: Verify credit card recommendation scoring, ranking, and institution grouping.
import { describe, expect, it } from "vitest"

import { INSTITUTIONS, getCardsByInstitution, getTopPicks, scoreCards } from "./creditCardService"
import type { UserProfile } from "../types"

const allCards = INSTITUTIONS.flatMap((i) => i.cards)

const student: UserProfile = { employment: "student", income: "under_30k", priorities: ["no_fee"] }
const earner: UserProfile = { employment: "employed", income: "80k_plus", priorities: ["travel"] }

describe("INSTITUTIONS", () => {
  it("has unique ids and a card list per institution", () => {
    const ids = INSTITUTIONS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(allCards.length).toBeGreaterThan(10)
  })

  it("only contains cards that point back to their institution", () => {
    for (const inst of INSTITUTIONS) {
      for (const card of inst.cards) expect(card.institutionId).toBe(inst.id)
    }
  })

  it("gives every card a unique id", () => {
    const ids = allCards.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("scoreCards", () => {
  it("returns every card with a numeric score, best first", () => {
    const scored = scoreCards(allCards, student)
    expect(scored).toHaveLength(allCards.length)
    const scores = scored.map((c) => c.score ?? 0)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it("does not mutate the input cards", () => {
    scoreCards(allCards, student)
    expect(allCards.every((c) => c.score === undefined)).toBe(true)
  })

  it("favours no-fee cards for someone who wants no fee", () => {
    const top = scoreCards(allCards, student)[0]
    expect(top.annualFee).toBe(0)
  })

  it("scores differently for different profiles", () => {
    const a = scoreCards(allCards, student).map((c) => c.id)
    const b = scoreCards(allCards, earner).map((c) => c.id)
    expect(a).not.toEqual(b)
  })
})

describe("getTopPicks", () => {
  it("returns three picks by default", () => {
    expect(getTopPicks(student)).toHaveLength(3)
  })

  it("respects a custom count", () => {
    expect(getTopPicks(student, 5)).toHaveLength(5)
  })
})

describe("getCardsByInstitution", () => {
  it("returns the unscored list when there is no profile", () => {
    expect(getCardsByInstitution(null)).toBe(INSTITUTIONS)
  })

  it("keeps all institutions and scores their cards when a profile is given", () => {
    const grouped = getCardsByInstitution(student)
    expect(grouped).toHaveLength(INSTITUTIONS.length)
    const first = grouped.find((g) => g.cards.length > 0)
    expect(first?.cards[0].score).toBeTypeOf("number")
  })
})
