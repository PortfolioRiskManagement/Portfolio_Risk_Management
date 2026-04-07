import { useEffect, useState } from "react"
import PageShell from "../../../components/layout/PageShell"
import RiskProfileCard from "../components/RiskProfileCard"
import DiversificationCard from "../components/DiversificationCard"
import CorrelationCard from "../components/CorrelationCard"
import RiskConcentrationCard from "../components/RiskConcentrationCard"
import PCAClusteringCard from "../components/PCAClusteringCard"
import InsightsPanel from "../components/InsightsPanel"
import ComparisonView from "../components/ComparisonView"
import PortfolioPieChart from "../components/PortfolioPieChart"

type PortfolioReport = {
    assets: string[]
    portfolio_risk_classification: string
    risk_alignment: {
        status: string
        user_risk_tolerance: string
        portfolio_risk_classification: string
    }
    volatility: number
    max_drawdown: number
    sharpe_ratio: number
    individual_volatility: Record<string, number>
    diversification: {
        diversification_score: number
        effective_number_of_assets: number
        actual_number_of_assets: number
    }
    correlation_analysis: {
        average_pairwise_correlation: number
        assessment: string
    }
    risk_concentration: {
        top_contributors: Array<{ ticker: string; risk_contribution_pct: number }>
        full_distribution: Record<string, number>
    }
    pca_clustering: {
        explained_variance: number[]
        asset_loadings: Record<string, Record<string, number>>
        clusters: Record<string, string[]>
    }
}

type PortfolioItem = {
    Ticker: string
    Shares: number
    Price?: number
}

type QuoteResponse = {
    success: boolean
    symbol?: string
    price?: number
    error?: string
}

export default function AdvisorPage() {
    const [report, setReport] = useState<PortfolioReport | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [riskTolerance, setRiskTolerance] = useState("medium")
    const [lookbackDays, setLookbackDays] = useState(504)
    const [activeTab, setActiveTab] = useState<"overview" | "details" | "sampling" | "ml">("overview")
    const [showInitialPortfolioModal, setShowInitialPortfolioModal] = useState(true)
    const [originalReport, setOriginalReport] = useState<PortfolioReport | null>(null)
    const [showComparison, setShowComparison] = useState(false)

    // Sampling state
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
        try {
            const raw = localStorage.getItem("advisor_custom_portfolio")
            if (!raw) return []
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    })
    const [newTicker, setNewTicker] = useState("")
    const [newShares, setNewShares] = useState(10)

    const getNormalizedPortfolio = () => {
        const validHoldings = portfolio.filter(
            (item) => item.Ticker.trim().length > 0 && item.Shares > 0 && (item.Price || 0) > 0,
        )
        const total = validHoldings.reduce((sum, item) => sum + item.Shares * (item.Price || 0), 0)

        if (total <= 0) return []

        return validHoldings.map((item) => ({
            Ticker: item.Ticker.trim().toUpperCase(),
            Weight: (item.Shares * (item.Price || 0)) / total,
        }))
    }

    const fetchQuotePrice = async (ticker: string): Promise<number | null> => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001"
            const response = await fetch(`${apiUrl}/api/quote?symbol=${encodeURIComponent(ticker)}`)
            const data: QuoteResponse = await response.json()
            if (!response.ok || !data.success || !data.price || data.price <= 0) return null
            return data.price
        } catch {
            return null
        }
    }

    const enrichPortfolioWithLivePrices = async () => {
        const updatedPortfolio = [...portfolio]

        for (let i = 0; i < updatedPortfolio.length; i += 1) {
            const item = updatedPortfolio[i]
            if (!item.Ticker?.trim() || item.Shares <= 0) continue
            if ((item.Price || 0) > 0) continue

            const livePrice = await fetchQuotePrice(item.Ticker.trim().toUpperCase())
            if (livePrice) {
                updatedPortfolio[i] = { ...item, Ticker: item.Ticker.trim().toUpperCase(), Price: livePrice }
            }
        }

        setPortfolio(updatedPortfolio)
        return updatedPortfolio
    }

    const fetchAnalysis = async (portfolioData?: Array<{ Ticker: string; Weight: number }>) => {
        let normalizedPortfolio = portfolioData
        if (!normalizedPortfolio) {
            const pricedPortfolio = await enrichPortfolioWithLivePrices()
            const validHoldings = pricedPortfolio.filter(
                (item) => item.Ticker.trim().length > 0 && item.Shares > 0 && (item.Price || 0) > 0,
            )
            const total = validHoldings.reduce((sum, item) => sum + item.Shares * (item.Price || 0), 0)
            normalizedPortfolio = total > 0
                ? validHoldings.map((item) => ({
                    Ticker: item.Ticker.trim().toUpperCase(),
                    Weight: (item.Shares * (item.Price || 0)) / total,
                }))
                : []
        }

        if (!normalizedPortfolio.length) {
            setError("Add valid holdings (ticker and shares). Live prices are fetched automatically from Yahoo Finance.")
            return false
        }

        setLoading(true)
        setError(null)
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001"
            const response = await fetch(`${apiUrl}/api/portfolio/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    risk_tolerance: riskTolerance,
                    lookback_days: lookbackDays,
                    portfolio_data: normalizedPortfolio,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `Server error: ${response.status}`)
            }

            const data = await response.json()
            setReport(data.data)
            return true
        } catch (err) {
            console.error("Error:", err)
            setError(err instanceof Error ? err.message : "Connection failed")
            return false
        } finally {
            setLoading(false)
        }
    }

    const getTotalValue = () => {
        return portfolio.reduce((sum, item) => sum + (item.Shares * (item.Price || 0)), 0)
    }

    const getHoldings = () => {
        const total = getTotalValue()
        return portfolio.map(item => ({
            ...item,
            Value: item.Shares * (item.Price || 0),
            Percentage: total > 0 ? ((item.Shares * (item.Price || 0)) / total * 100) : 0,
        }))
    }

    const addStock = () => {
        if (newTicker.trim() && newShares > 0) {
            setPortfolio([...portfolio, { Ticker: newTicker.trim().toUpperCase(), Shares: newShares }])
            setNewTicker("")
            setNewShares(10)
        }
    }

    const removeStock = (index: number) => {
        setPortfolio(portfolio.filter((_, i) => i !== index))
    }

    const updateStock = (index: number, field: keyof PortfolioItem, value: any) => {
        setPortfolio((prev) => prev.map((item, i) => (i === index ? ({ ...item, [field]: value } as PortfolioItem) : item)))
    }

    const handleSampleAnalyze = async () => {
        const normalized = getNormalizedPortfolio()
        if (report) {
            setOriginalReport(report)
        } else {
            setOriginalReport(null)
        }
        await fetchAnalysis(normalized)
        setShowComparison(Boolean(report))
    }

    const handleInitialAnalyze = async () => {
        setShowInitialPortfolioModal(false)
        const ok = await fetchAnalysis()
        if (ok) {
            setActiveTab("overview")
        }
    }

    useEffect(() => {
        localStorage.setItem("advisor_custom_portfolio", JSON.stringify(portfolio))
    }, [portfolio])

    const holdings = getHoldings()
    const totalValue = getTotalValue()

    return (
        <PageShell title="">
            <div className="w-full">
                {showInitialPortfolioModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-3xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                            <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
                                <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Set Your Portfolio</h2>
                                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Add your holdings here and start analysis immediately.</p>
                                <div className="mt-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-700/50 dark:bg-blue-900/20 dark:text-blue-300">
                                    Format hint: Ticker -&gt; Shares (example: AAPL -&gt; 12)
                                </div>
                            </div>

                            <div className="max-h-[65vh] space-y-4 overflow-y-auto p-4">
                                <div className="space-y-3">
                                    {holdings.map((item, idx) => (
                                        <div key={idx} className="rounded border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-700/40">
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 items-center">
                                                <input
                                                    type="text"
                                                    value={item.Ticker}
                                                    onChange={(e) => updateStock(idx, "Ticker", e.target.value.toUpperCase())}
                                                    placeholder="Ticker"
                                                    className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-500 dark:bg-zinc-600 dark:text-white"
                                                />
                                                <input
                                                    type="number"
                                                    value={item.Shares}
                                                    onChange={(e) => updateStock(idx, "Shares", parseFloat(e.target.value) || 0)}
                                                    placeholder="Shares"
                                                    className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-500 dark:bg-zinc-600 dark:text-white"
                                                    min="0"
                                                    step="0.1"
                                                />
                                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{item.Price ? `$${item.Price.toFixed(2)}` : "Live price on analyze"}</p>
                                                <button onClick={() => removeStock(idx)} className="rounded bg-red-600/20 px-2 py-1 text-sm font-medium text-red-500 transition hover:bg-red-600/40">Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-950 dark:text-white">Add Stock</h3>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <input type="text" value={newTicker} onChange={(e) => setNewTicker(e.target.value)} placeholder="Ticker" className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white" />
                                        <input type="number" value={newShares} onChange={(e) => setNewShares(parseFloat(e.target.value) || 0)} placeholder="Shares" className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white" min="0" step="0.1" />
                                        <button onClick={addStock} className="rounded bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700">Add</button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-700">
                                <button
                                    onClick={() => setShowInitialPortfolioModal(false)}
                                    className="rounded bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleInitialAnalyze}
                                    disabled={loading || portfolio.length === 0}
                                    className="ml-auto rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? "Analyzing..." : "Analyze Portfolio"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h1 className="mb-1 text-2xl font-bold text-zinc-950 dark:text-white">Portfolio Analysis</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Risk metrics, diversification & AI insights</p>
                </div>

                <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50 dark:shadow-none">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Risk Tolerance</label>
                            <select
                                value={riskTolerance}
                                onChange={(e) => setRiskTolerance(e.target.value)}
                                className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                            >
                                <option value="low">Conservative</option>
                                <option value="medium">Balanced</option>
                                <option value="high">Aggressive</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Period (days)</label>
                            <input
                                type="number"
                                value={lookbackDays}
                                onChange={(e) => setLookbackDays(Number(e.target.value))}
                                className="w-full rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                                min="30"
                                max="1000"
                            />
                        </div>
                        <div className="flex gap-2 items-end">
                            <button
                                onClick={() => fetchAnalysis()}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-1.5 rounded transition"
                            >
                                Analyze
                            </button>
                            <button
                                onClick={() => setShowInitialPortfolioModal(true)}
                                className="flex-1 rounded bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
                            >
                                Add/Edit Portfolio
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                        {error}
                    </div>
                )}

                {loading && !report && (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-500 dark:text-zinc-400">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
                        Analyzing portfolio...
                    </div>
                )}

                <>
                    <div className="mb-6 flex gap-0 overflow-x-auto border-b border-zinc-200 dark:border-zinc-700">
                        {(["overview", "details", "ml", "sampling"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-[2px] whitespace-nowrap ${
                                    activeTab === tab
                                        ? "text-blue-400 border-blue-500"
                                        : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300"
                                }`}
                            >
                                {tab === "overview" && "Overview"}
                                {tab === "details" && "Details"}
                                {tab === "ml" && "AI Analysis"}
                                {tab === "sampling" && "Sampling"}
                            </button>
                        ))}
                    </div>

                    {activeTab === "overview" && (
                        report ? (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/30">
                                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Assets</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {report.assets.map((asset) => (
                                            <span key={asset} className="bg-blue-500/20 border border-blue-500/40 text-blue-300 px-3 py-1 rounded text-xs font-medium">
                                                {asset}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
                                        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Risk Level</p>
                                        <p className="text-lg font-bold capitalize text-zinc-950 dark:text-white">{report.portfolio_risk_classification}</p>
                                    </div>
                                    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
                                        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Volatility</p>
                                        <p className="text-lg font-bold text-orange-400">{(report.volatility * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
                                        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Sharpe</p>
                                        <p className="text-lg font-bold text-green-400">{report.sharpe_ratio.toFixed(2)}</p>
                                    </div>
                                </div>

                                <InsightsPanel report={report} />
                            </div>
                        ) : (
                            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-300 dark:shadow-none">
                                Click Analyze after adding holdings in the startup popup, or edit holdings in the Sampling tab.
                            </div>
                        )
                    )}

                    {activeTab === "details" &&
                        (report ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <RiskProfileCard report={report} />
                                <DiversificationCard report={report} />
                                <CorrelationCard report={report} />
                                <RiskConcentrationCard report={report} />
                            </div>
                        ) : (
                            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-300 dark:shadow-none">
                                Run an analysis first to view detailed diagnostics.
                            </div>
                        ))}

                    {activeTab === "sampling" && (
                            <div className="space-y-6">
                                {showComparison && originalReport && (
                                    <div>
                                        <ComparisonView
                                            original={originalReport}
                                            modified={report}
                                            onClose={() => setShowComparison(false)}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
                                        <h3 className="mb-4 text-sm font-semibold text-zinc-950 dark:text-white">📊 Current</h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Current portfolio analysis</p>
                                    </div>
                                    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
                                        <h3 className="mb-4 text-sm font-semibold text-zinc-950 dark:text-white">🎯 Sample</h3>
                                        <p className="text-xs font-medium text-green-400">Total: ${totalValue.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
                                    <h3 className="mb-4 text-sm font-semibold text-zinc-950 dark:text-white">Portfolio Allocation</h3>
                                    {holdings.length > 0 && <PortfolioPieChart holdings={holdings} />}
                                </div>

                                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:shadow-none">
                                    <h3 className="mb-4 text-sm font-semibold text-zinc-950 dark:text-white">Holdings</h3>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {holdings.map((item, idx) => (
                                            <div key={idx} className="rounded border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-700/50">
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                                                    <div>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Ticker</p>
                                                        <input type="text" value={item.Ticker} onChange={(e) => updateStock(idx, "Ticker", e.target.value.toUpperCase())} className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-sm font-medium text-zinc-900 dark:border-zinc-500 dark:bg-zinc-600 dark:text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Shares</p>
                                                        <input type="number" value={item.Shares} onChange={(e) => updateStock(idx, "Shares", parseFloat(e.target.value) || 0)} className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-500 dark:bg-zinc-600 dark:text-white" min="0" step="0.1" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Value</p>
                                                        <p className="text-sm font-bold text-green-400">${item.Value.toFixed(2)}</p>
                                                    </div>
                                                    <div className="flex items-end gap-1">
                                                        <div className="flex-1">
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">%</p>
                                                            <p className="text-sm font-bold text-zinc-950 dark:text-white">{item.Percentage.toFixed(1)}%</p>
                                                        </div>
                                                        <button onClick={() => removeStock(idx)} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 p-1.5 rounded text-lg transition">−</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                    <h3 className="mb-4 text-sm font-semibold text-zinc-950 dark:text-white">Add Stock</h3>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <input type="text" value={newTicker} onChange={(e) => setNewTicker(e.target.value)} placeholder="Ticker" className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-500" />
                                        <input type="number" value={newShares} onChange={(e) => setNewShares(parseFloat(e.target.value) || 0)} placeholder="Shares" className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white dark:placeholder-zinc-500" min="0" step="0.1" />
                                        <button onClick={addStock} className="rounded bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700">Add Stock</button>
                                    </div>
                                </div>

                                <button onClick={handleSampleAnalyze} disabled={loading || portfolio.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition">
                                    {loading ? "Analyzing..." : report ? "Compare with Current" : "Analyze Portfolio"}
                                </button>
                            </div>
                    )}

                    {activeTab === "ml" &&
                        (report ? (
                            <PCAClusteringCard report={report} />
                        ) : (
                            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-300 dark:shadow-none">
                                Run an analysis first to view PCA and clustering insights.
                            </div>
                        ))}
                </>
            </div>
        </PageShell>
    )
}
