import { useState } from "react"
import { Link } from "react-router-dom"
import PageShell from "../../../components/layout/PageShell"
import Card from "../../../components/ui/Card"
import { useTheme } from "../../../hooks/useTheme"
import { useAuth } from "../../../contexts/AuthContext"
import { useHoldingAlerts } from "../../alerts/hooks/useHoldingAlerts"
import { saveSettings, type AlertSettings } from "../../alerts/services/holdingAlertsService"

type ThemeChoice = "light" | "dark"

const THRESHOLDS = [1, 2, 3, 5]

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
  const { user, signOut } = useAuth()
  const { settings: alertSettings } = useHoldingAlerts()
  const [permission, setPermission] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  )

  function updateAlerts(patch: Partial<AlertSettings>) {
    saveSettings({ ...alertSettings, ...patch })
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") return
    setPermission(await Notification.requestPermission())
  }

  function setThemeChoice(nextTheme: ThemeChoice) {
    setTheme(nextTheme)
  }

  return (
    <PageShell title="Settings">
      <div className="space-y-4">
        <Card title="Appearance">
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
                    theme === "light"
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
                    theme === "dark"
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

          </div>
        </Card>

        <Card title="Alerts" action={<Link to="/alerts" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Open alerts →</Link>}>
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">Alert when a holding moves</div>
              <div className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">Daily change vs. yesterday's close</div>
              <div className="flex gap-2">
                {THRESHOLDS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateAlerts({ threshold: t })}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${
                      alertSettings.threshold === t
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {t}%+
                  </button>
                ))}
              </div>
            </div>
            <ToggleRow
              label="Big Gains Too"
              description="Alert on large daily gains, not just drops."
              checked={alertSettings.includeGains}
              onChange={(next) => updateAlerts({ includeGains: next })}
            />
            <ToggleRow
              label="Major News"
              description="Alert on earnings, downgrades, lawsuits and mergers affecting your holdings."
              checked={alertSettings.newsAlerts}
              onChange={(next) => updateAlerts({ newsAlerts: next })}
            />
            <ToggleRow
              label="Desktop Notifications"
              description={
                permission === "denied"
                  ? "Blocked by your browser. Allow notifications for this site in your browser settings."
                  : "Show a pop-up when a new alert arrives while FIN/AI is open."
              }
              checked={alertSettings.browserNotifications}
              onChange={(next) => {
                updateAlerts({ browserNotifications: next })
                if (next && permission === "default") enableNotifications()
              }}
            />
          </div>
        </Card>

        <Card title="Account">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Signed in as</div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{user?.email ?? "—"}</div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
            >
              Sign out
            </button>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
