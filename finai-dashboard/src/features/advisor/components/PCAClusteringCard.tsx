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
		<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-6">
			<div>
				<h3 className="text-sm font-semibold text-zinc-100 mb-2">🧠 AI Pattern Recognition</h3>
				<p className="text-xs text-zinc-400">
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
						<div key={idx} className="bg-zinc-800/50 rounded p-3">
							<div className="flex items-start justify-between mb-2">
								<div className="flex-1">
									<p className="text-xs font-semibold text-blue-300">
										{factorNames[idx] || `Factor ${idx + 1}`}
									</p>
									<p className="text-xs text-zinc-400 mt-1">
										{factorDescriptions[idx] || "Hidden market factor"}
									</p>
								</div>
								<span className="text-xs font-bold text-blue-400 ml-2">
									{(variance * 100).toFixed(1)}%
								</span>
							</div>
							<div className="w-full bg-zinc-700 rounded h-2">
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
						<div key={clusterId} className="bg-zinc-800/50 rounded">
							<button
								onClick={() =>
									setExpandedCluster(
										expandedCluster === clusterId ? null : clusterId
									)
								}
								className="w-full text-left p-2 hover:bg-zinc-700/50 transition flex justify-between items-center"
							>
								<p className="text-xs font-medium text-zinc-300">
									Group {clusterId} ({assets.length} assets)
								</p>
								<span className="text-xs">
									{expandedCluster === clusterId ? "▼" : "▶"}
								</span>
							</button>
							{expandedCluster === clusterId && (
								<div className="p-2 border-t border-zinc-700">
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
									<p className="text-xs text-zinc-400">
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
