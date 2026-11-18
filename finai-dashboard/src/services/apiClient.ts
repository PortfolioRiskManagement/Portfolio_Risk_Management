/**
 * API Client using native fetch API
 * Note: This avoids external dependencies like axios
 */

const API_BASE_URL = 'http://localhost:5001'

interface ApiResponse<T> {
	data: T
	status: number
}

class ApiClient {
	private baseURL: string

	constructor(baseURL: string) {
		this.baseURL = baseURL
	}

	async get<T>(endpoint: string): Promise<ApiResponse<T>> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`)
		}

		const data = await response.json()
		return { data, status: response.status }
	}

	async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(body),
		})

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`)
		}

		const data = await response.json()
		return { data, status: response.status }
	}
}

const apiClient = new ApiClient(API_BASE_URL)

export default apiClient
