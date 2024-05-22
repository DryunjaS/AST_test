import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Form from "react-bootstrap/Form"
import { useEffect, useState } from "react"
import AuthService from "../../services/AuthService"
import UserService from "../../services/UserService"

function ModalAddUser({ show, setShow, setUsers }) {
	const [newUser, setNewUser] = useState({
		login: "",
		password: "",
	})
	const [validated, setValidated] = useState(false)

	const changeLogin = (event) => {
		const newValue = event.target.value
		setNewUser({ ...newUser, login: newValue })
	}
	const changePassword = (event) => {
		const newValue = event.target.value
		setNewUser({ ...newUser, password: newValue })
	}

	const addUser = async (event) => {
		event.preventDefault()
		const form = event.currentTarget
		if (form.checkValidity() === false) {
			event.stopPropagation()
		} else {
			await AuthService.registration(newUser.login, newUser.password)
			const response = await UserService.getUsers()
			setUsers(response.data)

			setNewUser({
				login: "",
				password: "",
			})
			setShow(false)
		}
		setValidated(true)
	}
	return (
		<>
			<Modal
				show={show}
				onHide={() => setShow(false)}
				size='lg'
				aria-labelledby='contained-modal-title-vcenter'
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title id='contained-modal-title-vcenter'>
						Добавление нового участника
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form noValidate validated={validated} onSubmit={addUser}>
						<div className='container'>
							<div className='add-item'>
								<Form.Label>Логин:</Form.Label>
								<Form.Control
									type='text'
									placeholder={`Придумайте логин`}
									value={newUser.login}
									onChange={(event) => changeLogin(event)}
									required
								/>
							</div>
							<div className='add-item'>
								<Form.Label>Пароль:</Form.Label>
								<Form.Control
									type='text'
									placeholder={`Придумайте пароль`}
									value={newUser.password}
									onChange={(event) => changePassword(event)}
									required
								/>
							</div>
						</div>
						<Modal.Footer>
							<Button type='submit'>Создать</Button>
						</Modal.Footer>
					</Form>
				</Modal.Body>
			</Modal>
		</>
	)
}

export default ModalAddUser
