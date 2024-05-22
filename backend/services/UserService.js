const db = require("../db")

class UserService {
	async getUsers() {
		const users = await new Promise((resolve, reject) => {
			db.all("SELECT id, login, role FROM users", (err, rows) => {
				if (err) {
					reject(err)
				} else {
					resolve(rows)
				}
			})
		})
		return users
	}

	async deleteUser(idUser) {
		await new Promise((resolve, reject) => {
			db.run("DELETE FROM users WHERE id = ?", [idUser], function (err) {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
		})
	}
}

module.exports = new UserService()
