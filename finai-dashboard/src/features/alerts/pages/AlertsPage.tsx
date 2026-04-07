import { useEffect, useState } from "react"
import AlertCard from "../components/AlertCard"
import type { Alert } from "../components/AlertCard"
import { fetchPortfolioAlerts, type PortfolioHolding } from "../services/alertsService"

type FilterType = "all" | "high" | "medium" | "low" | "market" | "my-holdings"

interface AlertsPageProps {
	portfolioTickers?: string[]
	portfolioHoldings?: PortfolioHolding[]
}

export default function AlertsPage({ 
	portfolioTickers = ["AAPL", "MSFT", "GOOGL", "TSLA"],
	portfolioHoldings = []
}: AlertsPageProps) {
	const [allAlerts, setAllAlerts] = useState<Alert[]>([])
	const [portfolioAlerts, setPortfolioAlerts] = useState<Alert[]>([])
	const [loading, setLoading] = useState(true)
	const [filter, setFilter] = useState<FilterType>("all")
	const [selectedTicker, setSelectedTicker] = useState<string>("")
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadAlerts = async () => {
			setLoading(true)
			setError(null)
			try {
				const all = await fetchPortfolioAlerts(portfolioTickers, portfolioHoldings)
				const portfolio = all.filter((alert) => alert.relatedTickers.length > 0)
				setAllAlerts(all)
				setPortfolioAlerts(portfolio)
			} catch (err) {
				setError("Failed to load alerts. Please try again later.")
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		loadAlerts()
		const interval = setInterval(loadAlerts, 5 * 60 * 1000)
		return () => clearInterval(interval)
	}, [portfolioTickers, portfolioHoldings])

	const getCurrentAlerts = () => {
		return filter === "my-holdings" ? portfolioAlerts : allAlerts
	}

	const filteredAlerts = getCurrentAlerts().filter((alert) => {
		if (filter === "my-holdings") {
			if (alert.relatedTickers.length === 0) return false
			if (selectedTicker) {
				return alert.relatedTickers.includes(selectedTicker)
			}
			return true
		}

		if (filter === "all") return true
		if (filter === "high" || filter === "medium" || filter === "low") return alert.impact === filter
		if (filter === "market") return alert.category === "market"
		
		return true
	})

	return (
		<div className="space-y-6">
			<div>
				<h1 className="mb-2 text-3xl font-bold text-zinc-950 dark:text-white">Portfolio Alerts</h1>
				<p className="text-zinc-600 dark:text-zinc-400">Market news and alerts impacting your holdings</p>
			</div>

			<div className="space-y-3">
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => {
							setFilter("all")
							setSelectedTicker("")
						}}
						className={`px-4 py-2 rounded-lg transition ${
							filter === "all"
								? "bg-blue-600 text-white"
								: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						}`}
					>
						All News
					</button>
					<button
						onClick={() => setFilter("high")}
						className={`px-4 py-2 rounded-lg transition ${
							filter === "high"
								? "bg-red-600 text-white"
								: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						}`}
					>
						High Impact
					</button>
					<button
						onClick={() => setFilter("medium")}
						className={`px-4 py-2 rounded-lg transition ${
							filter === "medium"
								? "bg-yellow-600 text-white"
								: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						}`}
					>
						Medium Impact
					</button>
					<button
						onClick={() => setFilter("low")}
						className={`px-4 py-2 rounded-lg transition ${
							filter === "low"
								? "bg-blue-600 text-white"
								: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						}`}
					>
						Low Impact
					</button>
					<button
						onClick={() => setFilter("market")}
						className={`px-4 py-2 rounded-lg transition ${
							filter === "market"
								? "bg-purple-600 text-white"
								: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						}`}
					>
						Market & Economy
					</button>
					<button
						onClick={() => {
							setFilter("my-holdings")
							setSelectedTicker("")
						}}
						className={`px-4 py-2 rounded-lg transition ${
							filter === "my-holdings"
								? "bg-indigo-600 text-white"
								: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						}`}
					>
						My Holdings
					</button>
				</div>

				{filter === "my-holdings" && portfolioHoldings.length > 0 && (
					<div className="flex items-center gap-2">
						<label className="text-sm text-zinc-500 dark:text-zinc-400">Filter by holding:</label>
						<select
							value={selectedTicker}
							onChange={(e) => setSelectedTicker(e.target.value)}
							className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
						>
							<option value="">All Holdings</option>
							{portfolioHoldings.map((holding) => (
								<option key={holding.ticker} value={holding.ticker}>
									{holding.ticker} ({holding.percentageOfPortfolio}%)
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
					{error}
				</div>
			)}

			{loading && (
				<div className="flex items-center justify-center py-12">
					<div className="text-zinc-500 dark:text-zinc-400">Loading alerts...</div>
				</div>
			)}

			{!loading && (
				<>
					{filteredAlerts.length > 0 ? (
						<div className="grid grid-cols-1 gap-4">
							{filteredAlerts.map((alert) => (
								<AlertCard 
									key={alert.id} 
									alert={alert}
									showTickers={filter === "my-holdings"}
								/>
							))}
						</div>
					) : (
						<div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
							{filter === "my-holdings"
								? `No news available for ${selectedTicker || "your holdings"}`
								: "No news available"}
						</div>
					)}
				</>
			)}

			{!loading && getCurrentAlerts().length > 0 && (
				<div className="grid grid-cols-4 gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-700">
					<div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/50">
						<p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Total News</p>
						<p className="text-2xl font-bold text-zinc-950 dark:text-white">{filteredAlerts.length}</p>
					</div>
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/20">
						<p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">High Impact</p>
						<p className="text-2xl font-bold text-red-400">
							{filteredAlerts.filter((a) => a.impact === "high").length}
						</p>
					</div>
					<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/30 dark:bg-yellow-900/20">
						<p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Medium Impact</p>
						<p className="text-2xl font-bold text-yellow-400">
							{filteredAlerts.filter((a) => a.impact === "medium").length}
						</p>
					</div>
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20">
						<p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Low Impact</p>
						<p className="text-2xl font-bold text-blue-400">
							{filteredAlerts.filter((a) => a.impact === "low").length}
						</p>
					</div>
				</div>
			)}
		</div>
        
	)
}
