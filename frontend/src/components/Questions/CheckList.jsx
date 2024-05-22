import Form from "react-bootstrap/Form"
import TestService from "../../services/TestService"
import { useEffect, useState } from "react"

const CheckList = ({ testID, arrQues, current }) => {
	const [value, setValue] = useState(arrQues[current])

	const handleCheckChange = async (ques) => {
		const tmp = arrQues[current].body.map((item) => {
			if (item.ques === ques) {
				return {
					...item,
					user_res: item.user_res === "Правильный" ? "" : "Правильный",
				}
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
				if (item.user_res === "Правильный") {
					item.user_res = ""
				} else {
					item.user_res = "Правильный"
				}
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
					<Form>
						{value.body.map((el, index) => (
							<Form.Check
								key={index}
								label={el.ques}
								checked={el.user_res === "Правильный"}
								onChange={() => handleCheckChange(el.ques)}
							/>
						))}
					</Form>
				</div>
			</div>
		</>
	)
}

export default CheckList
