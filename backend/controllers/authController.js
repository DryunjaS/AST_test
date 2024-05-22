const ApiError = require("../error/ApiError.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../db.js")

const generateJwt = (id, login, role) => {
	return jwt.sign({ id, login, role }, process.env.SECRET_KEY, {
		expiresIn: "24h",
	})
}
const getUserByLogin = (login) => {
	return new Promise((resolve, reject) => {
		db.get("SELECT * FROM users WHERE login = ?", [login], (err, row) => {
			if (err) {
				reject(err)
			} else {
				resolve(row)
			}
		})
	})
}
const insertUser = (login, password) => {
	return new Promise((resolve, reject) => {
		db.run(
			"INSERT INTO users (login, password, role) VALUES (?, ?, 'user')",
			[login, password],
			(err) => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			}
		)
	})
}
class AuthController {
	async registration(req, res, next) {
		const { login, password } = req.body
		if (!login || !password) {
			return next(ApiError.badRequest("Некорректный логин или пароль!"))
		}
		try {
			const candidate = await getUserByLogin(login)
			if (candidate) {
				return next(
					ApiError.badRequest("Пользователь с таким логином уже существует!")
				)
			}
			const hashPassword = await bcrypt.hash(password, 5)
			await insertUser(login, hashPassword)
			return res.json({ message: "Пользователь зарегистрирован!" })
		} catch (error) {
			return next(ApiError.internal(error.message))
		}
	}

	async login(req, res, next) {
		const { login, password } = req.body

		try {
			const user = await getUserByLogin(login)
			if (!user) {
				return next(ApiError.internal("Пользователь не найден!"))
			}
			const comparePassword = await bcrypt.compare(password, user.password)
			if (!comparePassword) {
				return next(ApiError.internal("Указан неверный пароль!"))
			}
			const token = generateJwt(user.id, user.login, user.role)
			return res.json({ token })
		} catch (error) {
			return next(ApiError.internal(error.message))
		}
	}

	async check(req, res, next) {
		const token = generateJwt(req.user.id, req.user.login, req.user.role)
		return res.json({ token })
	}

	async changePasswordUser(req, res, next) {
		const { login, password } = req.body
		if (!login || !password) {
			return next(ApiError.badRequest("Некорректный логин или пароль!"))
		}
		try {
			const candidate = await db.get("SELECT * FROM users WHERE login = ?", [
				login,
			])
			if (!candidate) {
				return next(
					ApiError.badRequest("Пользователь с таким логином не существует!")
				)
			}
			const hashPassword = await bcrypt.hash(password, 5)
			await db.run("UPDATE users SET password = ? WHERE login = ?", [
				hashPassword,
				login,
			])
			res.json({ message: "Пароль изменен!" })
		} catch (error) {
			return next(ApiError.internal(error.message))
		}
	}
}

module.exports = new AuthController()
