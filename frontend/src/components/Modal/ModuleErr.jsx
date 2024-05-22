import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import { observer } from "mobx-react-lite"

const ModuleErr = observer(({ err, setErr }) => {
	const cancelDelete = () => {
		setErr(false)
	}

	return (
		<>
			<Modal show={err} onHide={cancelDelete}>
				<Modal.Header closeButton>
					<Modal.Title>Ошибка</Modal.Title>
				</Modal.Header>
				<Modal.Body>{err}</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={cancelDelete}>
						Отмена
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	)
})

export default ModuleErr
