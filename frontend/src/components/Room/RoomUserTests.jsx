import { useEffect, useRef, useState } from "react"
import TestService from "../../services/TestService"
import { useNavigate, useParams } from "react-router-dom"

const RoomUserTests = () => {
	const { id } = useParams()

	const [userStore, setUserStore] = useState([])

	const navigate = useNavigate()

	const handleBurger = () => {
		navigate("/room")
	}
	async function getResults() {
		try {
			const response = await TestService.resultsEvent(id)
			setUserStore(response.data)
			console.log(response.data)
		} catch (error) {
			console.error("Error fetching sensor data:", error)
		}
	}

	useEffect(() => {
		getResults()
	}, [])

	const deleteStoreItemById = async (idDel) => {
		await TestService.deleteStoreItemById(idDel)
		getResults()
	}
	const formatDateTime = (dateTimeString) => {
		const date = new Date(dateTimeString)
		return date.toLocaleString()
	}
	const burgerRef = useRef(null)

	useEffect(() => {
		const controlBurger = () => {
			const burgerMenu = burgerRef.current
			const scrollDifference = window.scrollY - burgerMenu.offsetTop
			if (Math.abs(scrollDifference) > 0) {
				const newTop = window.scrollY + 80 + "px"
				burgerMenu.style.transition = "top 0.4s ease-out"
				burgerMenu.style.top = newTop
			}
		}

		window.addEventListener("scroll", controlBurger)

		return () => {
			window.removeEventListener("scroll", controlBurger)
		}
	}, [])
	return (
		<>
			<div
				className='burger-menu room-burger'
				onClick={handleBurger}
				ref={burgerRef}
			>
				&#x2715;
			</div>
			<div className='preview-container'>
				<div className='articles'>
					<div className='container'>
						<div className='item-left'>
							<div className={`user-room active-btn`}>Участник:</div>
							<div className={`user-room active-btn`}>{userStore.userName}</div>
						</div>
					</div>

					<div className='main room-test-main'>
						{userStore?.tests?.length ? (
							<div className='articles'>
								<h3 className='room-test-title'>Пройденные тесты</h3>
								{userStore.tests.map((test, index) => (
									<div className='articles__item room-test-item ' key={index}>
										<div className='left_item cursor-auto'>
											<h4>
												{index + 1}. {test.title}
											</h4>
											<div className='text'>
												Время окончания теста:{" "}
												{formatDateTime(test.time_finish)}
											</div>
											<div className='text'>Оценка: {test.score}</div>
										</div>
										<div className='right_item'>
											<div
												className='delete-btn'
												onClick={() => deleteStoreItemById(test.id)}
											>
												Удалить
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='room-hello'>Пойденных тестов ещё нет!</div>
						)}
					</div>
				</div>
			</div>
		</>
	)
}

export default RoomUserTests
