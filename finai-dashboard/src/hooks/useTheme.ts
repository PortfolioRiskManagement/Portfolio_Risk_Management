import { createContext, createElement, useContext, type ReactNode } from "react"
import { useThemeMode } from "./useThemeMode"

type Theme = "light" | "dark"

type ThemeContextValue = {
	theme: Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
	children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const { theme, setTheme, toggleTheme } = useThemeMode()

	return createElement(
		ThemeContext.Provider,
		{ value: { theme, setTheme, toggleTheme } },
		children,
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider")
	}

	return context
}
