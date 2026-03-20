import { useState } from "react"
import PageShell from "../../../components/layout/PageShell"

type SettingsSection = "general" | "portfolio" | "display" | "integrations" | "security"

interface Toast {
	id: string
	message: string
}

export default function SettingsPage() {
	const [activeSection, setActiveSection] = useState<SettingsSection>("general")
	const [toasts, setToasts] = useState<Toast[]>([])
	const [settings, setSettings] = useState({
		// General
		timezone: "EST",
		currency: "USD",
		defaultPage: "dashboard",

		// Portfolio
		defaultView: "all-assets",
		hideSmallBalances: true,
		minBalanceThreshold: 100,
		showGains: true,
		defaultSort: "value-desc",

		// Display
		density: "normal",
		chartRange: "1m",
		animations: true,
		sidebarCollapsed: false,

		// Integrations
		autoSync: true,
		syncFrequency: "5min",
		staleDataWarnings: true,

		// Security
		twoFactor: false,
	})

	const showToast = (message: string) => {
		const id = Math.random().toString(36).substr(2, 9)
		const toast: Toast = { id, message }
		setToasts((prev) => [...prev, toast])
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id))
		}, 2500)
	}

	const toggleSetting = (key: keyof typeof settings) => {
		setSettings((prev) => ({
			...prev,
			[key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
		}))
		const labels: Record<string, string> = {
			hideSmallBalances: "Small balances toggle",
			showGains: "Gain display toggle",
			animations: "Animations toggle",
			sidebarCollapsed: "Sidebar collapsed toggle",
			autoSync: "Auto-sync toggle",
			staleDataWarnings: "Stale data warnings toggle",
			twoFactor: "Two-factor authentication",
		}
		showToast(`${labels[key] || "Setting"} updated`)
	}

	const updateSetting = (key: keyof typeof settings, value: string | number | boolean) => {
		setSettings((prev) => ({
			...prev,
			[key]: value as any,
		}))
		showToast("Setting saved")
	}

	const handleAction = (action: string) => {
		const messages: Record<string, string> = {
			changePassword: "Password change initiated",
			sessions: "Active sessions view opened",
			export: "Data export started",
			statements: "Statements download initiated",
			delete: "Account deletion request submitted",
		}
		showToast(messages[action] || "Action completed")
	}

	const sections: { id: SettingsSection; label: string }[] = [
		{ id: "general", label: "General" },
		{ id: "portfolio", label: "Portfolio" },
		{ id: "display", label: "Display" },
		{ id: "integrations", label: "Integrations" },
		{ id: "security", label: "Security" },
	]

	return (
		<PageShell title="Settings">
			{/* Toasts */}
			<div className="fixed top-4 right-4 z-40 space-y-2">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 border border-blue-500/30 text-blue-200 transition-all"
					>
						{toast.message}
					</div>
				))}
			</div>

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-light tracking-tight text-white mb-2">Settings</h1>
				<p className="text-sm text-zinc-400">Customize how you interact with FIN/AI</p>
			</div>

			{/* Settings Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Navigation Sidebar */}
				<div className="lg:col-span-1">
					<div className="space-y-1">
						{sections.map((section) => (
							<button
								key={section.id}
								onClick={() => setActiveSection(section.id)}
								className={`w-full px-4 py-3 text-left text-sm rounded-lg transition-colors duration-200 ${
									activeSection === section.id
										? "bg-zinc-900 border border-zinc-700 text-white font-medium"
										: "text-zinc-400 hover:text-white hover:bg-zinc-800/30"
								}`}
							>
								{section.label}
							</button>
						))}
					</div>
				</div>

				{/* Settings Content */}
				<div className="lg:col-span-3">
					{/* General */}
					{activeSection === "general" && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm text-zinc-400 mb-2">Timezone</label>
								<select
									value={settings.timezone}
									onChange={(e) => updateSetting("timezone", e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
								>
									<option>EST</option>
									<option>CST</option>
									<option>MST</option>
									<option>PST</option>
									<option>UTC</option>
								</select>
							</div>

							<div>
								<label className="block text-sm text-zinc-400 mb-2">Currency</label>
								<select
									value={settings.currency}
									onChange={(e) => updateSetting("currency", e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
								>
									<option>USD</option>
									<option>CAD</option>
									<option>EUR</option>
									<option>GBP</option>
									<option>AUD</option>
								</select>
							</div>

							<div>
								<label className="block text-sm text-zinc-400 mb-2">Default Landing Page</label>
								<select
									value={settings.defaultPage}
									onChange={(e) => updateSetting("defaultPage", e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
								>
									<option value="dashboard">Dashboard</option>
									<option value="portfolio">Portfolio</option>
									<option value="advisor">Advisor</option>
									<option value="alerts">Alerts</option>
								</select>
							</div>
						</div>
					)}

					{/* Portfolio */}
					{activeSection === "portfolio" && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm text-zinc-400 mb-2">Default View</label>
								<select
									value={settings.defaultView}
									onChange={(e) => updateSetting("defaultView", e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
								>
									<option value="all-assets">All Assets</option>
									<option value="connected-only">Connected Sources Only</option>
									<option value="largest">Largest First</option>
									<option value="sector">Grouped by Sector</option>
								</select>
							</div>

							<div>
								<label className="block text-sm text-zinc-400 mb-2">Default Sorting</label>
								<select
									value={settings.defaultSort}
									onChange={(e) => updateSetting("defaultSort", e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
								>
									<option value="value-desc">Largest Value</option>
									<option value="value-asc">Smallest Value</option>
									<option value="gain-desc">Best Gain</option>
									<option value="gain-asc">Worst Gain</option>
									<option value="alphabetical">Alphabetical</option>
								</select>
							</div>

							<div className="space-y-3 pt-4 border-t border-zinc-800">
								<div className="flex items-center justify-between">
									<label className="text-sm text-zinc-300">Hide small balances</label>
									<button
										onClick={() => toggleSetting("hideSmallBalances")}
										className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${
											settings.hideSmallBalances
												? "bg-green-600/80 hover:bg-green-600 justify-end"
												: "bg-zinc-700/40 hover:bg-zinc-700/60 justify-start"
										} p-0.5`}
									>
										<div className="w-4 h-4 bg-white rounded-full shadow-sm" />
									</button>
								</div>

								{settings.hideSmallBalances && (
									<div>
										<label className="text-xs text-zinc-400">Minimum threshold</label>
										<input
											type="number"
											value={settings.minBalanceThreshold}
											onChange={(e) => updateSetting("minBalanceThreshold", Number(e.target.value))}
											className="w-full mt-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
										/>
									</div>
								)}

								<div className="flex items-center justify-between">
									<label className="text-sm text-zinc-300">Show gain percentages</label>
									<button
										onClick={() => toggleSetting("showGains")}
										className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${
											settings.showGains
												? "bg-green-600/80 hover:bg-green-600 justify-end"
												: "bg-zinc-700/40 hover:bg-zinc-700/60 justify-start"
										} p-0.5`}
									>
										<div className="w-4 h-4 bg-white rounded-full shadow-sm" />
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Display */}
					{activeSection === "display" && (
						<div className="space-y-6">
							<div>
								<label className="block text-sm text-zinc-400 mb-2">Density</label>
								<select
									value={settings.density}
									onChange={(e) => updateSetting("density", e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
								>
									<option value="compact">Compact</option>
									<option value="normal">Normal</option>
									<option value="spacious">Spacious</option>
								</select>
							</div>

							<div>
								<label className="block text-sm text-zinc-400 mb-2">Default Chart Range</label>
								<select
									value={settings.chartRange}
									onChange={(e) => updateSetting("chartRange", e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
								>
									<option value="1d">1 Day</option>
									<option value="1w">1 Week</option>
									<option value="1m">1 Month</option>
									<option value="3m">3 Months</option>
									<option value="1y">1 Year</option>
									<option value="all">All Time</option>
								</select>
							</div>

							<div className="space-y-3 pt-4 border-t border-zinc-800">
								<div className="flex items-center justify-between">
									<label className="text-sm text-zinc-300">Enable animations</label>
									<button
										onClick={() => toggleSetting("animations")}
										className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${
											settings.animations
												? "bg-green-600/80 hover:bg-green-600 justify-end"
												: "bg-zinc-700/40 hover:bg-zinc-700/60 justify-start"
										} p-0.5`}
									>
										<div className="w-4 h-4 bg-white rounded-full shadow-sm" />
									</button>
								</div>

								<div className="flex items-center justify-between">
									<label className="text-sm text-zinc-300">Collapse sidebar by default</label>
									<button
										onClick={() => toggleSetting("sidebarCollapsed")}
										className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${
											settings.sidebarCollapsed
												? "bg-green-600/80 hover:bg-green-600 justify-end"
												: "bg-zinc-700/40 hover:bg-zinc-700/60 justify-start"
										} p-0.5`}
									>
										<div className="w-4 h-4 bg-white rounded-full shadow-sm" />
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Integrations */}
					{activeSection === "integrations" && (
						<div className="space-y-6">
							<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 mb-6">
								<p className="text-sm text-blue-200">Manage how connected accounts sync with your portfolio</p>
							</div>

							<div>
								<label className="block text-sm text-zinc-400 mb-2">Sync Frequency</label>
								<select
									value={settings.syncFrequency}
									onChange={(e) => updateSetting("syncFrequency", e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
								>
									<option value="realtime">Real-time</option>
									<option value="1min">Every 1 minute</option>
									<option value="5min">Every 5 minutes</option>
									<option value="15min">Every 15 minutes</option>
									<option value="hourly">Hourly</option>
									<option value="manual">Manual only</option>
								</select>
							</div>

							<div className="space-y-3 pt-4 border-t border-zinc-800">
								<div className="flex items-center justify-between">
									<label className="text-sm text-zinc-300">Auto-sync enabled</label>
									<button
										onClick={() => toggleSetting("autoSync")}
										className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${
											settings.autoSync
												? "bg-green-600/80 hover:bg-green-600 justify-end"
												: "bg-zinc-700/40 hover:bg-zinc-700/60 justify-start"
										} p-0.5`}
									>
										<div className="w-4 h-4 bg-white rounded-full shadow-sm" />
									</button>
								</div>

								<div className="flex items-center justify-between">
									<label className="text-sm text-zinc-300">Warn when data is stale</label>
									<button
										onClick={() => toggleSetting("staleDataWarnings")}
										className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${
											settings.staleDataWarnings
												? "bg-green-600/80 hover:bg-green-600 justify-end"
												: "bg-zinc-700/40 hover:bg-zinc-700/60 justify-start"
										} p-0.5`}
									>
										<div className="w-4 h-4 bg-white rounded-full shadow-sm" />
									</button>
								</div>
							</div>

							<div className="pt-4 border-t border-zinc-800">
								<button className="text-sm px-3 py-2 border border-zinc-700/50 rounded hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors text-center w-full">
									Manage Connections
								</button>
							</div>
						</div>
					)}

					{/* Security */}
					{activeSection === "security" && (
						<div className="space-y-6">
							<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 mb-6">
								<p className="text-sm text-blue-200">Protect your account with strong security practices</p>
							</div>

							<div className="space-y-2 pb-4 border-b border-zinc-800">
								<p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Account</p>
								<button
									onClick={() => handleAction("changePassword")}
									className="w-full text-left px-3 py-2 text-sm border border-zinc-700/50 rounded hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors"
								>
									Change Password
								</button>
								<button
									onClick={() => handleAction("sessions")}
									className="w-full text-left px-3 py-2 text-sm border border-zinc-700/50 rounded hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors"
								>
									View Active Sessions
								</button>
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-sm text-zinc-300">Two-factor authentication</label>
									<button
										onClick={() => toggleSetting("twoFactor")}
										className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center ${
											settings.twoFactor
												? "bg-green-600/80 hover:bg-green-600 justify-end"
												: "bg-zinc-700/40 hover:bg-zinc-700/60 justify-start"
										} p-0.5`}
									>
										<div className="w-4 h-4 bg-white rounded-full shadow-sm" />
									</button>
								</div>
							</div>

							<div className="pt-4 border-t border-zinc-800 space-y-2">
								<p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Data</p>
								<button
									onClick={() => handleAction("export")}
									className="w-full text-left px-3 py-2 text-sm border border-zinc-700/50 rounded hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors"
								>
									Export My Data
								</button>
								<button
									onClick={() => handleAction("statements")}
									className="w-full text-left px-3 py-2 text-sm border border-zinc-700/50 rounded hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors"
								>
									Download Statements
								</button>
							</div>

							<div className="pt-6 border-t border-zinc-800">
								<div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
									<p className="text-xs uppercase tracking-wider text-red-300 font-medium mb-3">Danger Zone</p>
									<button
										onClick={() => handleAction("delete")}
										className="w-full text-left px-3 py-2 text-sm border border-red-500/30 text-red-300 rounded hover:border-red-500/50 hover:bg-red-500/5 transition-colors"
									>
										Delete Account & Data
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</PageShell>
	)
}

