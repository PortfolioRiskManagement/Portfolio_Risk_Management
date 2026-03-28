import { useEffect, useState } from "react"
import PageShell from "../../../components/layout/PageShell"
import CreditCardResults from "../components/CreditCardResults"
import ProfileQuestionnaireFlow from "../components/ProfileQuestionnaireFlow"
import type { UserProfile } from "../types"
import "../creditcard.css"

const fadeOutMs = 200
const pauseMs = 100
const revealMs = 400

export default function CreditCardPage() {
	const [view, setView] = useState<"questionnaire" | "results">("questionnaire")
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [questionnaireVisible, setQuestionnaireVisible] = useState(true)
	const [questionnaireScale, setQuestionnaireScale] = useState(1)
	const [resultsVisible, setResultsVisible] = useState(false)
	const [headerVisible, setHeaderVisible] = useState(false)

	useEffect(() => {
		const timer = window.setTimeout(() => setHeaderVisible(true), 30)
		return () => window.clearTimeout(timer)
	}, [])

	const moveToResults = (nextProfile: UserProfile | null) => {
		setQuestionnaireVisible(false)
		setQuestionnaireScale(0.97)
		window.setTimeout(() => {
			window.setTimeout(() => {
				setProfile(nextProfile)
				setView("results")
				setResultsVisible(true)
			}, pauseMs)
		}, fadeOutMs)
	}

	const handleComplete = (nextProfile: UserProfile) => {
		moveToResults(nextProfile)
	}

	const handleSkipAll = () => {
		moveToResults(null)
	}

	const handleAdjustProfile = () => {
		setResultsVisible(false)
		window.setTimeout(() => {
			setView("questionnaire")
			setQuestionnaireVisible(true)
			setQuestionnaireScale(1)
			setHeaderVisible(false)
			window.setTimeout(() => setHeaderVisible(true), 30)
		}, revealMs)
	}

	const handleNewSearch = () => {
		setResultsVisible(false)
		window.setTimeout(() => {
			setProfile(null)
			setView("questionnaire")
			setQuestionnaireVisible(true)
			setQuestionnaireScale(1)
			setHeaderVisible(false)
			window.setTimeout(() => setHeaderVisible(true), 30)
		}, revealMs)
	}

	if (view === "questionnaire") {
		return (
			<div className="creditcard-bg min-h-screen">
				<div className="mx-auto max-w-4xl px-4 pb-10 pt-[60px]">
					<div
						className="mb-6 text-center transition-all duration-200"
						style={{
							opacity: headerVisible ? 1 : 0,
							transform: headerVisible ? "translateY(0)" : "translateY(8px)",
						}}
					>
						<h1 className="m-0" style={{ fontSize: 22, fontWeight: 600, color: "#e6edf3" }}>
							Credit Card Assistant
						</h1>
						<p className="m-0 mt-2" style={{ fontSize: 13, color: "#8b949e" }}>
							Answer a few questions to get personalized recommendations
						</p>
					</div>
					<div
						className="transition-all duration-200"
						style={{ opacity: questionnaireVisible ? 1 : 0, transform: `scale(${questionnaireScale})` }}
					>
						<ProfileQuestionnaireFlow onComplete={handleComplete} onSkipAll={handleSkipAll} />
					</div>
				</div>
			</div>
		)
	}

	return (
		<PageShell title="Credit Card Assistant">
			<div
                className="creditcard-bg creditcard-results-in -m-6 p-6"
				style={{
					opacity: resultsVisible ? 1 : 0,
					transform: resultsVisible ? "translateY(0)" : "translateY(20px)",
					transition: `opacity ${revealMs}ms ease, transform ${revealMs}ms ease`,
				}}
			>
				<CreditCardResults profile={profile} onAdjustProfile={handleAdjustProfile} onNewSearch={handleNewSearch} />
			</div>
		</PageShell>
	)
}
