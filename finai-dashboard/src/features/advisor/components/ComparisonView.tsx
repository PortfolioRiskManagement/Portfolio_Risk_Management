type Props = {
    original: any
    modified: any
    onClose: () => void
}

export default function ComparisonView({ original, modified, onClose }: Props) {
    const metrics = [
        { label: "Risk Level", key: "portfolio_risk_classification", format: (v: any) => v.toUpperCase() },
        { label: "Volatility", key: "volatility", format: (v: any) => `${(v * 100).toFixed(2)}%` },
        { label: "Sharpe Ratio", key: "sharpe_ratio", format: (v: any) => v.toFixed(2) },
        { label: "Max Drawdown", key: "max_drawdown", format: (v: any) => `${(v * 100).toFixed(2)}%` },
        { label: "Diversification", key: "diversification", format: (v: any) => v.diversification_score.toFixed(0) },
        { label: "Avg Correlation", key: "correlation_analysis", format: (v: any) => v.average_pairwise_correlation.toFixed(2) },
    ]

    const getDifference = (original: any, modified: any, key: string) => {
        let origVal = original[key]
        let modVal = modified[key]
        if (typeof origVal === "object") {
            origVal = origVal[Object.keys(origVal)[0]] || 0
            modVal = modVal[Object.keys(modVal)[0]] || 0
        }
        const diff = modVal - origVal
        return { diff, improved: diff < 0 ? "✓" : diff > 0 ? "↑" : "=" }
    }

    return (
        <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">Portfolio Comparison</h3>
                <button onClick={onClose} className="text-lg text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">×</button>
            </div>
            <div className="space-y-2">
                {metrics.map((m, idx) => {
                    const { diff, improved } = getDifference(original, modified, m.key)
                    return (
                        <div key={idx} className="flex items-center justify-between rounded border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-700/50">
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{m.label}</span>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Original</p>
                                    <p className="text-sm font-medium text-zinc-950 dark:text-white">{m.format(original[m.key])}</p>
                                </div>
                                <div className="text-center">
                                    <p className={`text-lg font-bold ${diff < 0 ? "text-green-400" : diff > 0 ? "text-red-400" : "text-zinc-400"}`}>{improved}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">New</p>
                                    <p className="text-sm font-medium text-zinc-950 dark:text-white">{m.format(modified[m.key])}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
