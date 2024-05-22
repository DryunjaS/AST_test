import { $api, $authApi } from "../http"

export default class AuthService {
	static async login(login, password) {
		return $api.post("api/auth/login", { login, password })
	}
	static async registration(login, password) {
		return $api.post("api/auth/registration", { login, password })
	}
	static async logout() {
		return $authApi.post("/logout")
	}
}
