import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Form from "react-bootstrap/Form"
import { useEffect, useRef, useState } from "react"
import TestService from "../../services/TestService"
import { useParams } from "react-router-dom"

function ModalAddQues({ show, setShow, setTest }) {
	const [select, setSelect] = useState("1")
	const [images, setImages] = useState([])

	const { id } = useParams()

	const [validated, setValidated] = useState(false)

	const [user_ques, setUserQues] = useState({
		title: "",
		type: "radio",
		body: [
			{ ques: "", user_res: "" },
			{ ques: "", user_res: "" },
			{ ques: "", user_res: "" },
			{ ques: "", user_res: "" },
		],
		res: [
			{ ques: "", res: "" },
			{ ques: "", res: "" },
			{ ques: "", res: "" },
			{ ques: "", res: "" },
		],
		img: [],
	})
	const handleSelectChange = (event) => {
		setSelect(event.target.value)
		if (event.target.value === "1") setUserQues({ ...user_ques, type: "radio" })
		if (event.target.value === "2") setUserQues({ ...user_ques, type: "check" })
		if (event.target.value === "3")
			setUserQues({ ...user_ques, type: "select" })
	}

	const changeInput = (index, event) => {
		const newValue = event.target.value
		const updatedUserQues = { ...user_ques }
		updatedUserQues.body[index] = {
			...updatedUserQues.body[index],
			ques: newValue,
		}
		updatedUserQues.res[index] = {
			...updatedUserQues.res[index],
			ques: newValue,
		}
		setUserQues(updatedUserQues)
	}
	const changeRes = (index, event) => {
		const newValue = event.target.value
		const updatedUserQues = { ...user_ques }
		updatedUserQues.res[index] = {
			...updatedUserQues.res[index],
			res: newValue,
		}
		setUserQues(updatedUserQues)
	}
	const changeTitle = (event) => {
		const newValue = event.target.value
		setUserQues({ ...user_ques, title: newValue })
	}

	const handleResChange = (event) => {
		const newValue = event.target.value

		const updatedBody = user_ques.res.map((item) => ({
			...item,
			res: item.ques === newValue ? "Правильный" : "",
		}))

		setUserQues({ ...user_ques, res: updatedBody })
	}
	const handleResCheckChange = (index) => {
		console.log(index)
		setUserQues((prevState) => {
			const updatedBody = prevState.res.map((el, i) => {
				if (i === index) {
					return {
						...el,
						res: el.res === "Правильный" ? "" : "Правильный",
					}
				}
				return el
			})
			return { ...prevState, res: updatedBody }
		})
	}

	const createQues = async (event) => {
		event.preventDefault()
		const form = event.currentTarget
		if (form.checkValidity() === false) {
			event.stopPropagation()
		} else {
			if (images.length > 0) {
				const formData = new FormData()
				images.forEach((image) => {
					formData.append("files", image)
				})
				try {
					await TestService.addImagesEvent(formData)
					console.log("Files uploaded successfully.")
				} catch (error) {
					console.error("Error uploading files:", error)
				}
			}
			console.log(user_ques)
			await TestService.addQuesEvent(id, user_ques)
			const response = await TestService.getTestEvent(id)
			setTest(response.data)
			setShow(false)
			setUserQues({
				title: "",
				type: "radio",
				body: [
					{ ques: "", user_res: "" },
					{ ques: "", user_res: "" },
					{ ques: "", user_res: "" },
					{ ques: "", user_res: "" },
				],
				res: [
					{ ques: "", res: "" },
					{ ques: "", res: "" },
					{ ques: "", res: "" },
					{ ques: "", res: "" },
				],
				img: [],
			})
			setImages([])
		}
		setValidated(true)
	}
	const fileInputRef = useRef(null)

	const handleDivClick = () => {
		fileInputRef.current.click()
	}

	const handleFileChange = (event) => {
		const file = event.target.files[0]
		if (file) {
			setImages([...images, file])
		}
	}
	useEffect(() => {
		const filteredImageNames = images
			.filter((image) => {
				return image.name
			})
			.map((image) => image.name)
		setUserQues({ ...user_ques, img: filteredImageNames })
	}, [images])

	const deleteImage = (index) => {
		setImages((prevImages) => prevImages.filter((_, i) => i !== index))
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
						Создание вопроса
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form noValidate validated={validated} onSubmit={createQues}>
						<div className='container'>
							<div className='container__select'>
								<Form.Label htmlFor='inputPassword5'>
									Выберите тип вопроса
								</Form.Label>
								<Form.Select onChange={handleSelectChange} value={select}>
									<option value='1'>Одиночный выбор (Radiobox)</option>
									<option value='2'>Множественный выбор (Checkbox)</option>
									<option value='3'>На сопоставление (Select)</option>
								</Form.Select>
							</div>
							<div className='container__question'>
								{select === "1" && (
									<div className='question__variants'>
										<Form.Label>Вопрос:</Form.Label>
										<div className='flex'>
											<Form.Control
												type='text'
												id={`inputQues`}
												placeholder={`Сколько будет 2x2= ?`}
												value={user_ques.title}
												onChange={changeTitle}
												required
											/>
											<div
												className='add-img'
												title='Добавить изображение'
												onClick={handleDivClick}
											>
												<img src='/images/plus.png' alt='' />
												<img src='/images/addImage.png' alt='' />
												<input
													type='file'
													ref={fileInputRef}
													style={{ display: "none" }}
													onChange={handleFileChange}
												/>
											</div>
										</div>
										<div className='flex start'>
											{images.map((img, index) => (
												<div className='select-images'>
													<img key={index} src={`/images/${img.name}`} alt='' />
													<img
														key={index}
														src={`/images/close.png`}
														onClick={() => deleteImage(index)}
														alt=''
													/>
												</div>
											))}
										</div>
										<Form.Label>Варианты ответов:</Form.Label>
										{user_ques.body.map((ques, index) => (
											<Form.Control
												key={`inputQues${index}`}
												type='text'
												placeholder={`${index + 1}) вариант ответа на вопрос`}
												id={`inputQues${index}`}
												value={ques.ques}
												onChange={(event) => changeInput(index, event)}
												required
											/>
										))}
										<Form.Control.Feedback type='invalid'>
											Введите вырианты ответа на вопрос
										</Form.Control.Feedback>
										<Form.Label>Правильный ответ:</Form.Label>
										<Form.Select onChange={handleResChange}>
											<option value=''>Выберите ответ</option>
											{user_ques.body
												.filter((item) => item.ques.trim() !== "")
												.map((item, index) => (
													<option key={index} value={item.ques}>
														{item.ques}
													</option>
												))}
										</Form.Select>
									</div>
								)}
								{select === "2" && (
									<div className='question__variants'>
										<Form.Label>Вопрос:</Form.Label>

										<div className='flex'>
											<Form.Control
												type='text'
												id={`inputQues`}
												placeholder={`Сколько будет 2x2= ?`}
												value={user_ques.title}
												onChange={changeTitle}
												required
											/>
											<div
												className='add-img'
												title='Добавить изображение'
												onClick={handleDivClick}
											>
												<img src='/images/plus.png' alt='' />
												<img src='/images/addImage.png' alt='' />
												<input
													type='file'
													ref={fileInputRef}
													style={{ display: "none" }}
													onChange={handleFileChange}
												/>
											</div>
										</div>
										<div className='flex start'>
											{images.map((img, index) => (
												<div className='select-images'>
													<img key={index} src={`/images/${img.name}`} alt='' />
													<img
														key={index}
														src={`/images/close.png`}
														onClick={() => deleteImage(index)}
														alt=''
													/>
												</div>
											))}
										</div>

										<div className='questionCheck'>
											<Form.Label>Варианты ответов:</Form.Label>
											{user_ques.res.map((ques, index) => (
												<div className='questionCheck__item'>
													<div className='left__item'>
														<Form.Control
															key={`inputQues${index}`}
															type='text'
															placeholder={`${
																index + 1
															}) вариант ответа на вопрос`}
															id={`inputQues${index}`}
															value={ques.ques}
															onChange={(event) => changeInput(index, event)}
															required
														/>
													</div>
													<div className='right__item'>
														<Form.Check
															key={index}
															type='checkbox'
															name={`CheckGroup_123`}
															checked={ques.res === "Правильный"}
															onChange={() => handleResCheckChange(index)}
														/>
													</div>
												</div>
											))}
											<Form.Control.Feedback type='invalid'>
												Введите варианты ответа на вопрос
											</Form.Control.Feedback>
										</div>
									</div>
								)}
								{select === "3" && (
									<div className='question__variants'>
										<Form.Label>Вопрос:</Form.Label>

										<div className='flex'>
											<Form.Control
												type='text'
												id={`inputQues`}
												placeholder={`Сопоставьте характеристики`}
												value={user_ques.title}
												onChange={changeTitle}
												required
											/>
											<div
												className='add-img'
												title='Добавить изображение'
												onClick={handleDivClick}
											>
												<img src='/images/plus.png' alt='' />
												<img src='/images/addImage.png' alt='' />
												<input
													type='file'
													ref={fileInputRef}
													style={{ display: "none" }}
													onChange={handleFileChange}
												/>
											</div>
										</div>
										<div className='flex start'>
											{images.map((img, index) => (
												<div className='select-images'>
													<img key={index} src={`/images/${img.name}`} alt='' />
													<img
														key={index}
														src={`/images/close.png`}
														onClick={() => deleteImage(index)}
														alt=''
													/>
												</div>
											))}
										</div>
										<div className='questionSelect'>
											<Form.Label>Варианты ответов:</Form.Label>
											{user_ques.res.map((ques, index) => (
												<div className='questionCheck__item'>
													<div className='left__item'>
														<Form.Control
															key={`inputQues${index}`}
															type='text'
															placeholder='Вопрос'
															id={`inputQues${index}`}
															value={ques.ques}
															onChange={(event) => changeInput(index, event)}
															required
														/>
													</div>
													<div className='right__item'>
														<Form.Control
															key={`inputQues${index + 4}`}
															type='text'
															placeholder='Ответ'
															id={`inputQues${index}`}
															value={ques.res}
															onChange={(event) => changeRes(index, event)}
															required
														/>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
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

export default ModalAddQues
