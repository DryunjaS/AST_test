import Form from "react-bootstrap/Form"
import TestService from "../../services/TestService"
import { useEffect, useState } from "react"
import ModalImg from "../Modal/ModalImg"

const SelectList = ({ testID, arrQues, current }) => {
	const [value, setValue] = useState(arrQues[current])
	const [imageUrls, setImageUrls] = useState([])
	const [show, setShow] = useState(false)

	const handleSelectChange = async (event, ques) => {
		const tmp = arrQues[current].body.map((item) => {
			if (item.ques === ques) {
				item.user_res = event.target.value
			}
			return item
		})
		const newValue = {
			...value,
			body: tmp,
		}
		setValue(newValue)
		arrQues[current].body.forEach((item) => {
			if (item.ques === ques) {
				item.user_res = event.target.value
			}
		})
		await TestService.updateStoreEvent(testID, arrQues)
	}
	useEffect(() => {
		setImageUrls([])

		const fetchImages = async () => {
			if (arrQues[current].img.length) {
				const imgFilenames = arrQues[current].img
				try {
					const imgUrls = await Promise.all(
						imgFilenames.map(async (filename) => {
							try {
								const arrayBuffer = await TestService.getImagesEvent(filename)
								const imageBase64 = arrayBufferToBase64(arrayBuffer.data)
								return `data:image/jpeg;base64,${imageBase64}`
							} catch (error) {
								console.error(`Error fetching image ${filename}:`, error)
								return null
							}
						})
					)
					setImageUrls(imgUrls.filter((url) => url !== null))
				} catch (error) {
					console.error("Error fetching images:", error)
				}
			}
		}

		fetchImages()
	}, [arrQues[current]])
	useEffect(() => {
		setValue(arrQues[current])
	}, [current])
	const arrayBufferToBase64 = (buffer) => {
		const bytes = new Uint8Array(buffer)
		let binary = ""
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i])
		}
		return window.btoa(binary) // Используем window.btoa для кодирования в base64
	}

	return (
		<>
			<ModalImg show={show} setShow={setShow} title={Number(current) + 1} />
			<div className='articles__item'>
				<h3 className='title'>{arrQues[current].title}</h3>
				<div className='images-ques'>
					{imageUrls.length !== 0 &&
						imageUrls.map((imageUrl, index) => (
							<img
								key={index}
								src={imageUrl}
								alt={`Image ${index}`}
								onClick={() => setShow(imageUrl)}
							/>
						))}
				</div>
				<div className='text'>
					{value.body.lenght !== 0 &&
						value.body.map((el) => (
							<div className='text-container'>
								<div className='text-item'>{el.ques}</div>
								<Form.Select
									aria-label='Default select example'
									onChange={(event) => handleSelectChange(event, el.ques)}
									value={el.user_res}
								>
									<option>Выберите</option>
									{value.res.map((item) => (
										<option key={item.res} value={item.res}>
											{item.res}
										</option>
									))}
								</Form.Select>
							</div>
						))}
				</div>
			</div>
		</>
	)
}

export default SelectList
