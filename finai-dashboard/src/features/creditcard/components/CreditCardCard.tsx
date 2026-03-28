import type { CreditCard, CreditCardFilterResult } from "../types"

interface CreditCardCardProps {
	card: CreditCard
	filterResult?: CreditCardFilterResult
	index?: number
}

export default function CreditCardCard({ card, filterResult, index = 0 }: CreditCardCardProps) {
	const isRecommended = filterResult && filterResult.matchScore > 20
	const topBenefit = card.topEarnRates[0]

	const getInstitutionColor = (institution: string): string => {
		const colors: Record<string, string> = {
			Amex: "from-blue-600 to-blue-500",
			Scotiabank: "from-red-600 to-red-500",
			BMO: "from-orange-600 to-orange-500",
			TD: "from-green-600 to-emerald-500",
			RBC: "from-purple-600 to-purple-500",
			CIBC: "from-yellow-600 to-yellow-500",
			"National Bank": "from-pink-600 to-pink-500",
			Tangerine: "from-orange-500 to-orange-400",
			"PC Financial": "from-teal-600 to-teal-500"
		}
		return colors[institution] || "from-zinc-600 to-zinc-500"
	}

	return (
		<div
			className={`group relative rounded-lg border transition-all duration-300 hover:scale-102 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 ${
				isRecommended
					? "border-purple-500/50 bg-gradient-to-br from-purple-950/50 to-zinc-900 shadow-lg shadow-purple-500/20"
					: "border-zinc-700 bg-gradient-to-br from-zinc-800/50 to-zinc-900 hover:border-zinc-600"
			}`}
			style={{
				animationDelay: `${index * 100}ms`,
				animationFillMode: "both"
			}}
		>
			{/* Recommendation Badge */}
			{isRecommended && (
				<div className="absolute -top-3 -right-3 z-10">
					<div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
						⭐ Recommended
					</div>
				</div>
			)}

			{/* Card Header with Institution */}
			<div className={`bg-gradient-to-r ${getInstitutionColor(card.institution)} p-4 rounded-t-lg`}>
				<div className="flex items-start justify-between">
					<div>
						<h3 className="text-xl font-bold text-white">{card.name}</h3>
						<p className="text-white/80 text-sm">{card.institution}</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-white">
							{card.annualFee === 0 || card.annualFee === "FREE" ? "FREE" : `$${card.annualFee}`}
						</div>
						<p className="text-white/70 text-xs">Annual Fee</p>
					</div>
				</div>
			</div>

			{/* Card Body */}
			<div className="p-5 space-y-4">
				{/* Top Earn Rates */}
				<div className="space-y-2">
					<h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Top Earn Rates</h4>
					<div className="grid grid-cols-2 gap-2">
						{card.topEarnRates.slice(0, 3).map((rate, idx) => (
							<div key={idx} className="bg-zinc-900/50 rounded p-2 border border-zinc-700/50">
								<p className="text-xs text-zinc-400">{rate.name}</p>
								<p className="text-lg font-bold text-blue-400">{rate.value}</p>
							</div>
						))}
					</div>
				</div>

				{/* Welcome Bonus */}
				{card.welcomeBonus && (
					<div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30 rounded p-3">
						<p className="text-xs font-semibold text-green-300 uppercase mb-1">Welcome Bonus</p>
						<p className="text-sm text-green-100">{card.welcomeBonus}</p>
					</div>
				)}

				{/* Key Perks */}
				{card.keyPerks.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Key Perks</h4>
						<ul className="space-y-1">
							{card.keyPerks.slice(0, 3).map((perk, idx) => (
								<li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
									<span className="text-purple-400 mt-0.5">✓</span>
									<span>{perk.name}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Income Requirement */}
				{card.minIncome && (
					<div className="text-xs text-zinc-400 border-t border-zinc-700/50 pt-3">
						💼 <span className="font-semibold">Income Requirement:</span> {card.minIncome}
					</div>
				)}

				{/* Filter Result Info */}
				{filterResult && filterResult.matchScore > 0 && (
					<div className="border-t border-zinc-700/50 pt-3">
						<p className="text-xs text-purple-300 font-semibold mb-2">{filterResult.whyRecommended}</p>
						{filterResult.relevantBenefits.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{filterResult.relevantBenefits.slice(0, 2).map((benefit, idx) => (
									<span
										key={idx}
										className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30"
									>
										{benefit}
									</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Highlights */}
				{card.highlights && card.highlights.length > 0 && !filterResult && (
					<div className="border-t border-zinc-700/50 pt-3 space-y-1">
						{card.highlights.slice(0, 2).map((highlight, idx) => (
							<p key={idx} className="text-xs text-zinc-400">
								• {highlight}
							</p>
						))}
					</div>
				)}
			</div>

			{/* Hover Effect */}
			<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
		</div>
	)
}
