import { useMemo, useState } from "react"
import type { AccessTier, CreditCard, EmploymentStatus } from "../types"

interface CreditCardCardProps {
	card: CreditCard
	accentColor: string
	showTopPick?: boolean
	employment?: EmploymentStatus | null
	compact?: boolean
	animationDelayMs?: number
}

function formatAnnualFee(amount: number): string {
	if (amount === 0) return "$0/yr"
	if (Number.isInteger(amount)) return `$${amount}/yr`
	return `$${amount.toFixed(2)}/yr`
}

function accessBadge(accessTier: AccessTier): { label: string; style: React.CSSProperties } | null {
	if (accessTier === "now") return null
	if (accessTier === "student") {
		return {
			label: "Student",
			style: {
				background: "rgba(88,166,255,0.08)",
				color: "#58a6ff",
				border: "1px solid rgba(88,166,255,0.2)",
			},
		}
	}
	if (accessTier === "post_grad") {
		return {
			label: "Near-term",
			style: {
				background: "rgba(210,153,34,0.1)",
				color: "#d29922",
				border: "1px solid rgba(210,153,34,0.25)",
			},
		}
	}
	return {
		label: "Premium ($60k+)",
		style: {
			background: "rgba(248,81,73,0.08)",
			color: "#f85149",
			border: "1px solid rgba(248,81,73,0.2)",
		},
	}
}

function fitRating(score?: number): { label: string; stars: number; color: string } {
	if (score === undefined) return { label: "General", stars: 3, color: "var(--cc-text-muted)" }
	if (score >= 105) return { label: "Excellent", stars: 5, color: "#f0c96e" }
	if (score >= 90) return { label: "Strong", stars: 4, color: "#79c0ff" }
	if (score >= 75) return { label: "Good", stars: 3, color: "var(--cc-text-muted)" }
	if (score >= 60) return { label: "Fair", stars: 2, color: "#d29922" }
	return { label: "Weak", stars: 1, color: "#f85149" }
}

export default function CreditCardCard({
	card,
	accentColor,
	showTopPick = false,
	employment = null,
	compact = true,
	animationDelayMs,
}: CreditCardCardProps) {
	const [showStudentTip, setShowStudentTip] = useState(false)
	const tier = useMemo(() => accessBadge(card.accessTier), [card.accessTier])
	const isStudentView = employment === "student" && !!card.studentNote
	const rating = useMemo(() => fitRating(card.score), [card.score])
	const stars = "★".repeat(rating.stars) + "☆".repeat(5 - rating.stars)
	const topRates = card.topEarnRates.slice(0, 2)
	const keyPerks = card.keyPerks.slice(0, 2)

	const feeStyle: React.CSSProperties =
		card.annualFee === 0
			? {
				background: "rgba(63,185,80,0.1)",
				color: "#3fb950",
				border: "1px solid rgba(63,185,80,0.25)",
			}
			: {
				background: "var(--cc-chip-bg)",
				color: "#d4a843",
				border: "1px solid var(--cc-border)",
			}

	return (
		<article
			className={`creditcard-card creditcard-row ${animationDelayMs !== undefined ? "creditcard-top-card-in" : ""}`}
			style={{
				borderLeft: `3px solid ${accentColor}`,
				padding: compact ? 12 : 16,
				animationDelay: animationDelayMs !== undefined ? `${animationDelayMs}ms` : undefined,
			}}
		>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-[2.2fr_0.9fr_1.3fr_1fr_0.9fr] md:items-center">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<p className="m-0" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.6px", color: "var(--cc-text-muted)" }}>
							{card.institution}
						</p>
						{tier && <span style={{ ...tier.style, fontSize: 10, borderRadius: 4, padding: "2px 7px" }}>{tier.label}</span>}
						{showTopPick && (
							<span
								style={{
									background: "rgba(88,166,255,0.1)",
									border: "1px solid rgba(88,166,255,0.25)",
									borderRadius: 4,
									fontSize: 10,
									padding: "2px 6px",
									color: "#79c0ff",
								}}
							>
								★ Top Pick
							</span>
						)}
						{card.noForeignTransactionFee && (
							<span
								style={{
									background: "rgba(63,185,80,0.08)",
									color: "#3fb950",
									border: "1px solid rgba(63,185,80,0.2)",
									borderRadius: 3,
									fontSize: 10,
									padding: "2px 6px",
								}}
							>
								No FX Fee
							</span>
						)}
					</div>
					<div className="mt-1 flex items-center gap-2">
						<h3 className="m-0 truncate" style={{ fontSize: 17, fontWeight: 650, color: "var(--cc-text-strong)" }}>
							{card.name}
						</h3>
					</div>
					<div className="mt-1 flex flex-wrap items-center gap-2">
						<span
							style={{
								background: "var(--cc-chip-bg)",
								border: "1px solid var(--cc-chip-border)",
								color: "var(--cc-chip-text)",
								fontSize: 10,
								borderRadius: 4,
								padding: "2px 7px",
							}}
						>
							{card.rewardProgram}
						</span>
						<p className="m-0 truncate" style={{ fontSize: 11, color: "var(--cc-text-muted)" }}>
							{keyPerks.join(" • ")}
						</p>
					</div>
				</div>

				<div className="md:text-center">
					<p className="m-0 mb-1" style={{ fontSize: 10, color: "var(--cc-text-subtle)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
						Annual Fee
					</p>
					<div
						style={{
							...feeStyle,
							borderRadius: 4,
							padding: "3px 8px",
							fontSize: 11,
							fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
							display: "inline-block",
						}}
					>
						{formatAnnualFee(card.annualFee)}
					</div>
					{card.feeWaivable && <p className="m-0 mt-1" style={{ fontSize: 10, color: "var(--cc-text-subtle)" }}>waivable</p>}
				</div>

				<div>
					<p className="m-0 mb-1" style={{ fontSize: 10, color: "var(--cc-text-subtle)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
						Top Earn Rates
					</p>
					<div className="space-y-1">
						{topRates.map((rate) => (
							<div key={`${card.id}-${rate.category}-${rate.rate}`} className="flex items-center gap-2">
							<span
								style={{
									minWidth: 42,
									fontSize: 16,
									fontWeight: 700,
									color: "#f0c96e",
									lineHeight: 1,
								}}
							>
								{rate.rate}
							</span>
							<span className="line-clamp-1" style={{ fontSize: 11, color: "var(--cc-text-muted)", lineHeight: 1.3 }}>
								{rate.category}
							</span>
						</div>
					))}
				</div>
				</div>

				<div>
					<p className="m-0 mb-1" style={{ fontSize: 10, color: "var(--cc-text-subtle)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
						Welcome Bonus
					</p>
					<p className="m-0" style={{ fontSize: 14, fontWeight: 700, color: "#d4a843" }}>
						{card.welcomeBonusValue ?? card.welcomeBonus ?? "None"}
					</p>
					<p className="m-0 mt-1" style={{ fontSize: 11, color: "var(--cc-text-muted)" }}>
						{card.baseRate}
					</p>
				</div>

				<div>
					<p className="m-0 mb-1" style={{ fontSize: 10, color: "var(--cc-text-subtle)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
						Fit Rating
					</p>
					<p
						className="m-0"
						style={{
							fontSize: 12,
							fontWeight: 600,
							color: rating.color,
							textShadow: "0 0 10px rgba(255,255,255,0.06)",
						}}
						>
							{stars}
						</p>
					<p className="m-0 mt-1" style={{ fontSize: 11, color: "var(--cc-text-muted)" }}>
						{rating.label}
					</p>
				</div>
			</div>

			{isStudentView && (
				<>
					<hr className="creditcard-divider border-0" style={{ marginTop: 10, marginBottom: 10 }} />
					<button
						type="button"
						onClick={() => setShowStudentTip((prev) => !prev)}
						style={{
							background: "transparent",
							border: "none",
							padding: 0,
							fontSize: 12,
							color: "#58a6ff",
							cursor: "pointer",
						}}
					>
						🎓 Student tip {showStudentTip ? "↑" : "↓"}
					</button>
					<div
						style={{
							maxHeight: showStudentTip ? "240px" : "0px",
							overflow: "hidden",
							opacity: showStudentTip ? 1 : 0,
							transition: "max-height 220ms ease, opacity 220ms ease",
						}}
					>
						<div
							className="mt-3"
							style={{
								background: "var(--cc-student-bg)",
								border: "1px solid var(--cc-student-border)",
								borderRadius: 8,
								padding: "12px 14px",
								fontSize: 12,
								color: "var(--cc-student-text)",
								lineHeight: 1.6,
							}}
						>
							{card.studentNote}
						</div>
					</div>
				</>
			)}
		</article>
	)
}
