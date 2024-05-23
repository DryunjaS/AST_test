const db = require("../db")

class UserService {
	async getUsers() {
		const users = await db.query("select id, login, role from users")
		return users.rows
	}
	async deleteUser(idUser) {
		await db.query("delete from users where id = $1", [idUser])
		return
	}
}

module.exports = new UserService()
