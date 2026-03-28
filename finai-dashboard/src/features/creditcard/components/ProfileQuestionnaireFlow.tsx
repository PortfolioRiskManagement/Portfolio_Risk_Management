import { useState, useEffect } from "react"
import type { EmploymentStatus, IncomeRange, SpendingCategory, UserProfile } from "../types"

interface ProfileQuestionnaireFlowProps {
	onComplete: (profile: UserProfile) => void
	onSkipAll: () => void
}

const questions = [
	{
		id: "employment",
		title: "What's your employment status?",
		type: "single",
		options: [
			{ value: "student", label: "👨‍🎓 Student", icon: "👨‍🎓" },
			{ value: "employed", label: "💼 Employed Full-Time", icon: "💼" },
			{ value: "self-employed", label: "🚀 Self-Employed", icon: "🚀" },
			{ value: "unemployed", label: "🔍 Currently Seeking", icon: "🔍" },
			{ value: "retired", label: "🌴 Retired", icon: "🌴" }
		]
	},
	{
		id: "income",
		title: "What's your estimated annual income?",
		type: "single",
		options: [
			{ value: "$0-30k", label: "Under $30k", icon: "💰" },
			{ value: "$30-50k", label: "$30k - $50k", icon: "💵" },
			{ value: "$50-75k", label: "$50k - $75k", icon: "💴" },
			{ value: "$75-100k", label: "$75k - $100k", icon: "💶" },
			{ value: "$100k+", label: "$100k+", icon: "💸" }
		]
	},
	{
		id: "spending",
		title: "What are your main spending categories? (Select all that apply)",
		type: "multi",
		options: [
			{ value: "groceries", label: "🛒 Groceries & Food", icon: "🛒" },
			{ value: "dining", label: "🍽️ Dining Out & Restaurants", icon: "🍽️" },
			{ value: "travel", label: "✈️ Travel & Flights", icon: "✈️" },
			{ value: "shopping", label: "🛍️ Shopping & Retail", icon: "🛍️" },
			{ value: "streaming", label: "📺 Streaming & Subscriptions", icon: "📺" },
			{ value: "balance", label: "⚖️ Balanced Across Categories", icon: "⚖️" }
		]
	}
]

export default function ProfileQuestionnaireFlow({ onComplete, onSkipAll }: ProfileQuestionnaireFlowProps) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [profile, setProfile] = useState<UserProfile>({})
	const [answered, setAnswered] = useState(new Set<string>())
	const [fadeOut, setFadeOut] = useState(false)

	const currentQuestion = questions[currentQuestionIndex]
	const isLastQuestion = currentQuestionIndex === questions.length - 1

	const handleAnswer = (value: string | string[]) => {
		const newAnswered = new Set(answered)
		newAnswered.add(currentQuestion.id)
		setAnswered(newAnswered)

		const newProfile = { ...profile }

		if (currentQuestion.id === "employment") {
			newProfile.employmentStatus = value as EmploymentStatus
		} else if (currentQuestion.id === "income") {
			newProfile.incomeRange = value as IncomeRange
		} else if (currentQuestion.id === "spending") {
			newProfile.spendingCategories = Array.isArray(value) ? (value as SpendingCategory[]) : [value as SpendingCategory]
		}

		setProfile(newProfile)

		// Animate to next question
		setFadeOut(true)
		setTimeout(() => {
			if (isLastQuestion) {
				onComplete(newProfile)
			} else {
				setCurrentQuestionIndex(currentQuestionIndex + 1)
				setFadeOut(false)
			}
		}, 300)
	}

	const handleSkip = () => {
		const newAnswered = new Set(answered)
		newAnswered.add(currentQuestion.id)
		setAnswered(newAnswered)

		setFadeOut(true)
		setTimeout(() => {
			if (isLastQuestion) {
				onComplete(profile)
			} else {
				setCurrentQuestionIndex(currentQuestionIndex + 1)
				setFadeOut(false)
			}
		}, 300)
	}

	const handleSkipAll = () => {
		onSkipAll()
	}

	const handleBack = () => {
		if (currentQuestionIndex > 0) {
			const newAnswered = new Set(answered)
			newAnswered.delete(currentQuestion.id)

			// Remove the answer for current question
			const newProfile = { ...profile }
			if (currentQuestion.id === "employment") {
				delete newProfile.employmentStatus
			} else if (currentQuestion.id === "income") {
				delete newProfile.incomeRange
			} else if (currentQuestion.id === "spending") {
				delete newProfile.spendingCategories
			}

			setProfile(newProfile)
			setAnswered(newAnswered)
			setFadeOut(true)
			setTimeout(() => {
				setCurrentQuestionIndex(currentQuestionIndex - 1)
				setFadeOut(false)
			}, 300)
		}
	}

	const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-4xl font-bold text-white">Find Your Perfect Card</h1>
						<button
							onClick={handleSkipAll}
							className="text-sm text-zinc-400 hover:text-white transition px-3 py-1 rounded hover:bg-zinc-700"
							title="Skip to see generic recommendations"
						>
							Skip All —
						</button>
					</div>
					<p className="text-zinc-400 mb-6">
						Answer a few quick questions to get personalized credit card recommendations
					</p>

					{/* Progress Bar */}
					<div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>

				{/* Question Card */}
				<div
					className={`bg-zinc-800 rounded-lg border border-zinc-700 p-8 transition-all duration-300 ${
						fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
					}`}
				>
					<h2 className="text-2xl font-semibold text-white mb-8">{currentQuestion.title}</h2>

					{/* Options */}
					{currentQuestion.type === "single" ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
							{currentQuestion.options.map((option, index) => (
								<button
									key={option.value}
									onClick={() => handleAnswer(option.value)}
									className="group relative p-4 rounded-lg border-2 border-zinc-600 hover:border-purple-500 hover:bg-zinc-700/50 transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-2"
									style={{
										animationDelay: `${index * 50}ms`,
										animationFillMode: "both"
									}}
								>
									<span className="text-2xl mr-3">{option.icon}</span>
									<span className="text-white font-medium">{option.label}</span>
									<div className="absolute inset-0 rounded-lg border-2 border-purple-500 opacity-0 group-hover:opacity-20 transition-opacity" />
								</button>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
							{currentQuestion.options.map((option, index) => (
								<button
									key={option.value}
									onClick={() => {
										const current = profile.spendingCategories || []
										const isSelected = current.includes(option.value as SpendingCategory)
										const newSpending = isSelected
											? current.filter((s) => s !== option.value)
											: [...current, option.value as SpendingCategory]
										setProfile({ ...profile, spendingCategories: newSpending })
										setAnswered(new Set(answered).add(currentQuestion.id))
									}}
									className={`group relative p-4 rounded-lg border-2 transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-2 ${
										(profile.spendingCategories || []).includes(option.value as SpendingCategory)
											? "border-purple-500 bg-purple-500/20 text-white"
											: "border-zinc-600 hover:border-purple-500 hover:bg-zinc-700/50 text-zinc-300"
									}`}
									style={{
										animationDelay: `${index * 50}ms`,
										animationFillMode: "both"
									}}
								>
									<span className="text-2xl mr-3">{option.icon}</span>
									<span className="font-medium">{option.label}</span>
									{(profile.spendingCategories || []).includes(option.value as SpendingCategory) && (
										<span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400">✓</span>
									)}
								</button>
							))}
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3 pt-6 border-t border-zinc-700">
						<button
							onClick={handleBack}
							disabled={currentQuestionIndex === 0}
							className="flex-1 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
						>
							← Back
						</button>

						<button
							onClick={handleSkip}
							className="flex-1 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition"
						>
							Skip This
						</button>

						<button
							onClick={() => {
								if (currentQuestion.type === "multi" && profile.spendingCategories && profile.spendingCategories.length > 0) {
									handleAnswer(profile.spendingCategories)
								} else if (currentQuestion.type === "single") {
									// Already handled by option click
								}
							}}
							disabled={currentQuestion.type === "multi" && (!profile.spendingCategories || profile.spendingCategories.length === 0)}
							className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
						>
							{isLastQuestion ? "Complete ✓" : "Next →"}
						</button>
					</div>
				</div>

				{/* Help Text */}
				<p className="text-center text-zinc-500 text-sm mt-6">
					💡 Your information helps us find cards tailored to your spending patterns and financial goals
				</p>
			</div>
		</div>
	)
}
