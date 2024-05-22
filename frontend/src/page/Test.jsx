import RadioList from "../components/Questions/RadioList"
import SelectList from "../components/Questions/SelectList"

import { useEffect, useState } from "react"
import MyPagination from "../components/MyPagination"
import { useNavigate, useParams } from "react-router-dom"
import CheckList from "../components/Questions/CheckList"
import TestService from "../services/TestService"
import ModuleReturn from "../components/Modal/ModalReturn"

const Test = () => {
	const [selectQ, setSelectQ] = useState(1) // выбранный вопрос, текущий
	const [numQ, setNumQ] = useState(1) // кол-во вопросов
	const [time, setTime] = useState(5 * 60) // 5 минут в секундах
	const [randomQuestions, setRandomQuestions] = useState([])
	const [showModalReturn, setShowModalReturn] = useState(false)
	const navigate = useNavigate()
	const { testID } = useParams()

	const getQuestions = async () => {
		try {
			await TestService.createStoreEvent(testID)
		} catch (err) {
		} finally {
			try {
				const res = await TestService.getStoreEvent(testID)
				console.log(res.data)
				setRandomQuestions(res.data.buffer)
				setNumQ(res.data.buffer.length)
				const timeFinish = res.data.time_finish
				const finishDate = new Date(timeFinish)
				const now = new Date()
				const diffMs = finishDate - now
				if (diffMs > 0) {
					const diffSeconds = Math.floor(diffMs / 1000)
					setTime(diffSeconds)
				} else {
					console.log("FGHJk")
					setShowModalReturn(true)
				}
			} catch (err) {
				console.log("FGHJk")
				setShowModalReturn(true)
			}
		}
	}

	useEffect(() => {
		getQuestions()
	}, [testID])

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTime((prevTime) => {
				if (prevTime <= 1) {
					clearInterval(intervalId)
					navigate("/result")
					return 0
				}
				return prevTime - 1
			})
		}, 1000)

		return () => clearInterval(intervalId)
	}, [navigate])

	const minutes = Math.floor(time / 60)
	const seconds = time % 60

	return (
		<>
			<ModuleReturn show={showModalReturn} setShow={setShowModalReturn} />
			<div className='setting-container'>
				<div className='articles'>
					<div className='container'>
						<div className='time-test'>
							Осталось времени: {minutes}:
							{seconds < 10 ? `0${seconds}` : seconds}
						</div>
					</div>

					<div className='main'>
						{randomQuestions[selectQ - 1] && (
							<>
								{(() => {
									switch (randomQuestions[selectQ - 1].type) {
										case "radio":
											return (
												<RadioList
													testID={testID}
													arrQues={randomQuestions}
													current={[selectQ - 1]}
												/>
											)
										case "select":
											return (
												<SelectList
													testID={testID}
													arrQues={randomQuestions}
													current={[selectQ - 1]}
												/>
											)
										case "check":
											return (
												<CheckList
													testID={testID}
													arrQues={randomQuestions}
													current={[selectQ - 1]}
												/>
											)
										default:
											return null
									}
								})()}
							</>
						)}
					</div>

					<div className='footer'>
						<MyPagination
							value={numQ}
							select={selectQ}
							setSelectQ={setSelectQ}
						/>
					</div>
				</div>
			</div>
		</>
	)
}

export default Test
