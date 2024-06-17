import axios from "axios"

const $api = axios.create({
	baseURL: import.meta.env.VITE_REACT_APP_API_URL,
	headers: {
		"ngrok-skip-browser-warning": "true",
	},
})

const $authApi = axios.create({
	baseURL: import.meta.env.VITE_REACT_APP_API_URL,
	headers: {
		"ngrok-skip-browser-warning": "true",
	},
})

const authInterceptor = (config) => {
	config.headers.authorization = `Bearer ${sessionStorage.getItem("token")}`
	return config
}
$authApi.interceptors.request.use(authInterceptor)

export { $api, $authApi }
