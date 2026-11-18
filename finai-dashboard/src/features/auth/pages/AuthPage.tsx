import { useState, type FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import BrandLogo from "../../../components/ui/BrandLogo"
import { useAuth } from "../../../contexts/AuthContext"
import { supabase } from "../../../services/supabaseClient"
import AuthShowcase from "../components/AuthShowcase"
import { AuthField, PasswordField, SubmitButton, FormMessage, friendlyAuthError } from "../components/AuthFormParts"
import "../../landing/landing.css"

type Mode = "login" | "signup" | "forgot"

const COPY: Record<Mode, { title: string; subtitle: string; submit: string }> = {
	login: { title: "Welcome back", subtitle: "Log in to see your portfolio risk.", submit: "Log in" },
	signup: { title: "Create your account", subtitle: "Start understanding your portfolio in minutes.", submit: "Create account" },
	forgot: { title: "Reset your password", subtitle: "Enter your email and we'll send you a reset link.", submit: "Send reset link" },
}

const MIN_PASSWORD_LENGTH = 8

export default function AuthPage({ initialMode }: { initialMode: "login" | "signup" }) {
	const { user, isLoading } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const redirectTo = (location.state as { from?: string } | null)?.from || "/dashboard"

	const [mode, setMode] = useState<Mode>(initialMode)
	const [fullName, setFullName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [notice, setNotice] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)
	const [sentTo, setSentTo] = useState<string | null>(null)

	if (!isLoading && user) return <Navigate to={redirectTo} replace />

	function switchMode(next: Mode) {
		setMode(next)
		setError(null)
		setNotice(null)
		if (next !== "forgot") navigate(next === "login" ? "/login" : "/signup", { replace: true, state: location.state })
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		setError(null)
		setNotice(null)

		const trimmedEmail = email.trim()
		if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
			setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
			return
		}

		setSubmitting(true)
		try {
			if (mode === "login") {
				const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
				if (signInError) throw signInError
				navigate(redirectTo, { replace: true })
			} else if (mode === "signup") {
				const { data, error: signUpError } = await supabase.auth.signUp({
					email: trimmedEmail,
					password,
					options: {
						data: { full_name: fullName.trim() },
						emailRedirectTo: `${window.location.origin}/dashboard`,
					},
				})
				if (signUpError) throw signUpError
				// With email confirmation on, Supabase returns no session until the link is clicked.
				if (data.session) navigate("/dashboard", { replace: true })
				else setSentTo(trimmedEmail)
			} else {
				const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
					redirectTo: `${window.location.origin}/reset-password`,
				})
				if (resetError) throw resetError
				setNotice(`If an account exists for ${trimmedEmail}, a reset link is on its way.`)
			}
		} catch (err) {
			setError(friendlyAuthError(err))
		} finally {
			setSubmitting(false)
		}
	}

	const copy = COPY[mode]

	return (
		<div className="grid min-h-screen bg-white lg:grid-cols-2 dark:bg-[#0b0b0c]">
			<div className="relative flex flex-col px-4 py-8 sm:px-10 lg:px-16">
				<div className="flex items-center justify-between">
					<BrandLogo />
					<Link to="/" className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
						← Back to home
					</Link>
				</div>

				<div className="flex flex-1 items-center justify-center py-12">
					<div className="w-full max-w-sm">
						{sentTo ? (
							<div className="lp-enter text-center">
								<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20 dark:text-indigo-300">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
									</svg>
								</div>
								<h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">Check your email</h1>
								<p className="mt-3 text-zinc-600 dark:text-zinc-400">
									We sent a confirmation link to <span className="font-medium text-zinc-900 dark:text-white">{sentTo}</span>. Click it to
									activate your account.
								</p>
								<button
									type="button"
									onClick={() => {
										setSentTo(null)
										switchMode("login")
									}}
									className="mt-8 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
								>
									Back to log in
								</button>
							</div>
						) : (
							<div key={mode} className="lp-enter">
								<h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">{copy.title}</h1>
								<p className="mt-2 text-zinc-600 dark:text-zinc-400">{copy.subtitle}</p>

								<form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
									{mode === "signup" && (
										<AuthField
											label="Full name"
											autoComplete="name"
											value={fullName}
											onChange={setFullName}
											placeholder="Jane Doe"
											required
										/>
									)}
									<AuthField
										label="Email"
										type="email"
										autoComplete="email"
										value={email}
										onChange={setEmail}
										placeholder="you@example.com"
										required
									/>
									{mode !== "forgot" && (
										<PasswordField
											value={password}
											onChange={setPassword}
											autoComplete={mode === "signup" ? "new-password" : "current-password"}
											hint={mode === "signup" ? `At least ${MIN_PASSWORD_LENGTH} characters` : undefined}
											action={
												mode === "login" ? (
													<button type="button" onClick={() => switchMode("forgot")} className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
														Forgot password?
													</button>
												) : undefined
											}
										/>
									)}

									{error && <FormMessage tone="error">{error}</FormMessage>}
									{notice && <FormMessage tone="success">{notice}</FormMessage>}

									<SubmitButton loading={submitting} disabled={!email.trim() || (mode !== "forgot" && !password) || (mode === "signup" && !fullName.trim())}>
										{copy.submit}
									</SubmitButton>
								</form>

								<p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
									{mode === "login" && (
										<>
											New to FIN/AI?{" "}
											<button type="button" onClick={() => switchMode("signup")} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
												Create an account
											</button>
										</>
									)}
									{mode === "signup" && (
										<>
											Already have an account?{" "}
											<button type="button" onClick={() => switchMode("login")} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
												Log in
											</button>
										</>
									)}
									{mode === "forgot" && (
										<button type="button" onClick={() => switchMode("login")} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
											← Back to log in
										</button>
									)}
								</p>

								{mode === "signup" && (
									<p className="mt-6 text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
										FIN/AI provides educational analysis only and is not financial advice.
									</p>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<AuthShowcase />
		</div>
	)
}
