import React, { createContext, useContext, useEffect, useRef, useState } from "react"

interface LoadingContextType {
	isLoading: boolean
	triggerLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(true)
	const timeoutRef = useRef<number | null>(null)

	const scheduleHide = () => {
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current)
		}
		timeoutRef.current = window.setTimeout(() => {
			setIsLoading(false)
		}, 2000)
	}

	useEffect(() => {
		scheduleHide()
		return () => {
			if (timeoutRef.current !== null) {
				window.clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	const triggerLoading = () => {
		setIsLoading(true)
		scheduleHide()
	}

	return (
		<LoadingContext.Provider value={{ isLoading, triggerLoading }}>
			{children}
		</LoadingContext.Provider>
	)
}

export function useLoading() {
	const context = useContext(LoadingContext)
	if (!context) {
		throw new Error("useLoading must be used within LoadingProvider")
	}
	return context
}
