import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import { useNavigate } from "react-router-dom"

const ModuleReturn = ({ show, setShow }) => {
	const navigate = useNavigate()

	const handleCancel = () => {
		setShow(false)
		navigate("/preview")
	}

	return (
		<>
			<Modal show={show} onHide={handleCancel}>
				<Modal.Header closeButton>
					<Modal.Title>Оповещение</Modal.Title>
				</Modal.Header>
				<Modal.Body>Тест завершен!</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={handleCancel}>
						Отмена
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default ModuleReturn
