export function shuffleData(data) {
	for (let i = data.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[data[i].ques, data[j].ques] = [data[j].ques, data[i].ques]
		;[data[i].res, data[j].res] = [data[j].res, data[i].res]
	}
	return data
}
