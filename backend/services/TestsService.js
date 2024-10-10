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
	const allAnswers = []

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
			allAnswers.push({
				ques: question,
				userAnsvers: userAnswers,
				res: correctAnswersSet,
				typeAns: "null",
			})
		} else if (isCorrect) {
			correctCount++
			correctAnswers.push(question)
			allAnswers.push({
				ques: question,
				userAnsvers: userAnswers,
				res: correctAnswersSet,
				typeAns: "correct",
			})
		} else {
			incorrectCount++
			incorrectAnswers.push(question)
			allAnswers.push({
				ques: question,
				userAnsvers: userAnswers,
				res: correctAnswersSet,
				typeAns: "incorrect",
			})
		}
	})

	return {
		correctCount,
		incorrectCount,
		nullCount,
		correctAnswers,
		incorrectAnswers,
		nullAnswers,
		allAnswers,
	}
}

class TestsService {
	async getTests() {
		const tests = await db.query("select id, title, time from tests")
		return tests.rows
	}
	async getTest(idTest) {
		const testInfo = await db.query(
			"select id, title, time from tests where id = $1",
			[idTest]
		)
		const questions = await db.query(
			"select id, title, type, body, res, img from questions where id_test = $1",
			[idTest]
		)
		let modifiedRes
		const modifiedQuestions = questions.rows.map((question) => {
			question.body = JSON.parse(question.body)
			if (question.type === "select") {
				const shuffledResValues = shuffleArray(
					JSON.parse(question.res).map((resItem) => resItem.res)
				)
				modifiedRes = JSON.parse(question.res).map((resItem, index) => ({
					...resItem,
					res: shuffledResValues[index],
				}))
			} else {
				modifiedRes = JSON.parse(question.res).map((resItem) => {
					const { res, ...rest } = resItem
					return rest
				})
			}
			return {
				...question,
				res: modifiedRes,
			}
		})
		return {
			...testInfo.rows[0],
			questions: modifiedQuestions,
		}
	}

	async addTest(title, time) {
		await db.query("insert into tests values (default, $1, $2) returning *", [
			title,
			time,
		])
		console.log(`insert into tests values (default, "${title}", "${time}");`)
		return
	}
	async addQuestions(id, questions) {
		await db.query(
			"INSERT INTO questions VALUES (default, $1, $2, $3, $4, $5, $6) RETURNING *",
			[
				id,
				questions.title,
				questions.type,
				JSON.stringify(questions.body),
				JSON.stringify(questions.res),
				JSON.stringify(questions.img),
			]
		)
		console.log(
			`INSERT INTO questions VALUES (default, "${id}", "${questions.title}"," ${
				questions.type
			}", "${JSON.stringify(questions.body)}", "${JSON.stringify(
				questions.res
			)}", "${JSON.stringify(questions.img)}");`
		)
		return
	}
	async deleteQuestion(id) {
		await db.query("delete from questions where id = $1", [id])
		return
	}
	async deleteTest(idTest) {
		await db.query("delete from tests where id = $1", [idTest])
		return
	}
	async changeTest(idTest, questions) {
		await db.query("delete from questions where id_test = $1", [idTest])
		const questionPromises = questions.map(async (question) => {
			await db.query(
				"INSERT INTO questions VALUES (default, $1, $2, $3, $4, $5) RETURNING *",
				[idTest, question.title, question.type, question.body, question.res]
			)
			return
		})
		await Promise.all(questionPromises)
		return
	}
	async finishTest(id, idTest) {
		const candidate = await db.query(
			"select * from store where id_user = $1 and id_test = $2",
			[id, idTest]
		)
		if (candidate.rows.length === 0) {
			throw new Error("Данных о прохождении теста не существует!")
		}
		if (
			new Date(candidate.rows[0].time_finish).getTime() < new Date().getTime()
		) {
			throw new Error("Время для прохождения теста вышло!")
		}
		await db.query(
			"update store set time_finish = $1 where id_user = $2 and id_test = $3",
			[
				`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
				id,
				idTest,
			]
		)
		return
	}
	async createStore(id, idTest) {
		const candidate = await db.query(
			"select * from store where id_user = $1 and id_test = $2",
			[id, idTest]
		)
		if (candidate.rows.length !== 0) {
			throw new Error("Данные о прохождении теста уже существуют!")
		}
		const data = await db.query("select * from tests where id = $1", [idTest])

		const questionsData = await db.query(
			"select title, type, body, res, img from questions where id_test = $1",
			[idTest]
		)
		const questionsBuffer = await this.getTest(idTest)

		questionsBuffer.questions.forEach((question) => {
			if (typeof question.img === "string") {
				question.img = JSON.parse(question.img)
			}
		})

		const questionsRes = questionsData.rows.map(({ res }) => res)
		await db.query(
			"insert into store values (default, $1, $2, $3, $4, $5, $6)",
			[
				id,
				idTest,
				JSON.stringify(questionsBuffer.questions),
				JSON.stringify(questionsRes),
				`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
				`${new Date(
					new Date().setMinutes(new Date().getMinutes() + data.rows[0].time)
				).toLocaleDateString()} ${new Date(
					new Date().setMinutes(new Date().getMinutes() + data.rows[0].time)
				).toLocaleTimeString()}`,
			]
		)
		return
	}
	async getStore(id, idTest) {
		const candidate = await db.query(
			"select id_user, id_test, buffer, response, time_start, time_finish from store where id_user = $1 and id_test = $2",
			[id, idTest]
		)
		if (candidate.rows.length === 0) {
			throw new Error("Данных о прохождении теста не существует!")
		}
		if (
			new Date(candidate.rows[0].time_finish).getTime() < new Date().getTime()
		) {
			throw new Error("Время для прохождения теста вышло!")
		}
		const parseBuffer = JSON.parse(candidate.rows[0].buffer)
		const data = {
			...candidate.rows[0],
			buffer: parseBuffer,
			response: JSON.parse(candidate.rows[0].response),
		}
		return data
	}
	async getStores(id) {
		const candidate = await db.query(
			"select id_user, id_test, buffer, time_start, time_finish from store where id_user = $1",
			[id]
		)
		const data = candidate.rows.map((element) => ({
			...element,
			buffer: JSON.parse(element.buffer),
		}))
		return data
	}
	async updateStore(id, idTest, buffer) {
		const candidate = await db.query(
			"select * from store where id_user = $1 and id_test = $2",
			[id, idTest]
		)
		if (candidate.rows.length === 0) {
			throw new Error("Данных о прохождении теста не существует!")
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
		const query = "DELETE FROM store WHERE id = $1"

		try {
			const res = await db.query(query, [id])
			if (res.rowCount === 0) {
				throw new Error(`Запись с id = ${id} не найдена`)
			}
		} catch (err) {
			console.error("Ошибка при удалении записи:", err.message)
			throw err
		}
	}
	async getResult(id, idTest) {
		const candidate = await db.query(
			"select buffer, response from store where id_user = $1 and id_test = $2",
			[id, idTest]
		)
		if (candidate.rows.length === 0) {
			throw new Error("Данных о прохождении теста не существует!")
		}
		if (
			new Date(candidate.rows[0].time_finish).getTime() > new Date().getTime()
		) {
			throw new Error(
				"Время для прохождения теста не вышло или вы не завершили тест!"
			)
		}
		const userName = await db.query("select login from users where id = $1", [
			id,
		])
		const testTitle = await db.query("select title from tests where id = $1", [
			idTest,
		])
		userName.rows[0].login
		testTitle.rows[0].title

		const result = checkAnswers(
			JSON.parse(candidate.rows[0].buffer),
			JSON.parse(candidate.rows[0].response)
		)
		const finalResult = {
			userName: userName.rows[0].login,
			testTitle: testTitle.rows[0].title,
			...result,
		}

		return finalResult
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
			WHERE s.id_user = $1
		`

		try {
			const result = await db.query(query, [userId])

			const userNameResult = await db.query(
				"SELECT login FROM users WHERE id = $1",
				[userId]
			)
			if (userNameResult.rows.length === 0) {
				throw new Error("Пользователь не найден!")
			}
			const userName = userNameResult.rows[0].login

			if (result.rows.length === 0) {
				return { userName }
			}

			const now = new Date()

			const filteredAndSortedResults = result.rows
				.filter((row) => new Date(row.time_finish).getTime() < now.getTime())
				.sort((a, b) => new Date(a.time_finish) - new Date(b.time_finish))

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
				const nullCount = checkResult.nullCount

				const totalCount = correctCount + incorrectCount + nullCount
				const resultPercent = (5 * correctCount) / totalCount
				const roundedResultPercent = parseFloat(resultPercent.toFixed(2))

				return {
					id: row.id,
					title: row.title,
					time_finish: row.time_finish,
					score: roundedResultPercent,
				}
			})

			const finalResult = {
				userName,
				tests: finalResults,
			}

			return finalResult
		} catch (err) {
			console.error("Ошибка выполнения запроса", err)
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
				allAnswers: checkResult.allAnswers,
			}
		})

		return finalResults
	}
	async getStoreResults() {
		const { rows } = await db.query(
			`SELECT id_user, id_test, buffer, response, time_start, time_finish 
			 FROM store
			 ORDER BY DATE(time_start), id_test`
		)

		const groupedByDate = rows.reduce((result, row) => {
			const date = new Date(row.time_start).toISOString().split("T")[0]

			if (!result[date]) {
				result[date] = {}
			}

			if (!result[date][row.id_test]) {
				result[date][row.id_test] = []
			}

			result[date][row.id_test].push({
				id_user: row.id_user,
				id_test: row.id_test,
			})

			return result
		}, {})

		return groupedByDate
	}
}

module.exports = new TestsService()
