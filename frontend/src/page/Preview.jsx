import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Form from "react-bootstrap/Form"
import TestService from "../services/TestService"
import { logout } from "../http/userAPI"

const Preview = () => {
	const [selectForm, setSelectForm] = useState({})
	const [tests, setTests] = useState([])
	const navigate = useNavigate()

	const handleSelectChange = (event) => {
		const selectedTestId = parseInt(event.target.value, 10)
		const selectTest = tests.find((test) => test.id === selectedTestId)

		setSelectForm(selectTest)
	}

	const handlelogout = async () => {
		await logout()
		localStorage.removeItem("userName")
		localStorage.removeItem("role")
		localStorage.removeItem("id")
		navigate("/")
	}

	const getTests = async () => {
		try {
			const res = await TestService.getTestsEvents()
			setTests(res.data)
			setSelectForm(res.data[0])
		} catch (err) {
			console.log("Ошибка при получении тестов")
		}
	}

	useEffect(() => {
		if (localStorage.getItem("isAuth") === "true") {
			getTests()
		}
	}, [])

	return (
		<>
			<div className='preview-container'>
				<div className='articles'>
					<div className='container'>
						<div className='item-left room-hello'>
							Добро пожаловать, {localStorage.getItem("userName")}
						</div>

						<div className='wrapp-item'>
							<Link to='/room' className='user-room link'>
								Личный кабинет
							</Link>
							<div className='user-room' onClick={handlelogout}>
								Выйти
							</div>
						</div>
					</div>
					<div className='main'>
						<div className='hardware preview-wrap'>
							<h3 className='title m0'>Выберите тест</h3>

							<div className='preview-select'>
								<Form.Select
									onChange={handleSelectChange}
									value={selectForm?.id || ""}
								>
									{tests?.length !== 0 &&
										tests.map((test) => (
											<option key={test.id} value={test.id}>
												{test.title}
											</option>
										))}
								</Form.Select>
							</div>

							<div className='btn-wrapp'>
								<Link to={`/test/${selectForm?.id}`} className='link btn btn-1'>
									<svg>
										<rect x='0' y='0' fill='none' width='100%' height='100%' />
									</svg>
									<div className='hardware__item'>Начать</div>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Preview
