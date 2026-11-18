import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useThemeMode } from "../../hooks/useThemeMode"
import { useAuth } from "../../contexts/AuthContext"
import Icon from "../ui/Icon"

interface Props {
  title: string
  subtitle?: string
  onMenuClick: () => void
}

function AccountMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  if (!user) return null

  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim()
  const displayName = fullName || user.email || "Account"
  const initial = displayName.charAt(0).toUpperCase()

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate("/", { replace: true })
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pr-3 pl-1 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">{displayName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            {fullName && <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">{fullName}</div>}
            <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              navigate("/settings")
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Header({ title, subtitle, onMenuClick }: Props) {
  const { theme, toggleTheme } = useThemeMode()

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl transition-colors dark:border-white/[0.06] dark:bg-zinc-950/70">
      <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="-ml-1 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-white/5"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          {title && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950 sm:text-xl dark:text-white">{title}</h1>
              {subtitle && <p className="hidden truncate text-sm text-zinc-500 sm:block dark:text-zinc-400">{subtitle}</p>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="rounded-full p-2.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} className="h-[18px] w-[18px]" />
          </button>
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
