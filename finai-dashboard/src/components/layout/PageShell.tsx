import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

interface Props {
	title: string
	subtitle?: string
	children: React.ReactNode
}

export default function PageShell({ title, subtitle, children }: Props) {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

	return (
		<div className="relative min-h-screen bg-zinc-50 transition-colors dark:bg-[#07070a]">
			{/* Soft brand glow behind the content, echoing the landing page */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
				<div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-indigo-400/20 blur-[120px] dark:bg-indigo-600/15" />
				<div className="absolute top-1/3 left-[10%] h-[420px] w-[420px] rounded-full bg-blue-400/10 blur-[120px] dark:bg-blue-600/10" />
			</div>

			<Sidebar
				isCollapsed={isSidebarCollapsed}
				onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
				isMobileOpen={isMobileNavOpen}
				onMobileClose={() => setIsMobileNavOpen(false)}
			/>
			<div
				className={`relative flex min-h-screen flex-col transition-[padding-left] duration-300 ${
					isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
				}`}
			>
				<Header title={title} subtitle={subtitle} onMenuClick={() => setIsMobileNavOpen(true)} />
				<main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 text-zinc-900 transition-colors sm:px-6 lg:px-8 lg:py-8 dark:text-white">
					{children}
				</main>
			</div>
		</div>
	)
}
