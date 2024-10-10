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
import axios from "axios"
import fileDownload from "js-file-download"

const RoomAdmin = () => {
	const [tests, setTests] = useState([])
	const [users, setUsers] = useState([])
	const [stores, setStores] = useState([])
	const [testTitles, setTestTitles] = useState({})

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
		setSelect("Участники")
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
			setTestOnline(response.data)
		} catch (error) {
			console.error("Error fetching sensor data:", error)
		}
	}
	async function getResults() {
		setSelect("Результаты")

		try {
			const { data } = await TestService.getStoreResults()
			console.log(data)
			setStores(data)

			const testIds = new Set()
			Object.keys(data).forEach((date) => {
				Object.keys(data[date]).forEach((id_test) => testIds.add(id_test))
			})

			const titles = {}
			for (let id of testIds) {
				const { data: testData } = await TestService.getTestEvent(id)
				titles[id] = testData.title
			}

			setTestTitles(titles)
		} catch (error) {
			console.error("Error fetching test titles:", error)
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
	const dounloadResultAll = async (resAll, testTitle, Date) => {
		const txtTitle = `Результаты теста ${testTitle}_${Date}`
		await TestService.downloadResultsAll(resAll, txtTitle)
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
				<div className='container'>
					<div className='item-left'>
						<div
							className={`user-room ${select === "Тесты" ? "active-btn" : ""}`}
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
								select === "Участники" ? "active-btn" : ""
							}`}
							onClick={getUsers}
						>
							Участники
							{select === "Участники" && (
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
						<div
							className={`user-room ${
								select === "Результаты" ? "active-btn" : ""
							}`}
							onClick={getResults}
						>
							Результаты
						</div>
					</div>

					<div className='user-room active-btn'>
						Пользователь: {sessionStorage.getItem("userName")}
					</div>
				</div>

				<div className='main room-test-main'>
					<div className='articles'>
						{select === "Тесты" && tests?.length !== 0 ? (
							<>
								<h3 className='room-test-title'>Тесты</h3>
								{tests.map((test, index) => (
									<div className='articles__item room-test-item' key={test.id}>
										<div
											className='left_item'
											onClick={() => handleTest(test.id)}
										>
											<h4>
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
							</>
						) : select === "Тесты" ? (
							<div className='room-hello'>Созданных тестов ещё нет!</div>
						) : null}

						{select === "Участники" && users?.length !== 0 ? (
							<>
								<h3 className='room-test-title'>Список Участников</h3>
								{users.map((user, index) => (
									<div className='articles__item room-test-item' key={user.id}>
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
							</>
						) : select === "Участники" ? (
							<div className='room-test-title'>Список Участников пуст</div>
						) : null}

						{select === "Наблюдение" && testOnline?.length !== 0 ? (
							<>
								<h3 className='room-test-title'>Список текущих тестов</h3>
								{testOnline.map((testUser, index) => (
									<div className='articles__item room-test-item' key={index}>
										<div className='left_item'>
											<h3>
												{index + 1}) {testUser.name}, {testUser.title}
											</h3>
											<div className='text block-res'>
												<div>Ответы тестируемого:</div>
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
											<div>Текущая оценка:</div>
											<h2>{testUser.score}</h2>
										</div>
									</div>
								))}
							</>
						) : select === "Наблюдение" ? (
							<div className='room-test-title'>Текущих тестов нет!</div>
						) : null}

						{select === "Результаты" &&
						stores &&
						Object.keys(stores).length !== 0 ? (
							<>
								<h3 className='room-test-title'>Список результатов:</h3>
								{Object.keys(stores).map((date, index) => (
									<div className='articles__group' key={index}>
										<h3>{new Date(date).toLocaleDateString()}</h3>
										{Object.keys(stores[date]).map((id_test, testIndex) => (
											<div
												className='articles__item room-test-item'
												key={testIndex}
											>
												<div className='left_item'>
													<h4>{testIndex + 1}) Название теста: </h4>
													<div className='text'>
														{testTitles[id_test] || "Загрузка..."}
													</div>
												</div>
												<div className='right_item'>
													{sessionStorage.getItem("role") === "admin" && (
														<div
															className='delete-btn w-max'
															onClick={() =>
																dounloadResultAll(
																	stores[date][id_test],
																	testTitles[id_test],
																	new Date(date).toLocaleDateString()
																)
															}
														>
															Выгрузить результат
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								))}
							</>
						) : select === "Результаты" ? (
							<div className='room-test-title'>Результатов тестов нет!</div>
						) : null}
					</div>
				</div>
			</div>
		</>
	)
}

export default observer(RoomAdmin)
