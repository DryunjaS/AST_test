import { observable } from "mobx"

const store = observable({
	// --------Auth------------
	isAuth: false,
	user: "",

	setIsAuth(bool) {
		sessionStorage.setItem("isAuth", "true")
		this.isAuth = bool
	},

	setUser(user) {
		if (sessionStorage.getItem("userName")) {
			this.user = sessionStorage.getItem("userName")
		} else {
			this.user = user
		}
	},

	// --------Тест------------
	randomQuestions: [],

	getUserAnswerByID(id) {
		const question = this.randomQuestions.find((item) => item.id === id)
		return question.user_res
	},
	setAnswerByID(id, user_answer) {
		const question = this.randomQuestions.find((item) => item.id === id)
		if (question) {
			question.user_res = user_answer
		}
	},
	setAnswerSelectByID(id, ques, user_answer) {
		const question = this.randomQuestions[id]
		if (question) {
			const questionItem = question.body.find((item) => item.ques === ques)
			if (questionItem) {
				questionItem.user_res = user_answer
			}
		}
	},
})

export default store
