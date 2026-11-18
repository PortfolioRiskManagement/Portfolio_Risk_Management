import { useId, useState, type ReactNode } from "react"

const inputClass =
	"mt-1.5 block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-indigo-400"

type AuthFieldProps = {
	label: string
	value: string
	onChange: (value: string) => void
	type?: string
	autoComplete?: string
	placeholder?: string
	required?: boolean
}

export function AuthField({ label, value, onChange, type = "text", autoComplete, placeholder, required }: AuthFieldProps) {
	const id = useId()
	return (
		<div>
			<label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
				{label}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				autoComplete={autoComplete}
				placeholder={placeholder}
				required={required}
				className={inputClass}
			/>
		</div>
	)
}

type PasswordFieldProps = {
	value: string
	onChange: (value: string) => void
	autoComplete: string
	label?: string
	hint?: string
	/** Optional element shown to the right of the label, e.g. "Forgot password?". */
	action?: ReactNode
}

export function PasswordField({ value, onChange, autoComplete, label = "Password", hint, action }: PasswordFieldProps) {
	const id = useId()
	const [visible, setVisible] = useState(false)

	return (
		<div>
			<div className="flex items-center justify-between">
				<label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
					{label}
				</label>
				{action}
			</div>
			<div className="relative">
				<input
					id={id}
					type={visible ? "text" : "password"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					autoComplete={autoComplete}
					required
					className={`${inputClass} pr-16`}
				/>
				<button
					type="button"
					onClick={() => setVisible((v) => !v)}
					className="absolute inset-y-0 right-0 mt-1.5 px-4 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
					aria-label={visible ? "Hide password" : "Show password"}
				>
					{visible ? "Hide" : "Show"}
				</button>
			</div>
			{hint && <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>}
		</div>
	)
}

export function SubmitButton({ children, loading, disabled }: { children: ReactNode; loading: boolean; disabled?: boolean }) {
	return (
		<button
			type="submit"
			disabled={loading || disabled}
			className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/35 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
		>
			{loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
			{children}
		</button>
	)
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
	const styles =
		tone === "error"
			? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
			: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
	return (
		<div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
			{children}
		</div>
	)
}

/** Turns Supabase auth errors into short, human messages. */
export function friendlyAuthError(err: unknown): string {
	const message = err instanceof Error ? err.message : String(err)
	const lower = message.toLowerCase()
	if (lower.includes("invalid login credentials")) return "Incorrect email or password."
	if (lower.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link."
	if (lower.includes("already registered")) return "An account with this email already exists. Try logging in."
	if (lower.includes("rate limit") || lower.includes("too many")) return "Too many attempts. Please wait a minute and try again."
	if (lower.includes("valid email") || lower.includes("invalid format")) return "Please enter a valid email address."
	if (lower.includes("failed to fetch") || lower.includes("network")) return "Can't reach the server. Check your connection and try again."
	return message || "Something went wrong. Please try again."
}
