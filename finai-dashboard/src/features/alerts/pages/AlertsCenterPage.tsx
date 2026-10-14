import { useEffect, useMemo, useState } from "react"
import Card from "../../../components/ui/Card"
import {
  clearTriggeredAlerts,
  createAlertRule,
  deleteRule,
  evaluateAndTriggerAlerts,
  getAlertRules,
  getConditionLabel,
  getTriggeredAlerts,
  markTriggeredAlertRead,
  type AlertConditionType,
  type AlertRule,
  type MarketSnapshot,
  type TriggeredAlert,
  updateRuleEnabled,
} from "../services/userAlertsService"

type Props = {
  portfolioTickers?: string[]
}

const CONDITIONS: { value: AlertConditionType; label: string; hint: string }[] = [
  { value: "price_above", label: "Price above", hint: "Target price in $" },
  { value: "price_below", label: "Price below", hint: "Target price in $" },
  { value: "day_change_up", label: "Daily gain %", hint: "Alert when gain is >= this %" },
  { value: "day_change_down", label: "Daily drop %", hint: "Alert when drop is >= this %" },
  { value: "near_52w_high", label: "Near 52-week high", hint: "Distance from high in %" },
  { value: "near_52w_low", label: "Near 52-week low", hint: "Distance from low in %" },
]

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString()
}

function formatThreshold(condition: AlertConditionType, threshold: number) {
  if (condition === "price_above" || condition === "price_below") {
    return `$${threshold.toFixed(2)}`
  }

  return `${threshold.toFixed(2)}%`
}

export default function AlertsCenterPage({
  portfolioTickers = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "META", "GLD"],
}: Props) {
  const uniqueTickers = useMemo(
    () => [...new Set(portfolioTickers.map((ticker) => ticker.trim().toUpperCase()))].filter(Boolean),
    [portfolioTickers]
  )

  const [rules, setRules] = useState<AlertRule[]>([])
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([])
  const [snapshots, setSnapshots] = useState<Record<string, MarketSnapshot>>({})
  const [symbol, setSymbol] = useState(uniqueTickers[0] ?? "AAPL")
  const [condition, setCondition] = useState<AlertConditionType>("price_above")
  const [threshold, setThreshold] = useState<string>("200")
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)

  const unreadCount = triggeredAlerts.filter((alert) => !alert.isRead).length
  const activeRules = rules.filter((rule) => rule.isEnabled)
  const dataSource = Object.values(snapshots).some((snapshot) => snapshot.source === "live")
    ? "Live market data"
    : "Fallback data"

  const currentHint = CONDITIONS.find((item) => item.value === condition)?.hint ?? ""

  const reloadFromStorage = () => {
    setRules(getAlertRules())
    setTriggeredAlerts(getTriggeredAlerts())
  }

  const runEvaluation = async (showMessage = false) => {
    setIsChecking(true)
    try {
      const result = await evaluateAndTriggerAlerts(getAlertRules())
      setRules(result.rules)
      setTriggeredAlerts(result.triggeredAlerts)
      setSnapshots((prev) => ({ ...prev, ...result.snapshotsBySymbol }))

      if (showMessage) {
        if (result.newTriggeredCount > 0) {
          setStatusMessage(`Created ${result.newTriggeredCount} new alert trigger(s).`)
        } else {
          setStatusMessage("Checked all active alert rules. No new triggers right now.")
        }
      }
    } catch {
      if (showMessage) {
        setStatusMessage("Unable to evaluate alerts right now. Please try again.")
      }
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    reloadFromStorage()
  }, [])

  useEffect(() => {
    if (!symbol && uniqueTickers.length > 0) {
      setSymbol(uniqueTickers[0])
    }
  }, [symbol, uniqueTickers])

  useEffect(() => {
    runEvaluation(false)
    const interval = setInterval(() => {
      void runEvaluation(false)
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const onCreateRule = () => {
    const numericThreshold = Number(threshold)

    if (!symbol || !Number.isFinite(numericThreshold) || numericThreshold <= 0) {
      setStatusMessage("Please choose an asset and enter a valid threshold greater than 0.")
      return
    }

    createAlertRule({
      symbol,
      condition,
      threshold: numericThreshold,
    })

    reloadFromStorage()
    setStatusMessage(`Created rule: ${symbol} - ${getConditionLabel(condition)} ${formatThreshold(condition, numericThreshold)}`)
  }

  const onToggleRule = (ruleId: string, isEnabled: boolean) => {
    updateRuleEnabled(ruleId, isEnabled)
    reloadFromStorage()
  }

  const onDeleteRule = (ruleId: string) => {
    deleteRule(ruleId)
    reloadFromStorage()
  }

  const onMarkRead = (alertId: string) => {
    markTriggeredAlertRead(alertId)
    reloadFromStorage()
  }

  const onClearTriggered = () => {
    clearTriggeredAlerts()
    reloadFromStorage()
    setStatusMessage("Cleared triggered alerts history.")
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Active Rules</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">{activeRules.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Unread Triggers</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">{unreadCount}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Monitored Assets</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">{uniqueTickers.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Data Source</p>
          <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-white">{dataSource}</p>
        </Card>
      </div>

      <Card title="Create Alert Rule">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Asset</span>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              {uniqueTickers.map((ticker) => (
                <option key={ticker} value={ticker}>
                  {ticker}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 lg:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Condition</span>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AlertConditionType)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              {CONDITIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Threshold</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              placeholder="Enter value"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={onCreateRule}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500"
            >
              Add Rule
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{currentHint}</p>
      </Card>

      <Card title="Current Snapshots">
        {Object.keys(snapshots).length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Snapshots populate after your first rule check.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.values(snapshots).map((snapshot) => (
              <div key={snapshot.symbol} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-950 dark:text-white">{snapshot.symbol}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{snapshot.source}</p>
                </div>
                <p className="mt-2 text-xl font-bold text-zinc-950 dark:text-white">${snapshot.currentPrice.toFixed(2)}</p>
                <p className={`text-sm ${snapshot.dayChangePercent >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {snapshot.dayChangePercent >= 0 ? "+" : ""}
                  {snapshot.dayChangePercent.toFixed(2)}% today
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  52W High: {snapshot.week52High ? `$${snapshot.week52High.toFixed(2)}` : "N/A"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  52W Low: {snapshot.week52Low ? `$${snapshot.week52Low.toFixed(2)}` : "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Alert Rules">
        {rules.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No rules yet. Create your first alert rule above.</p>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">{rule.symbol}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      {getConditionLabel(rule.condition)} {formatThreshold(rule.condition, rule.threshold)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Created {formatDateTime(rule.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleRule(rule.id, !rule.isEnabled)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        rule.isEnabled
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {rule.isEnabled ? "Enabled" : "Disabled"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRule(rule.id)}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Triggered Alerts">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => void runEvaluation(true)}
            disabled={isChecking}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {isChecking ? "Checking..." : "Check Now"}
          </button>
          <button
            type="button"
            onClick={onClearTriggered}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Clear History
          </button>
        </div>

        {statusMessage && <p className="mb-3 text-sm text-blue-600 dark:text-blue-300">{statusMessage}</p>}

        {triggeredAlerts.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No triggers yet. Alerts will appear when your conditions are met.</p>
        ) : (
          <div className="space-y-3">
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 ${
                  alert.isRead
                    ? "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40"
                    : "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20"
                }`}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">{alert.symbol}</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{alert.message}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Triggered {formatDateTime(alert.triggeredAt)}</p>
                  </div>
                  {!alert.isRead && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(alert.id)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
