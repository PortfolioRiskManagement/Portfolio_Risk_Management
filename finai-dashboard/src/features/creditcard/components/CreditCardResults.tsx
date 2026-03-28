import { useState } from "react"
import CreditCardCard from "./CreditCardCard"
import { getCardsByInstitution, getInstitutions } from "../services/creditCardService"
import type { CreditCardFilterResult, Institution } from "../types"

interface CreditCardResultsProps {
	results: CreditCardFilterResult[]
	hasProfile: boolean
	onReset: () => void
	onEditProfile: () => void
}

export default function CreditCardResults({
	results,
	hasProfile,
	onReset,
	onEditProfile
}: CreditCardResultsProps) {
	const [expandedInstitution, setExpandedInstitution] = useState<Institution | null>(null)
	const [sortBy, setSortBy] = useState<"relevance" | "fee" | "welcome">("relevance")

	// Group results by institution
	const resultsByInstitution: Record<Institution, CreditCardFilterResult[]> = {}
	const institutions = getInstitutions()

	institutions.forEach((institution) => {
		resultsByInstitution[institution] = results.filter((r) => r.card.institution === institution)
	})

	// Get top recommendations (highest score)
	const topRecommendations = results.slice(0, 3)

	// Sort function
	const sortResults = (cards: CreditCardFilterResult[]) => {
		const sorted = [...cards]
		switch (sortBy) {
			case "fee":
				return sorted.sort((a, b) => a.card.annualFee - b.card.annualFee)
			case "welcome":
				return sorted.sort((a, b) => {
					const aBonus = a.card.welcomeBonus ? parseInt(a.card.welcomeBonus.match(/\d+/)?.[0] || "0") : 0
					const bBonus = b.card.welcomeBonus ? parseInt(b.card.welcomeBonus.match(/\d+/)?.[0] || "0") : 0
					return bBonus - aBonus
				})
			default:
				return sorted
		}
	}

	return (
		<div className="space-y-8">
			{/* Header with Actions */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-3xl font-bold text-white">
						{hasProfile ? "Your Personalized Recommendations" : "Explore All Credit Cards"}
					</h2>
					<p className="text-zinc-400 mt-2">
						{hasProfile
							? "Cards matched to your profile and spending habits"
							: "Browse all available credit cards organized by bank"}
					</p>
				</div>
				<div className="flex gap-2">
					{hasProfile && (
						<button
							onClick={onEditProfile}
							className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition text-sm"
						>
							Adjust Profile
						</button>
					)}
					<button
						onClick={onReset}
						className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition text-sm"
					>
						New Search
					</button>
				</div>
			</div>

			{/* Top Recommendations */}
			{hasProfile && topRecommendations.length > 0 && (
				<div>
					<h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
						<span>⭐ Top Matches For You</span>
						<span className="text-sm text-zinc-400 font-normal">({topRecommendations.length} cards)</span>
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{topRecommendations.map((result, idx) => (
							<CreditCardCard
								key={result.card.id}
								card={result.card}
								filterResult={result}
								index={idx}
							/>
						))}
					</div>
				</div>
			)}

			{/* Sort Controls */}
			{!hasProfile && (
				<div className="flex items-center gap-4">
					<label className="text-sm text-zinc-400">Sort by:</label>
					<div className="flex gap-2">
						{(
							[
								["relevance", "Relevance"],
								["fee", "Annual Fee"],
								["welcome", "Welcome Bonus"]
							] as const
						).map(([value, label]) => (
							<button
								key={value}
								onClick={() => setSortBy(value)}
								className={`px-3 py-1 rounded text-sm transition ${
									sortBy === value
										? "bg-purple-600 text-white"
										: "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
								}`}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Cards by Institution */}
			<div className="space-y-6">
				{institutions.map((institution) => {
					const institutionResults = resultsByInstitution[institution]
					if (institutionResults.length === 0) return null

					const sortedCards = sortResults(institutionResults)
					const isExpanded = expandedInstitution === institution

					return (
						<div key={institution}>
							{/* Institution Header */}
							<button
								onClick={() =>
									setExpandedInstitution(isExpanded ? null : institution)
								}
								className="w-full group text-left mb-4 p-4 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-700 transition"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<span className="text-2xl">
											{institution === "Amex" && "💳"}
											{institution === "Scotiabank" && "🏦"}
											{institution === "BMO" && "🏛️"}
											{institution === "TD" && "🌍"}
											{institution === "RBC" && "👑"}
											{institution === "CIBC" && "🏢"}
											{institution === "National Bank" && "🏭"}
											{institution === "Tangerine" && "🍊"}
											{institution === "PC Financial" && "💼"}
										</span>
										<div>
											<h3 className="font-bold text-white text-lg">{institution}</h3>
											<p className="text-sm text-zinc-400">
												{institutionResults.length} card
												{institutionResults.length !== 1 ? "s" : ""}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-zinc-400">
											{isExpanded ? "▼" : "▶"}
										</span>
									</div>
								</div>
							</button>

							{/* Institution Cards */}
							{isExpanded && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 animate-in fade-in slide-in-from-top-2">
									{sortedCards.map((result, idx) => (
										<CreditCardCard
											key={result.card.id}
											card={result.card}
											filterResult={hasProfile ? result : undefined}
											index={idx}
										/>
									))}
								</div>
							)}
						</div>
					)
				})}
			</div>

			{/* Empty State */}
			{results.length === 0 && (
				<div className="text-center py-12">
					<div className="text-6xl mb-4">🔍</div>
					<h3 className="text-xl font-semibold text-white mb-2">No cards found</h3>
					<p className="text-zinc-400 mb-6">Try adjusting your preferences</p>
					<button
						onClick={onReset}
						className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition"
					>
						Start Over
					</button>
				</div>
			)}

			{/* Footer Info */}
			<div className="border-t border-zinc-700 pt-8 mt-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
					<div>
						<p className="font-semibold text-white mb-2">💡 Tip</p>
						<p>
							Compare multiple cards before applying. Your credit utilization affects your credit
							score.
						</p>
					</div>
					<div>
						<p className="font-semibold text-white mb-2">📍 Note</p>
						<p>
							Information is accurate as of March 2026. Card benefits and features change
							frequently—verify with the issuer.
						</p>
					</div>
					<div>
						<p className="font-semibold text-white mb-2">⚖️ Disclaimer</p>
						<p>This is not financial advice. Please review terms and conditions before applying.</p>
					</div>
				</div>
			</div>
		</div>
	)
}
