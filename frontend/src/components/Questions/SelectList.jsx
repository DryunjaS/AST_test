import Form from "react-bootstrap/Form"
import TestService from "../../services/TestService"
import { useEffect, useState } from "react"

const SelectList = ({ testID, arrQues, current }) => {
	const [value, setValue] = useState(arrQues[current])

	const handleSelectChange = async (event, ques) => {
		const tmp = arrQues[current].body.map((item) => {
			if (item.ques === ques) {
				item.user_res = event.target.value
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
				item.user_res = event.target.value
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
					{value.body.lenght !== 0 &&
						value.body.map((el) => (
							<div className='text-container'>
								<div className='text-item'>{el.ques}</div>
								<Form.Select
									aria-label='Default select example'
									onChange={(event) => handleSelectChange(event, el.ques)}
									value={el.user_res}
								>
									<option>Выберите</option>
									{value.res.map((item) => (
										<option key={item.res} value={item.res}>
											{item.res}
										</option>
									))}
								</Form.Select>
							</div>
						))}
				</div>
			</div>
		</>
	)
}

export default SelectList
