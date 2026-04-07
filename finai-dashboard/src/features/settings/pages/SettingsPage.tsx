import { useEffect, useMemo, useState } from "react"
import PageShell from "../../../components/layout/PageShell"
import Card from "../../../components/ui/Card"
import { useTheme } from "../../../hooks/useTheme"

type ThemeChoice = "light" | "dark"

type SettingsState = {
  theme: ThemeChoice
  marketAlerts: boolean
  weeklyDigest: boolean
  riskWarnings: boolean
  autoSync: boolean
  syncIntervalMinutes: number
  hidePortfolioValues: boolean
}

const STORAGE_KEY = "finai_settings_v1"

const DEFAULT_SETTINGS: SettingsState = {
  theme: "dark",
  marketAlerts: true,
  weeklyDigest: true,
  riskWarnings: true,
  autoSync: true,
  syncIntervalMinutes: 15,
  hidePortfolioValues: false,
}

function readSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS

    const parsed = JSON.parse(raw) as Partial<SettingsState>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme: parsed.theme === "light" ? "light" : "dark",
      syncIntervalMinutes: [5, 15, 30, 60].includes(parsed.syncIntervalMinutes ?? 15)
        ? (parsed.syncIntervalMinutes as number)
        : 15,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function writeSettings(settings: SettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
      <div>
        <div className="font-medium text-zinc-900 dark:text-zinc-100">{label}</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
          checked
            ? "border-emerald-500/70 bg-emerald-500"
            : "border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<SettingsState>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS
    return readSettings()
  })
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [savedAt, setSavedAt] = useState<string>("")

  useEffect(() => {
    setSettings((prev) => (prev.theme === theme ? prev : { ...prev, theme }))
  }, [theme])

  useEffect(() => {
    setSaveState("saving")
    const timer = window.setTimeout(() => {
      writeSettings(settings)
      setSavedAt(new Date().toLocaleTimeString())
      setSaveState("saved")
    }, 250)

    return () => window.clearTimeout(timer)
  }, [settings])

  const statusText = useMemo(() => {
    if (saveState === "saving") return "Saving settings..."
    if (saveState === "saved" && savedAt) return `Auto-saved at ${savedAt}`
    return ""
  }, [saveState, savedAt])

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function setThemeChoice(nextTheme: ThemeChoice) {
    setTheme(nextTheme)
    update("theme", nextTheme)
  }

  function resetDefaults() {
    setSettings(DEFAULT_SETTINGS)
    setTheme(DEFAULT_SETTINGS.theme)
  }

  return (
    <PageShell title="Settings">
      <div className="space-y-4">
        <Card title="Profile Preferences">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">Theme</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setThemeChoice("light")}
                  aria-label="Light mode"
                  title="Light mode"
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    settings.theme === "light"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="inline-flex w-full items-center justify-center">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="4" />
                      <path strokeLinecap="round" d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07 6.7 17.3M17.3 6.7l1.77-1.77" />
                    </svg>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setThemeChoice("dark")}
                  aria-label="Dark mode"
                  title="Dark mode"
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    settings.theme === "dark"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="inline-flex w-full items-center justify-center">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a.8.8 0 0 0-1.08.95A7.5 7.5 0 1 0 20.05 15.6a.8.8 0 0 0 .95-1.1Z" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            <ToggleRow
              label="Hide Portfolio Values"
              description="Mask balances and total values in cards for private viewing."
              checked={settings.hidePortfolioValues}
              onChange={(next) => update("hidePortfolioValues", next)}
            />
          </div>
        </Card>

        <Card title="Notifications">
          <div className="space-y-3">
            <ToggleRow
              label="Market Alerts"
              description="Get alerts when holdings move above your threshold."
              checked={settings.marketAlerts}
              onChange={(next) => update("marketAlerts", next)}
            />
            <ToggleRow
              label="Weekly Digest"
              description="Receive a weekly summary of portfolio performance."
              checked={settings.weeklyDigest}
              onChange={(next) => update("weeklyDigest", next)}
            />
            <ToggleRow
              label="Risk Warnings"
              description="Warn when concentration or volatility becomes high."
              checked={settings.riskWarnings}
              onChange={(next) => update("riskWarnings", next)}
            />
          </div>
        </Card>

        <Card title="Automation">
          <div className="space-y-3">
            <ToggleRow
              label="Auto-Sync Connections"
              description="Automatically sync connected platforms in the background."
              checked={settings.autoSync}
              onChange={(next) => update("autoSync", next)}
            />

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
              <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">Sync Interval</label>
              <select
                value={settings.syncIntervalMinutes}
                onChange={(e) => update("syncIntervalMinutes", Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 60 minutes</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{statusText}</div>
          <button
            type="button"
            onClick={resetDefaults}
            className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Reset To Defaults
          </button>
        </div>
      </div>
    </PageShell>
  )
}
