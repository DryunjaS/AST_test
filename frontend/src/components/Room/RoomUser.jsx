import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import TestService from "../../services/TestService"

const RoomUser = () => {
	const [tests, setTests] = useState([])

	async function getTests() {
		try {
			const response = await TestService.getTestsEvents()
			setTests(response.data)
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
							Пользователь: {sessionStorage.getItem("userName")}
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
												Время выполнения: {test.time} минут
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
