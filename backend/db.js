const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcrypt")

const db = new sqlite3.Database("./database.db", async (err) => {
	if (err) {
		console.error("Ошибка при открытии базы данных", err.message)
	} else {
		console.log("Успешное подключение к базе данных")

		// Создание таблиц
		db.exec(
			`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                login TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
            );
            CREATE TABLE IF NOT EXISTS tests (
                id INTEGER PRIMARY KEY,
                title TEXT,
                time INTEGER
            );
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY,
                id_test INTEGER,
                title TEXT,
                type TEXT,
                body TEXT,
                res TEXT,
                FOREIGN KEY (id_test) REFERENCES tests (id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS store (
                id INTEGER PRIMARY KEY,
                id_user INTEGER,
                id_test INTEGER,
                buffer TEXT,
                response TEXT,
                time_start TIMESTAMP,
                time_finish TIMESTAMP,
                FOREIGN KEY (id_test) REFERENCES tests (id) ON DELETE CASCADE,
                FOREIGN KEY (id_user) REFERENCES users (id) ON DELETE CASCADE
            );
        `,
			async (err) => {
				if (err) {
					console.error("Ошибка при создании таблиц:", err.message)
				} else {
					console.log("Таблицы успешно созданы")

					// Проверяем, существует ли пользователь с логином "admin"
					db.get(
						"SELECT id FROM users WHERE login = ?",
						["admin"],
						async (err, row) => {
							if (err) {
								console.error(
									"Ошибка при проверке существующего пользователя:",
									err.message
								)
							} else if (row) {
								console.log("Пользователь с логином 'admin' уже существует")
							} else {
								const login = "admin"
								const hashPassword = await bcrypt.hash("adminKaf21", 5)

								db.run(
									'INSERT INTO users (login, password, role) VALUES (?, ?, "admin")',
									[login, hashPassword],
									function (err) {
										if (err) {
											console.error(
												"Ошибка при создании пользователя:",
												err.message
											)
										} else {
											console.log("Пользователь успешно создан")
										}

										// Закрываем соединение с базой данных после выполнения операции
										db.close((err) => {
											if (err) {
												console.error(
													"Ошибка при закрытии базы данных:",
													err.message
												)
											} else {
												console.log("Соединение с базой данных успешно закрыто")
											}
										})
									}
								)
							}
						}
					)
				}
			}
		)
	}
})

module.exports = db
