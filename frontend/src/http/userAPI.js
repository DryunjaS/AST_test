import { $authApi, $api } from "./index.js"
import { jwtDecode } from "jwt-decode"

export const registration = async (login, password) => {
	const { data } = await $api.post("api/auth/registration", {
		login,
		password,
	})
	localStorage.setItem("token", data.token)
	return jwtDecode(data.token)
}

export const login = async (login, password) => {
	const { data } = await $api.post("api/auth/login", { login, password })
	localStorage.setItem("token", data.token)
	return jwtDecode(data.token)
}
export const logout = async () => {
	localStorage.removeItem("token")
	sessionStorage.removeItem("isAuth")
	return
}
export const check = async () => {
	const { data } = await $authApi.get("api/auth/auth")
	localStorage.setItem("token", data.token)
	return jwtDecode(data.token)
}
