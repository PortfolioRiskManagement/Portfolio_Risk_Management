import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import BrandLogo from "../../../components/ui/BrandLogo"
import { SpinnerLoader } from "../../../components/ui/SpinnerLoader"
import { useAuth } from "../../../contexts/AuthContext"
import { supabase } from "../../../services/supabaseClient"
import AuthShowcase from "../components/AuthShowcase"
import { PasswordField, SubmitButton, FormMessage, friendlyAuthError } from "../components/AuthFormParts"
import "../../landing/landing.css"

const MIN_PASSWORD_LENGTH = 8

/** Landing spot for the password-reset email link; Supabase signs the user in from the link first. */
export default function ResetPasswordPage() {
	const { user, isLoading } = useAuth()
	const navigate = useNavigate()
	const [password, setPassword] = useState("")
	const [confirm, setConfirm] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setError(null)
		if (password.length < MIN_PASSWORD_LENGTH) {
			setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
			return
		}
		if (password !== confirm) {
			setError("Passwords don't match.")
			return
		}

		setSubmitting(true)
		const { error: updateError } = await supabase.auth.updateUser({ password })
		setSubmitting(false)
		if (updateError) {
			setError(friendlyAuthError(updateError))
			return
		}
		navigate("/dashboard", { replace: true })
	}

	return (
		<div className="grid min-h-screen bg-white lg:grid-cols-2 dark:bg-[#0b0b0c]">
			<div className="flex flex-col px-4 py-8 sm:px-10 lg:px-16">
				<BrandLogo />
				<div className="flex flex-1 items-center justify-center py-12">
					<div className="lp-enter w-full max-w-sm">
						{isLoading ? (
							<SpinnerLoader size={80} label="" />
						) : !user ? (
							<div className="text-center">
								<h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">This link has expired</h1>
								<p className="mt-3 text-zinc-600 dark:text-zinc-400">Reset links can only be used once and expire after a while. Request a new one to continue.</p>
								<Link to="/login" className="mt-8 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
									Back to log in
								</Link>
							</div>
						) : (
							<>
								<h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">Choose a new password</h1>
								<p className="mt-2 text-zinc-600 dark:text-zinc-400">For {user.email}</p>
								<form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
									<PasswordField label="New password" value={password} onChange={setPassword} autoComplete="new-password" hint={`At least ${MIN_PASSWORD_LENGTH} characters`} />
									<PasswordField label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
									{error && <FormMessage tone="error">{error}</FormMessage>}
									<SubmitButton loading={submitting} disabled={!password || !confirm}>
										Update password
									</SubmitButton>
								</form>
							</>
						)}
					</div>
				</div>
			</div>
			<AuthShowcase />
		</div>
	)
}
