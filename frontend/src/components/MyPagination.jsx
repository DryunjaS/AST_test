import { useState } from "react"
import Module from "./Modal/Module"
import { useParams } from "react-router-dom"

function MyPagination({ userID, value, select, setSelectQ }) {
	const [show, setShow] = useState(false)
	const { testID } = useParams()

	const handleRight = () => {
		if (select < value) {
			setSelectQ((n) => n + 1)
		}
		if (select >= value) {
			setShow(true)
		}
	}

	return (
		<div>
			<Module show={show} setShow={setShow} testID={testID} userID={userID} />

			<div className='pagination'>
				{select} из {value}
				<div className='pagination__item ' onClick={handleRight}>
					{select < value ? "Следующий вопрос" : "Заверщить тест"}
				</div>
			</div>
		</div>
	)
}

export default MyPagination
