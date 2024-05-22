import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import { useNavigate } from "react-router-dom"
import TestService from "../../services/TestService"

const Module = ({ show, setShow, testID }) => {
	const navigate = useNavigate()

	const handleCancel = () => {
		setShow(false)
	}
	const handleEnter = async () => {
		await TestService.finishTestEvent(testID)
		navigate(`/result/${testID}`)
	}

	return (
		<>
			<Modal show={show} onHide={handleCancel}>
				<Modal.Header closeButton>
					<Modal.Title>Оповещение</Modal.Title>
				</Modal.Header>
				<Modal.Body>Вы готовы завершить тест?</Modal.Body>
				<Modal.Footer>
					<div className='row'>
						<Button variant='secondary' onClick={handleCancel}>
							Отмена
						</Button>
						<Button type='submit' onClick={handleEnter}>
							Завершить
						</Button>
					</div>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default Module
