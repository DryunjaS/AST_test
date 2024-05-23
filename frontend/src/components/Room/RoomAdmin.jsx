import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import TestService from "../../services/TestService"
import UserService from "../../services/UserService"
import { useNavigate } from "react-router-dom"
import ModalAddTest from "../Modal/ModalAddTest"
import ModalAddUser from "../Modal/ModalAddUser"
import Spinner from "react-bootstrap/Spinner"
import { io } from "socket.io-client"
import Trigger from "../Trigger"

const RoomAdmin = () => {
	const [tests, setTests] = useState([])
	const [users, setUsers] = useState([])
	const [testOnline, setTestOnline] = useState([])

	const [showModalTest, setShowModalTest] = useState(false)
	const [showModalUser, setShowModalUser] = useState(false)

	const [select, setSelect] = useState("Тесты")
	const navigate = useNavigate()

	async function getTests() {
		setSelect("Тесты")
		try {
			const response = await TestService.getTestsEvents()
			setTests(response.data)
		} catch (error) {
			console.error("Error fetching sensor data:", error)
		}
	}
	async function getUsers() {
		setSelect("Учасники")
		try {
			const response = await UserService.getUsers()
			setUsers(response.data)
		} catch (error) {
			console.error("Error fetching sensor data:", error)
		}
	}
	async function getOnlineTests() {
		setSelect("Наблюдение")
		try {
			const response = await TestService.getOnlineStoreEvent()
			console.log(response.data)
			setTestOnline(response.data)
		} catch (error) {
			console.error("Error fetching sensor data:", error)
		}
	}
	useEffect(() => {
		getTests()

		const socket = io.connect(import.meta.env.VITE_REACT_APP_API_URL, {
			transports: ["websocket", "polling", "flashsocket"],
		})
		socket.on("online-tests", (data) => {
			if (data.message === "Новый ответ от пользователя!") {
				getOnlineTests()
			}
		})
		return () => {
			socket.disconnect()
		}
	}, [])

	const handleTest = (id) => {
		navigate(`/room/test/${id}`)
	}
	const handleUser = (id) => {
		navigate(`/room/user/${id}`)
	}
	const addTest = () => {
		setShowModalTest(true)
	}
	const addUser = () => {
		setShowModalUser(true)
	}
	const deleteTest = async (id) => {
		await TestService.geleteTestEvent(id)
		getTests()
	}
	const deleteUser = async (id) => {
		await UserService.geleteUserEvent(id)
		getUsers()
	}
	return (
		<>
			<ModalAddTest
				show={showModalTest}
				setShow={setShowModalTest}
				setTests={setTests}
			/>
			<ModalAddUser
				show={showModalUser}
				setShow={setShowModalUser}
				setUsers={setUsers}
			/>
			<div className='preview-container'>
				<div className='articles'>
					<div className='container'>
						<div className='item-left'>
							<div
								className={`user-room ${
									select === "Тесты" ? "active-btn" : ""
								}`}
								onClick={getTests}
							>
								Тесты
								{select === "Тесты" && (
									<div className='add' onClick={addTest}>
										Добавить
									</div>
								)}
							</div>
							<div
								className={`user-room ${
									select === "Учасники" ? "active-btn" : ""
								}`}
								onClick={getUsers}
							>
								Учасники
								{select === "Учасники" && (
									<div className='add' onClick={addUser}>
										Добавить
									</div>
								)}
							</div>
							<div
								className={`user-room ${
									select === "Наблюдение" ? "active-btn" : ""
								}`}
								onClick={getOnlineTests}
							>
								Наблюдение
								{select === "Наблюдение" && (
									<>
										<div className='add'>Online</div>
										<Spinner className='m-l5' animation='grow' />
									</>
								)}
							</div>
						</div>

						<div className='user-room active-btn'>
							Пользователь: {sessionStorage.getItem("userName")}
						</div>
					</div>

					<div className='main room-test-main'>
						{select === "Тесты" &&
							(tests.length !== 0 ? (
								<div className='articles'>
									<h3 className='room-test-title'>Тесты</h3>
									{tests.map((test, index) => (
										<div className='articles__item room-test-item '>
											<div
												className='left_item'
												onClick={() => handleTest(test.id)}
											>
												<h4 className=''>
													{index + 1}) {test.title}
												</h4>
												<div className='text'>
													Время выполнения: {test.time} минут
												</div>
											</div>
											<div className='right_item'>
												<div
													className='delete-btn'
													onClick={() => deleteTest(test.id)}
												>
													Удалить
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className='room-hello'>Созданных тестов ещё нет!</div>
							))}
						{select === "Учасники" &&
							(users.length !== 0 ? (
								<div className='articles'>
									<h3 className='room-test-title'>Список учасников</h3>
									{users.map((user, index) => (
										<div
											className='articles__item room-test-item'
											key={user.id}
										>
											<div
												className='left_item'
												onClick={() => handleUser(user.id)}
											>
												<h4>
													{index + 1}) {user.login}
												</h4>
												<div className='text'>
													Роль:{" "}
													{user.role === "admin" ? "Администратор" : "Участник"}
												</div>
											</div>
											<div className='right_item'>
												{user.role !== "admin" && (
													<div
														className='delete-btn'
														onClick={() => deleteUser(user.id)}
													>
														Удалить
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className='articles'>
									<h3 className='room-test-title'>Список учасников пуст</h3>
								</div>
							))}

						{select === "Наблюдение" &&
							(testOnline.length !== 0 ? (
								<div className='articles'>
									<h3 className='room-test-title'>Список текущих тестов</h3>
									{testOnline.map((testUser, index) => (
										<div className='articles__item room-test-item' key={index}>
											<div className='left_item'>
												<h3>
													{index + 1}) {testUser.name}, {testUser.title}
												</h3>

												<div className='text block-res'>
													<div>Ответы тестируемого: </div>
													<div className='resQues'>
														{testUser.allAnswers.map((ques, index) => (
															<Trigger key={index} title={ques.ques.title}>
																<div
																	className={
																		ques.typeAns === "correct"
																			? "correctQues"
																			: ques.typeAns === "incorrect"
																			? "incorrectQues"
																			: ques.typeAns === "null"
																			? "nullAnswers"
																			: ""
																	}
																></div>
															</Trigger>
														))}
													</div>
												</div>
											</div>
											<div className='right_item current-res'>
												<div>Текущая ценка: </div>
												<h2>{testUser.score}</h2>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className='articles'>
									<h3 className='room-test-title'>Текущих тестов нет!</h3>
								</div>
							))}
					</div>
				</div>
			</div>
		</>
	)
}

export default observer(RoomAdmin)
