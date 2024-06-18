import Form from "react-bootstrap/Form"
import TestService from "../../services/TestService"
import { useEffect, useState } from "react"
import ModalImg from "../Modal/ModalImg"

const CheckList = ({ testID, arrQues, current }) => {
	const [value, setValue] = useState(arrQues[current])
	const [imageUrls, setImageUrls] = useState([])
	const [show, setShow] = useState(false)

	const handleCheckChange = async (ques) => {
		const tmp = arrQues[current].body.map((item) => {
			if (item.ques === ques) {
				return {
					...item,
					user_res: item.user_res === "Правильный" ? "" : "Правильный",
				}
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
				if (item.user_res === "Правильный") {
					item.user_res = ""
				} else {
					item.user_res = "Правильный"
				}
			}
		})
		await TestService.updateStoreEvent(testID, arrQues)
	}
	useEffect(() => {
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

		setValue(arrQues[current])
	}, [arrQues, current])

	const arrayBufferToBase64 = (buffer) => {
		const bytes = new Uint8Array(buffer)
		let binary = ""
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i])
		}
		return window.btoa(binary)
	}

	return (
		<>
			<ModalImg show={show} setShow={setShow} title={Number(current) + 1} />

			<div className='articles__item'>
				<h3 className='title'>{arrQues[current].title}</h3>
				<div className='images-ques'>
					{imageUrls.map((imageUrl, index) => (
						<img
							key={index}
							src={imageUrl}
							alt={`Image ${index}`}
							onClick={() => setShow(imageUrl)}
						/>
					))}
				</div>
				<div className='text'>
					<Form>
						{value.body.map((el, index) => (
							<Form.Check
								key={index}
								label={el.ques}
								checked={el.user_res === "Правильный"}
								onChange={() => handleCheckChange(el.ques)}
							/>
						))}
					</Form>
				</div>
			</div>
		</>
	)
}

export default CheckList
