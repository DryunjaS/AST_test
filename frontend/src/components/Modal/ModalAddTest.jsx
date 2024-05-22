import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Form from "react-bootstrap/Form"
import { useState } from "react"
import TestService from "../../services/TestService"

function ModalAddTest({ show, setShow, setTests }) {
	const [test, setTest] = useState({
		title: "",
		time: "",
	})
	const [validated, setValidated] = useState(false)

	const changeTitle = (event) => {
		const newValue = event.target.value
		setTest({ ...test, title: newValue })
	}
	const changeTime = (event) => {
		const newValue = event.target.value
		setTest({ ...test, time: newValue })
	}

	const createTest = async (event) => {
		event.preventDefault()
		const form = event.currentTarget
		if (form.checkValidity() === false) {
			event.stopPropagation()
		} else {
			await TestService.addTestEvent(test.title, test.time)
			const response = await TestService.getTestsEvents()
			setTests(response.data)

			setTest({
				title: "",
				time: "",
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
						Создание теста
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form noValidate validated={validated} onSubmit={createTest}>
						<div className='container'>
							<div className='add-item'>
								<Form.Label>Название теста:</Form.Label>
								<Form.Control
									type='text'
									id={`inputNameTest`}
									placeholder={`Придумайте название`}
									value={test.title}
									onChange={changeTitle}
									required
								/>
								<Form.Control.Feedback type='invalid'>
									Введите название теста
								</Form.Control.Feedback>
							</div>
							<div className='add-item'>
								<Form.Label>Время на прохождение:</Form.Label>
								<Form.Control
									type='number'
									id={`inputTimeTest`}
									placeholder={`10 минут`}
									value={test.time}
									onChange={changeTime}
									required
								/>
								<Form.Control.Feedback type='invalid'>
									Введите время на прохождение теста
								</Form.Control.Feedback>
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

export default ModalAddTest
