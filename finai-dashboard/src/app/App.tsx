import { BrowserRouter } from "react-router-dom"
import AppRoutes from "./routes"
import { ThemeProvider } from "../hooks/useTheme"
import { AuthProvider } from "../contexts/AuthContext"

function AppContent() {
	return (
		<BrowserRouter>
			<AppRoutes />
		</BrowserRouter>
	)
}

export default function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</ThemeProvider>
	)
}