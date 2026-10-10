import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { SpinnerLoader } from "../ui/SpinnerLoader"

/** Sends signed-out visitors to /login and brings them back to the page they wanted afterwards. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, isLoading } = useAuth()
	const location = useLocation()

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
				<SpinnerLoader size={96} label="" />
			</div>
		)
	}

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
	}

	return <>{children}</>
}
