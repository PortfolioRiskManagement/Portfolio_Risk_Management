import { useMemo, useState } from "react"
import type { EmploymentStatus, IncomeRange, SpendingPriority, UserProfile } from "../types"

interface ProfileQuestionnaireFlowProps {
	onComplete: (profile: UserProfile) => void
	onSkipAll: () => void
}

type Step = 0 | 1 | 2 | 3

type AnimationPhase = "idle" | "enter" | "exit"

type SlideDirection = "next" | "back"

interface Option<TValue extends string> {
	value: TValue
	label: string
}

const employmentOptions: Option<EmploymentStatus>[] = [
	{ value: "student", label: "Student" },
	{ value: "employed", label: "Employed" },
	{ value: "self_employed", label: "Self-Employed" },
	{ value: "seeking", label: "Seeking" },
	{ value: "retired", label: "Retired" },
]

const incomeOptions: Option<IncomeRange>[] = [
	{ value: "under_30k", label: "Under $30,000" },
	{ value: "30k_60k", label: "$30,000 - $60,000" },
	{ value: "60k_80k", label: "$60,000 - $80,000" },
	{ value: "80k_plus", label: "$80,000+" },
]

const spendOptions: Option<SpendingPriority>[] = [
	{ value: "groceries", label: "Groceries" },
	{ value: "dining", label: "Dining" },
	{ value: "travel", label: "Travel" },
	{ value: "gas", label: "Gas & Transit" },
	{ value: "streaming", label: "Streaming" },
]

const preferenceOptions: Option<SpendingPriority>[] = [
	{ value: "cashback", label: "Cash Back" },
	{ value: "no_fee", label: "No Annual Fee" },
]

const emptyProfile: UserProfile = {
	employment: null,
	income: null,
	priorities: [],
}

const transitionMs = 220

function getQuestion(step: Step): { title: string; subtitle?: string; isMulti: boolean } {
	if (step === 0) return { title: "Employment status", isMulti: false }
	if (step === 1) return { title: "Annual income", isMulti: false }
	if (step === 2) return { title: "Main spending", subtitle: "Select all", isMulti: true }
	return { title: "Card preferences", subtitle: "Select all", isMulti: true }
}

function stepClass(phase: AnimationPhase, direction: SlideDirection): string {
	if (phase === "idle") return ""
	if (phase === "exit") return direction === "next" ? "creditcard-step-out-next" : "creditcard-step-out-back"
	return direction === "next" ? "creditcard-step-in-next" : "creditcard-step-in-back"
}

function updatePriorities(current: SpendingPriority[], value: SpendingPriority): SpendingPriority[] {
	if (current.includes(value)) return current.filter((item) => item !== value)
	return [...current, value]
}

export default function ProfileQuestionnaireFlow({ onComplete, onSkipAll }: ProfileQuestionnaireFlowProps) {
	const [step, setStep] = useState<Step>(0)
	const [profile, setProfile] = useState<UserProfile>(emptyProfile)
	const [phase, setPhase] = useState<AnimationPhase>("enter")
	const [direction, setDirection] = useState<SlideDirection>("next")

	const question = useMemo(() => getQuestion(step), [step])
	const totalSteps = 4
	const progress = ((step + 1) / totalSteps) * 100
	const options = step === 0 ? employmentOptions : step === 1 ? incomeOptions : step === 2 ? spendOptions : preferenceOptions
	const isMulti = step >= 2

	const canGoNext = useMemo(() => {
		if (step === 0) return profile.employment !== null
		if (step === 1) return profile.income !== null
		if (step === 2) return profile.priorities.some((p) => spendOptions.map((o) => o.value).includes(p))
		return true
	}, [profile, step])

	const runTransition = (nextStep: Step, nextDirection: SlideDirection) => {
		setDirection(nextDirection)
		setPhase("exit")
		window.setTimeout(() => {
			setStep(nextStep)
			setPhase("enter")
			window.setTimeout(() => setPhase("idle"), transitionMs)
		}, transitionMs)
	}

	const applySingleSelect = (value: string) => {
		if (step === 0) setProfile((prev) => ({ ...prev, employment: value as EmploymentStatus }))
		if (step === 1) setProfile((prev) => ({ ...prev, income: value as IncomeRange }))
	}

	const applyMultiSelect = (value: SpendingPriority) => {
		setProfile((prev) => ({ ...prev, priorities: updatePriorities(prev.priorities, value) }))
	}

	const handleNext = () => {
		if (!canGoNext) return
		if (step === 3) {
			onComplete(profile)
			return
		}
		runTransition((step + 1) as Step, "next")
	}

	const handleBack = () => {
		if (step === 0) return
		runTransition((step - 1) as Step, "back")
	}

	const handleSkipThis = () => {
		if (step === 3) {
			onComplete(profile)
			return
		}
		runTransition((step + 1) as Step, "next")
	}

	return (
		<div className="mx-auto w-full max-w-[560px] px-4">
			<div className="creditcard-panel creditcard-questionnaire-in p-10">
				<div className="creditcard-panel-header mb-2">
					<p className="m-0" style={{ fontSize: 11, color: "var(--cc-text-subtle)", letterSpacing: "1px" }}>
						Step {step + 1} of {totalSteps}
					</p>
					<button type="button" onClick={onSkipAll} className="creditcard-skip-all-btn">
						Skip All Questions
					</button>
				</div>
				<div className="mb-7 h-[3px] rounded-[2px]" style={{ background: "var(--cc-track)" }}>
					<div
						className="h-[3px] rounded-[2px]"
						style={{
							width: `${progress}%`,
							background: "linear-gradient(90deg, #58a6ff, #79c0ff)",
							transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)",
						}}
					/>
				</div>

				<div className={stepClass(phase, direction)}>
					<h2 className="m-0" style={{ fontSize: 20, fontWeight: 600, color: "var(--cc-text-strong)" }}>
						{question.title}
					</h2>
					{question.subtitle && (
						<p className="m-0 mt-[6px]" style={{ fontSize: 13, color: "var(--cc-text-muted)" }}>
							{question.subtitle}
						</p>
					)}

					<div className="creditcard-options-sun mt-6 mb-8 p-3 sm:p-4">
						<div className={`grid gap-3 ${step === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
						{options.map((option, index) => {
							const isSelected =
								(step === 0 && profile.employment === option.value) ||
								(step === 1 && profile.income === option.value) ||
								(step >= 2 && profile.priorities.includes(option.value as SpendingPriority))

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										if (isMulti) {
											applyMultiSelect(option.value as SpendingPriority)
										} else {
											applySingleSelect(option.value)
										}
									}}
									className={`creditcard-option creditcard-option-in text-left active:scale-[0.97] ${isSelected ? "creditcard-option-selected" : ""}`}
									style={{ animationDelay: `${80 + index * 60}ms` }}
								>
									<div className="flex items-center justify-between gap-3">
										<span style={{ fontSize: 14, fontWeight: 500, color: isSelected ? "#79c0ff" : "var(--cc-text-strong)" }}>{option.label}</span>
										{step < 2 ? (
											isSelected ? (
												<span style={{ color: "#79c0ff", fontSize: 14 }}>✓</span>
											) : null
										) : (
											<span
												style={{
													width: 18,
													height: 18,
													borderRadius: 4,
													border: isSelected ? "1.5px solid #58a6ff" : "1.5px solid var(--cc-border)",
													background: isSelected ? "#58a6ff" : "transparent",
													color: "#ffffff",
													fontSize: 12,
													display: "inline-flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												{isSelected ? "✓" : ""}
											</span>
										)}
									</div>
								</button>
							)
						})}
						</div>
					</div>

					<div className="flex items-center justify-between border-t pt-5" style={{ borderColor: "var(--cc-border)" }}>
						<div className="w-28 text-left">
							{step > 0 && (
								<button
									type="button"
									onClick={handleBack}
									className="bg-transparent p-0"
									style={{ color: "var(--cc-text-subtle)", border: "none", fontSize: 13 }}
								>
									Back
								</button>
							)}
						</div>
						<button
							type="button"
							onClick={handleSkipThis}
							className="creditcard-skip-this-btn"
						>
							Skip This
						</button>
						<button
							type="button"
							onClick={handleNext}
							disabled={!canGoNext}
							className="creditcard-next-btn"
							style={{
								border: "none",
								borderRadius: 8,
								padding: "10px 24px",
								fontWeight: 500,
								fontSize: 14,
								color: "#ffffff",
								opacity: canGoNext ? 1 : 0.45,
								cursor: canGoNext ? "pointer" : "not-allowed",
							}}
						>
							{step === 3 ? "Finish →" : "Next →"}
						</button>
					</div>
				</div>
			</div>
			<p className="m-0 pt-4 text-center" style={{ fontSize: 12, color: "var(--cc-text-muted)" }}>
				No pressure: answers are optional, and you can skip everything anytime.
			</p>
		</div>
	)
}
