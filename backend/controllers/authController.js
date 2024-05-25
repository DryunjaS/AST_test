const ApiError = require("../error/ApiError.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../db.js")

const generateJwt = (id, login, role) => {
	return jwt.sign({ id, login, role }, process.env.SECRET_KEY, {
		expiresIn: "24h",
	})
}

class AuthController {
	async registration(req, res, next) {
		const { login, password } = req.body
		if (!login || !password) {
			return next(ApiError.badRequest("Некорректный логин или пароль!"))
		}
		const candidate = await db.query("select * from users where login = $1", [
			login,
		])
		if (candidate.rows.length !== 0) {
			return next(
				ApiError.badRequest("Пользователь с таким логином уже существует!")
			)
		}
		const hashPassword = await bcrypt.hash(password, 5)
		await db.query("insert into users values (default, $1, $2, 'user')", [
			login,
			hashPassword,
		])
		return res.json({ message: "Пользователь зарегистрирован!" })
	}

	async login(req, res, next) {
		const { login, password } = req.body
		const user = await db.query("select * from users where login = $1", [login])
		if (user.rows.length === 0) {
			return next(ApiError.internal("Пользователь не найден!"))
		}
		let comparePassword = bcrypt.compareSync(password, user.rows[0].password)
		if (!comparePassword) {
			return next(ApiError.internal("Указан неверный пароль!"))
		}
		const token = generateJwt(
			user.rows[0].id,
			user.rows[0].login,
			user.rows[0].role
		)
		const id = user.rows[0].id
		const role = user.rows[0].role

		return res.json({ token, id, role })
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
		const candidate = await db.query("select * from users where login = $1", [
			login,
		])
		if (candidate.rows.length === 0) {
			return next(
				ApiError.badRequest("Пользователь с таким логином не существует!")
			)
		}
		const hashPassword = await bcrypt.hash(password, 5)
		await db.query("update users set password = $1 where login = $2", [
			hashPassword,
			login,
		])
		res.json({ message: "Пароль изменен!" })
	}
}

module.exports = new AuthController()
