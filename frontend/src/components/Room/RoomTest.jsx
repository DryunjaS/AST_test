import { useEffect, useRef, useState } from "react"
import TestService from "../../services/TestService"
import { useNavigate, useParams } from "react-router-dom"
import ModalAddQues from "../Modal/ModalAddQues"

const RoomTest = () => {
	const { id } = useParams()

	const [test, setTest] = useState([])

	const [showModal, setShowModal] = useState(false)

	const navigate = useNavigate()

	const handleBurger = () => {
		navigate("/room")
	}
	async function getTest() {
		try {
			const response = await TestService.getTestEvent(id)
			setTest(response.data)
		} catch (error) {
			console.error("Error fetching sensor data:", error)
		}
	}

	useEffect(() => {
		getTest()
	}, [])

	const addQuestion = () => {
		setShowModal(true)
	}
	const deleteQuestion = async (idDel) => {
		await TestService.geleteQuestionEvent(idDel)
		getTest()
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
			<ModalAddQues show={showModal} setShow={setShowModal} setTest={setTest} />
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
							<div className={`user-room active-btn`}>Тест:</div>
							<div className={`user-room active-btn`}>
								{test.title}
								<div className='add' onClick={addQuestion}>
									Добавить вопрос
								</div>
							</div>
						</div>
					</div>

					<div className='main room-test-main'>
						{test.questions?.length ? (
							<div className='articles'>
								<h3 className='room-test-title'>Вопросы теста</h3>
								{test.questions.map((ques, index) => (
									<div className='articles__item room-test-item ' key={index}>
										<div className='left_item cursor-auto'>
											<h4>
												{index + 1}. {ques.title}
											</h4>
											{ques.body.map((item, itemIndex) => (
												<div className='text list-item'>
													{itemIndex + 1}) {item.ques}
												</div>
											))}
										</div>
										<div className='right_item'>
											<div
												className='delete-btn'
												onClick={() => deleteQuestion(ques.id)}
											>
												Удалить
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='room-hello'>Вопросов к тесту ещё нет!</div>
						)}
					</div>
				</div>
			</div>
		</>
	)
}

export default RoomTest
