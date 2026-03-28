import { useState, useEffect } from "react"
import PageShell from "../../../components/layout/PageShell"
import ProfileQuestionnaireFlow from "../components/ProfileQuestionnaireFlow"
import CreditCardResults from "../components/CreditCardResults"
import { matchCardsToProfile, getCardsByInstitution } from "../services/creditCardService"
import type { UserProfile, CreditCardFilterResult } from "../types"

export default function CreditCardPage() {
	const [stage, setStage] = useState<"questionnaire" | "results">("questionnaire")
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
	const [results, setResults] = useState<CreditCardFilterResult[]>([])
	const [hasProfile, setHasProfile] = useState(false)

	// Load initial results (generic recommendations)
	useEffect(() => {
		const genericProfile: UserProfile = {}
		const genericResults = matchCardsToProfile(genericProfile)
		setResults(genericResults)
	}, [])

	const handleProfileComplete = (profile: UserProfile) => {
		setUserProfile(profile)
		setHasProfile(true)

		// Get filtered results
		const filteredResults = matchCardsToProfile(profile)
		setResults(filteredResults)
		setStage("results")
	}

	const handleSkipAll = () => {
		setHasProfile(false)
		setUserProfile(null)
		setStage("results")

		// Load generic results
		const genericResults = matchCardsToProfile({})
		setResults(genericResults)
	}

	const handleReset = () => {
		setStage("questionnaire")
		setUserProfile(null)
		setHasProfile(false)
	}

	const handleEditProfile = () => {
		setStage("questionnaire")
	}

	return (
		<>
			{stage === "questionnaire" ? (
				<div>
					<ProfileQuestionnaireFlow
						onComplete={handleProfileComplete}
						onSkipAll={handleSkipAll}
					/>
				</div>
			) : (
				<PageShell
					title="Credit Card Assistant"
					subtitle="Find the perfect credit card matched to your lifestyle and financial goals"
				>
					<CreditCardResults
						results={results}
						hasProfile={hasProfile}
						onReset={handleReset}
						onEditProfile={handleEditProfile}
					/>
				</PageShell>
			)}
		</>
	)
}
