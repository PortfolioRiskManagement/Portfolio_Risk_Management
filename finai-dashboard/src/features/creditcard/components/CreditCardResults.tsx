import { useMemo, useState } from "react"
import CreditCardCard from "./CreditCardCard"
import { getCardsByInstitution, getTopPicks } from "../services/creditCardService"
import type { CreditCard, UserProfile } from "../types"

interface CreditCardResultsProps {
	profile: UserProfile | null
	onAdjustProfile: () => void
	onNewSearch: () => void
}

type SortBy = "relevance" | "annual_fee" | "welcome_bonus"

function parseWelcomeValue(value: string | null): number {
	if (!value) return 0
	const matched = value.match(/[\d,.]+/)
	if (!matched) return 0
	return parseFloat(matched[0].replace(/,/g, ""))
}

function sortCards(cards: CreditCard[], sortBy: SortBy): CreditCard[] {
	if (sortBy === "annual_fee") return [...cards].sort((a, b) => a.annualFee - b.annualFee)
	if (sortBy === "welcome_bonus") return [...cards].sort((a, b) => parseWelcomeValue(b.welcomeBonusValue) - parseWelcomeValue(a.welcomeBonusValue))
	return [...cards].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

export default function CreditCardResults({ profile, onAdjustProfile, onNewSearch }: CreditCardResultsProps) {
	const [sortBy, setSortBy] = useState<SortBy>(profile ? "relevance" : "annual_fee")

	const institutions = useMemo(() => getCardsByInstitution(profile), [profile])
	const totalCards = useMemo(() => institutions.reduce((sum, inst) => sum + inst.cards.length, 0), [institutions])
	const topPicks = useMemo(() => (profile ? getTopPicks(profile, 3) : []), [profile])
	const accentMap = useMemo(() => Object.fromEntries(institutions.map((inst) => [inst.id, inst.accentColor])), [institutions])

	const rows = useMemo(() => {
		return institutions.map((inst) => {
			const cards = profile ? sortCards(inst.cards, sortBy) : [...inst.cards].sort((a, b) => a.annualFee - b.annualFee)
			return { ...inst, cards }
		})
	}, [institutions, profile, sortBy])

	return (
		<div className="creditcard-scroll space-y-8">
			<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h2 className="m-0" style={{ fontSize: 28, fontWeight: 750, color: "var(--cc-text-strong)", textShadow: "var(--cc-heading-shadow)" }}>
						Your Recommendations
					</h2>
					<p className="m-0 mt-1" style={{ fontSize: 13, color: "var(--cc-text-muted)" }}>
						{profile ? `${totalCards} cards matched to your profile` : "Showing all cards"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{profile && (
						<button
							type="button"
							onClick={onAdjustProfile}
							style={{
								border: "1px solid var(--cc-border)",
								background: "transparent",
								borderRadius: 6,
								padding: "6px 14px",
								fontSize: 13,
								color: "var(--cc-text-muted)",
							}}
							onMouseEnter={(event) => {
								event.currentTarget.style.borderColor = "var(--cc-border-strong)"
								event.currentTarget.style.color = "var(--cc-text-strong)"
							}}
							onMouseLeave={(event) => {
								event.currentTarget.style.borderColor = "var(--cc-border)"
								event.currentTarget.style.color = "var(--cc-text-muted)"
							}}
						>
							Adjust Profile
						</button>
					)}
					<button
						type="button"
						onClick={onNewSearch}
						style={{
							border: "1px solid var(--cc-border)",
							background: "transparent",
							borderRadius: 6,
							padding: "6px 14px",
							fontSize: 13,
							color: "var(--cc-text-muted)",
						}}
						onMouseEnter={(event) => {
							event.currentTarget.style.borderColor = "var(--cc-border-strong)"
							event.currentTarget.style.color = "var(--cc-text-strong)"
						}}
						onMouseLeave={(event) => {
							event.currentTarget.style.borderColor = "var(--cc-border)"
							event.currentTarget.style.color = "var(--cc-text-muted)"
						}}
					>
						New Search
					</button>
				</div>
			</header>

			<section className="creditcard-legend">
				<span className="creditcard-legend-chip creditcard-legend-chip-now">✅ NOW · No/minimal income req</span>
				<span className="creditcard-legend-chip creditcard-legend-chip-student">🎓 STUDENT · Student-specific version available</span>
				<span className="creditcard-legend-chip creditcard-legend-chip-postgrad">💼 POST-GRAD · Entry professional tier</span>
				<span className="creditcard-legend-chip creditcard-legend-chip-premium">👑 PREMIUM · Target tier after graduation</span>
				<span className="creditcard-legend-chip">✈️ No FX Fee badge shown on cards</span>
			</section>

			{profile && topPicks.length > 0 && (
				<section>
					<div style={{ borderBottom: "1px solid var(--cc-border)", paddingBottom: 10, marginBottom: 20 }}>
						<p
							className="m-0"
							style={{
								fontSize: 12,
								letterSpacing: "2px",
								textTransform: "uppercase",
								color: "var(--cc-text)",
								textShadow: "var(--cc-heading-shadow)",
							}}
						>
							Top Matches For You
						</p>
					</div>
					<div className="grid grid-cols-1 gap-3">
						{topPicks.map((card, index) => (
							<CreditCardCard
								key={card.id}
								card={card}
								accentColor={accentMap[card.institutionId] ?? "var(--cc-border)"}
								showTopPick
								compact
								employment={profile.employment}
								animationDelayMs={60 + index * 50}
							/>
						))}
					</div>
				</section>
			)}

			<section className="space-y-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<p
						className="m-0"
						style={{
							fontSize: 11,
							letterSpacing: "2px",
							textTransform: "uppercase",
							color: "var(--cc-text-subtle)",
						}}
					>
						All Cards By Institution
					</p>
					<div className="flex items-center gap-2">
						<label htmlFor="credit-sort" style={{ fontSize: 12, color: "var(--cc-text-subtle)" }}>
							Sort
						</label>
						<select
							id="credit-sort"
							value={sortBy}
							onChange={(event) => setSortBy(event.target.value as SortBy)}
							style={{
								background: "var(--cc-select-bg)",
								border: "1px solid var(--cc-border)",
								color: "var(--cc-select-text)",
								borderRadius: 6,
								padding: "6px 12px",
								fontSize: 13,
							}}
							onFocus={(event) => {
								event.currentTarget.style.borderColor = "#58a6ff"
							}}
							onBlur={(event) => {
								event.currentTarget.style.borderColor = "var(--cc-border)"
							}}
						>
							<option value="relevance">Relevance</option>
							<option value="annual_fee">Annual Fee ↑</option>
							<option value="welcome_bonus">Welcome Bonus</option>
						</select>
					</div>
				</div>

				<div className="space-y-4">
					{rows.map((institution) => (
						<div key={institution.id} className="creditcard-institution-section">
							<div className="mb-4 flex items-center gap-2 border-b pb-3" style={{ borderColor: "var(--cc-border)" }}>
								<span
									aria-hidden="true"
									style={{
										width: 9,
										height: 9,
										borderRadius: "50%",
										background: institution.accentColor,
										display: "inline-block",
									}}
								/>
								<h3 className="m-0" style={{ fontSize: 18, fontWeight: 600, color: "var(--cc-text-strong)" }}>
									{institution.name}
								</h3>
								<span style={{ fontSize: 12, color: "var(--cc-text-muted)" }}>{institution.cards.length} cards</span>
							</div>
							<div className="mb-2 hidden border-b pb-2 md:grid md:grid-cols-[2.2fr_0.9fr_1.3fr_1fr_0.9fr] md:gap-3" style={{ borderColor: "var(--cc-border)" }}>
								<p className="m-0 text-[10px] uppercase tracking-[1.5px]" style={{ color: "var(--cc-text-subtle)" }}>Card</p>
								<p className="m-0 text-[10px] uppercase tracking-[1.5px]" style={{ color: "var(--cc-text-subtle)" }}>Fee</p>
								<p className="m-0 text-[10px] uppercase tracking-[1.5px]" style={{ color: "var(--cc-text-subtle)" }}>Top Earn</p>
								<p className="m-0 text-[10px] uppercase tracking-[1.5px]" style={{ color: "var(--cc-text-subtle)" }}>Bonus</p>
								<p className="m-0 text-[10px] uppercase tracking-[1.5px]" style={{ color: "var(--cc-text-subtle)" }}>Rating</p>
							</div>
							<div className="grid grid-cols-1 gap-2">
								{institution.cards.map((card, index) => (
									<div key={card.id} className="creditcard-accordion-card-in" style={{ animationDelay: `${40 + index * 40}ms` }}>
										<CreditCardCard card={card} accentColor={institution.accentColor} employment={profile?.employment ?? null} compact />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			<footer className="pt-2">
				<p className="m-0" style={{ fontSize: 12, color: "var(--cc-text-muted)" }}>
					Information accurate as of March 2026. Verify terms directly with each issuer before applying.
				</p>
				<p className="m-0 mt-1" style={{ fontSize: 12, color: "var(--cc-text-subtle)" }}>
					This is not financial advice.
				</p>
			</footer>
		</div>
	)
}
