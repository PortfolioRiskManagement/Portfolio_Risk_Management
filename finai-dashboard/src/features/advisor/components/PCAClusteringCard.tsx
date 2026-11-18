import { useState } from "react"

type Props = {
	report: any
}

export default function PCAClusteringCard({ report }: Props) {
	const pca = report.pca_clustering
	const [expandedCluster, setExpandedCluster] = useState<string | null>(null)

	// Map factors to real market drivers
	const factorNames = [
		"Market Beta (Overall Market Movement)",
		"Size Factor (Large vs Small Cap)",
		"Volatility Factor (High vs Low Volatility)",
	]

	const factorDescriptions = [
		"How much your portfolio moves with the overall market. High = moves with S&P 500.",
		"Whether you're heavy in large-cap (stable) or small-cap (growth) stocks.",
		"How sensitive your portfolio is to market turbulence vs calm periods.",
	]

	return (
		<div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
			<div>
				<h3 className="mb-2 text-sm font-semibold text-zinc-950 dark:text-zinc-100">🧠 AI Pattern Recognition</h3>
				<p className="text-xs text-zinc-600 dark:text-zinc-400">
					Machine learning analysis of your portfolio's hidden risk factors and behavioral patterns.
				</p>
			</div>

			{/* PCA Explanation */}
			<div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
				<h4 className="text-xs font-semibold text-blue-200 mb-2">📊 What Drives Your Portfolio?</h4>
				<p className="text-xs text-blue-300 mb-3">
					These are the main "invisible hands" pushing your portfolio returns:
				</p>
				<div className="space-y-3">
					{pca.explained_variance.map((variance: number, idx: number) => (
						<div key={idx} className="rounded border border-zinc-200 bg-white/80 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
							<div className="flex items-start justify-between mb-2">
								<div className="flex-1">
									<p className="text-xs font-semibold text-blue-300">
										{factorNames[idx] || `Factor ${idx + 1}`}
									</p>
									<p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
										{factorDescriptions[idx] || "Hidden market factor"}
									</p>
								</div>
								<span className="text-xs font-bold text-blue-400 ml-2">
									{(variance * 100).toFixed(1)}%
								</span>
							</div>
							<div className="h-2 w-full rounded bg-zinc-200 dark:bg-zinc-700">
								<div
									className="h-2 rounded bg-blue-500"
									style={{ width: `${variance * 100}%` }}
								/>
							</div>
						</div>
					))}
				</div>
				<div className="mt-3 p-2 bg-blue-950/50 rounded">
					<p className="text-xs text-blue-300">
						💡 <strong>What this means:</strong> The first factor explains {(pca.explained_variance[0] * 100).toFixed(1)}% of your portfolio's movement. 
						{(pca.explained_variance[0] * 100) > 70 
							? " Your portfolio is heavily driven by one market force—less diversified." 
							: (pca.explained_variance[0] * 100) > 50
							? " Your portfolio is moderately complex with multiple driving forces."
							: " Your portfolio is well-balanced across multiple independent factors."}
					</p>
				</div>
			</div>

			{/* Clustering Explanation */}
			<div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3">
				<h4 className="text-xs font-semibold text-purple-200 mb-2">🔗 Asset Groups (Clusters)</h4>
				<p className="text-xs text-purple-300 mb-3">
					Assets are grouped by behavior similarity. Assets in the same group move together—when one drops, others likely
				</p>
				<div className="space-y-2">
					{Object.entries(pca.clusters).map(([clusterId, assets]: any) => (
						<div key={clusterId} className="rounded border border-zinc-200 bg-white/80 dark:border-zinc-700 dark:bg-zinc-800/50">
							<button
								onClick={() =>
									setExpandedCluster(
										expandedCluster === clusterId ? null : clusterId
									)
								}
								className="flex w-full items-center justify-between p-2 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-700/50"
							>
								<p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
									Group {clusterId} ({assets.length} assets)
								</p>
								<span className="text-xs">
									{expandedCluster === clusterId ? "▼" : "▶"}
								</span>
							</button>
							{expandedCluster === clusterId && (
								<div className="border-t border-zinc-200 p-2 dark:border-zinc-700">
									<div className="flex flex-wrap gap-1 mb-2">
										{assets.map((asset: string) => (
											<span
												key={asset}
												className="text-xs bg-purple-700 text-purple-200 px-2 py-1 rounded"
											>
												{asset}
											</span>
										))}
									</div>
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										These assets tend to move together. If one drops, others likely will too.
									</p>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Key Insight */}
			<div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
				<p className="text-xs text-green-200">
					💡 <strong>Insight:</strong> If all your assets are in one cluster, you lack true diversification. Aim for assets
					spread across multiple clusters.
				</p>
			</div>
		</div>
	)
}
