/**
 * Canadian registered-account contribution rules, per CRA:
 * - TFSA: https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/contributing/calculate-room.html
 * - FHSA: https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/contributing-your-fhsa.html
 * - RRSP: https://www.canada.ca/en/revenue-agency/services/tax/registered-plans-administrators/pspa/mp-rrsp-dpsp-tfsa-limits-ympe.html
 *
 * Update the tables each year when CRA publishes new limits (usually Nov/Dec).
 */

/** TFSA annual dollar limit by year. Room accumulates from the year you turn 18 (or 2009, whichever is later). */
export const TFSA_ANNUAL_LIMITS: Record<number, number> = {
  2009: 5000, 2010: 5000, 2011: 5000, 2012: 5000,
  2013: 5500, 2014: 5500,
  2015: 10000,
  2016: 5500, 2017: 5500, 2018: 5500,
  2019: 6000, 2020: 6000, 2021: 6000, 2022: 6000,
  2023: 6500,
  2024: 7000, 2025: 7000, 2026: 7000,
}

/** RRSP dollar limit by tax year (the cap on 18% of the previous year's earned income). */
export const RRSP_DOLLAR_LIMITS: Record<number, number> = {
  2023: 30780,
  2024: 31560,
  2025: 32490,
  2026: 33810,
  2027: 35390,
}

export const RRSP_INCOME_RATE = 0.18

export const FHSA_ANNUAL_LIMIT = 8000
export const FHSA_MAX_CARRYFORWARD = 8000
export const FHSA_LIFETIME_LIMIT = 40000
export const FHSA_FIRST_YEAR = 2023
export const FHSA_MIN_AGE = 18
export const FHSA_MAX_AGE = 71

const TFSA_FIRST_YEAR = 2009

function latestKnown(table: Record<number, number>, year: number) {
  const years = Object.keys(table).map(Number).sort((a, b) => a - b)
  const known = years.filter((y) => y <= year)
  return table[known[known.length - 1] ?? years[0]]
}

export function tfsaAnnualLimit(year: number) {
  return TFSA_ANNUAL_LIMITS[year] ?? latestKnown(TFSA_ANNUAL_LIMITS, year)
}

export function rrspDollarLimit(year: number) {
  return RRSP_DOLLAR_LIMITS[year] ?? latestKnown(RRSP_DOLLAR_LIMITS, year)
}

export interface RoomResult {
  /** Total room available for the year, before contributions. */
  limit: number
  /** Contributions counted against that room. */
  used: number
  /** limit - used. Negative means over-contributed. */
  remaining: number
  /** Plain-language explanation of how the number was calculated. */
  note: string
}

/**
 * TFSA room = sum of annual limits since you became eligible
 *           + withdrawals made in previous years
 *           - all contributions ever made.
 * Assumes Canadian residency since turning 18.
 */
export function calculateTfsaRoom(opts: {
  age: number
  year: number
  totalContributions: number
  withdrawalsBeforeThisYear: number
}): RoomResult {
  const yearTurned18 = opts.year - opts.age + 18
  const firstYear = Math.max(TFSA_FIRST_YEAR, yearTurned18)

  let cumulative = 0
  for (let y = firstYear; y <= opts.year; y++) cumulative += tfsaAnnualLimit(y)

  const limit = cumulative + Math.max(0, opts.withdrawalsBeforeThisYear)
  const used = Math.max(0, opts.totalContributions)
  const note =
    firstYear > opts.year
      ? "TFSA room starts the year you turn 18."
      : `Room since ${firstYear} ($${tfsaAnnualLimit(opts.year).toLocaleString()} added in ${opts.year})${
          opts.withdrawalsBeforeThisYear > 0 ? " plus past withdrawals" : ""
        }.`

  return { limit, used, remaining: limit - used, note }
}

/**
 * FHSA room for this year = $8,000 + unused room from previous years (carryforward capped at $8,000),
 * never more than what's left of the $40,000 lifetime limit.
 * Carryforward is estimated from totals, which matches CRA's year-by-year calculation unless
 * a past year was over-contributed.
 */
export function calculateFhsaRoom(opts: {
  age: number
  year: number
  yearOpened: number | undefined
  contributionsBeforeThisYear: number
  contributionsThisYear: number
}): RoomResult {
  const used = Math.max(0, opts.contributionsThisYear)

  if (!opts.yearOpened) {
    const eligible = opts.age >= FHSA_MIN_AGE && opts.age <= FHSA_MAX_AGE
    return {
      limit: 0,
      used,
      remaining: 0 - used,
      note: eligible
        ? `Not opened yet. Room only starts once you open an FHSA ($${FHSA_ANNUAL_LIMIT.toLocaleString()}/yr, $${FHSA_LIFETIME_LIMIT.toLocaleString()} lifetime).`
        : `FHSA is for first-time buyers aged ${FHSA_MIN_AGE}–${FHSA_MAX_AGE}.`,
    }
  }

  const opened = Math.max(FHSA_FIRST_YEAR, opts.yearOpened)
  const priorYears = Math.max(0, opts.year - opened)
  const priorContribs = Math.max(0, opts.contributionsBeforeThisYear)
  const carryforward = Math.min(FHSA_MAX_CARRYFORWARD, Math.max(0, priorYears * FHSA_ANNUAL_LIMIT - priorContribs))
  const lifetimeLeft = Math.max(0, FHSA_LIFETIME_LIMIT - priorContribs)
  const limit = Math.min(FHSA_ANNUAL_LIMIT + carryforward, lifetimeLeft)

  const note =
    lifetimeLeft === 0
      ? `$${FHSA_LIFETIME_LIMIT.toLocaleString()} lifetime limit reached.`
      : `$${FHSA_ANNUAL_LIMIT.toLocaleString()} for ${opts.year}${
          carryforward > 0 ? ` + $${carryforward.toLocaleString()} carried forward` : ""
        }. $${lifetimeLeft.toLocaleString()} of the $${FHSA_LIFETIME_LIMIT.toLocaleString()} lifetime limit left.`

  return { limit, used, remaining: limit - used, note }
}

/**
 * RRSP deduction limit. The exact figure (including unused room from past years and pension
 * adjustments) is on your Notice of Assessment; without it we estimate this year's new room as
 * 18% of last year's earned income, capped at the year's dollar limit.
 */
export function calculateRrspRoom(opts: {
  year: number
  annualIncome: number
  deductionLimitFromNoa?: number
  contributionsThisYear: number
}): RoomResult {
  const used = Math.max(0, opts.contributionsThisYear)

  if (opts.deductionLimitFromNoa && opts.deductionLimitFromNoa > 0) {
    return {
      limit: opts.deductionLimitFromNoa,
      used,
      remaining: opts.deductionLimitFromNoa - used,
      note: "Deduction limit from your Notice of Assessment.",
    }
  }

  const cap = rrspDollarLimit(opts.year)
  const limit = Math.round(Math.min(Math.max(0, opts.annualIncome) * RRSP_INCOME_RATE, cap))
  return {
    limit,
    used,
    remaining: limit - used,
    note: `Estimate: 18% of income, max $${cap.toLocaleString()} for ${opts.year}. Doesn't include unused room from past years. Check your Notice of Assessment for the exact number.`,
  }
}
