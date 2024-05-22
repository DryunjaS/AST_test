import { $authApi } from "../http"

export default class UserService {
	static getUsers() {
		return $authApi.get("api/user/get-users")
	}
	static changeUserPass(newPass, userName) {
		return $authApi.post("api/auth/change-pass", { newPass, userName })
	}
	static async geleteUserEvent(id) {
		console.log(id)
		return $authApi.delete(`api/user/delete-user?id=${id}`)
	}
}
