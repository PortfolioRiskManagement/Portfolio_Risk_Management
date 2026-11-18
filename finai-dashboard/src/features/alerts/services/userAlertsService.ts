export type AlertConditionType =
  | "price_above"
  | "price_below"
  | "day_change_up"
  | "day_change_down"
  | "near_52w_high"
  | "near_52w_low"

export interface AlertRule {
  id: string
  symbol: string
  condition: AlertConditionType
  threshold: number
  isEnabled: boolean
  createdAt: string
  lastTriggeredAt?: string
}

export interface TriggeredAlert {
  id: string
  ruleId: string
  symbol: string
  condition: AlertConditionType
  threshold: number
  message: string
  triggeredValue: number
  triggeredAt: string
  isRead: boolean
}

export interface MarketSnapshot {
  symbol: string
  currentPrice: number
  dayChangePercent: number
  week52High: number | null
  week52Low: number | null
  source: "live" | "fallback"
}

interface FinnhubQuote {
  c: number
  dp: number
}

interface FinnhubMetricResponse {
  metric?: Record<string, number>
}

interface RuleEvaluationResult {
  triggered: boolean
  message: string
  triggeredValue: number
}

const RULES_STORAGE_KEY = "finai.alertRules.v1"
const TRIGGERED_STORAGE_KEY = "finai.triggeredAlerts.v1"
const EVALUATION_COOLDOWN_MS = 30 * 60 * 1000

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1"

const FALLBACK_QUOTES: Record<string, { price: number; changePct: number; week52High: number; week52Low: number }> = {
  AAPL: { price: 190.15, changePct: 1.4, week52High: 204.2, week52Low: 162.8 },
  MSFT: { price: 417.9, changePct: -0.9, week52High: 430.6, week52Low: 311.4 },
  GOOGL: { price: 174.4, changePct: 2.1, week52High: 181.6, week52Low: 129.2 },
  TSLA: { price: 186.2, changePct: -3.2, week52High: 278.9, week52Low: 138.8 },
  NVDA: { price: 918.55, changePct: 4.5, week52High: 974.0, week52Low: 604.1 },
  META: { price: 512.8, changePct: 1.9, week52High: 544.2, week52Low: 337.1 },
  GLD: { price: 221.45, changePct: 0.7, week52High: 229.1, week52Low: 175.3 },
}

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase()
}

function readStorage<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!hasStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function buildUrl(endpoint: string, params: Record<string, string | number>) {
  const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })

  url.searchParams.set("token", FINNHUB_API_KEY)
  return url.toString()
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function fetchSnapshotFromApi(symbol: string): Promise<MarketSnapshot> {
  const quoteUrl = buildUrl("/quote", { symbol })
  const metricUrl = buildUrl("/stock/metric", { symbol, metric: "all" })

  const [quote, metricResponse] = await Promise.all([
    fetchJson<FinnhubQuote>(quoteUrl),
    fetchJson<FinnhubMetricResponse>(metricUrl),
  ])

  const metric = metricResponse.metric ?? {}

  return {
    symbol,
    currentPrice: Number(quote.c || 0),
    dayChangePercent: Number(quote.dp || 0),
    week52High: Number.isFinite(metric["52WeekHigh"]) ? metric["52WeekHigh"] : null,
    week52Low: Number.isFinite(metric["52WeekLow"]) ? metric["52WeekLow"] : null,
    source: "live",
  }
}

function getFallbackSnapshot(symbol: string): MarketSnapshot {
  const normalized = normalizeSymbol(symbol)
  const fallback = FALLBACK_QUOTES[normalized] ?? {
    price: 100,
    changePct: 0,
    week52High: 120,
    week52Low: 80,
  }

  return {
    symbol: normalized,
    currentPrice: fallback.price,
    dayChangePercent: fallback.changePct,
    week52High: fallback.week52High,
    week52Low: fallback.week52Low,
    source: "fallback",
  }
}

function shouldSkipRuleByCooldown(rule: AlertRule, nowMs: number) {
  if (!rule.lastTriggeredAt) return false
  const lastMs = new Date(rule.lastTriggeredAt).getTime()
  return nowMs - lastMs < EVALUATION_COOLDOWN_MS
}

function evaluateRule(rule: AlertRule, snapshot: MarketSnapshot): RuleEvaluationResult {
  const threshold = Number(rule.threshold)

  if (!Number.isFinite(threshold) || threshold <= 0) {
    return {
      triggered: false,
      message: "Invalid threshold",
      triggeredValue: 0,
    }
  }

  switch (rule.condition) {
    case "price_above": {
      const triggered = snapshot.currentPrice >= threshold
      return {
        triggered,
        message: `${rule.symbol} is above ${threshold.toFixed(2)} (current ${snapshot.currentPrice.toFixed(2)}).`,
        triggeredValue: snapshot.currentPrice,
      }
    }
    case "price_below": {
      const triggered = snapshot.currentPrice <= threshold
      return {
        triggered,
        message: `${rule.symbol} is below ${threshold.toFixed(2)} (current ${snapshot.currentPrice.toFixed(2)}).`,
        triggeredValue: snapshot.currentPrice,
      }
    }
    case "day_change_up": {
      const triggered = snapshot.dayChangePercent >= threshold
      return {
        triggered,
        message: `${rule.symbol} is up ${snapshot.dayChangePercent.toFixed(2)}% today (threshold ${threshold.toFixed(2)}%).`,
        triggeredValue: snapshot.dayChangePercent,
      }
    }
    case "day_change_down": {
      const triggered = snapshot.dayChangePercent <= -Math.abs(threshold)
      return {
        triggered,
        message: `${rule.symbol} is down ${Math.abs(snapshot.dayChangePercent).toFixed(2)}% today (threshold ${Math.abs(threshold).toFixed(2)}%).`,
        triggeredValue: snapshot.dayChangePercent,
      }
    }
    case "near_52w_high": {
      if (!snapshot.week52High || snapshot.week52High <= 0) {
        return { triggered: false, message: "52-week high not available", triggeredValue: 0 }
      }
      const distancePct = ((snapshot.week52High - snapshot.currentPrice) / snapshot.week52High) * 100
      const triggered = distancePct <= threshold
      return {
        triggered,
        message: `${rule.symbol} is ${Math.max(distancePct, 0).toFixed(2)}% from 52-week high (threshold ${threshold.toFixed(2)}%).`,
        triggeredValue: distancePct,
      }
    }
    case "near_52w_low": {
      if (!snapshot.week52Low || snapshot.week52Low <= 0) {
        return { triggered: false, message: "52-week low not available", triggeredValue: 0 }
      }
      const distancePct = ((snapshot.currentPrice - snapshot.week52Low) / snapshot.week52Low) * 100
      const triggered = distancePct <= threshold
      return {
        triggered,
        message: `${rule.symbol} is ${Math.max(distancePct, 0).toFixed(2)}% from 52-week low (threshold ${threshold.toFixed(2)}%).`,
        triggeredValue: distancePct,
      }
    }
    default:
      return {
        triggered: false,
        message: "Unsupported condition",
        triggeredValue: 0,
      }
  }
}

export function getConditionLabel(condition: AlertConditionType) {
  switch (condition) {
    case "price_above":
      return "Price Above"
    case "price_below":
      return "Price Below"
    case "day_change_up":
      return "Daily Gain >= X%"
    case "day_change_down":
      return "Daily Drop >= X%"
    case "near_52w_high":
      return "Near 52-Week High"
    case "near_52w_low":
      return "Near 52-Week Low"
    default:
      return condition
  }
}

export function getAlertRules(): AlertRule[] {
  const rules = readStorage<AlertRule[]>(RULES_STORAGE_KEY, [])
  return rules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getTriggeredAlerts(): TriggeredAlert[] {
  const alerts = readStorage<TriggeredAlert[]>(TRIGGERED_STORAGE_KEY, [])
  return alerts.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
}

export function createAlertRule(input: {
  symbol: string
  condition: AlertConditionType
  threshold: number
}): AlertRule {
  const nextRule: AlertRule = {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    symbol: normalizeSymbol(input.symbol),
    condition: input.condition,
    threshold: Number(input.threshold),
    isEnabled: true,
    createdAt: new Date().toISOString(),
  }

  const all = getAlertRules()
  writeStorage(RULES_STORAGE_KEY, [nextRule, ...all])
  return nextRule
}

export function updateRuleEnabled(ruleId: string, isEnabled: boolean) {
  const updated = getAlertRules().map((rule) =>
    rule.id === ruleId
      ? {
          ...rule,
          isEnabled,
        }
      : rule
  )
  writeStorage(RULES_STORAGE_KEY, updated)
}

export function deleteRule(ruleId: string) {
  const updatedRules = getAlertRules().filter((rule) => rule.id !== ruleId)
  writeStorage(RULES_STORAGE_KEY, updatedRules)

  const updatedTriggered = getTriggeredAlerts().filter((alert) => alert.ruleId !== ruleId)
  writeStorage(TRIGGERED_STORAGE_KEY, updatedTriggered)
}

export function markTriggeredAlertRead(alertId: string) {
  const updated = getTriggeredAlerts().map((alert) =>
    alert.id === alertId
      ? {
          ...alert,
          isRead: true,
        }
      : alert
  )
  writeStorage(TRIGGERED_STORAGE_KEY, updated)
}

export function clearTriggeredAlerts() {
  writeStorage(TRIGGERED_STORAGE_KEY, [])
}

export async function getMarketSnapshot(symbol: string): Promise<MarketSnapshot> {
  const normalized = normalizeSymbol(symbol)

  if (!FINNHUB_API_KEY) {
    return getFallbackSnapshot(normalized)
  }

  try {
    return await fetchSnapshotFromApi(normalized)
  } catch {
    return getFallbackSnapshot(normalized)
  }
}

export async function evaluateAndTriggerAlerts(rules: AlertRule[] = getAlertRules()) {
  const nowIso = new Date().toISOString()
  const nowMs = Date.now()
  const enabledRules = rules.filter((rule) => rule.isEnabled)
  const snapshotsBySymbol: Record<string, MarketSnapshot> = {}
  const existingTriggered = getTriggeredAlerts()
  const newTriggered: TriggeredAlert[] = []

  for (const rule of enabledRules) {
    if (!snapshotsBySymbol[rule.symbol]) {
      snapshotsBySymbol[rule.symbol] = await getMarketSnapshot(rule.symbol)
    }

    if (shouldSkipRuleByCooldown(rule, nowMs)) {
      continue
    }

    const evaluation = evaluateRule(rule, snapshotsBySymbol[rule.symbol])
    if (!evaluation.triggered) {
      continue
    }

    const alreadyUnread = existingTriggered.some(
      (item) => item.ruleId === rule.id && !item.isRead
    )

    if (alreadyUnread) {
      continue
    }

    newTriggered.push({
      id: `trigger-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ruleId: rule.id,
      symbol: rule.symbol,
      condition: rule.condition,
      threshold: rule.threshold,
      message: evaluation.message,
      triggeredValue: evaluation.triggeredValue,
      triggeredAt: nowIso,
      isRead: false,
    })
  }

  const updatedRules = rules.map((rule) => {
    const didTrigger = newTriggered.some((alert) => alert.ruleId === rule.id)
    if (!didTrigger) return rule

    return {
      ...rule,
      lastTriggeredAt: nowIso,
    }
  })

  if (newTriggered.length > 0) {
    writeStorage(TRIGGERED_STORAGE_KEY, [...newTriggered, ...existingTriggered])
  }
  writeStorage(RULES_STORAGE_KEY, updatedRules)

  return {
    rules: updatedRules,
    triggeredAlerts: getTriggeredAlerts(),
    snapshotsBySymbol,
    newTriggeredCount: newTriggered.length,
  }
}
