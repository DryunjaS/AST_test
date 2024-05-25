import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import TestService from "../../services/TestService"
import UserService from "../../services/UserService"

const RoomUser = () => {
	const [tests, setTests] = useState([])

	async function getTests() {
		try {
			const idUser = localStorage.getItem("id")
			const response = await TestService.resultsEvent(idUser)
			console.log(response.data.tests)
			setTests(response.data.tests)
		} catch (error) {
			console.error("Error fetching sensor data:", error)
		}
	}
	useEffect(() => {
		getTests()
	}, [])

	return (
		<>
			<div className='preview-container'>
				<div className='articles'>
					<div className='container'>
						<div className='item-left room-hello'>Личный кабинет</div>

						<div className='user-room active-btn cursor-auto'>
							Пользователь: {localStorage.getItem("userName")}
						</div>
					</div>
					<div className='main room-test-main'>
						{tests.length !== 0 ? (
							<div className='articles'>
								<h3 className='room-test-title'>Пройденные тесты</h3>
								{tests.map((test, index) => (
									<div className='articles__item room-test-item'>
										<div className='left_item cursor-auto'>
											<h4>
												{index + 1}) {test.title}
											</h4>
											<div className='text'>
												Время окончания выполнения:{" "}
												{new Date(test.time_finish).toLocaleDateString()}{" "}
												{new Date(test.time_finish).toLocaleTimeString()}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='room-hello'>Пройденных тестов ещё нет!</div>
						)}
					</div>
				</div>
			</div>
		</>
	)
}

export default RoomUser
