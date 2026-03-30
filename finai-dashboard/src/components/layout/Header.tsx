import { useThemeMode } from "../../hooks/useThemeMode"

interface Props {
  title: string
}

export default function Header({ title }: Props) {
  const { theme, toggleTheme } = useThemeMode()

  return (
    <header className="border-b border-zinc-200 bg-white/90 p-6 backdrop-blur-sm transition-colors dark:border-zinc-800 dark:bg-black/85">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">{title}</h1>
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </header>
  )
}
