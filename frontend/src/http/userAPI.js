import { $authApi, $api } from "./index.js"
import { jwtDecode } from "jwt-decode"

export const registration = async (login, password) => {
	const { data } = await $api.post("api/auth/registration", {
		login,
		password,
	})
	sessionStorage.setItem("token", data.token)
	return jwtDecode(data.token)
}

export const login = async (login, password) => {
	const { data } = await $api.post("api/auth/login", { login, password })

	sessionStorage.setItem("token", data.token)
	sessionStorage.setItem("id", data.id)
	sessionStorage.setItem("role", data.role)
	sessionStorage.setItem("userName", login)
	sessionStorage.setItem("isAuth", "true")

	return jwtDecode(data.token)
}
export const logout = async () => {
	sessionStorage.removeItem("token")
	sessionStorage.removeItem("isAuth")
	return
}
export const check = async () => {
	const { data } = await $authApi.get("api/auth/auth")
	sessionStorage.setItem("token", data.token)
	return jwtDecode(data.token)
}
