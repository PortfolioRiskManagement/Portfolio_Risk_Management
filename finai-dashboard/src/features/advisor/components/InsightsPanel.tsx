type Props = {
    report: any
}

export default function InsightsPanel({ report }: Props) {
    const alignment = report.risk_alignment
    const isAligned = alignment.status === "aligned"
    const div = report.diversification
    const corr = report.correlation_analysis

    return (
        <div className="space-y-4">
            {/* Risk Alignment */}
            <div
                className={`border rounded-lg p-4 ${
                    isAligned
                        ? "bg-green-900/20 border-green-800"
                        : "bg-yellow-900/20 border-yellow-800"
                }`}
            >
                <div className="flex items-start gap-3">
                    <span className="text-2xl">{isAligned ? "✅" : "⚠️"}</span>
                    <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-zinc-950 dark:text-zinc-100">
                            Risk Profile {isAligned ? "Match" : "Mismatch"}
                        </h4>
                        <p className={`text-sm ${isAligned ? "text-green-200" : "text-yellow-200"}`}>
                            Your portfolio is <strong>{alignment.portfolio_risk_classification}</strong> risk, but you selected <strong>{alignment.user_risk_tolerance}</strong> tolerance.
                        </p>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                            {isAligned ? "Great! Your portfolio matches your comfort level." : "Consider rebalancing to align with your risk tolerance."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Diversification Insight */}
            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">🧩</span>
                    <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-zinc-950 dark:text-zinc-100">Diversification Score</h4>
                        <p className="text-sm text-purple-200">
                            Your portfolio has <strong>{div.effective_number_of_assets.toFixed(1)}</strong> effective assets out of <strong>{div.actual_number_of_assets}</strong> total.
                        </p>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                            {div.diversification_score > 70 ? "Excellent diversification! You're well-protected against individual asset failures." : div.diversification_score > 50 ? "Good diversification, but could be better. Consider adding more uncorrelated assets." : "Poor diversification. Too concentrated in a few assets. This increases risk."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Correlation Insight */}
            <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">🔗</span>
                    <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-zinc-950 dark:text-zinc-100">Asset Correlation</h4>
                        <p className="text-sm text-orange-200">
                            Average correlation: <strong>{corr.average_pairwise_correlation.toFixed(2)}</strong>
                        </p>
                        <p className="mt-2 text-xs italic text-zinc-600 dark:text-zinc-300">{corr.assessment}</p>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                            {corr.average_pairwise_correlation > 0.7 ? "Your assets move together too much. When one drops, they all drop. Find uncorrelated assets." : corr.average_pairwise_correlation > 0.5 ? "Moderate correlation. Some diversification benefits, but room for improvement." : "Low correlation is great! Your assets move independently, providing real diversification."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Max Drawdown Warning */}
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">📉</span>
                    <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-zinc-950 dark:text-zinc-100">Maximum Drawdown</h4>
                        <p className="text-sm text-red-200">
                            Worst past loss: <strong>{(report.max_drawdown * 100).toFixed(1)}%</strong>
                        </p>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                            This is the biggest drop your portfolio experienced. Could happen again. Are you comfortable with this level of loss?
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
