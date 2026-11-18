import { loadHoldings, type Holding } from "../../portfolio/hooks/useHoldings"
import { fetchQuoteDetails } from "../../portfolio/hooks/useLivePrice"
import { fetchHoldingNews } from "./alertsService"

export interface HoldingAlert {
  id: string
  kind: "move" | "news"
  symbol: string
  title: string
  message: string
  createdAt: string
  read: boolean
  direction?: "up" | "down"
  changePercent?: number
  link?: string
}

export interface AlertSettings {
  /** Alert when a holding moves at least this many % in a day. */
  threshold: number
  /** Also alert on big gains, not just drops. */
  includeGains: boolean
  /** Alert on high-impact news about a holding. */
  newsAlerts: boolean
  /** Show a desktop notification for new alerts. */
  browserNotifications: boolean
}

export interface HoldingMove {
  symbol: string
  name: string
  price: number
  changePercent: number | null
}

export const DEFAULT_SETTINGS: AlertSettings = {
  threshold: 2,
  includeGains: true,
  newsAlerts: true,
  browserNotifications: true,
}

const ALERTS_KEY = "finai.holdingAlerts.v1"
const SETTINGS_KEY = "finai.alertSettings.v1"
// ids we already sent a desktop notification for, so a cleared alert that reappears stays quiet
const SEEN_KEY = "finai.seenAlertIds.v1"
const MAX_SEEN = 500
const MAX_STORED = 100
export const ALERTS_EVENT = "finai-alerts-change"

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(ALERTS_EVENT))
}

export function getAlerts(): HoldingAlert[] {
  return read<HoldingAlert[]>(ALERTS_KEY, [])
}

export function getSettings(): AlertSettings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<AlertSettings>>(SETTINGS_KEY, {}) }
}

export function saveSettings(settings: AlertSettings) {
  write(SETTINGS_KEY, settings)
}

export function markAllRead() {
  write(ALERTS_KEY, getAlerts().map(a => ({ ...a, read: true })))
}

export function markRead(id: string) {
  write(ALERTS_KEY, getAlerts().map(a => (a.id === id ? { ...a, read: true } : a)))
}

export function clearAlerts() {
  write(ALERTS_KEY, [])
}

function localDate() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/**
 * One alert per holding, per day, per threshold step: a 2.3% drop alerts once,
 * and it alerts again only if it keeps falling past 4%, 6%, ...
 */
export function buildMoveAlert(move: HoldingMove, settings: AlertSettings): HoldingAlert | null {
  const pct = move.changePercent
  if (pct === null || settings.threshold <= 0) return null
  const direction = pct >= 0 ? "up" : "down"
  if (direction === "up" && !settings.includeGains) return null
  const level = Math.floor(Math.abs(pct) / settings.threshold)
  if (level < 1) return null

  const abs = Math.abs(pct).toFixed(2)
  return {
    id: `move-${move.symbol}-${localDate()}-${direction}-${level}`,
    kind: "move",
    symbol: move.symbol,
    title: `${move.symbol} is ${direction === "down" ? "down" : "up"} ${abs}% today`,
    message: `${move.name} is trading at $${move.price.toFixed(2)}, a ${abs}% ${direction === "down" ? "drop" : "gain"} from yesterday's close.`,
    createdAt: new Date().toISOString(),
    read: false,
    direction,
    changePercent: pct,
    link: `https://finance.yahoo.com/quote/${move.symbol}`,
  }
}

export async function fetchHoldingMoves(holdings: Holding[]): Promise<HoldingMove[]> {
  const results = await Promise.all(
    holdings.map(async h => {
      const q = await fetchQuoteDetails(h.symbol)
      return q ? { symbol: h.symbol, name: h.name, price: q.price, changePercent: q.changePercent } : null
    })
  )
  return results.filter((m): m is HoldingMove => m !== null)
}

function notify(alerts: HoldingAlert[], settings: AlertSettings) {
  if (!settings.browserNotifications || typeof Notification === "undefined" || Notification.permission !== "granted") return
  for (const a of alerts.slice(0, 5)) {
    try {
      const n = new Notification(a.title, { body: a.message, tag: a.id })
      n.onclick = () => {
        window.focus()
        window.location.assign("/alerts")
      }
    } catch {
      // some browsers only allow notifications from a service worker
    }
  }
}

/** Check every holding for big daily moves and high-impact news; store and notify anything new. */
export async function checkForAlerts(): Promise<{ moves: HoldingMove[]; newAlerts: HoldingAlert[] }> {
  const holdings = loadHoldings()
  const settings = getSettings()

  const [moves, news] = await Promise.all([
    fetchHoldingMoves(holdings),
    settings.newsAlerts
      ? fetchHoldingNews(
          holdings.map(h => h.symbol),
          holdings.map(h => ({ ticker: h.symbol, companyName: h.name, percentageOfPortfolio: 0 }))
        ).catch(() => [])
      : Promise.resolve([]),
  ])

  const candidates: HoldingAlert[] = [
    ...moves.map(m => buildMoveAlert(m, settings)).filter((a): a is HoldingAlert => a !== null),
    ...news.map(n => ({
      id: n.id,
      kind: "news" as const,
      symbol: n.relatedTickers[0],
      title: `${n.relatedTickers.join(", ")}: ${n.title}`,
      message: n.description,
      createdAt: n.timestamp,
      read: false,
      link: n.link,
    })),
  ]

  const existing = getAlerts()
  const existingIds = new Set(existing.map(a => a.id))
  const newAlerts = candidates.filter(a => !existingIds.has(a.id))

  if (newAlerts.length) {
    const seenIds = read<string[]>(SEEN_KEY, [])
    const seen = new Set(seenIds)
    const unnotified = newAlerts.filter(a => !seen.has(a.id))
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...unnotified.map(a => a.id), ...seenIds].slice(0, MAX_SEEN)))
    } catch {
      // ignore
    }
    const merged = [...newAlerts, ...existing]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_STORED)
    write(ALERTS_KEY, merged)
    notify(unnotified, settings)
  }

  return { moves, newAlerts }
}
