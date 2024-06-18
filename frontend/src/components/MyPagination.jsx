import { useState } from "react"
import Module from "./Modal/Module"
import { useParams } from "react-router-dom"

function MyPagination({ userID, value, select, setSelectQ }) {
	const [show, setShow] = useState(false)
	const { testID } = useParams()
	const arr = Array.from({ length: value }, (_, index) => index + 1)
	const handleLeft = () => {
		if (select > 1) {
			setSelectQ((n) => n - 1)
		}
	}
	const handleRight = () => {
		if (select < value) {
			setSelectQ((n) => n + 1)
		}
		if (select >= value) {
			setShow(true)
		}
	}
	const handleItem = (item) => {
		setSelectQ(item)
	}

	return (
		<div className='pagination'>
			<Module show={show} setShow={setShow} testID={testID} userID={userID} />
			<div className='pagination__item' onClick={handleLeft}>
				{"<"}
			</div>
			{arr.map((item) => (
				<div
					key={item}
					className={`pagination__item ${item === select ? "active" : ""}`}
					onClick={() => handleItem(item)}
				>
					{item}
				</div>
			))}
			<div className='pagination__item' onClick={handleRight}>
				{">"}
			</div>
		</div>
	)
}

export default MyPagination
