import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js"
import { supabase } from "../services/supabaseClient"

type AuthContextValue = {
	user: User | null
	session: Session | null
	/** True until the stored session has been read on first load. */
	isLoading: boolean
	/** Set when the user arrives from a password-reset email. */
	lastEvent: AuthChangeEvent | null
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [lastEvent, setLastEvent] = useState<AuthChangeEvent | null>(null)

	useEffect(() => {
		let isMounted = true

		supabase.auth.getSession().then(({ data }) => {
			if (!isMounted) return
			setSession(data.session)
			setIsLoading(false)
		})

		const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
			setSession(nextSession)
			setLastEvent(event)
			setIsLoading(false)
		})

		return () => {
			isMounted = false
			data.subscription.unsubscribe()
		}
	}, [])

	async function signOut() {
		await supabase.auth.signOut()
	}

	return (
		<AuthContext.Provider value={{ user: session?.user ?? null, session, isLoading, lastEvent, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
