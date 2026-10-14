import { BrowserRouter } from "react-router-dom"
import AppRoutes from "./routes"
import { ThemeProvider } from "../hooks/useTheme"
import { AuthProvider } from "../contexts/AuthContext"
import AlertsMonitor from "../features/alerts/components/AlertsMonitor"

function AppContent() {
	return (
		<BrowserRouter>
			<AlertsMonitor />
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