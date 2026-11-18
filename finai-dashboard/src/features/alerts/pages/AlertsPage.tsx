import { useCallback, useEffect, useState } from "react"
import Card from "../../../components/ui/Card"
import { useHoldingAlerts } from "../hooks/useHoldingAlerts"
import {
	checkForAlerts,
	clearAlerts,
	markAllRead,
	markRead,
	saveSettings,
	type AlertSettings,
	type HoldingAlert,
	type HoldingMove,
} from "../services/holdingAlertsService"

const THRESHOLDS = [1, 2, 3, 5]

function notificationPermission(): NotificationPermission | "unsupported" {
	return typeof Notification === "undefined" ? "unsupported" : Notification.permission
}

function timeAgo(iso: string) {
	const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
	if (mins < 1) return "just now"
	if (mins < 60) return `${mins}m ago`
	const hours = Math.round(mins / 60)
	if (hours < 24) return `${hours}h ago`
	return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
	return (
		<label className="flex cursor-pointer items-start justify-between gap-4 py-2">
			<span>
				<span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
				<span className="block text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
			</span>
			<input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-indigo-600" />
		</label>
	)
}

function AlertRow({ alert }: { alert: HoldingAlert }) {
	const tone =
		alert.kind === "news"
			? "border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/30"
			: alert.direction === "down"
				? "border-rose-200 bg-rose-50 dark:border-rose-800/50 dark:bg-rose-950/30"
				: "border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/30"
	const badge =
		alert.kind === "news" ? "News" : alert.direction === "down" ? "Drop" : "Gain"

	return (
		<div
			onClick={() => !alert.read && markRead(alert.id)}
			className={`rounded-xl border p-4 transition ${tone} ${alert.read ? "opacity-70" : ""}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						{!alert.read && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-label="Unread" />}
						<span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-200">{badge}</span>
						<span className="text-xs text-zinc-500 dark:text-zinc-400">{timeAgo(alert.createdAt)}</span>
					</div>
					<div className="mt-2 font-semibold text-zinc-900 dark:text-zinc-100">{alert.title}</div>
					<div className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{alert.message}</div>
				</div>
				{alert.link && (
					<a href={alert.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="shrink-0 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
						View →
					</a>
				)}
			</div>
		</div>
	)
}

export default function AlertsPage() {
	const { alerts, settings, unreadCount } = useHoldingAlerts()
	const [moves, setMoves] = useState<HoldingMove[] | null>(null)
	const [checking, setChecking] = useState(false)
	const [lastChecked, setLastChecked] = useState<Date | null>(null)
	const [permission, setPermission] = useState(notificationPermission)

	const runCheck = useCallback(async () => {
		setChecking(true)
		try {
			const result = await checkForAlerts()
			setMoves(result.moves)
			setLastChecked(new Date())
		} finally {
			setChecking(false)
		}
	}, [])

	useEffect(() => {
		runCheck()
	}, [runCheck])

	function update(patch: Partial<AlertSettings>) {
		saveSettings({ ...settings, ...patch })
		runCheck()
	}

	async function enableNotifications() {
		if (typeof Notification === "undefined") return
		setPermission(await Notification.requestPermission())
	}

	const sortedMoves = [...(moves ?? [])].sort((a, b) => Math.abs(b.changePercent ?? 0) - Math.abs(a.changePercent ?? 0))

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-zinc-600 dark:text-zinc-400">
					Get notified when a holding moves {settings.threshold}% or more in a day, or when big news hits it.
				</p>
				<button
					onClick={runCheck}
					disabled={checking}
					className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
				>
					{checking ? "Checking…" : "Check now"}
				</button>
			</div>

			{settings.browserNotifications && permission === "default" && (
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800/50 dark:bg-indigo-950/30">
					<div className="text-sm text-zinc-800 dark:text-zinc-200">Turn on desktop notifications to get alerted even when you're on another tab.</div>
					<button onClick={enableNotifications} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">
						Enable notifications
					</button>
				</div>
			)}
			{settings.browserNotifications && permission === "denied" && (
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300">
					Desktop notifications are blocked for this site. Allow them in your browser's site settings to get pop-up alerts.
				</div>
			)}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<Card
						title={`Alerts${unreadCount ? ` · ${unreadCount} new` : ""}`}
						action={
							alerts.length > 0 && (
								<div className="flex gap-3 text-sm">
									{unreadCount > 0 && (
										<button onClick={markAllRead} className="text-indigo-600 hover:underline dark:text-indigo-400">Mark all read</button>
									)}
									<button onClick={clearAlerts} className="text-zinc-500 hover:underline dark:text-zinc-400">Clear</button>
								</div>
							)
						}
					>
						{alerts.length === 0 ? (
							<div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
								No alerts yet. You'll see one here when a holding moves {settings.threshold}%+ in a day
								{settings.newsAlerts ? " or has major news" : ""}.
							</div>
						) : (
							<div className="space-y-3">
								{alerts.map((a) => <AlertRow key={a.id} alert={a} />)}
							</div>
						)}
					</Card>

					<Card title="Today's moves">
						{moves === null ? (
							<div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading prices…</div>
						) : sortedMoves.length === 0 ? (
							<div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
								Couldn't load prices. Is the backend running (python app.py)?
							</div>
						) : (
							<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
								{sortedMoves.map((m) => {
									const pct = m.changePercent
									const big = pct !== null && Math.abs(pct) >= settings.threshold
									return (
										<div key={m.symbol} className="flex items-center justify-between py-2.5">
											<div className="min-w-0">
												<span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.symbol}</span>
												<span className="ml-2 truncate text-sm text-zinc-500 dark:text-zinc-400">{m.name}</span>
											</div>
											<div className="flex items-center gap-4">
												<span className="text-sm text-zinc-700 dark:text-zinc-300">${m.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
												<span
													className={`w-20 rounded-full px-2 py-0.5 text-right text-sm font-medium ${
														pct === null
															? "text-zinc-400"
															: pct < 0
																? `text-rose-600 dark:text-rose-400 ${big ? "bg-rose-100 dark:bg-rose-500/15" : ""}`
																: `text-emerald-600 dark:text-emerald-400 ${big ? "bg-emerald-100 dark:bg-emerald-500/15" : ""}`
													}`}
												>
													{pct === null ? "—" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`}
												</span>
											</div>
										</div>
									)
								})}
							</div>
						)}
						{lastChecked && (
							<div className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
								Last checked {lastChecked.toLocaleTimeString()} · checks automatically every 5 minutes while the app is open
							</div>
						)}
					</Card>
				</div>

				<Card title="Alert settings" className="h-fit">
					<div className="py-2">
						<div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Alert when a holding moves</div>
						<div className="mt-2 flex gap-2">
							{THRESHOLDS.map((t) => (
								<button
									key={t}
									onClick={() => update({ threshold: t })}
									className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${
										settings.threshold === t
											? "border-indigo-600 bg-indigo-600 text-white"
											: "border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
									}`}
								>
									{t}%+
								</button>
							))}
						</div>
					</div>
					<div className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
						<Toggle label="Big gains too" hint="Not just drops" checked={settings.includeGains} onChange={(v) => update({ includeGains: v })} />
						<Toggle label="Major news" hint="Earnings, downgrades, lawsuits, mergers…" checked={settings.newsAlerts} onChange={(v) => update({ newsAlerts: v })} />
						<Toggle label="Desktop notifications" hint="Pop-up when a new alert arrives" checked={settings.browserNotifications} onChange={(v) => update({ browserNotifications: v })} />
					</div>
				</Card>
			</div>
		</div>
	)
}
