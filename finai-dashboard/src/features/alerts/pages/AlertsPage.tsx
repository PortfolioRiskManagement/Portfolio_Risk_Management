import { useState } from "react"
import PageShell from "../../../components/layout/PageShell"

interface Alert {
	id: string
	title: string
	type: "price" | "portfolio" | "risk" | "diversification" | "volatility" | "connection"
	scope?: string
	condition: string
	threshold?: string
	status: "active" | "paused"
	priority: "low" | "medium" | "high"
	deliveryMethods: ("email" | "push" | "in-app")[]
	createdAt: string
}

interface TriggeredAlert {
	id: string
	title: string
	severity: "info" | "warning" | "critical"
	message: string
	timestamp: string
}

interface Toast {
	id: string
	message: string
	type: "success" | "info"
}

const initialAlerts: Alert[] = [
	{
		id: "1",
		title: "Price Target",
		type: "price",
		scope: "BTC",
		condition: "Falls below",
		threshold: "$58,000",
		status: "active",
		priority: "high",
		deliveryMethods: ["email", "in-app"],
		createdAt: "2026-02-15",
	},
	{
		id: "2",
		title: "Concentration Limit",
		type: "diversification",
		scope: "Tech Sector",
		condition: "Exceeds",
		threshold: "65%",
		status: "active",
		priority: "medium",
		deliveryMethods: ["in-app"],
		createdAt: "2026-02-10",
	},
	{
		id: "3",
		title: "Portfolio Risk Score",
		type: "risk",
		scope: "Portfolio",
		condition: "Rises above",
		threshold: "75",
		status: "paused",
		priority: "high",
		deliveryMethods: ["email", "push", "in-app"],
		createdAt: "2026-02-01",
	},
	{
		id: "4",
		title: "Volatility Spike",
		type: "volatility",
		scope: "NVDA",
		condition: "Unusual movement detected",
		status: "active",
		priority: "high",
		deliveryMethods: ["in-app"],
		createdAt: "2026-02-18",
	},
]

const initialActivity: TriggeredAlert[] = [
	{
		id: "t1",
		title: "BTC crossed below target",
		severity: "critical",
		message: "BTC fell to $57,800, below your $58,000 threshold",
		timestamp: "2 hours ago",
	},
	{
		id: "t2",
		title: "Robinhood sync delayed",
		severity: "warning",
		message: "Robinhood account sync delayed for 18 minutes",
		timestamp: "35 minutes ago",
	},
	{
		id: "t3",
		title: "Portfolio up 2.3%",
		severity: "info",
		message: "Your portfolio reached a new daily high of $142,500",
		timestamp: "1 hour ago",
	},
]

export default function AlertsPage() {
	const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
	const [activity, setActivity] = useState<TriggeredAlert[]>(initialActivity)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
	const [toasts, setToasts] = useState<Toast[]>([])
	const [deliveryToggles, setDeliveryToggles] = useState({
		"in-app": true,
		email: true,
		push: false,
	})
	const [formData, setFormData] = useState({
		type: "price" as Alert["type"],
		scope: "",
		condition: "Below",
		threshold: "",
		priority: "medium" as Alert["priority"],
		methods: ["in-app", "email"] as ("in-app" | "email" | "push")[],
	})

	const showToast = (message: string, type: "success" | "info" = "success") => {
		const id = Math.random().toString(36).substr(2, 9)
		const toast: Toast = { id, message, type }
		setToasts((prev) => [...prev, toast])
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id))
		}, 3000)
	}

	const handleToggleDelivery = (channel: "in-app" | "email" | "push") => {
		if (channel === "push" && !deliveryToggles.push) {
			showToast("Push notifications require setup in Security settings")
			return
		}
		setDeliveryToggles((prev) => ({ ...prev, [channel]: !prev[channel] }))
		showToast(`${channel === "in-app" ? "In-app" : channel === "email" ? "Email" : "Push"} notifications ${!deliveryToggles[channel] ? "enabled" : "disabled"}`, "success")
	}

	const handleTestNotification = () => {
		const newActivity: TriggeredAlert = {
			id: `act${Date.now()}`,
			title: "Test Notification",
			severity: "info",
			message: "This is a test notification from your alert rules",
			timestamp: "just now",
		}
		setActivity((prev) => [newActivity, ...prev])
		showToast("Test notification sent successfully", "success")
	}

	const handleCreateAlert = () => {
		if (!formData.scope || !formData.threshold) {
			showToast("Please fill in all required fields", "info")
			return
		}

		if (editingAlert) {
			setAlerts((prev) =>
				prev.map((a) =>
					a.id === editingAlert.id
						? {
								...a,
								type: formData.type,
								scope: formData.scope,
								condition: formData.condition,
								threshold: formData.threshold,
								priority: formData.priority,
								deliveryMethods: formData.methods,
							}
						: a
				)
			)
			showToast("Alert updated", "success")
			setEditingAlert(null)
		} else {
			const newAlert: Alert = {
				id: `${Date.now()}`,
				title: `${formData.type === "price" ? "Price" : formData.type === "portfolio" ? "Portfolio" : formData.type === "risk" ? "Risk" : formData.type === "diversification" ? "Concentration" : "Volatility"} Alert`,
				type: formData.type,
				scope: formData.scope,
				condition: formData.condition,
				threshold: formData.threshold,
				status: "active",
				priority: formData.priority,
				deliveryMethods: formData.methods,
				createdAt: new Date().toISOString().split("T")[0],
			}
			setAlerts((prev) => [newAlert, ...prev])
			showToast("Alert created", "success")
		}

		setShowCreateModal(false)
		setFormData({
			type: "price",
			scope: "",
			condition: "Below",
			threshold: "",
			priority: "medium",
			methods: ["in-app", "email"],
		})
	}

	const handleEditAlert = (alert: Alert) => {
		setEditingAlert(alert)
		setFormData({
			type: alert.type,
			scope: alert.scope || "",
			condition: alert.condition,
			threshold: alert.threshold || "",
			priority: alert.priority,
			methods: alert.deliveryMethods,
		})
		setShowCreateModal(true)
	}

	const handleDeleteAlert = (id: string) => {
		setAlerts((prev) => prev.filter((a) => a.id !== id))
		setDeleteConfirm(null)
		showToast("Alert deleted", "success")
	}

	const handleToggleAlertStatus = (id: string) => {
		setAlerts((prev) =>
			prev.map((a) =>
				a.id === id
					? { ...a, status: a.status === "active" ? "paused" : "active" }
					: a
			)
		)
	}

	const activeCount = alerts.filter((a) => a.status === "active").length

	const severityDot = (severity: string) => {
		const colors: Record<string, string> = {
			critical: "bg-red-500",
			warning: "bg-amber-500",
			info: "bg-blue-500",
		}
		return colors[severity] || "bg-zinc-500"
	}

	return (
		<PageShell title="Alerts">
			{/* Toasts */}
			<div className="fixed top-4 right-4 z-40 space-y-2">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
							toast.type === "success"
								? "bg-green-500/20 border border-green-500/30 text-green-200"
								: "bg-blue-500/20 border border-blue-500/30 text-blue-200"
						}`}
					>
						{toast.message}
					</div>
				))}
			</div>

			{/* Header */}
			<div className="flex items-baseline justify-between mb-8">
				<div>
					<p className="text-sm text-zinc-400">Monitor and manage your portfolio alerts in one place</p>
				</div>
				<button
					onClick={() => {
						setEditingAlert(null)
						setFormData({
							type: "price",
							scope: "",
							condition: "Below",
							threshold: "",
							priority: "medium",
							methods: ["in-app", "email"],
						})
						setShowCreateModal(true)
					}}
					className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
				>
					Create Alert
				</button>
			</div>

			{/* Two-Column Main Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column: Alert Rules + Recent Activity */}
				<div className="lg:col-span-2 space-y-8">
					{/* Alert Rules Section */}
					<section>
						<div className="flex items-baseline justify-between mb-4">
							<h2 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">Active Rules</h2>
							<span className="text-xs text-zinc-500">{activeCount} active</span>
						</div>

						<div className="rounded-lg border border-zinc-800/50 overflow-hidden">
							{alerts.length > 0 ? (
								<div className="divide-y divide-zinc-800/30">
									{alerts.map((alert) => (
										<div
											key={alert.id}
											className="px-6 py-4 hover:bg-zinc-900/50 transition-colors group flex items-stretch justify-between gap-6"
										>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-3 mb-2">
													<button
														onClick={() => handleToggleAlertStatus(alert.id)}
														className={`w-5 h-5 rounded-full border transition-all flex-shrink-0 ${
															alert.status === "active"
																? "bg-green-500/20 border-green-500/40 hover:border-green-500/60"
																: "bg-zinc-700/40 border-zinc-600/40 hover:border-zinc-600/60"
														}`}
														title={alert.status === "active" ? "Click to pause" : "Click to activate"}
													/>
													<h3 className="text-sm font-medium text-white truncate">{alert.title}</h3>
													{alert.scope && (
														<span className="text-xs px-2 py-0.5 bg-zinc-800/60 text-zinc-300 rounded whitespace-nowrap font-mono">
															{alert.scope}
														</span>
													)}
												</div>
												<p className="text-xs text-zinc-500 mb-2">
													{alert.condition}
													{alert.threshold && ` ${alert.threshold}`}
												</p>
												<div className="flex items-center gap-4 text-xs text-zinc-600">
													<span>{alert.deliveryMethods.join(", ")}</span>
												</div>
											</div>

											<div className="flex items-center gap-2 flex-shrink-0">
												<span
													className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium ${
														alert.status === "active"
															? "bg-green-500/20 border border-green-500/30 text-green-300"
															: "bg-zinc-700/30 border border-zinc-600/30 text-zinc-300"
													}`}
												>
													{alert.status === "active" ? "Active" : "Paused"}
												</span>
												<div className="hidden group-hover:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<button
														onClick={() => handleEditAlert(alert)}
														className="px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
													>
														Edit
													</button>
													<button
														onClick={() => setDeleteConfirm(alert.id)}
														className="px-3 py-1 text-xs text-zinc-400 hover:text-red-400 transition-colors"
													>
														Delete
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="px-6 py-12 text-center text-zinc-500 text-sm">
									No active rules. Create your first alert to get started.
								</div>
							)}
						</div>
					</section>

					{/* Recent Activity */}
					<section>
						<h2 className="text-sm font-medium text-zinc-300 uppercase tracking-wider mb-4">Recent Activity</h2>

						<div className="rounded-lg border border-zinc-800/50 divide-y divide-zinc-800/30 max-h-80 overflow-y-auto">
							{activity.length > 0 ? (
								activity.map((item) => (
									<div key={item.id} className="px-6 py-4 hover:bg-zinc-900/50 transition-colors">
										<div className="flex items-start gap-3">
											<div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot(item.severity)}`}></div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-2 mb-1">
													<h4 className="text-sm text-white font-medium truncate">{item.title}</h4>
													<span className="text-xs text-zinc-500 flex-shrink-0">{item.timestamp}</span>
												</div>
												<p className="text-xs text-zinc-400 leading-relaxed">{item.message}</p>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="px-6 py-12 text-center text-zinc-500 text-sm">
									No activity yet
								</div>
							)}
						</div>
					</section>
				</div>

				{/* Right Column: Delivery Preferences & Suggestions */}
				<div className="space-y-6">
					{/* Delivery Preferences */}
					<section className="rounded-lg border border-zinc-800/50 p-6 bg-black/20">
						<h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider mb-4">Delivery Preferences</h3>

						<div className="space-y-3">
							{[
								{ key: "in-app" as const, label: "In-App Notifications" },
								{ key: "email" as const, label: "Email" },
								{ key: "push" as const, label: "Push Notifications" },
							].map(({ key, label }) => (
								<div key={key} className="flex items-center justify-between">
									<span className="text-xs text-zinc-400">{label}</span>
									<button
										onClick={() => handleToggleDelivery(key)}
										className={`w-10 h-5 rounded-full transition-all duration-200 flex items-center flex-shrink-0 ${
											deliveryToggles[key]
												? "bg-green-600/80 hover:bg-green-600 justify-end"
												: "bg-zinc-700/40 hover:bg-zinc-700/60 justify-start"
										} p-0.5`}
									>
										<div className="w-4 h-4 bg-white rounded-full shadow-sm" />
									</button>
								</div>
							))}
						</div>

						<button
							onClick={handleTestNotification}
							className="mt-4 w-full px-3 py-2 text-xs rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700/50"
						>
							Send Test Notification
						</button>
					</section>

					{/* Suggestions */}
					<section className="rounded-lg border border-zinc-800/50 p-6 bg-black/20">
						<h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider mb-3">Suggestions</h3>

						<div className="space-y-3">
							<div className="px-3 py-2 rounded bg-blue-500/10 border border-blue-500/20">
								<p className="text-xs text-blue-300 font-medium mb-1">Portfolio Rebalance</p>
								<p className="text-xs text-blue-200/70">Consider setting an alert when your allocation drifts more than 5%</p>
							</div>

							<div className="px-3 py-2 rounded bg-amber-500/10 border border-amber-500/20">
								<p className="text-xs text-amber-300 font-medium mb-1">Dividend Events</p>
								<p className="text-xs text-amber-200/70">Track dividend payment dates for your holdings</p>
							</div>
						</div>
					</section>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm">
						<h3 className="text-lg font-medium text-white mb-2">Delete Alert?</h3>
						<p className="text-sm text-zinc-400 mb-6">This action cannot be undone.</p>
						<div className="flex gap-3">
							<button
								onClick={() => setDeleteConfirm(null)}
								className="flex-1 px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors font-medium"
							>
								Cancel
							</button>
							<button
								onClick={() => handleDeleteAlert(deleteConfirm)}
								className="flex-1 px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Create/Edit Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-md w-full mx-4">
						<h2 className="text-lg font-medium text-white mb-6">{editingAlert ? "Edit Alert" : "Create New Alert"}</h2>

						<div className="space-y-4">
							<div>
								<label className="block text-xs font-medium text-zinc-400 mb-2">Scope (e.g., BTC, NVDA)</label>
								<input
									type="text"
									value={formData.scope}
									onChange={(e) => setFormData((p) => ({ ...p, scope: e.target.value }))}
									placeholder="Enter scope..."
									className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 hover:border-zinc-600 transition-colors"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-zinc-400 mb-2">Condition</label>
								<select
									value={formData.condition}
									onChange={(e) => setFormData((p) => ({ ...p, condition: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm hover:border-zinc-600 transition-colors"
								>
									<option>Below</option>
									<option>Above</option>
									<option>Exceeds</option>
									<option>Falls below</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-zinc-400 mb-2">Threshold</label>
								<input
									type="text"
									value={formData.threshold}
									onChange={(e) => setFormData((p) => ({ ...p, threshold: e.target.value }))}
									placeholder="Enter threshold..."
									className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 hover:border-zinc-600 transition-colors"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-zinc-400 mb-2">Priority</label>
								<select
									value={formData.priority}
									onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value as any }))}
									className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm hover:border-zinc-600 transition-colors"
								>
									<option>low</option>
									<option>medium</option>
									<option>high</option>
								</select>
							</div>

							<div>
								<label className="block text-xs font-medium text-zinc-400 mb-2">Delivery Methods</label>
								<div className="space-y-2">
									{["in-app", "email", "push"].map((method) => (
										<label key={method} className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={formData.methods.includes(method as any)}
												onChange={(e) => {
													if (e.target.checked) {
														setFormData((p) => ({ ...p, methods: [...p.methods, method as any] }))
													} else {
														setFormData((p) => ({ ...p, methods: p.methods.filter((m) => m !== method) }))
													}
												}}
												className="w-4 h-4 rounded"
											/>
											<span className="text-xs text-zinc-300">{method === "in-app" ? "In-App" : method === "email" ? "Email" : "Push"}</span>
										</label>
									))}
								</div>
							</div>
						</div>

						<div className="flex gap-3 mt-6">
							<button
								onClick={() => {
									setShowCreateModal(false)
									setEditingAlert(null)
								}}
								className="flex-1 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
							>
								Cancel
							</button>
							<button
								onClick={handleCreateAlert}
								className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
							>
								{editingAlert ? "Update" : "Create"}
							</button>
						</div>
					</div>
				</div>
			)}
		</PageShell>
	)
}
