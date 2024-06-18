import React from "react"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/esm/Button"

const ModalImg = ({ show, setShow, title }) => {
	const handleClose = () => setShow(false)
	const imgPath = show ? show : ""
	console.log(imgPath)
	return (
		<Modal
			show={show}
			onHide={handleClose}
			animation={false}
			className='modalImg'
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title>Изображение для вопроса {title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className='img-modal'>
					<img src={imgPath} alt={`Изображение для вопроса ${title}`} />{" "}
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button variant='secondary' onClick={handleClose}>
					Закрыть
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default ModalImg
