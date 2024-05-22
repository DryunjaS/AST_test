import Form from "react-bootstrap/Form"
import TestService from "../../services/TestService"
import { useEffect, useState } from "react"

const RadioList = ({ testID, arrQues, current }) => {
	const [value, setValue] = useState(arrQues[current])

	const handleRadioChange = async (ques) => {
		const tmp = arrQues[current].body.map((item) => {
			if (item.ques === ques) {
				item.user_res = "Правильный"
			} else {
				item.user_res = ""
			}
			return item
		})
		const newValue = {
			...value,
			body: tmp,
		}
		setValue(newValue)

		arrQues[current].body.forEach((item) => {
			if (item.ques === ques) {
				item.user_res = "Правильный"
			} else {
				item.user_res = ""
			}
		})
		await TestService.updateStoreEvent(testID, arrQues)
	}
	useEffect(() => {
		setValue(arrQues[current])
	}, [current])
	return (
		<>
			<div className='articles__item'>
				<h3 className='title'>{arrQues[current].title}</h3>
				<div className='text'>
					{value && (
						<Form>
							{value.body.map((el) => (
								<Form.Check
									type='radio'
									label={el.ques}
									name={`radioGroup_${arrQues[current].id}`}
									checked={el.user_res === "Правильный"}
									onChange={() => handleRadioChange(el.ques)}
								/>
							))}
						</Form>
					)}
				</div>
			</div>
		</>
	)
}

export default RadioList
