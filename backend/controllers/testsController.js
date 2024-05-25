const ApiError = require("../error/ApiError.js")
const TestsService = require("../services/TestsService.js")
const fs = require("fs")
const path = require("path")

function getQuestionsType(type) {
	if (type === "radio") {
		return "одиночный"
	} else if (type === "check") {
		return "множественный"
	} else if (type === "select") {
		return "на соотношение"
	}
}

function formatTestResults(data) {
	const { correctCount, incorrectCount, correctAnswers, incorrectAnswers } =
		data

	const totalQuestions = correctCount + incorrectCount
	const accuracy = ((correctCount / totalQuestions) * 100).toFixed(2)

	const formattedData = `
Результаты теста:
================
Всего вопросов: ${totalQuestions}
Правильных ответов: ${correctCount}
Неправильных ответов: ${incorrectCount}
Точность: ${accuracy}%

Вопросы с правильными ответами:
-------------------------------
${correctAnswers
	.map(
		(question) => `
Заголовок: ${question.title}
Тип: ${getQuestionsType(question.type)}
Ответы пользователя: ${question.body
			.filter((b) => b.user_res === "Правильный")
			.map((b) => `${b.ques}`)
			.join(", ")}
`
	)
	.join("\n")}

Вопросы с неправильными ответами:
---------------------------------
${incorrectAnswers
	.map(
		(question) => `
Заголовок: ${question.title}
Тип: ${getQuestionsType(question.type)}
Ответы пользователя: ${question.body
			.map((b) => `${b.ques}: ${b.user_res}`)
			.join(", ")}
`
	)
	.join("\n")}
`

	return formattedData
}

class TestsController {
	async getTests(req, res, next) {
		try {
			const tests = await TestsService.getTests()
			res.json(tests)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async getTest(req, res, next) {
		const { id } = req.query
		try {
			const test = await TestsService.getTest(id)
			res.json(test)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async addTest(req, res, next) {
		const { title, time, questions } = req.body
		try {
			await TestsService.addTest(title, time, questions)
			res.json({ message: "Тест добавлен!" })
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async addQuestions(req, res, next) {
		const { id, questions } = req.body
		try {
			await TestsService.addQuestions(id, questions)
			res.json({ message: "Вопрос добавлен!" })
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async deleteTest(req, res, next) {
		const { id } = req.query
		try {
			await TestsService.deleteTest(id)
			res.json({ message: "Тест удален!" })
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async deleteQuestion(req, res, next) {
		const { id } = req.query
		try {
			await TestsService.deleteQuestion(id)
			res.json({ message: "Вопрос удален!" })
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async changeTest(req, res, next) {
		const { idTest, questions } = req.body
		try {
			await TestsService.changeTest(idTest, questions)
			res.json({ message: "Тест изменен!" })
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async finishTest(req, res, next) {
		const { id } = req.user
		const { idTest } = req.body
		try {
			await TestsService.finishTest(id, idTest)
			res.json("Вы завершили тест.")
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async createStore(req, res, next) {
		const { id } = req.user
		const { idTest } = req.body
		try {
			await TestsService.createStore(id, idTest)
			res.json("Успехов в прохождении теста.")
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async getStore(req, res, next) {
		const { id } = req.user
		const { idTest } = req.query
		try {
			const data = await TestsService.getStore(id, idTest)
			res.json(data)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async getStores(req, res, next) {
		const { id } = req.user
		try {
			const data = await TestsService.getStores(id)
			res.json(data)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async getAdminStores(req, res, next) {
		const { id } = req.query
		try {
			const data = await TestsService.getStores(id)
			res.json(data)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async updateStore(req, res, next) {
		const { id } = req.user
		const { idTest, buffer } = req.body
		try {
			await TestsService.updateStore(id, idTest, buffer)
			req.io.emit("online-tests", { message: "Новый ответ от пользователя!" })
			res.json("Изменение записано.")
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async deleteStoreItemById(req, res, next) {
		const { id } = req.query
		try {
			await TestsService.deleteStoreItemById(id)
			res.json("Элемент Store удален.")
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async getResult(req, res, next) {
		const { id } = req.user
		const { idTest } = req.query
		try {
			const data = await TestsService.getResult(id, idTest)
			res.json(data)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async getResults(req, res, next) {
		const { idUser } = req.query

		try {
			const data = await TestsService.getResults(idUser)
			res.json(data)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}

	async downloadResult(req, res, next) {
		const { idTest } = req.params
		const { login, id } = req.user
		try {
			const data = await TestsService.getResult(id, idTest)
			const formattedData = formatTestResults(data)
			const filePath = path.join(
				__dirname + "/../",
				"temp",
				`result_${idTest}_${login}.txt`
			)
			fs.writeFile(filePath, formattedData, (err) => {
				if (err) {
					return next(
						ApiError.badRequest("Не удалось записать результаты в файл.")
					)
				}
				res.sendFile(filePath, `result_${idTest}_${login}.txt`, (err) => {
					if (!err) {
						fs.unlinkSync(filePath)
					}
				})
			})
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
	async getOnlineStore(req, res, next) {
		try {
			const data = await TestsService.getOnlineStore()
			res.json(data)
		} catch (e) {
			next(ApiError.badRequest(e.message))
		}
	}
}

module.exports = new TestsController()
