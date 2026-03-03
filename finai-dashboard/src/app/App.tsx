import { BrowserRouter } from "react-router-dom"
import AppRoutes from "./routes"
import { LoadingProvider } from "../contexts/LoadingContext"
import LoadingScreen from "../components/LoadingScreen"
import { useLoading } from "../contexts/LoadingContext"

function AppContent() {
	const { isLoading } = useLoading()

	return (
		<>
			<LoadingScreen isVisible={isLoading} />
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
		</>
	)
}

export default function App() {
	return (
		<LoadingProvider>
			<AppContent />
		</LoadingProvider>
	)
}