import { observer } from "mobx-react-lite"
import RoomAdmin from "../components/Room/RoomAdmin"
import RoomUser from "../components/Room/RoomUser"
import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

const Room = () => {
	const navigate = useNavigate()
	const burgerRef = useRef(null)

	const handleBurger = () => {
		navigate("/preview")
	}

	useEffect(() => {
		const controlBurger = () => {
			const burgerMenu = burgerRef.current
			const scrollDifference = window.scrollY - burgerMenu.offsetTop
			if (Math.abs(scrollDifference) > 0) {
				const newTop = window.scrollY + 80 + "px"
				burgerMenu.style.transition = "top 0.4s ease-out"
				burgerMenu.style.top = newTop
			}
		}

		window.addEventListener("scroll", controlBurger)

		return () => {
			window.removeEventListener("scroll", controlBurger)
		}
	}, [])
	return (
		<>
			<div
				className='burger-menu room-burger'
				onClick={handleBurger}
				ref={burgerRef}
			>
				&#x2715;
			</div>
			{sessionStorage.getItem("userName") === "admin" ? (
				<RoomAdmin />
			) : (
				<RoomUser />
			)}
		</>
	)
}

export default observer(Room)
