const { response } = require("express")
const db = require("../db")

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}
function checkAnswers(buffer, response) {
	let correctCount = 0
	let incorrectCount = 0
	let nullCount = 0
	const correctAnswers = []
	const incorrectAnswers = []
	const nullAnswers = []

	buffer.forEach((question, index) => {
		const userAnswers = question.body
		const correctAnswersSet = JSON.parse(response[index])

		const isAnswered = userAnswers.every(
			(userAnswer) => userAnswer.user_res === ""
		)
		const isCorrect = userAnswers.every(
			(userAnswer, i) => userAnswer.user_res === correctAnswersSet[i].res
		)

		if (isAnswered) {
			nullCount++
			nullAnswers.push(question)
		} else if (isCorrect) {
			correctCount++
			correctAnswers.push(question)
		} else {
			incorrectCount++
			incorrectAnswers.push(question)
		}
	})

	return {
		correctCount,
		incorrectCount,
		nullCount,
		correctAnswers,
		incorrectAnswers,
		nullAnswers,
	}
}

class TestsService {
	async getTests() {
		const getAllTests = () => {
			return new Promise((resolve, reject) => {
				db.all("SELECT id, title, time FROM tests", (err, rows) => {
					if (err) {
						reject(err)
					} else {
						resolve(rows)
					}
				})
			})
		}

		try {
			const tests = await getAllTests()
			return tests
		} catch (error) {
			throw new Error("Ошибка при получении тестов: " + error.message)
		}
	}

	async getTest(idTest) {
		// Функция для обертки вызова db.all в промис
		const getTestInfo = (id) => {
			return new Promise((resolve, reject) => {
				db.all(
					"SELECT id, title, time FROM tests WHERE id = ?",
					[id],
					(err, rows) => {
						if (err) {
							reject(err)
						} else {
							resolve(rows[0])
						}
					}
				)
			})
		}

		const getQuestions = (id) => {
			return new Promise((resolve, reject) => {
				db.all(
					"SELECT id, title, type, body, res FROM questions WHERE id_test = ?",
					[id],
					(err, rows) => {
						if (err) {
							reject(err)
						} else {
							resolve(rows)
						}
					}
				)
			})
		}

		try {
			// Получаем информацию о тесте
			const testInfo = await getTestInfo(idTest)

			// Получаем вопросы теста
			const questions = await getQuestions(idTest)

			// Модифицируем вопросы
			const modifiedQuestions = questions.map((question) => {
				question.body = JSON.parse(question.body)
				if (question.type === "select") {
					const shuffledResValues = shuffleArray(
						JSON.parse(question.res).map((resItem) => resItem.res)
					)
					const modifiedRes = JSON.parse(question.res).map(
						(resItem, index) => ({
							...resItem,
							res: shuffledResValues[index],
						})
					)
					return {
						...question,
						res: modifiedRes,
					}
				} else {
					const modifiedRes = JSON.parse(question.res).map((resItem) => {
						const { res, ...rest } = resItem
						return rest
					})
					return {
						...question,
						res: modifiedRes,
					}
				}
			})

			// Возвращаем информацию о тесте и модифицированные вопросы
			return {
				...testInfo,
				questions: modifiedQuestions,
			}
		} catch (error) {
			throw new Error("Ошибка при получении теста: " + error.message)
		}
	}

	async addTest(title, time) {
		try {
			const result = await new Promise((resolve, reject) => {
				db.run(
					"INSERT INTO tests (title, time) VALUES (?, ?)",
					[title, time],
					function (err) {
						if (err) {
							reject(err)
						} else {
							resolve(this.lastID)
						}
					}
				)
			})
			return result
		} catch (error) {
			throw new Error("Ошибка при добавлении теста: " + error.message)
		}
	}

	async addQuestions(id, questions) {
		try {
			await new Promise((resolve, reject) => {
				db.run(
					"INSERT INTO questions (id_test, title, type, body, res) VALUES (?, ?, ?, ?, ?)",
					[
						id,
						questions.title,
						questions.type,
						JSON.stringify(questions.body),
						JSON.stringify(questions.res),
					],
					function (err) {
						if (err) {
							reject(err)
						} else {
							resolve()
						}
					}
				)
			})
		} catch (error) {
			throw new Error("Ошибка при добавлении вопросов: " + error.message)
		}
	}

	async deleteQuestion(id) {
		try {
			await new Promise((resolve, reject) => {
				db.run("DELETE FROM questions WHERE id = ?", [id], function (err) {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				})
			})
		} catch (error) {
			throw new Error("Ошибка при удалении вопроса: " + error.message)
		}
	}

	async deleteTest(idTest) {
		try {
			await new Promise((resolve, reject) => {
				db.run("DELETE FROM tests WHERE id = ?", [idTest], function (err) {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				})
			})
		} catch (error) {
			throw new Error("Ошибка при удалении теста: " + error.message)
		}
	}

	async changeTest(idTest, questions) {
		try {
			await new Promise((resolve, reject) => {
				db.run(
					"DELETE FROM questions WHERE id_test = ?",
					[idTest],
					function (err) {
						if (err) {
							reject(err)
						} else {
							resolve()
						}
					}
				)
			})

			const questionPromises = questions.map(async (question) => {
				await new Promise((resolve, reject) => {
					db.run(
						"INSERT INTO questions (id_test, title, type, body, res) VALUES (?, ?, ?, ?, ?)",
						[
							idTest,
							question.title,
							question.type,
							JSON.stringify(question.body),
							JSON.stringify(question.res),
						],
						function (err) {
							if (err) {
								reject(err)
							} else {
								resolve()
							}
						}
					)
				})
			})

			await Promise.all(questionPromises)
		} catch (error) {
			throw new Error("Ошибка при изменении теста: " + error.message)
		}
	}

	async finishTest(id, idTest) {
		try {
			const getCandidates = (id, idTest) => {
				return new Promise((resolve, reject) => {
					db.all(
						"SELECT * FROM store WHERE id_user = ? AND id_test = ?",
						[id, idTest],
						(err, rows) => {
							if (err) {
								reject(err)
							} else {
								resolve(rows)
							}
						}
					)
				})
			}
			const candidate = await getCandidates(id, idTest)

			if (!candidate) {
				throw new Error("Данных о прохождении теста не существует!")
			}
			if (new Date(candidate.time_finish).getTime() < new Date().getTime()) {
				throw new Error("Время для прохождения теста вышло!")
			}
			await new Promise((resolve, reject) => {
				db.run(
					"UPDATE store SET time_finish = ? WHERE id_user = ? AND id_test = ?",
					[
						`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
						id,
						idTest,
					],
					function (err) {
						if (err) {
							reject(err)
						} else {
							resolve()
						}
					}
				)
			})
		} catch (error) {
			throw new Error("Ошибка при завершении теста: " + error.message)
		}
	}

	async createStore(id, idTest) {
		try {
			const getCandidates = (id, idTest) => {
				return new Promise((resolve, reject) => {
					db.all(
						"SELECT * FROM store WHERE id_user = ? AND id_test = ?",
						[id, idTest],
						(err, rows) => {
							if (err) {
								reject(err)
							} else {
								resolve(rows)
							}
						}
					)
				})
			}

			const getData = (idTest) => {
				return new Promise((resolve, reject) => {
					db.get("SELECT * FROM tests WHERE id = ?", [idTest], (err, row) => {
						if (err) {
							reject(err)
						} else {
							resolve(row)
						}
					})
				})
			}

			const getQuestionsData = (idTest) => {
				return new Promise((resolve, reject) => {
					db.all(
						"SELECT title, type, body, res FROM questions WHERE id_test = ?",
						[idTest],
						(err, rows) => {
							if (err) {
								reject(err)
							} else {
								resolve(rows)
							}
						}
					)
				})
			}

			const candidate = await getCandidates(id, idTest)
			if (candidate.length !== 0) {
				throw new Error("Данные о прохождении теста уже существуют!")
			}

			const data = await getData(idTest)
			const questionsData = await getQuestionsData(idTest)

			const questionsBuffer = await this.getTest(idTest)
			const questionsRes = questionsData.map(({ res }) => res)

			await new Promise((resolve, reject) => {
				db.run(
					"INSERT INTO store (id_user, id_test, buffer, response, time_start, time_finish) VALUES (?, ?, ?, ?, ?, ?)",
					[
						id,
						idTest,
						JSON.stringify(questionsBuffer.questions),
						JSON.stringify(questionsRes),
						`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
						`${new Date(
							new Date().setMinutes(new Date().getMinutes() + data.time)
						).toLocaleDateString()} ${new Date(
							new Date().setMinutes(new Date().getMinutes() + data.time)
						).toLocaleTimeString()}`,
					],
					(err) => {
						if (err) {
							reject(err)
						} else {
							resolve()
						}
					}
				)
			})
		} catch (error) {
			throw new Error("Ошибка при создании записи в store: " + error.message)
		}
	}

	async getStore(id, idTest) {
		try {
			const candidate = await new Promise((resolve, reject) => {
				db.all(
					"SELECT id_user, id_test, buffer, response, time_start, time_finish FROM store WHERE id_user = ? AND id_test = ?",
					[id, idTest],
					(err, row) => {
						if (err) {
							reject(err)
						} else {
							resolve(row)
						}
					}
				)
			})
			if (!candidate) {
				throw new Error("Данных о прохождении теста не существует!")
			}
			if (new Date(candidate.time_finish).getTime() < new Date().getTime()) {
				throw new Error("Время для прохождения теста вышло!")
			}
			const parseBuffer = JSON.parse(candidate.buffer)
			const data = {
				...candidate,
				buffer: parseBuffer,
				response: JSON.parse(candidate.response),
			}
			return data
		} catch (error) {
			throw new Error("Ошибка при получении данных из store: " + error.message)
		}
	}

	async getStores(id) {
		try {
			const candidate = await new Promise((resolve, reject) => {
				db.all(
					"SELECT id_user, id_test, buffer, time_start, time_finish FROM store WHERE id_user = ?",
					[id],
					(err, rows) => {
						if (err) {
							reject(err)
						} else {
							resolve(rows)
						}
					}
				)
			})
			if (!candidate || candidate.length === 0) {
				throw new Error("Данных о прохождении тестов не существует!")
			}
			const data = candidate.map((element) => ({
				...element,
				buffer: JSON.parse(element.buffer),
			}))
			return data
		} catch (error) {
			throw new Error("Ошибка при получении данных из store: " + error.message)
		}
	}

	async updateStore(id, idTest, buffer) {
		try {
			const candidate = await new Promise((resolve, reject) => {
				db.all(
					"SELECT * FROM store WHERE id_user = ? AND id_test = ?",
					[id, idTest],
					(err, rows) => {
						if (err) {
							reject(err)
						} else {
							resolve(rows)
						}
					}
				)
			})
			if (!candidate || candidate.length === 0) {
				throw new Error("Данных о прохождении теста не существует!")
			}
			if (new Date(candidate[0].time_finish).getTime() < new Date().getTime()) {
				throw new Error("Время для прохождения теста вышло!")
			}
			await new Promise((resolve, reject) => {
				db.run(
					"UPDATE store SET buffer = ? WHERE id_user = ? AND id_test = ?",
					[JSON.stringify(buffer), id, idTest],
					(err) => {
						if (err) {
							reject(err)
						} else {
							resolve()
						}
					}
				)
			})

			return
		} catch (error) {
			throw new Error("Ошибка при обновлении данных в store: " + error.message)
		}
		if (
			new Date(candidate.rows[0].time_finish).getTime() < new Date().getTime()
		) {
			throw new Error("Время для прохождения теста вышло!")
		}
		await db.query(
			"update store set buffer = $1 where id_user = $2 and id_test = $3",
			[JSON.stringify(buffer), id, idTest]
		)

		return
	}

	async deleteStoreItemById(id) {
		const query = "DELETE FROM store WHERE id = ?"

		try {
			const result = await new Promise((resolve, reject) => {
				db.run(query, [id], function (err) {
					if (err) {
						reject(err)
					} else {
						resolve(this.changes) // Возвращаем количество удаленных записей
					}
				})
			})

			if (result === 0) {
				throw new Error(`Запись с id = ${id} не найдена`)
			}
		} catch (error) {
			console.error("Ошибка при удалении записи:", error.message)
			throw error
		}
	}
	async getResult(id, idTest) {
		try {
			const candidate = await new Promise((resolve, reject) => {
				db.get(
					"SELECT buffer, response, time_finish FROM store WHERE id_user = ? AND id_test = ?",
					[id, idTest],
					(err, row) => {
						if (err) {
							reject(err)
						} else {
							resolve(row)
						}
					}
				)
			})

			if (!candidate) {
				throw new Error("Данных о прохождении теста не существует!")
			}

			const currentTime = new Date().getTime()
			const timeFinish = new Date(candidate.time_finish).getTime()

			if (timeFinish > currentTime) {
				throw new Error(
					"Время для прохождения теста не вышло или вы не завершили тест!"
				)
			}

			const userName = await new Promise((resolve, reject) => {
				db.get("SELECT login FROM users WHERE id = ?", [id], (err, row) => {
					if (err) {
						reject(err)
					} else {
						resolve(row)
					}
				})
			})

			const testTitle = await new Promise((resolve, reject) => {
				db.get("SELECT title FROM tests WHERE id = ?", [idTest], (err, row) => {
					if (err) {
						reject(err)
					} else {
						resolve(row)
					}
				})
			})

			const buffer = JSON.parse(candidate.buffer)
			const response = JSON.parse(candidate.response)

			const result = checkAnswers(buffer, response)

			return {
				userName: userName.login,
				testTitle: testTitle.title,
				...result,
			}
		} catch (error) {
			throw new Error(`Ошибка при получении результата теста: ${error.message}`)
		}
	}

	async getResults(userId) {
		const query = `
			SELECT 
				t.title,
				s.id, 
				s.buffer, 
				s.response, 
				s.time_finish 
			FROM store s
			JOIN tests t ON s.id_test = t.id
			WHERE s.id_user = ?
		`

		try {
			const [results, { login: userName }] = await Promise.all([
				new Promise((resolve, reject) => {
					db.all(query, [userId], (err, rows) => {
						if (err) {
							reject(err)
						} else {
							resolve(rows)
						}
					})
				}),
				new Promise((resolve, reject) => {
					db.get(
						"SELECT login FROM users WHERE id = ?",
						[userId],
						(err, row) => {
							if (err) {
								reject(err)
							} else {
								resolve(row)
							}
						}
					)
				}),
			])
			if (results.length === 0) {
				return { userName }
			}

			const now = new Date()

			// Преобразуем строки даты в объекты Date и фильтруем результаты
			const filteredAndSortedResults = results
				.filter((row) => {
					const [datePart, timePart] = row.time_finish.split(" ")
					const [day, month, year] = datePart.split(".").map(Number)
					const [hours, minutes, seconds] = timePart.split(":").map(Number)
					const finishDate = new Date(
						year,
						month - 1,
						day,
						hours,
						minutes,
						seconds
					)
					console.log(`Comparing finish date ${finishDate} with now ${now}`)
					return finishDate < now
				})
				.sort((a, b) => {
					const [datePartA, timePartA] = a.time_finish.split(" ")
					const [dayA, monthA, yearA] = datePartA.split(".").map(Number)
					const [hoursA, minutesA, secondsA] = timePartA.split(":").map(Number)
					const finishDateA = new Date(
						yearA,
						monthA - 1,
						dayA,
						hoursA,
						minutesA,
						secondsA
					)

					const [datePartB, timePartB] = b.time_finish.split(" ")
					const [dayB, monthB, yearB] = datePartB.split(".").map(Number)
					const [hoursB, minutesB, secondsB] = timePartB.split(":").map(Number)
					const finishDateB = new Date(
						yearB,
						monthB - 1,
						dayB,
						hoursB,
						minutesB,
						secondsB
					)

					return finishDateA - finishDateB
				})
			console.log(filteredAndSortedResults)

			if (filteredAndSortedResults.length === 0) {
				return { userName }
			}

			const finalResults = filteredAndSortedResults.map((row) => {
				const checkResult = checkAnswers(
					JSON.parse(row.buffer),
					JSON.parse(row.response)
				)

				const correctCount = checkResult.correctCount
				const incorrectCount = checkResult.incorrectCount
				const totalCount = correctCount + incorrectCount
				const resultPercent = (5 * correctCount) / totalCount
				const roundedResultPercent = parseFloat(resultPercent.toFixed(2))

				return {
					id: row.id,
					title: row.title,
					time_finish: row.time_finish,
					score: roundedResultPercent,
				}
			})

			return { userName, tests: finalResults }
		} catch (err) {
			throw err
		}
	}
	async getOnlineStore() {
		const candidate = await db.query(
			"SELECT id_user, id_test, buffer, response, time_start, time_finish FROM store"
		)

		const now = new Date()

		const filteredAndSortedResults = candidate.rows
			.filter((row) => new Date(row.time_finish).getTime() > now.getTime())
			.sort((a, b) => new Date(a.time_finish) - new Date(b.time_finish))

		const userID = filteredAndSortedResults.map((test) => test.id_user)
		const testID = filteredAndSortedResults.map((test) => test.id_test)

		const usersName = await db.query(
			`SELECT id, login FROM users WHERE id = ANY($1::int[])`,
			[userID]
		)

		const testTitle = await db.query(
			`SELECT id, title FROM tests WHERE id = ANY($1::int[])`,
			[testID]
		)

		const userLogins = {}
		usersName.rows.forEach((user) => {
			userLogins[user.id] = user.login
		})

		const testTitlesMap = {}
		testTitle.rows.forEach((test) => {
			testTitlesMap[test.id] = test.title
		})

		const resultsWithLoginsAndTitles = filteredAndSortedResults.map((test) => ({
			...test,
			login: userLogins[test.id_user] || null,
			title: testTitlesMap[test.id_test] || null,
		}))

		const finalResults = resultsWithLoginsAndTitles.map((row) => {
			const checkResult = checkAnswers(
				JSON.parse(row.buffer),
				JSON.parse(row.response)
			)
			console.log(checkResult)

			const correctCount = checkResult.correctCount
			const incorrectCount = checkResult.incorrectCount
			const nullCount = checkResult.nullCount

			const totalCount = correctCount + incorrectCount + nullCount
			const resultPercent = (5 * correctCount) / totalCount
			const roundedResultPercent = parseFloat(resultPercent.toFixed(2))

			return {
				title: row.title,
				time_finish: row.time_finish,
				score: roundedResultPercent,
				name: row.login,
				correctQues: checkResult.correctAnswers,
				incorrectQues: checkResult.incorrectAnswers,
				nullAnswers: checkResult.nullAnswers,
			}
		})

		return finalResults
	}
}

module.exports = new TestsService()
