export function getRandomQuestions(questions, numQuestions) {
	const questionsCopy = [...questions]
	const selectedQuestions = []

	while (questionsCopy.length > 0 && selectedQuestions.length < numQuestions) {
		const randomIndex = Math.floor(Math.random() * questionsCopy.length)
		const randomQuestion = questionsCopy.splice(randomIndex, 1)[0]

		selectedQuestions.push(randomQuestion)
	}

	return selectedQuestions
}
