import { useTheme } from "../../hooks/useTheme"

interface Props {
  title: string
}

export default function Header({ title }: Props) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-zinc-200 bg-white/90 p-6 backdrop-blur-sm transition-colors dark:border-zinc-800 dark:bg-black/85">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">{title}</h1>
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {theme === "dark" ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07 6.7 17.3M17.3 6.7l1.77-1.77" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a.8.8 0 0 0-1.08.95A7.5 7.5 0 1 0 20.05 15.6a.8.8 0 0 0 .95-1.1Z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
